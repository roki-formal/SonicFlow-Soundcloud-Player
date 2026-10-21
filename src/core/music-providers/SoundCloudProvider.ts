import { AudioTrack } from '../../types';
import { SoundCloudClient } from '../soundcloud/SoundCloudClient';
import { INITIAL_TRACKS } from './catalog';

export class SoundCloudProvider {
  private client: SoundCloudClient;
  private cache: Map<string, AudioTrack[]> = new Map();

  constructor() {
    this.client = SoundCloudClient.getInstance();
  }

  public async search(query: string): Promise<AudioTrack[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    if (this.cache.has(q)) {
      return this.cache.get(q)!;
    }

    try {
      const results = await this.client.search(query, 25);
      if (results.length > 0) {
        this.cache.set(q, results);
        return results;
      }
    } catch (err) {
      console.warn('SoundCloud search failed:', err);
    }

    // Fallback: search local initial tracks
    const matches = INITIAL_TRACKS.filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.album.toLowerCase().includes(q)
    );
    this.cache.set(q, matches);
    return matches;
  }

  public isConfigured(): boolean {
    return true;
  }
}
