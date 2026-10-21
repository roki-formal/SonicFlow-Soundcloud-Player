import { SoundCloudAuth, SC_API_BASE, SC_DIRECT_API } from './SoundCloudAuth';
import { SoundCloudRawTrack, SoundCloudRawPlaylist } from './SoundCloudTypes';
import { AudioTrack, StoredPlaylist } from '../../types';

const DEFAULT_CLIENT_ID = 'a3e059563d7fd3372b49b37f00a00bcf';
const STREAMING_BASE = 'https://stream.scnative.dev';

export class SoundCloudClient {
  private static instance: SoundCloudClient;
  private auth: SoundCloudAuth;
  private clientId: string;
  private streamUrlCache: Map<string, string> = new Map();

  private constructor() {
    this.auth = SoundCloudAuth.getInstance();
    this.clientId = import.meta.env.VITE_SOUNDCLOUD_CLIENT_ID || DEFAULT_CLIENT_ID;
  }

  public static getInstance(): SoundCloudClient {
    if (!SoundCloudClient.instance) {
      SoundCloudClient.instance = new SoundCloudClient();
    }
    return SoundCloudClient.instance;
  }

  private getAuthParams(): string {
    const token = this.auth.getToken();
    if (token) {
      return `oauth_token=${encodeURIComponent(token)}&client_id=${this.clientId}`;
    }
    return `client_id=${this.clientId}`;
  }

  /**
   * Resolves audio stream URL (.m3u8 or progressive mp3)
   */
  public async resolveStreamUrl(rawMediaUrl: string, trackUrnOrId?: string | number): Promise<string> {
    if (this.streamUrlCache.has(rawMediaUrl)) {
      return this.streamUrlCache.get(rawMediaUrl)!;
    }

    // Попытка 1: Через стриминговый шлюз scnative (без блокировок)
    if (trackUrnOrId) {
      try {
        const urn = String(trackUrnOrId).includes(':') ? trackUrnOrId : `soundcloud:tracks:${trackUrnOrId}`;
        const gatewayUrl = `${STREAMING_BASE}/resolve?urn=${encodeURIComponent(urn)}`;
        const res = await fetch(gatewayUrl, {
          headers: this.auth.getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && (data.url || data.stream_url)) {
            const resolved = data.url || data.stream_url;
            this.streamUrlCache.set(rawMediaUrl, resolved);
            return resolved;
          }
        }
      } catch (e) {
        // Fallback to direct transcoding resolve
      }
    }

    // Попытка 2: Через медиа-транскодинг SoundCloud
    try {
      const sep = rawMediaUrl.includes('?') ? '&' : '?';
      const fetchUrl = `${rawMediaUrl}${sep}${this.getAuthParams()}`;
      const res = await fetch(fetchUrl, {
        headers: this.auth.getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.url) {
          this.streamUrlCache.set(rawMediaUrl, data.url);
          return data.url;
        }
      }
    } catch (e) {
      console.warn('Failed to resolve SoundCloud stream transcoding:', e);
    }

    return rawMediaUrl;
  }

  /**
   * Transforms raw SoundCloud track into our unified AudioTrack model
   */
  public async mapTrack(raw: SoundCloudRawTrack): Promise<AudioTrack> {
    const transcodings = raw.media?.transcodings || [];
    const progressive = transcodings.find((t) => t.format?.protocol === 'progressive');
    const hls = transcodings.find((t) => t.format?.protocol === 'hls');
    const mediaTrans = progressive || hls;

    let streamUrl = raw.stream_url || '';
    if (!streamUrl && mediaTrans?.url) {
      streamUrl = await this.resolveStreamUrl(mediaTrans.url, raw.urn || raw.id);
    }

    let coverUrl = raw.artwork_url || raw.user?.avatar_url || '';
    if (coverUrl) {
      coverUrl = coverUrl.replace('-large', '-t500x500');
    } else {
      coverUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500';
    }

    const trackId = raw.id ? `sc-${raw.id}` : `sc-${raw.urn?.replace('soundcloud:tracks:', '') || Date.now()}`;

    return {
      id: trackId,
      title: raw.title || 'SoundCloud Track',
      artist: raw.user?.username || 'SoundCloud Artist',
      album: 'SoundCloud',
      year: raw.created_at ? new Date(raw.created_at).getFullYear() : new Date().getFullYear(),
      duration: Math.round((raw.duration || 0) / 1000),
      coverUrl,
      streamUrl: streamUrl || 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
      provider: 'soundcloud',
      isFavorite: false,
      genre: raw.genre,
    };
  }

  /**
   * Fetches user's SoundCloud Likes (синхронизация с soundcloud.com/you/likes)
   */
  public async getMyLikes(limit = 40): Promise<AudioTrack[]> {
    if (!this.auth.isAuthenticated()) return [];

    // Приоритет 1: Через нативную сессию scnative (как в SoundCloud-Desktop)
    if (this.auth.getSessionId()) {
      try {
        const url = `${SC_API_BASE}/me/likes/tracks?limit=${limit}`;
        const res = await fetch(url, { headers: this.auth.getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          const collection = Array.isArray(data) ? data : data.collection || data.items || [];
          const trackPromises = collection.map(async (item: any) => {
            const raw = item.track || item;
            if (!raw || (!raw.id && !raw.urn)) return null;
            const mapped = await this.mapTrack(raw);
            mapped.isFavorite = true;
            return mapped;
          });
          const tracks = await Promise.all(trackPromises);
          return tracks.filter(Boolean) as AudioTrack[];
        }
      } catch (e) {
        console.warn('Failed to fetch likes via scnative:', e);
      }
    }

    // Приоритет 2: Через прямой токен soundcloud.com
    try {
      const url = `${SC_DIRECT_API}/me/likes/tracks?limit=${limit}&${this.getAuthParams()}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const collection = data.collection || [];
        const trackPromises = collection.map(async (item: any) => {
          const raw = item.track || item;
          if (!raw || !raw.id) return null;
          const mapped = await this.mapTrack(raw);
          mapped.isFavorite = true;
          return mapped;
        });
        const tracks = await Promise.all(trackPromises);
        return tracks.filter(Boolean) as AudioTrack[];
      }
    } catch (e) {
      console.error('Failed to fetch SoundCloud likes:', e);
    }

    return [];
  }

  /**
   * Fetches user's stream / feed (треки авторов из подписок)
   */
  public async getMyStream(limit = 30): Promise<AudioTrack[]> {
    if (!this.auth.isAuthenticated()) return [];

    // Приоритет 1: Через сессию scnative
    if (this.auth.getSessionId()) {
      try {
        const url = `${SC_API_BASE}/stream?limit=${limit}`;
        const res = await fetch(url, { headers: this.auth.getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          const collection = Array.isArray(data) ? data : data.collection || data.items || [];
          const trackPromises = collection.map(async (item: any) => {
            const raw = item.track || item;
            if (!raw || (!raw.id && !raw.urn)) return null;
            return this.mapTrack(raw);
          });
          const tracks = await Promise.all(trackPromises);
          return tracks.filter(Boolean) as AudioTrack[];
        }
      } catch (e) {
        console.warn('Failed to fetch stream via scnative:', e);
      }
    }

    // Приоритет 2: Через прямой API
    try {
      const url = `${SC_DIRECT_API}/stream?limit=${limit}&${this.getAuthParams()}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const collection = data.collection || [];
        const trackPromises = collection.map(async (item: any) => {
          const raw = item.track || item;
          if (!raw || !raw.id) return null;
          return this.mapTrack(raw);
        });
        const tracks = await Promise.all(trackPromises);
        return tracks.filter(Boolean) as AudioTrack[];
      }
    } catch (e) {
      console.error('Failed to fetch SoundCloud stream:', e);
    }

    return [];
  }

  /**
   * Fetches user's SoundCloud Playlists (плейлисты пользователя)
   */
  public async getMyPlaylists(): Promise<StoredPlaylist[]> {
    if (!this.auth.isAuthenticated()) return [];

    // Приоритет 1: Через сессию scnative
    if (this.auth.getSessionId()) {
      try {
        const url = `${SC_API_BASE}/me/playlists`;
        const res = await fetch(url, { headers: this.auth.getAuthHeaders() });
        if (res.ok) {
          const collection: SoundCloudRawPlaylist[] = await res.json();
          if (Array.isArray(collection)) {
            const playlists = await Promise.all(
              collection.map(async (pl) => {
                const rawTracks = pl.tracks || [];
                const mappedTracks = await Promise.all(rawTracks.map((t) => this.mapTrack(t)));
                return {
                  id: `sc-pl-${pl.id || pl.urn}`,
                  title: pl.title,
                  description: pl.description || `Плейлист SoundCloud · ${pl.track_count || rawTracks.length} треков`,
                  coverUrl: pl.artwork_url ? pl.artwork_url.replace('-large', '-t500x500') : undefined,
                  createdAt: pl.created_at ? new Date(pl.created_at).getTime() : Date.now(),
                  tracks: mappedTracks,
                };
              })
            );
            return playlists;
          }
        }
      } catch (e) {
        console.warn('Failed to fetch playlists via scnative:', e);
      }
    }

    // Приоритет 2: Через прямой API
    try {
      const url = `${SC_DIRECT_API}/me/playlists?${this.getAuthParams()}`;
      const res = await fetch(url);
      if (res.ok) {
        const collection: SoundCloudRawPlaylist[] = await res.json();
        const playlists = await Promise.all(
          collection.map(async (pl) => {
            const rawTracks = pl.tracks || [];
            const mappedTracks = await Promise.all(rawTracks.map((t) => this.mapTrack(t)));
            return {
              id: `sc-pl-${pl.id}`,
              title: pl.title,
              description: pl.description || `Плейлист SoundCloud · ${pl.track_count} треков`,
              coverUrl: pl.artwork_url ? pl.artwork_url.replace('-large', '-t500x500') : undefined,
              createdAt: pl.created_at ? new Date(pl.created_at).getTime() : Date.now(),
              tracks: mappedTracks,
            };
          })
        );
        return playlists;
      }
    } catch (e) {
      console.error('Failed to fetch SoundCloud playlists:', e);
    }

    return [];
  }

  /**
   * Global SoundCloud search
   */
  public async search(query: string, limit = 20): Promise<AudioTrack[]> {
    const q = query.trim();
    if (!q) return [];

    // Приоритет 1: Через сессию scnative
    if (this.auth.getSessionId()) {
      try {
        const url = `${SC_API_BASE}/search/tracks?q=${encodeURIComponent(q)}&limit=${limit}`;
        const res = await fetch(url, { headers: this.auth.getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          const collection = Array.isArray(data) ? data : data.collection || data.items || [];
          const trackPromises = collection.map((raw: SoundCloudRawTrack) => this.mapTrack(raw));
          const tracks = await Promise.all(trackPromises);
          return tracks.filter(Boolean) as AudioTrack[];
        }
      } catch (e) {
        console.warn('Failed to search via scnative:', e);
      }
    }

    // Приоритет 2: Через прямой API
    try {
      const url = `${SC_DIRECT_API}/search/tracks?q=${encodeURIComponent(q)}&limit=${limit}&${this.getAuthParams()}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const collection = data.collection || [];
        const trackPromises = collection.map((raw: SoundCloudRawTrack) => this.mapTrack(raw));
        const tracks = await Promise.all(trackPromises);
        return tracks.filter(Boolean) as AudioTrack[];
      }
    } catch (e) {
      console.error('Failed to search SoundCloud:', e);
    }

    return [];
  }

  /**
   * Likes or unlikes a track directly on soundcloud.com
   */
  public async syncLike(trackId: string, shouldLike: boolean): Promise<boolean> {
    if (!this.auth.isAuthenticated()) return false;
    const cleanId = trackId.replace('sc-', '');
    const urn = cleanId.includes(':') ? cleanId : `soundcloud:tracks:${cleanId}`;

    // Приоритет 1: Через сессию scnative
    if (this.auth.getSessionId()) {
      try {
        const method = shouldLike ? 'POST' : 'DELETE';
        const url = `${SC_API_BASE}/likes/tracks/${encodeURIComponent(urn)}`;
        const res = await fetch(url, {
          method,
          headers: this.auth.getAuthHeaders(),
        });
        if (res.ok || res.status === 200 || res.status === 201 || res.status === 204) {
          return true;
        }
      } catch (e) {
        console.warn('Failed to sync like via scnative:', e);
      }
    }

    // Приоритет 2: Через прямой API
    try {
      const url = `${SC_DIRECT_API}/me/track_likes/${cleanId}?${this.getAuthParams()}`;
      const method = shouldLike ? 'PUT' : 'DELETE';
      const res = await fetch(url, {
        method,
        headers: { Accept: 'application/json, text/javascript, */*' },
      });
      return res.ok || res.status === 200 || res.status === 201 || res.status === 204;
    } catch (e) {
      console.error(`Failed to sync like on SoundCloud for track ${trackId}:`, e);
      return false;
    }
  }
}
