import './setup';
import { describe, it, expect, beforeEach } from 'vitest';
import { SoundCloudAuth } from '../src/core/soundcloud/SoundCloudAuth';
import { SoundCloudClient, DEFAULT_CLIENT_ID } from '../src/core/soundcloud/SoundCloudClient';
import { SoundCloudRawTrack, SoundCloudUser } from '../src/core/soundcloud/SoundCloudTypes';

describe('SoundCloud Integration', () => {
  beforeEach(() => {
    (global as any).localStorage.clear();
  });

  it('SoundCloudAuth handles 1-click sessionId and headers correctly', () => {
    const auth = SoundCloudAuth.getInstance();
    auth.logout();
    expect(auth.isAuthenticated()).toBe(false);

    // Mock native sessionId
    const mockUser: SoundCloudUser = {
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

  it('SoundCloudAuth connects profile by username/url and saves account permanently', async () => {
    const auth = SoundCloudAuth.getInstance();
    auth.logout();

    const mockProfileUser: SoundCloudUser = {
      id: 123456,
      username: 'Skrillex',
      avatar_url: 'https://i1.sndcdn.com/avatars-skrillex-large.jpg',
      permalink_url: 'https://soundcloud.com/skrillex',
      followers_count: 6710000,
      likes_count: 42,
      playlist_count: 10,
    };

    const res = await auth.connectWithProfile('skrillex', async (handle) => {
      expect(handle).toBe('skrillex');
      return mockProfileUser;
    });

    expect(res.success).toBe(true);
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.getAuthType()).toBe('profile');
    expect(auth.getUser()?.username).toBe('Skrillex');
    expect(localStorage.getItem('sonicflow_sc_auth_type')).toBe('profile');
    expect(localStorage.getItem('sonicflow_sc_profile_handle')).toBe('skrillex');
    expect(localStorage.getItem('sonicflow_sc_user')).toContain('Skrillex');
  });

  it('SoundCloudAuth connects with token and saves account permanently', async () => {
    const auth = SoundCloudAuth.getInstance();
    auth.logout();

    (global as any).fetch = async (url: string) => {
      if (url.includes('/me?oauth_token=2-test-token-123')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 9988,
            username: 'TokenUser',
            avatar_url: 'https://i1.sndcdn.com/avatars-token-large.jpg',
            permalink_url: 'https://soundcloud.com/tokenuser',
            likes_count: 88,
          }),
        };
      }
      return { ok: false, status: 401 };
    };

    const res = await auth.loginWithToken('2-test-token-123');
    expect(res.success).toBe(true);
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.getToken()).toBe('2-test-token-123');
    expect(auth.getUser()?.username).toBe('TokenUser');
    expect(localStorage.getItem('sonicflow_sc_token')).toBe('2-test-token-123');
    expect(localStorage.getItem('sonicflow_sc_user')).toContain('TokenUser');
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

  it('SoundCloudClient manages and persists client ID', () => {
    const client = SoundCloudClient.getInstance();
    expect(client.getClientId()).toBeTruthy();

    client.setClientId('test_client_id_1234567890abcdef');
    expect(client.getClientId()).toBe('test_client_id_1234567890abcdef');
    expect(localStorage.getItem('sonicflow_sc_client_id')).toBe('test_client_id_1234567890abcdef');

    // Reset back to verified default
    client.setClientId(DEFAULT_CLIENT_ID);
    expect(client.getClientId()).toBe(DEFAULT_CLIENT_ID);
  });

  it('SoundCloudAuth.openInDefaultBrowser invokes browser launcher without errors', () => {
    let openedUrl = '';
    (global as any).window = {
      open: (url: string) => {
        openedUrl = url;
        return {};
      },
      location: { protocol: 'http:' },
    };
    (global as any).fetch = () => Promise.resolve({ ok: true });

    SoundCloudAuth.openInDefaultBrowser('https://soundcloud.com/connect');
    expect(openedUrl).toBe('https://soundcloud.com/connect');
  });
});
