import React from 'react';
import { Play, ListMusic, Radio } from 'lucide-react';
import { usePlayer } from '../../core/player/PlayerContext';
import { StoredPlaylist } from '../../types';

export const AlbumShelf: React.FC = () => {
  const { playTrack, soundCloudPlaylists, trendingPlaylists, soundCloudUser, isMobileView } = usePlayer();

  const displayPlaylists: StoredPlaylist[] = soundCloudPlaylists.length > 0 
    ? soundCloudPlaylists 
    : trendingPlaylists.length > 0 
      ? trendingPlaylists 
      : [];

  const handlePlayPlaylist = (playlist: StoredPlaylist) => {
    if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  if (displayPlaylists.length === 0) {
    return null;
  }

  return (
    <section style={{ padding: isMobileView ? '0 16px 20px 16px' : '0 28px 24px 28px' }}>
      {/* Section Header */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            {soundCloudPlaylists.length > 0 ? 'Ваши плейлисты SoundCloud' : 'Популярные плейлисты SoundCloud'}
          </h2>
          <span style={{ fontSize: '11px', color: '#ff5500', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(255, 85, 0, 0.12)' }}>
            SoundCloud
          </span>
        </div>
      </div>

      {/* Horizontal Scroll Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
          gap: '18px',
          overflowX: 'auto',
          paddingBottom: '8px',
        }}
      >
        {displayPlaylists.slice(0, 8).map((playlist) => (
          <div 
            key={playlist.id}
            onClick={() => handlePlayPlaylist(playlist)}
            className="card-interactive"
            style={{ 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              padding: '8px',
              borderRadius: 'var(--radius-card, 12px)',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              transition: 'all var(--transition-fast)',
            }}
          >
            {/* Playlist Cover */}
            <div 
              style={{ 
                position: 'relative', 
                width: '100%', 
                aspectRatio: '1 / 1',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: 'var(--color-bg-base)',
                marginBottom: '10px',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {playlist.coverUrl ? (
                <img 
                  src={playlist.coverUrl} 
                  alt={playlist.title}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <ListMusic size={32} style={{ color: '#ff5500' }} />
              )}
              
              {/* Play Button Overlay */}
              <div 
                style={{
                  position: 'absolute',
                  right: '8px',
                  bottom: '8px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#ff5500',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Play size={15} fill="#ffffff" style={{ marginLeft: '1px' }} />
              </div>
            </div>

            {/* Playlist Titles */}
            <div 
              style={{ 
                fontSize: '13px', 
                fontWeight: 700, 
                lineHeight: '1.3',
                marginBottom: '4px',
                color: 'var(--color-text-primary)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {playlist.title}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {playlist.tracks.length > 0 ? `${playlist.tracks.length} треков` : 'SoundCloud'}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
