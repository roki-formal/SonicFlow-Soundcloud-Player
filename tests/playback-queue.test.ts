import { describe, it, expect, beforeEach } from 'vitest';
import { PlaybackQueue } from '../src/core/player/PlaybackQueue';
import { AudioTrack } from '../src/types';

const mockTracks: AudioTrack[] = [
  { id: '1', title: 'Track 1', artist: 'Artist 1', album: 'Alb', duration: 100, coverUrl: '', streamUrl: '', provider: 'open-catalog' },
  { id: '2', title: 'Track 2', artist: 'Artist 2', album: 'Alb', duration: 120, coverUrl: '', streamUrl: '', provider: 'open-catalog' },
  { id: '3', title: 'Track 3', artist: 'Artist 3', album: 'Alb', duration: 140, coverUrl: '', streamUrl: '', provider: 'open-catalog' },
];

describe('PlaybackQueue', () => {
  let queue: PlaybackQueue;

  beforeEach(() => {
    queue = new PlaybackQueue(mockTracks);
  });

  it('should initialize with correct tracks and current track', () => {
    expect(queue.getTracks()).toHaveLength(3);
    expect(queue.getCurrentTrack()?.id).toBe('1');
    expect(queue.getCurrentIndex()).toBe(0);
  });

  it('should advance to next track', () => {
    const next = queue.next();
    expect(next?.id).toBe('2');
    expect(queue.getCurrentIndex()).toBe(1);
  });

  it('should handle repeat all mode by wrapping around', () => {
    queue.next(); // 2
    queue.next(); // 3
    const wrapped = queue.next(); // wrap to 1
    expect(wrapped?.id).toBe('1');
    expect(queue.getCurrentIndex()).toBe(0);
  });

  it('should handle repeat one mode', () => {
    queue.cycleRepeatMode(); // 'one'
    expect(queue.getRepeatMode()).toBe('one');
    const same = queue.next();
    expect(same?.id).toBe('1');
  });

  it('should add track to queue', () => {
    const newTrack: AudioTrack = { id: '4', title: 'Track 4', artist: 'Artist 4', album: 'Alb', duration: 150, coverUrl: '', streamUrl: '', provider: 'open-catalog' };
    queue.addTrack(newTrack);
    expect(queue.getTracks()).toHaveLength(4);
  });

  it('should reorder tracks correctly', () => {
    queue.reorder(0, 2);
    const tracks = queue.getTracks();
    expect(tracks[2].id).toBe('1');
  });

  it('should toggle shuffle without losing tracks', () => {
    const isShuffle = queue.toggleShuffle();
    expect(isShuffle).toBe(true);
    expect(queue.getTracks()).toHaveLength(3);
    const ids = queue.getTracks().map((t) => t.id).sort();
    expect(ids).toEqual(['1', '2', '3']);
  });
});
