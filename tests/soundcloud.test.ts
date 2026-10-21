import './setup';
import { describe, it, expect, beforeEach } from 'vitest';
import { SoundCloudAuth } from '../src/core/soundcloud/SoundCloudAuth';
import { SoundCloudClient } from '../src/core/soundcloud/SoundCloudClient';
import { SoundCloudRawTrack } from '../src/core/soundcloud/SoundCloudTypes';

describe('SoundCloud Integration', () => {
  beforeEach(() => {
    (global as any).localStorage.clear();
  });

  it('SoundCloudAuth handles 1-click sessionId and headers correctly', () => {
    const auth = SoundCloudAuth.getInstance();
    auth.logout();
    expect(auth.isAuthenticated()).toBe(false);

    // Mock native sessionId
    const mockUser = {
      id: 887766,
      username: 'ElectronicProducer',
      avatar_url: 'https://i1.sndcdn.com/avatars-0001-large.jpg',
      permalink_url: 'https://soundcloud.com/electronicproducer',
      followers_count: 520,
      track_count: 14,
    };

    localStorage.setItem('sonicflow_sc_session', 'sess_test_998877');
    localStorage.setItem('sonicflow_sc_user', JSON.stringify(mockUser));

    (auth as any).sessionId = 'sess_test_998877';
    (auth as any).user = mockUser;

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.getSessionId()).toBe('sess_test_998877');
    expect(auth.getUser()?.username).toBe('ElectronicProducer');

    const headers = auth.getAuthHeaders();
    expect(headers['x-session-id']).toBe('sess_test_998877');

    // Test logout clears session
    auth.logout();
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.getSessionId()).toBeNull();
    expect(localStorage.getItem('sonicflow_sc_session')).toBeNull();
  });

  it('SoundCloudClient maps raw tracks correctly with 500x500 cover art and URN support', async () => {
    const client = SoundCloudClient.getInstance();

    const rawTrack: SoundCloudRawTrack = {
      id: 104294821,
      urn: 'soundcloud:tracks:104294821',
      title: 'Midnight Drive (Synthwave Remaster)',
      duration: 215400, // ms
      genre: 'Synthwave',
      artwork_url: 'https://i1.sndcdn.com/artworks-xyz-large.jpg',
      created_at: '2023-05-10T12:00:00Z',
      user: {
        id: 5544,
        username: 'Kavinsky Vibe',
        avatar_url: 'https://i1.sndcdn.com/avatars-abc-large.jpg',
        permalink_url: 'https://soundcloud.com/kavinskyvibe',
      },
      media: {
        transcodings: [],
      },
    };

    const mapped = await client.mapTrack(rawTrack);

    expect(mapped.id).toBe('sc-104294821');
    expect(mapped.title).toBe('Midnight Drive (Synthwave Remaster)');
    expect(mapped.artist).toBe('Kavinsky Vibe');
    expect(mapped.duration).toBe(215); // converted from ms to seconds
    expect(mapped.year).toBe(2023);
    expect(mapped.genre).toBe('Synthwave');
    // Check artwork URL was upgraded from -large to -t500x500 for retina displays
    expect(mapped.coverUrl).toBe('https://i1.sndcdn.com/artworks-xyz-t500x500.jpg');
    expect(mapped.provider).toBe('soundcloud');
  });
});
