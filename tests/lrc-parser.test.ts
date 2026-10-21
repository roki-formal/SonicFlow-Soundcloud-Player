import { describe, it, expect } from 'vitest';
import { LrcParser } from '../src/core/lyrics/LrcParser';

describe('LrcParser', () => {
  it('should parse standard LRC format correctly', () => {
    const lrc = `
[ti:Tip Toes]
[ar:half•alive]
[00:08.50]But still my pride is screaming
[00:13.20]My future will listen to me
[00:18.00]Listen to me
    `.trim();

    const result = LrcParser.parse(lrc);
    expect(result.isSynced).toBe(true);
    expect(result.metadata.ti).toBe('Tip Toes');
    expect(result.metadata.ar).toBe('half•alive');
    expect(result.lines).toHaveLength(3);
    expect(result.lines[0].time).toBe(8.5);
    expect(result.lines[0].text).toBe('But still my pride is screaming');
    expect(result.lines[1].time).toBe(13.2);
    expect(result.lines[2].time).toBe(18.0);
  });

  it('should handle multiple timestamps on a single line', () => {
    const lrc = '[00:10.00][00:20.00] Repeated chorus line';
    const result = LrcParser.parse(lrc);

    expect(result.isSynced).toBe(true);
    expect(result.lines).toHaveLength(2);
    expect(result.lines[0].time).toBe(10);
    expect(result.lines[1].time).toBe(20);
    expect(result.lines[0].text).toBe('Repeated chorus line');
  });

  it('should correctly binary search for the active line index', () => {
    const lines = [
      { time: 5, text: 'Line 1' },
      { time: 10, text: 'Line 2' },
      { time: 15, text: 'Line 3' },
      { time: 20, text: 'Line 4' },
    ];

    expect(LrcParser.findActiveIndex(lines, 0)).toBe(-1);
    expect(LrcParser.findActiveIndex(lines, 4.9)).toBe(-1);
    expect(LrcParser.findActiveIndex(lines, 5.0)).toBe(0);
    expect(LrcParser.findActiveIndex(lines, 8.5)).toBe(0);
    expect(LrcParser.findActiveIndex(lines, 10.0)).toBe(1);
    expect(LrcParser.findActiveIndex(lines, 14.99)).toBe(1);
    expect(LrcParser.findActiveIndex(lines, 15.0)).toBe(2);
    expect(LrcParser.findActiveIndex(lines, 19.9)).toBe(2);
    expect(LrcParser.findActiveIndex(lines, 20.0)).toBe(3);
    expect(LrcParser.findActiveIndex(lines, 99.0)).toBe(3);
  });

  it('should gracefully handle empty or invalid content', () => {
    expect(LrcParser.parse('').lines).toEqual([]);
    expect(LrcParser.findActiveIndex([], 10)).toBe(-1);
  });
});
