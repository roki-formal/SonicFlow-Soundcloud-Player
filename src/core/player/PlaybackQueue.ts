import { AudioTrack, RepeatMode } from '../../types';

export class PlaybackQueue {
  private queue: AudioTrack[] = [];
  private originalQueue: AudioTrack[] = [];
  private currentIndex = 0;
  private isShuffle = false;
  private repeatMode: RepeatMode = 'all';
  private listeners: Set<() => void> = new Set();

  constructor(initialTracks: AudioTrack[] = []) {
    this.setQueue(initialTracks);
  }

  public getTracks(): AudioTrack[] {
    return [...this.queue];
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getCurrentTrack(): AudioTrack | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.queue.length) {
      return this.queue[this.currentIndex];
    }
    return null;
  }

  public setQueue(tracks: AudioTrack[], startIndex = 0): void {
    this.originalQueue = [...tracks];
    this.queue = this.isShuffle ? this.shuffleArray([...tracks], tracks[startIndex]) : [...tracks];
    this.currentIndex = Math.max(0, Math.min(startIndex, this.queue.length - 1));
    this.notify();
  }

  public addTrack(track: AudioTrack): void {
    this.queue.push(track);
    this.originalQueue.push(track);
    this.notify();
  }

  public addNext(track: AudioTrack): void {
    const insertIdx = this.currentIndex + 1;
    this.queue.splice(insertIdx, 0, track);
    this.originalQueue.splice(insertIdx, 0, track);
    this.notify();
  }

  public removeTrack(index: number): AudioTrack | null {
    if (index < 0 || index >= this.queue.length) return null;
    const [removed] = this.queue.splice(index, 0);
    const origIdx = this.originalQueue.indexOf(removed);
    if (origIdx !== -1) {
      this.originalQueue.splice(origIdx, 1);
    }
    if (index < this.currentIndex) {
      this.currentIndex--;
    } else if (index === this.currentIndex && this.currentIndex >= this.queue.length) {
      this.currentIndex = Math.max(0, this.queue.length - 1);
    }
    this.notify();
    return removed;
  }

  public reorder(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this.queue.length || toIndex < 0 || toIndex >= this.queue.length) {
      return;
    }
    const currentTrack = this.getCurrentTrack();
    const [moved] = this.queue.splice(fromIndex, 1);
    this.queue.splice(toIndex, 0, moved);

    if (currentTrack) {
      this.currentIndex = this.queue.indexOf(currentTrack);
    }
    this.notify();
  }

  public next(): AudioTrack | null {
    if (this.queue.length === 0) return null;

    if (this.repeatMode === 'one') {
      return this.getCurrentTrack();
    }

    if (this.currentIndex < this.queue.length - 1) {
      this.currentIndex++;
      this.notify();
      return this.queue[this.currentIndex];
    } else if (this.repeatMode === 'all') {
      this.currentIndex = 0;
      this.notify();
      return this.queue[0];
    }

    return null;
  }

  public previous(currentTime = 0): AudioTrack | null {
    if (this.queue.length === 0) return null;

    // If more than 3 seconds in, restart current track
    if (currentTime > 3) {
      return this.getCurrentTrack();
    }

    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.notify();
      return this.queue[this.currentIndex];
    } else if (this.repeatMode === 'all') {
      this.currentIndex = this.queue.length - 1;
      this.notify();
      return this.queue[this.currentIndex];
    }

    return this.getCurrentTrack();
  }

  public selectTrack(index: number): AudioTrack | null {
    if (index >= 0 && index < this.queue.length) {
      this.currentIndex = index;
      this.notify();
      return this.queue[this.currentIndex];
    }
    return null;
  }

  public toggleShuffle(): boolean {
    this.isShuffle = !this.isShuffle;
    const current = this.getCurrentTrack();

    if (this.isShuffle) {
      this.queue = this.shuffleArray([...this.originalQueue], current || undefined);
      this.currentIndex = current ? this.queue.indexOf(current) : 0;
    } else {
      this.queue = [...this.originalQueue];
      this.currentIndex = current ? this.queue.indexOf(current) : 0;
    }

    this.notify();
    return this.isShuffle;
  }

  public cycleRepeatMode(): RepeatMode {
    const modes: RepeatMode[] = ['all', 'one', 'off'];
    const nextIdx = (modes.indexOf(this.repeatMode) + 1) % modes.length;
    this.repeatMode = modes[nextIdx];
    this.notify();
    return this.repeatMode;
  }

  public getRepeatMode(): RepeatMode {
    return this.repeatMode;
  }

  public getIsShuffle(): boolean {
    return this.isShuffle;
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    this.listeners.forEach((cb) => cb());
  }

  private shuffleArray(array: AudioTrack[], keepFirst?: AudioTrack): AudioTrack[] {
    const list = [...array];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    if (keepFirst) {
      const idx = list.indexOf(keepFirst);
      if (idx !== -1) {
        list.splice(idx, 1);
        list.unshift(keepFirst);
      }
    }
    return list;
  }
}
