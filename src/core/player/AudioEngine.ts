import { AudioTrack } from '../../types';
import Hls from 'hls.js';

export type AudioEngineEvent = 
  | 'timeupdate'
  | 'durationchange'
  | 'play'
  | 'pause'
  | 'ended'
  | 'error'
  | 'loading';

type EventHandler = (...args: any[]) => void;

export class AudioEngine {
  private static instance: AudioEngine;
  private audio: HTMLAudioElement;
  private hls: Hls | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private freqData: Uint8Array = new Uint8Array(32);
  private listeners: Map<AudioEngineEvent, Set<EventHandler>> = new Map();
  private isInitialized = false;

  private constructor() {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.audio.crossOrigin = 'anonymous';

    this.setupListeners();
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Lazy initializes Web Audio API after first user interaction
   */
  private initAudioContext(): void {
    if (this.isInitialized) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 64; // Gives 32 frequency bins
        this.freqData = new Uint8Array(this.analyser.frequencyBinCount);

        this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
        this.isInitialized = true;
      }
    } catch (e) {
      console.warn('Web Audio API Analyser not initialized (likely CORS or autoplay restriction):', e);
    }
  }

  private setupListeners(): void {
    this.audio.addEventListener('timeupdate', () => {
      this.emit('timeupdate', this.audio.currentTime);
    });

    this.audio.addEventListener('durationchange', () => {
      this.emit('durationchange', this.audio.duration || 0);
    });

    this.audio.addEventListener('play', () => {
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      this.emit('play');
    });

    this.audio.addEventListener('pause', () => {
      this.emit('pause');
    });

    this.audio.addEventListener('ended', () => {
      this.emit('ended');
    });

    this.audio.addEventListener('waiting', () => {
      this.emit('loading');
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      this.emit('error', this.audio.error);
    });
  }

  public async loadTrack(track: AudioTrack, autoPlay = true): Promise<void> {
    this.initAudioContext();

    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    const url = track.streamUrl;
    const isHls = url.includes('.m3u8') || url.includes('/hls');

    if (isHls && Hls.isSupported()) {
      this.hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      this.hls.loadSource(url);
      this.hls.attachMedia(this.audio);
    } else if (isHls && this.audio.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Apple WebKit HLS for iOS Safari & macOS
      this.audio.src = url;
      this.audio.load();
    } else {
      if (this.audio.src !== url) {
        this.audio.src = url;
        this.audio.load();
      }
    }

    this.updateMediaSession(track);

    if (autoPlay) {
      await this.play();
    }
  }

  public async play(): Promise<void> {
    this.initAudioContext();
    try {
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      await this.audio.play();
    } catch (err) {
      console.warn('Playback error or blocked by autoplay:', err);
      this.emit('error', err);
    }
  }

  public pause(): void {
    this.audio.pause();
  }

  public togglePlay(): void {
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  public seek(seconds: number): void {
    if (Number.isFinite(seconds) && seconds >= 0) {
      this.audio.currentTime = seconds;
    }
  }

  public setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.audio.volume = clamped;
  }

  public setMuted(muted: boolean): void {
    this.audio.muted = muted;
  }

  public getCurrentTime(): number {
    return this.audio.currentTime || 0;
  }

  public getDuration(): number {
    return this.audio.duration || 0;
  }

  public isPaused(): boolean {
    return this.audio.paused;
  }

  public getFrequencies(): Uint8Array {
    if (this.analyser && !this.audio.paused) {
      this.analyser.getByteFrequencyData(this.freqData as any);
      return this.freqData;
    }
    // Return empty / zeroed bins when paused
    return this.freqData.fill(0);
  }

  public on(event: AudioEngineEvent, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.listeners.get(event)?.delete(handler);
  }

  private emit(event: AudioEngineEvent, ...args: any[]): void {
    this.listeners.get(event)?.forEach((handler) => handler(...args));
  }

  private updateMediaSession(track: AudioTrack): void {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: [
          { src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' },
        ],
      });
    }
  }
}
