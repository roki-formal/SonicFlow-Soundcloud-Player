export interface SoundCloudUser {
  id: number;
  urn?: string;
  username: string;
  avatar_url: string;
  permalink_url: string;
  followers_count?: number;
  followings_count?: number;
  likes_count?: number;
  track_count?: number;
  playlist_count?: number;
  country?: string;
}

export interface SoundCloudMediaTranscoding {
  url: string;
  preset?: string;
  duration?: number;
  snipped?: boolean;
  format?: {
    protocol: 'hls' | 'progressive';
    mime_type: string;
  };
  quality?: string;
}

export interface SoundCloudRawTrack {
  id: number;
  urn?: string;
  title: string;
  permalink_url?: string;
  duration: number; // in milliseconds
  artwork_url?: string;
  created_at?: string;
  genre?: string;
  likes_count?: number;
  playback_count?: number;
  user?: {
    id: number;
    urn?: string;
    username: string;
    avatar_url?: string;
    permalink_url?: string;
  };
  media?: {
    transcodings: SoundCloudMediaTranscoding[];
  };
  stream_url?: string;
}

export interface SoundCloudRawPlaylist {
  id: number;
  urn?: string;
  title: string;
  description?: string;
  track_count: number;
  artwork_url?: string;
  created_at?: string;
  tracks?: SoundCloudRawTrack[];
}

export interface OAuthLoginResponse {
  url: string;
  loginRequestId: string;
}

export interface OAuthLoginStatusResponse {
  status: 'pending' | 'completed' | 'failed' | 'expired';
  sessionId?: string;
  step?: 'token' | 'extract' | 'finalizing';
  error?: string;
  redirectUrl?: string;
}
