import { AudioTrack } from '../../types';

export class LocalFilesProvider {
  private localTracks: AudioTrack[] = [];

  public async processFiles(fileList: FileList | File[]): Promise<AudioTrack[]> {
    const newTracks: AudioTrack[] = [];
    const files = Array.from(fileList);

    for (const file of files) {
      if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(file.name)) {
        continue;
      }

      const streamUrl = URL.createObjectURL(file);
      // Clean up artist and title from filename (e.g. "Artist - Title.mp3")
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const parts = cleanName.split(' - ');
      let artist = 'Local Artist';
      let title = cleanName;

      if (parts.length >= 2) {
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }

      // Read audio duration using HTML5 Audio
      const duration = await this.getAudioDuration(streamUrl);

      const track: AudioTrack = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title,
        artist,
        album: 'Local Audio Library',
        year: new Date().getFullYear(),
        duration: Math.round(duration) || 180,
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
        streamUrl,
        provider: 'local',
      };

      newTracks.push(track);
      this.localTracks.push(track);
    }

    return newTracks;
  }

  public getTracks(): AudioTrack[] {
    return [...this.localTracks];
  }

  private getAudioDuration(url: string): Promise<number> {
    return new Promise((resolve) => {
      const a = new Audio(url);
      a.addEventListener('loadedmetadata', () => {
        resolve(a.duration);
      });
      a.addEventListener('error', () => {
        resolve(180);
      });
      // Safety timeout
      setTimeout(() => resolve(180), 2000);
    });
  }
}
