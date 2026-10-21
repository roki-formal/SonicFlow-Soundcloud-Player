import { AudioTrack } from '../../types';
import { INITIAL_TRACKS } from './catalog';

export class SoundCloudProvider {
  private clientId: string | null;
  private cache: Map<string, AudioTrack[]> = new Map();

  constructor() {
    this.clientId = import.meta.env.VITE_SOUNDCLOUD_CLIENT_ID || null;
  }

  public async search(query: string): Promise<AudioTrack[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    if (this.cache.has(q)) {
      return this.cache.get(q)!;
    }

    // If client ID is provided, query SoundCloud API
    if (this.clientId) {
      try {
        const res = await fetch(
          `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(query)}&client_id=${this.clientId}&limit=10`,
          { headers: { Accept: 'application/json' } }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.collection) && data.collection.length > 0) {
            const tracks: AudioTrack[] = data.collection
              .filter((item: any) => item.streamable && item.media?.transcodings?.length)
              .map((item: any) => {
                const progressive = item.media.transcodings.find((t: any) => t.format?.protocol === 'progressive');
                const streamUrl = progressive ? `${progressive.url}?client_id=${this.clientId}` : '';
                return {
                  id: `sc-${item.id}`,
                  title: item.title,
                  artist: item.user?.username || 'SoundCloud Artist',
                  album: 'SoundCloud Single',
                  year: new Date(item.created_at).getFullYear(),
                  duration: Math.round((item.duration || 0) / 1000),
                  coverUrl: item.artwork_url ? item.artwork_url.replace('-large', '-t500x500') : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
                  streamUrl: streamUrl || INITIAL_TRACKS[0].streamUrl,
                  provider: 'soundcloud' as const,
                };
              });
            this.cache.set(q, tracks);
            return tracks;
          }
        }
      } catch (err) {
        console.warn('SoundCloud API search failed, falling back to catalog:', err);
      }
    }

    // Fallback: search local curated high quality catalog
    const matches = INITIAL_TRACKS.filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.album.toLowerCase().includes(q)
    );
    this.cache.set(q, matches);
    return matches;
  }

  public isConfigured(): boolean {
    return Boolean(this.clientId);
  }
}
