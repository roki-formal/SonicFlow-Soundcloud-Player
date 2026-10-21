import { SoundCloudAuth, SC_API_BASE, SC_DIRECT_API } from './SoundCloudAuth';
import { 
  SoundCloudRawTrack, 
  SoundCloudRawPlaylist, 
  SoundCloudUser, 
  SoundCloudArtist 
} from './SoundCloudTypes';
import { AudioTrack, StoredPlaylist } from '../../types';

export const DEFAULT_CLIENT_ID = 'd6kpQQegNegASme5aDU800Fwq9DbVasv';
const CLIENT_ID_STORAGE_KEY = 'sonicflow_sc_client_id';

export class SoundCloudClient {
  private static instance: SoundCloudClient;
  private auth: SoundCloudAuth;
  private clientId: string;
  private streamUrlCache: Map<string, { url: string; expiresAt: number }> = new Map();
  private isRefreshingClientId = false;

  private constructor() {
    this.auth = SoundCloudAuth.getInstance();
    const storedId = typeof localStorage !== 'undefined' ? localStorage.getItem(CLIENT_ID_STORAGE_KEY) : null;
    this.clientId = import.meta.env.VITE_SOUNDCLOUD_CLIENT_ID || storedId || DEFAULT_CLIENT_ID;
  }

  public static getInstance(): SoundCloudClient {
    if (!SoundCloudClient.instance) {
      SoundCloudClient.instance = new SoundCloudClient();
    }
    return SoundCloudClient.instance;
  }

  public getClientId(): string {
    return this.clientId;
  }

  public setClientId(id: string): void {
    const clean = id.trim();
    if (clean) {
      this.clientId = clean;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CLIENT_ID_STORAGE_KEY, clean);
      }
    }
  }

  /**
   * Automatically scrapes working client ID from soundcloud.com web scripts
   */
  public async refreshClientId(): Promise<string> {
    if (this.isRefreshingClientId) return this.clientId;
    this.isRefreshingClientId = true;

    try {
      const res = await fetch('https://soundcloud.com', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (res.ok) {
        const html = await res.text();
        const scriptMatches = [...html.matchAll(/<script[^>]+src="([^">]+\.js)"/g)].map((m) => m[1]);

        for (const url of scriptMatches) {
          const fullUrl = url.startsWith('http') ? url : `https://soundcloud.com${url}`;
          try {
            const sres = await fetch(fullUrl);
            const js = await sres.text();
            const matches = js.matchAll(/client_id[:=]["']([a-zA-Z0-9]{32})["']/g);
            for (const m of matches) {
              const candidate = m[1];
              // Quick validation
              const test = await fetch(`${SC_DIRECT_API}/search/tracks?q=house&client_id=${candidate}&limit=1`);
              if (test.ok) {
                this.setClientId(candidate);
                this.isRefreshingClientId = false;
                return candidate;
              }
            }
          } catch (e) {
            // Check next script
          }
        }
      }
    } catch (err) {
      console.warn('Could not auto-scrape client ID from soundcloud.com:', err);
    } finally {
      this.isRefreshingClientId = false;
    }

    return this.clientId;
  }

  private getAuthParams(): string {
    const token = this.auth.getToken();
    if (token) {
      return `oauth_token=${encodeURIComponent(token)}&client_id=${this.clientId}`;
    }
    return `client_id=${this.clientId}`;
  }

  /**
   * Smart fetch wrapper that routes through Vite/Launcher proxy (/sc-api) to bypass CORS and CloudFront
   */
  public async fetchApi(path: string, options: RequestInit = {}): Promise<Response> {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const sep = cleanPath.includes('?') ? '&' : '?';
    const queryString = `${sep}${this.getAuthParams()}`;

    // Priority 1: Proxy route in browser / launcher (/sc-api/...)
    const proxyUrl = `/sc-api${cleanPath}${queryString}`;
    try {
      const res = await fetch(proxyUrl, {
        ...options,
        headers: {
          ...this.auth.getAuthHeaders(),
          ...(options.headers || {}),
        },
      });

      if (res.ok) {
        return res;
      }

      // If client_id was rejected (401/403), try scraping a fresh client ID once
      if (res.status === 401 || res.status === 403) {
        await this.refreshClientId();
        const retryUrl = `/sc-api${cleanPath}${cleanPath.includes('?') ? '&' : '?'}${this.getAuthParams()}`;
        const retryRes = await fetch(retryUrl, {
          ...options,
          headers: {
            ...this.auth.getAuthHeaders(),
            ...(options.headers || {}),
          },
        });
        if (retryRes.ok) return retryRes;
      }

      // If proxy route returns 404 (e.g. running on external web host without proxy), fallback to direct API
      if (res.status === 404 && typeof window !== 'undefined' && window.location.protocol !== 'file:') {
        // Fallback to direct
      } else {
        return res;
      }
    } catch (e) {
      // Network error on proxy route -> try direct API
    }

    // Priority 2: Direct API call
    const directUrl = `${SC_DIRECT_API}${cleanPath}${queryString}`;
    return fetch(directUrl, {
      ...options,
      headers: {
        ...this.auth.getAuthHeaders(),
        ...(options.headers || {}),
      },
    });
  }

  /**
   * Resolves audio stream URL (.m3u8 or progressive mp3)
   */
  public async resolveStreamUrl(rawMediaUrl: string, trackUrnOrId?: string | number): Promise<string> {
    const cached = this.streamUrlCache.get(rawMediaUrl);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.url;
    }

    // Resolves through SoundCloud media transcoding endpoint
    try {
      let fetchUrl = rawMediaUrl;
      if (rawMediaUrl.startsWith('https://api-v2.soundcloud.com')) {
        const sub = rawMediaUrl.replace('https://api-v2.soundcloud.com', '');
        const res = await this.fetchApi(sub);
        if (res.ok) {
          const data = await res.json();
          if (data && data.url) {
            // Cache resolved stream for 1.5 hours
            this.streamUrlCache.set(rawMediaUrl, {
              url: data.url,
              expiresAt: Date.now() + 90 * 60 * 1000,
            });
            return data.url;
          }
        }
      } else {
        const sep = rawMediaUrl.includes('?') ? '&' : '?';
        const fullUrl = `${rawMediaUrl}${sep}${this.getAuthParams()}`;
        const res = await fetch(fullUrl, { headers: this.auth.getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (data && data.url) {
            this.streamUrlCache.set(rawMediaUrl, {
              url: data.url,
              expiresAt: Date.now() + 90 * 60 * 1000,
            });
            return data.url;
          }
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
      // Resolve real playback CDN url
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
      streamUrl: streamUrl || mediaTrans?.url || '',
      provider: 'soundcloud',
      isFavorite: false,
      genre: raw.genre,
    };
  }

  /**
   * Resolves a SoundCloud user by username or profile link
   * e.g. "skrillex" or "https://soundcloud.com/skrillex"
   */
  public async resolveUser(handleOrUrl: string): Promise<SoundCloudUser | null> {
    let clean = handleOrUrl.trim().replace(/^@/, '');
    if (!clean.startsWith('http')) {
      clean = `https://soundcloud.com/${clean}`;
    }

    try {
      const res = await this.fetchApi(`/resolve?url=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const raw = await res.json();
        if (raw && raw.id) {
          const user: SoundCloudUser = {
            id: raw.id,
            urn: raw.urn,
            username: raw.username,
            avatar_url: raw.avatar_url ? raw.avatar_url.replace('-large', '-t500x500') : '',
            permalink_url: raw.permalink_url,
            followers_count: raw.followers_count || 0,
            followings_count: raw.followings_count || 0,
            likes_count: raw.likes_count || raw.public_favorites_count || 0,
            track_count: raw.track_count || 0,
            playlist_count: raw.playlist_count || 0,
            city: raw.city,
            country: raw.country,
            description: raw.description,
            full_name: raw.full_name,
            authType: 'profile',
          };
          return user;
        }
      }
    } catch (e) {
      console.warn('Failed to resolve SoundCloud user:', e);
    }

    return null;
  }

  /**
   * Fetches user's SoundCloud Likes (синхронизация с soundcloud.com/you/likes)
   */
  public async getMyLikes(limit = 50): Promise<AudioTrack[]> {
    if (!this.auth.isAuthenticated()) return [];
    const user = this.auth.getUser();

    // Priority 1: Native session via scnative
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

    // Priority 2: Direct API with oauth token
    if (this.auth.getToken()) {
      try {
        const res = await this.fetchApi(`/me/likes/tracks?limit=${limit}`);
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
        console.warn('Failed to fetch likes via token:', e);
      }
    }

    // Priority 3: Public profile likes (if authenticated via profile username)
    if (user && user.id) {
      try {
        const res = await this.fetchApi(`/users/${user.id}/likes?limit=${limit}`);
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
        console.warn('Failed to fetch public profile likes:', e);
      }
    }

    return [];
  }

  /**
   * Fetches user's SoundCloud Playlists
   */
  public async getMyPlaylists(): Promise<StoredPlaylist[]> {
    if (!this.auth.isAuthenticated()) return [];
    const user = this.auth.getUser();

    // Priority 1: Via scnative session
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

    // Priority 2: Direct API with token
    if (this.auth.getToken()) {
      try {
        const res = await this.fetchApi('/me/playlists');
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
        console.warn('Failed to fetch playlists via token:', e);
      }
    }

    // Priority 3: Public profile playlists
    if (user && user.id) {
      try {
        const res = await this.fetchApi(`/users/${user.id}/playlists_without_albums?limit=25`);
        if (res.ok) {
          const data = await res.json();
          const collection: SoundCloudRawPlaylist[] = data.collection || [];
          const playlists = await Promise.all(
            collection.map(async (pl) => {
              const rawTracks = pl.tracks || [];
              const mappedTracks = await Promise.all(rawTracks.map((t) => this.mapTrack(t)));
              return {
                id: `sc-pl-${pl.id}`,
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
      } catch (e) {
        console.warn('Failed to fetch public profile playlists:', e);
      }
    }

    return [];
  }

  /**
   * Fetches user's stream / feed
   */
  public async getMyStream(limit = 35): Promise<AudioTrack[]> {
    if (!this.auth.isAuthenticated()) return [];
    const user = this.auth.getUser();

    // Priority 1: scnative session
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

    // Priority 2: Direct API with token
    if (this.auth.getToken()) {
      try {
        const res = await this.fetchApi(`/stream?limit=${limit}`);
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
        console.warn('Failed to fetch stream via token:', e);
      }
    }

    // Priority 3: Public profile user's own tracks
    if (user && user.id) {
      try {
        const res = await this.fetchApi(`/users/${user.id}/tracks?limit=${limit}`);
        if (res.ok) {
          const data = await res.json();
          const collection = data.collection || [];
          const trackPromises = collection.map((raw: SoundCloudRawTrack) => this.mapTrack(raw));
          const tracks = await Promise.all(trackPromises);
          return tracks.filter(Boolean) as AudioTrack[];
        }
      } catch (e) {
        console.warn('Failed to fetch user tracks for stream:', e);
      }
    }

    return [];
  }

  /**
   * Fetches user's followed SoundCloud artists
   */
  public async getMyFollowings(limit = 25): Promise<SoundCloudArtist[]> {
    if (!this.auth.isAuthenticated()) return [];
    const user = this.auth.getUser();

    try {
      const endpoint = this.auth.getToken() ? '/me/followings' : user?.id ? `/users/${user.id}/followings` : null;
      if (!endpoint) return [];

      const res = await this.fetchApi(`${endpoint}?limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        const collection = data.collection || [];
        return collection.map((item: any) => ({
          id: item.id,
          urn: item.urn,
          username: item.username,
          avatar_url: item.avatar_url ? item.avatar_url.replace('-large', '-t500x500') : '',
          permalink_url: item.permalink_url,
          followers_count: item.followers_count || 0,
          track_count: item.track_count || 0,
          city: item.city,
          country: item.country,
          isFollowed: true,
        }));
      }
    } catch (e) {
      console.warn('Failed to fetch followed artists:', e);
    }

    return [];
  }

  /**
   * Fetches real popular/trending tracks from SoundCloud
   */
  public async getTrendingTracks(genre = 'all-music', limit = 30): Promise<AudioTrack[]> {
    try {
      const searchTerms = ['electronic', 'techno', 'hiphop', 'house', 'trap'];
      const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      const res = await this.fetchApi(`/search/tracks?q=${encodeURIComponent(term)}&limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        const collection = data.collection || [];
        const trackPromises = collection.map((raw: SoundCloudRawTrack) => this.mapTrack(raw));
        const tracks = await Promise.all(trackPromises);
        return tracks.filter(Boolean) as AudioTrack[];
      }
    } catch (e) {
      console.warn('Failed to fetch trending tracks:', e);
    }
    return [];
  }

  /**
   * Fetches real trending playlists from SoundCloud
   */
  public async getTrendingPlaylists(limit = 8): Promise<StoredPlaylist[]> {
    try {
      const res = await this.fetchApi('/mixed-selections');
      if (res.ok) {
        const data = await res.json();
        const selections = data.collection || [];
        const powerSelection = selections.find((s: any) => s.title?.toLowerCase().includes('playlist') || s.title?.toLowerCase().includes('curated')) || selections[0];

        if (powerSelection?.items?.collection) {
          const rawItems = powerSelection.items.collection.slice(0, limit);
          const playlists = await Promise.all(
            rawItems.map(async (item: any) => {
              const pl = item.playlist || item;
              const rawTracks = pl.tracks || [];
              const mappedTracks = await Promise.all(rawTracks.slice(0, 15).map((t: any) => this.mapTrack(t)));
              return {
                id: `sc-curated-${pl.id || Date.now()}`,
                title: pl.title || 'SoundCloud Playlist',
                description: pl.description || `SoundCloud · ${pl.track_count || rawTracks.length} треков`,
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
      console.warn('Failed to fetch trending playlists:', e);
    }
    return [];
  }

  /**
   * Global SoundCloud search for tracks
   */
  public async search(query: string, limit = 30): Promise<AudioTrack[]> {
    const q = query.trim();
    if (!q) return [];

    try {
      const res = await this.fetchApi(`/search/tracks?q=${encodeURIComponent(q)}&limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        const collection = data.collection || [];
        const trackPromises = collection.map((raw: SoundCloudRawTrack) => this.mapTrack(raw));
        const tracks = await Promise.all(trackPromises);
        return tracks.filter(Boolean) as AudioTrack[];
      }
    } catch (e) {
      console.warn('Failed to search SoundCloud:', e);
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

    // Priority 1: Via scnative session
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

    // Priority 2: Direct API with token
    if (this.auth.getToken()) {
      try {
        const method = shouldLike ? 'PUT' : 'DELETE';
        const res = await this.fetchApi(`/me/track_likes/${cleanId}`, {
          method,
          headers: { Accept: 'application/json, text/javascript, */*' },
        });
        return res.ok || res.status === 200 || res.status === 201 || res.status === 204;
      } catch (e) {
        console.warn(`Failed to sync like on SoundCloud for track ${trackId}:`, e);
      }
    }

    return false;
  }
}
