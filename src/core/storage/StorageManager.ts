import { AudioTrack, StoredPlaylist } from '../../types';

const FAVORITES_KEY = 'sonicflow_favorites_ids';
const HISTORY_KEY = 'sonicflow_history_list';
const PLAYLISTS_KEY = 'sonicflow_playlists_data';

export class StorageManager {
  private static instance: StorageManager;
  private favorites: Set<string> = new Set();
  private history: AudioTrack[] = [];
  private playlists: StoredPlaylist[] = [];

  private constructor() {
    this.loadData();
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  private loadData(): void {
    try {
      const favRaw = localStorage.getItem(FAVORITES_KEY);
      if (favRaw) {
        this.favorites = new Set(JSON.parse(favRaw));
      } else {
        // Pre-favorite real SoundCloud tracks if empty
        this.favorites = new Set(['sc-1553270944', 'sc-2314914782', 'sc-2249133425']);
      }

      const histRaw = localStorage.getItem(HISTORY_KEY);
      if (histRaw) {
        this.history = JSON.parse(histRaw);
      }

      const plRaw = localStorage.getItem(PLAYLISTS_KEY);
      if (plRaw) {
        this.playlists = JSON.parse(plRaw);
      } else {
        // Default initial playlist
        this.playlists = [
          {
            id: 'pl-favorites',
            title: 'Любимые треки',
            description: 'Ваша персональная подборка лучших композиций',
            createdAt: Date.now(),
            tracks: [],
          },
          {
            id: 'pl-chill-vibes',
            title: 'Night Studio Vibes',
            description: 'Спокойная атмосфера для кодинга и отдыха',
            createdAt: Date.now() - 86400000,
            tracks: [],
          },
        ];
      }
    } catch (e) {
      console.error('Error loading storage data:', e);
    }
  }

  public isFavorite(trackId: string): boolean {
    return this.favorites.has(trackId);
  }

  public toggleFavorite(trackId: string): boolean {
    const isFav = this.favorites.has(trackId);
    if (isFav) {
      this.favorites.delete(trackId);
    } else {
      this.favorites.add(trackId);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(this.favorites)));
    return !isFav;
  }

  public addToHistory(track: AudioTrack): void {
    this.history = [track, ...this.history.filter((t) => t.id !== track.id)].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
  }

  public getHistory(): AudioTrack[] {
    return [...this.history];
  }

  public getPlaylists(): StoredPlaylist[] {
    return [...this.playlists];
  }

  public createPlaylist(title: string, description?: string): StoredPlaylist {
    const newPlaylist: StoredPlaylist = {
      id: `pl-${Date.now()}`,
      title: title.trim() || 'Новый плейлист',
      description,
      createdAt: Date.now(),
      tracks: [],
    };
    this.playlists.push(newPlaylist);
    this.savePlaylists();
    return newPlaylist;
  }

  public deletePlaylist(id: string): boolean {
    const initialLen = this.playlists.length;
    this.playlists = this.playlists.filter((p) => p.id !== id);
    if (this.playlists.length !== initialLen) {
      this.savePlaylists();
      return true;
    }
    return false;
  }

  public addTrackToPlaylist(playlistId: string, track: AudioTrack): boolean {
    const pl = this.playlists.find((p) => p.id === playlistId);
    if (!pl) return false;
    if (!pl.tracks.some((t) => t.id === track.id)) {
      pl.tracks.push(track);
      this.savePlaylists();
      return true;
    }
    return false;
  }

  public removeTrackFromPlaylist(playlistId: string, trackId: string): boolean {
    const pl = this.playlists.find((p) => p.id === playlistId);
    if (!pl) return false;
    pl.tracks = pl.tracks.filter((t) => t.id !== trackId);
    this.savePlaylists();
    return true;
  }

  private savePlaylists(): void {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(this.playlists));
  }
}
