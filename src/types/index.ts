export interface LyricLine {
  time: number; // in seconds
  text: string;
  words?: { word: string; time: number }[];
}

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  year?: number | string;
  duration: number; // seconds
  coverUrl: string;
  streamUrl: string;
  lyricsLrc?: string;
  plainLyrics?: string;
  provider: 'soundcloud' | 'open-catalog' | 'local';
  isFavorite?: boolean;
  bpm?: number;
  genre?: string;
}

export interface Album {
  id: string;
  title: string;
  year: number;
  coverUrl: string;
  trackCount: number;
}

export interface SimilarArtist {
  id: string;
  name: string;
  avatarUrl: string;
  isFollowed: boolean;
}

export interface ArtistProfile {
  id: string;
  name: string;
  avatarUrl: string;
  followers: string;
  isFollowed: boolean;
  albums: Album[];
  popularTracks: AudioTrack[];
  similarArtists: SimilarArtist[];
}

export interface FriendActivity {
  id: string;
  name: string;
  avatarUrl: string;
  currentTrack: string;
  artist: string;
  isOnline: boolean;
  timeAgo: string;
}

export type RepeatMode = 'off' | 'all' | 'one';
export type LyricsTab = 'karaoke' | 'synced' | 'unsynced' | 'genius';

export interface PlaybackState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: AudioTrack[];
  queueIndex: number;
  isLyricsOpen: boolean;
  lyricsTab: LyricsTab;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  colorScheme: 'dark' | 'light';
  preview: {
    bg: string;
    surface: string;
    accent: string;
    text: string;
  };
  tokens: Record<string, string>;
  source: 'builtin' | 'user';
}

export interface StoredPlaylist {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  createdAt: number;
  tracks: AudioTrack[];
}
