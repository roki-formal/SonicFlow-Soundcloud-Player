import React from 'react';
import { ChevronDown, Play, Heart } from 'lucide-react';
import { TACO_ARTIST_PROFILE, INITIAL_TRACKS } from '../../core/music-providers/catalog';
import { usePlayer } from '../../core/player/PlayerContext';

export const AlbumShelf: React.FC = () => {
  const { playTrack } = usePlayer();

  const handlePlayAlbum = (albumTitle: string) => {
    // Find track matching album or play default
    const match = INITIAL_TRACKS.find((t) => t.album.toLowerCase().includes(albumTitle.toLowerCase())) || INITIAL_TRACKS[0];
    playTrack(match);
  };

  return (
    <section style={{ padding: '0 28px 24px 28px' }}>
      {/* Section Header */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Albums
        </h2>

        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            fontSize: '12px', 
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
          }}
        >
          <span>Sort by</span>
          <ChevronDown size={14} />
        </div>
      </div>

      {/* Horizontal Scroll Row */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
          gap: '18px',
          overflowX: 'auto',
          paddingBottom: '8px',
        }}
      >
        {TACO_ARTIST_PROFILE.albums.map((album) => (
          <div 
            key={album.id}
            onClick={() => handlePlayAlbum(album.title)}
            style={{ 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Album Cover */}
            <div 
              style={{ 
                position: 'relative', 
                width: '100%', 
                aspectRatio: '1 / 1',
                borderRadius: 'var(--radius-card)',
                overflow: 'hidden',
                backgroundColor: 'var(--color-bg-surface)',
                marginBottom: '10px',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
              }}
            >
              <img 
                src={album.coverUrl} 
                alt={album.title}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  transition: 'transform var(--transition-normal)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
              />
              
              {/* Center Subtle Heart / Action Indicator */}
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.85,
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  <Heart size={15} fill="rgba(255, 255, 255, 0.8)" stroke="none" />
                </div>
              </div>
            </div>

            {/* Album Titles */}
            <div 
              style={{ 
                fontSize: '13px', 
                fontWeight: 600, 
                lineHeight: '1.3',
                marginBottom: '2px',
                color: 'var(--color-text-primary)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {album.title}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {album.year}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
