import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { AudioTrack, RepeatMode, LyricsTab, StoredPlaylist } from '../../types';
import { AudioEngine } from './AudioEngine';
import { PlaybackQueue } from './PlaybackQueue';
import { INITIAL_TRACKS } from '../music-providers/catalog';
import { StorageManager } from '../storage/StorageManager';
import { SoundCloudAuth } from '../soundcloud/SoundCloudAuth';
import { SoundCloudClient } from '../soundcloud/SoundCloudClient';
import { SoundCloudUser } from '../soundcloud/SoundCloudTypes';
import { CustomizationManager, CustomizationSettings } from '../settings/CustomizationManager';

export type NavSection = 'home' | 'albums' | 'local' | 'favorites' | 'playlists';

interface PlayerContextValue {
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
  isThemeEditorOpen: boolean;
  isMobileView: boolean;
  activeSection: NavSection;
  searchQuery: string;
  audioFrequencies: Uint8Array;
  soundCloudUser: SoundCloudUser | null;
  isSoundCloudLoggedIn: boolean;
  isLoginModalOpen: boolean;
  soundCloudLikes: AudioTrack[];
  soundCloudStream: AudioTrack[];
  soundCloudPlaylists: StoredPlaylist[];
  isSyncing: boolean;
  customizationSettings: CustomizationSettings;

  // Actions
  playTrack: (track: AudioTrack, newQueue?: AudioTrack[]) => void;
  togglePlay: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (from: number, to: number) => void;
  toggleLyrics: (open?: boolean) => void;
  setLyricsTab: (tab: LyricsTab) => void;
  toggleThemeEditor: (open?: boolean) => void;
  toggleMobileView: (mobile?: boolean) => void;
  toggleLoginModal: (open?: boolean) => void;
  syncSoundCloudData: () => Promise<void>;
  updateCustomizationSettings: (partial: Partial<CustomizationSettings>) => void;
  resetCustomizationSettings: () => void;
  setActiveSection: (section: NavSection) => void;
  setSearchQuery: (q: string) => void;
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const engine = useMemo(() => AudioEngine.getInstance(), []);
  const storage = useMemo(() => StorageManager.getInstance(), []);
  const queueManager = useMemo(() => new PlaybackQueue(INITIAL_TRACKS), []);
  const scAuth = useMemo(() => SoundCloudAuth.getInstance(), []);
  const scClient = useMemo(() => SoundCloudClient.getInstance(), []);
  const customManager = useMemo(() => CustomizationManager.getInstance(), []);

  const [customizationSettings, setCustomizationSettings] = useState<CustomizationSettings>(customManager.getSettings());

  useEffect(() => {
    return customManager.subscribe((s) => setCustomizationSettings(s));
  }, [customManager]);

  const updateCustomizationSettings = useCallback((partial: Partial<CustomizationSettings>) => {
    customManager.updateSettings(partial);
  }, [customManager]);

  const resetCustomizationSettings = useCallback(() => {
    customManager.resetToDefaults();
  }, [customManager]);

  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(INITIAL_TRACKS[0].duration);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMutedState] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [queue, setQueue] = useState<AudioTrack[]>(INITIAL_TRACKS);
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [lyricsTab, setLyricsTab] = useState<LyricsTab>('synced');
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState<boolean>(false);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [audioFrequencies, setAudioFrequencies] = useState<Uint8Array>(new Uint8Array(32));
  const [, setFavTick] = useState<number>(0);

  // SoundCloud state
  const [soundCloudUser, setSoundCloudUser] = useState<SoundCloudUser | null>(scAuth.getUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [soundCloudLikes, setSoundCloudLikes] = useState<AudioTrack[]>([]);
  const [soundCloudStream, setSoundCloudStream] = useState<AudioTrack[]>([]);
  const [soundCloudPlaylists, setSoundCloudPlaylists] = useState<StoredPlaylist[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Synchronize SoundCloud data
  const syncSoundCloudData = useCallback(async () => {
    if (!scAuth.isAuthenticated()) return;
    setIsSyncing(true);
    try {
      const [likes, stream, playlists] = await Promise.all([
        scClient.getMyLikes(50),
        scClient.getMyStream(40),
        scClient.getMyPlaylists(),
      ]);
      setSoundCloudLikes(likes);
      setSoundCloudStream(stream);
      setSoundCloudPlaylists(playlists);
    } catch (e) {
      console.error('Error synchronizing SoundCloud data:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [scAuth, scClient]);

  // Subscribe to SoundCloud auth changes
  useEffect(() => {
    const unsub = scAuth.subscribe((user) => {
      setSoundCloudUser(user);
      if (user) {
        syncSoundCloudData();
      } else {
        setSoundCloudLikes([]);
        setSoundCloudStream([]);
        setSoundCloudPlaylists([]);
      }
    });
    if (scAuth.isAuthenticated()) {
      syncSoundCloudData();
    }
    return unsub;
  }, [scAuth, syncSoundCloudData]);

  // Sync queue updates
  useEffect(() => {
    return queueManager.subscribe(() => {
      setQueue(queueManager.getTracks());
      setQueueIndex(queueManager.getCurrentIndex());
      setIsShuffle(queueManager.getIsShuffle());
      setRepeatMode(queueManager.getRepeatMode());
    });
  }, [queueManager]);

  // AudioEngine events
  useEffect(() => {
    const unsubTime = engine.on('timeupdate', (time: number) => {
      setCurrentTime(time);
    });

    const unsubDur = engine.on('durationchange', (dur: number) => {
      if (dur > 0) setDuration(dur);
    });

    const unsubPlay = engine.on('play', () => setIsPlaying(true));
    const unsubPause = engine.on('pause', () => setIsPlaying(false));

    const unsubEnded = engine.on('ended', () => {
      const nextTrack = queueManager.next();
      if (nextTrack) {
        setCurrentTrack(nextTrack);
        engine.loadTrack(nextTrack, true);
        storage.addToHistory(nextTrack);
      } else {
        setIsPlaying(false);
      }
    });

    return () => {
      unsubTime();
      unsubDur();
      unsubPlay();
      unsubPause();
      unsubEnded();
    };
  }, [engine, queueManager, storage]);

  // Frequency animation loop for visualizer
  useEffect(() => {
    let animId: number;
    const updateFreq = () => {
      if (isPlaying) {
        const freqs = engine.getFrequencies();
        setAudioFrequencies(new Uint8Array(freqs));
      }
      animId = requestAnimationFrame(updateFreq);
    };
    animId = requestAnimationFrame(updateFreq);
    return () => cancelAnimationFrame(animId);
  }, [engine, isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          engine.togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          engine.seek(engine.getCurrentTime() + 5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          engine.seek(Math.max(0, engine.getCurrentTime() - 5));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolumeState((v) => {
            const nextV = Math.min(1, v + 0.05);
            engine.setVolume(nextV);
            return nextV;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolumeState((v) => {
            const nextV = Math.max(0, v - 0.05);
            engine.setVolume(nextV);
            return nextV;
          });
          break;
        case 'KeyM':
          e.preventDefault();
          setIsMutedState((m) => {
            const nextM = !m;
            engine.setMuted(nextM);
            return nextM;
          });
          break;
        case 'KeyL':
          e.preventDefault();
          setIsLyricsOpen((l) => !l);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine]);

  const playTrack = useCallback(
    (track: AudioTrack, newQueue?: AudioTrack[]) => {
      if (newQueue) {
        const startIdx = newQueue.findIndex((t) => t.id === track.id);
        queueManager.setQueue(newQueue, Math.max(0, startIdx));
      } else {
        const existingIdx = queueManager.getTracks().findIndex((t) => t.id === track.id);
        if (existingIdx !== -1) {
          queueManager.selectTrack(existingIdx);
        } else {
          queueManager.addNext(track);
          queueManager.next();
        }
      }

      setCurrentTrack(track);
      setDuration(track.duration);
      setCurrentTime(0);
      engine.loadTrack(track, true);
      storage.addToHistory(track);
    },
    [engine, queueManager, storage]
  );

  const togglePlay = useCallback(() => {
    if (!currentTrack && queue.length > 0) {
      playTrack(queue[0]);
    } else {
      engine.togglePlay();
    }
  }, [currentTrack, queue, playTrack, engine]);

  const pause = useCallback(() => {
    engine.pause();
  }, [engine]);

  const next = useCallback(() => {
    const nextTrack = queueManager.next();
    if (nextTrack) {
      setCurrentTrack(nextTrack);
      setDuration(nextTrack.duration);
      setCurrentTime(0);
      engine.loadTrack(nextTrack, true);
      storage.addToHistory(nextTrack);
    }
  }, [engine, queueManager, storage]);

  const previous = useCallback(() => {
    const prevTrack = queueManager.previous(currentTime);
    if (prevTrack) {
      setCurrentTrack(prevTrack);
      setDuration(prevTrack.duration);
      setCurrentTime(0);
      engine.loadTrack(prevTrack, true);
      storage.addToHistory(prevTrack);
    }
  }, [engine, queueManager, currentTime, storage]);

  const seek = useCallback(
    (seconds: number) => {
      engine.seek(seconds);
      setCurrentTime(seconds);
    },
    [engine]
  );

  const setVolume = useCallback(
    (vol: number) => {
      const v = Math.max(0, Math.min(1, vol));
      setVolumeState(v);
      engine.setVolume(v);
      if (isMuted && v > 0) {
        setIsMutedState(false);
        engine.setMuted(false);
      }
    },
    [engine, isMuted]
  );

  const toggleMute = useCallback(() => {
    const nextM = !isMuted;
    setIsMutedState(nextM);
    engine.setMuted(nextM);
  }, [engine, isMuted]);

  const toggleShuffle = useCallback(() => {
    const shuffled = queueManager.toggleShuffle();
    setIsShuffle(shuffled);
  }, [queueManager]);

  const cycleRepeat = useCallback(() => {
    const mode = queueManager.cycleRepeatMode();
    setRepeatMode(mode);
  }, [queueManager]);

  const removeFromQueue = useCallback(
    (index: number) => {
      queueManager.removeTrack(index);
    },
    [queueManager]
  );

  const reorderQueue = useCallback(
    (from: number, to: number) => {
      queueManager.reorder(from, to);
    },
    [queueManager]
  );

  const toggleLyrics = useCallback((open?: boolean) => {
    setIsLyricsOpen((prev) => (open !== undefined ? open : !prev));
  }, []);

  const toggleThemeEditor = useCallback((open?: boolean) => {
    setIsThemeEditorOpen((prev) => (open !== undefined ? open : !prev));
  }, []);

  const toggleMobileView = useCallback((mobile?: boolean) => {
    setIsMobileView((prev) => (mobile !== undefined ? mobile : !prev));
  }, []);

  const toggleLoginModal = useCallback((open?: boolean) => {
    setIsLoginModalOpen((prev) => (open !== undefined ? open : !prev));
  }, []);

  const toggleFavorite = useCallback(
    async (trackId: string) => {
      const isNowFav = storage.toggleFavorite(trackId);
      setFavTick((t) => t + 1);

      // If track is from SoundCloud or user is authenticated, sync like with soundcloud.com
      if (scAuth.isAuthenticated()) {
        await scClient.syncLike(trackId, isNowFav);
        // Refresh likes list in background
        scClient.getMyLikes(50).then((likes) => setSoundCloudLikes(likes)).catch(() => {});
      }
    },
    [storage, scAuth, scClient]
  );

  const isFavorite = useCallback(
    (trackId: string) => {
      return storage.isFavorite(trackId);
    },
    [storage]
  );

  const value = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    queue,
    queueIndex,
    isLyricsOpen,
    lyricsTab,
    isThemeEditorOpen,
    isMobileView,
    activeSection,
    searchQuery,
    audioFrequencies,
    soundCloudUser,
    isSoundCloudLoggedIn: Boolean(soundCloudUser),
    isLoginModalOpen,
    soundCloudLikes,
    soundCloudStream,
    soundCloudPlaylists,
    isSyncing,
    customizationSettings,
    playTrack,
    togglePlay,
    pause,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    removeFromQueue,
    reorderQueue,
    toggleLyrics,
    setLyricsTab,
    toggleThemeEditor,
    toggleMobileView,
    toggleLoginModal,
    syncSoundCloudData,
    updateCustomizationSettings,
    resetCustomizationSettings,
    setActiveSection,
    setSearchQuery,
    toggleFavorite,
    isFavorite,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = (): PlayerContextValue => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
