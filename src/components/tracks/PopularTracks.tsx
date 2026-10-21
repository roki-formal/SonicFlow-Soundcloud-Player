import React from 'react';
import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';
import { usePlayer } from '../../core/player/PlayerContext';
import { INITIAL_TRACKS } from '../../core/music-providers/catalog';
import { AudioTrack } from '../../types';

export const PopularTracks: React.FC = () => {
  const { currentTrack, isPlaying, playTrack, togglePlay, isFavorite, toggleFavorite } = usePlayer();

  const popularList: AudioTrack[] = [
    INITIAL_TRACKS.find((t) => t.id === 'track-tamagotchi') || INITIAL_TRACKS[3],
    INITIAL_TRACKS.find((t) => t.id === 'track-wszystko-na-niby') || INITIAL_TRACKS[4],
    INITIAL_TRACKS.find((t) => t.id === 'track-w-piatki') || INITIAL_TRACKS[5],
    INITIAL_TRACKS.find((t) => t.id === 'track-saldo-07') || INITIAL_TRACKS[0],
    INITIAL_TRACKS.find((t) => t.id === 'track-900729') || INITIAL_TRACKS[8],
  ].filter(Boolean) as AudioTrack[];

  const handleTrackClick = (track: AudioTrack) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, popularList);
    }
  };

  return (
    <div style={{ flex: '1.4', minWidth: '280px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '16px' }}>
        Popular
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {popularList.map((track, idx) => {
          const isCurrent = currentTrack?.id === track.id;
          const isTrackPlaying = isCurrent && isPlaying;
          const fav = isFavorite(track.id);

          return (
            <div
              key={track.id}
              onClick={() => handleTrackClick(track)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: isCurrent ? 'var(--color-bg-surface-active)' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!isCurrent) e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isCurrent) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* Rank and Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                {/* Index / Play indicator */}
                <div 
                  style={{ 
                    width: '20px', 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: isCurrent ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isTrackPlaying ? (
                    <Pause size={14} fill="currentColor" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Track Details */}
                <div style={{ minWidth: 0 }}>
                  <div 
                    style={{ 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      color: isCurrent ? 'var(--color-accent)' : 'var(--color-text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {track.title}
                  </div>
                  <div 
                    style={{ 
                      fontSize: '11px', 
                      color: 'var(--color-text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {track.year ? `${track.year}, ` : ''}{track.album}
                  </div>
                </div>
              </div>

              {/* Actions: Heart and options */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => toggleFavorite(track.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: fav ? '#ef4444' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                >
                  <Heart size={15} fill={fav ? '#ef4444' : 'none'} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
