import './setup';
import { describe, it, expect, beforeEach } from 'vitest';
import { StorageManager } from '../src/core/storage/StorageManager';
import { AudioTrack } from '../src/types';

describe('StorageManager', () => {
  let storage: StorageManager;

  beforeEach(() => {
    (global as any).localStorage.clear();
    storage = StorageManager.getInstance();
  });

  it('should toggle favorites', () => {
    const isFavNow = storage.toggleFavorite('track-test-1');
    expect(isFavNow).toBe(true);
    expect(storage.isFavorite('track-test-1')).toBe(true);

    const isFavSecond = storage.toggleFavorite('track-test-1');
    expect(isFavSecond).toBe(false);
    expect(storage.isFavorite('track-test-1')).toBe(false);
  });

  it('should create and delete playlists', () => {
    const pl = storage.createPlaylist('Synthwave Sessions', 'Electronic synth music');
    expect(pl.title).toBe('Synthwave Sessions');
    expect(storage.getPlaylists().some((p) => p.id === pl.id)).toBe(true);

    const deleted = storage.deletePlaylist(pl.id);
    expect(deleted).toBe(true);
    expect(storage.getPlaylists().some((p) => p.id === pl.id)).toBe(false);
  });

  it('should add tracks to playlist and prevent duplicates', () => {
    const pl = storage.createPlaylist('Rock Hits');
    const track: AudioTrack = {
      id: 't-10',
      title: 'Thunder',
      artist: 'Band',
      album: 'Alb',
      duration: 200,
      coverUrl: '',
      streamUrl: '',
      provider: 'open-catalog',
    };

    const added1 = storage.addTrackToPlaylist(pl.id, track);
    expect(added1).toBe(true);

    const addedDuplicate = storage.addTrackToPlaylist(pl.id, track);
    expect(addedDuplicate).toBe(false);
  });
});
