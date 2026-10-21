import { LyricLine } from '../../types';

export interface ParsedLrcResult {
  lines: LyricLine[];
  metadata: Record<string, string>;
  isSynced: boolean;
}

/**
 * Robust LRC & TXT lyrics parser
 * Supports standard [mm:ss.xx], extended [mm:ss.xxx], and multi-timestamp lines.
 */
export class LrcParser {
  private static TIMESTAMP_REGEX = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/g;
  private static META_REGEX = /^\[(ti|ar|al|by|offset|length):([^\]]+)\]$/i;

  public static parse(lrcContent: string): ParsedLrcResult {
    const lines: LyricLine[] = [];
    const metadata: Record<string, string> = {};
    let isSynced = false;

    if (!lrcContent || typeof lrcContent !== 'string') {
      return { lines: [], metadata: {}, isSynced: false };
    }

    const rawLines = lrcContent.split(/\r?\n/);

    for (const rawLine of rawLines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      // Check metadata
      const metaMatch = trimmed.match(this.META_REGEX);
      if (metaMatch) {
        const [, key, val] = metaMatch;
        metadata[key.toLowerCase()] = val.trim();
        continue;
      }

      // Check timestamps
      const timestamps: number[] = [];
      let match: RegExpExecArray | null;
      let lastIndex = 0;

      this.TIMESTAMP_REGEX.lastIndex = 0;
      while ((match = this.TIMESTAMP_REGEX.exec(trimmed)) !== null) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const fractionsStr = match[3] || '0';
        // fractions can be 2 digits (centiseconds) or 3 digits (milliseconds)
        const milliseconds = fractionsStr.length === 2 
          ? parseInt(fractionsStr, 10) * 10 
          : parseInt(fractionsStr.padEnd(3, '0').slice(0, 3), 10);

        const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;
        timestamps.push(totalSeconds);
        lastIndex = this.TIMESTAMP_REGEX.lastIndex;
      }

      const text = trimmed.slice(lastIndex).trim();

      if (timestamps.length > 0) {
        isSynced = true;
        for (const time of timestamps) {
          lines.push({
            time,
            text,
          });
        }
      } else {
        // Plain text line without timestamps
        lines.push({
          time: 0,
          text: trimmed,
        });
      }
    }

    // Sort synced lines by time
    if (isSynced) {
      lines.sort((a, b) => a.time - b.time);
    }

    return { lines, metadata, isSynced };
  }

  /**
   * Fast binary search to find the active lyric line index for a given playback time.
   * Runs in O(log N).
   */
  public static findActiveIndex(lyrics: LyricLine[], currentTime: number): number {
    if (!lyrics || lyrics.length === 0) return -1;
    if (currentTime < lyrics[0].time) return -1;

    let low = 0;
    let high = lyrics.length - 1;
    let best = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (lyrics[mid].time <= currentTime) {
        best = mid;
        low = mid + 1; // Try to find a later matching line
      } else {
        high = mid - 1;
      }
    }

    return best;
  }
}
