import React from 'react';
import { Play, Pause, SkipForward, Heart } from 'lucide-react';
import { usePlayer } from '../../core/player/PlayerContext';

interface MobileMiniPlayerProps {
  onExpand: () => void;
}

export const MobileMiniPlayer: React.FC<MobileMiniPlayerProps> = ({ onExpand }) => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    next, 
    currentTime, 
    duration, 
    isFavorite, 
    toggleFavorite 
  } = usePlayer();

  if (!currentTrack) return null;

  const isFav = isFavorite(currentTrack.id);
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: 'var(--color-bg-surface, #17171f)',
        borderTop: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.4)',
        zIndex: 40,
        userSelect: 'none',
      }}
    >
      {/* Top progress bar indicator */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '2px', 
          backgroundColor: 'rgba(255, 255, 255, 0.1)' 
        }}
      >
        <div 
          style={{ 
            height: '100%', 
            width: `${progressPercent}%`, 
            backgroundColor: '#ff5500',
            transition: 'width 0.2s linear',
          }} 
        />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          gap: '12px',
        }}
      >
        {/* Track Artwork & Title — click expands full player */}
        <div 
          onClick={onExpand}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            flex: 1, 
            minWidth: 0, 
            cursor: 'pointer' 
          }}
        >
          {/* Mini spinning vinyl artwork */}
          <div 
            className={`animate-spin-slow ${!isPlaying ? 'animation-paused' : ''}`}
            style={{
              width: '42px',
              height: '42px',
              minWidth: '42px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #333 15%, #151515 50%, #000 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <img 
              src={currentTrack.coverUrl} 
              alt={currentTrack.title}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
            <div 
              style={{ 
                position: 'absolute', 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--color-bg-base)', 
                border: '1px solid rgba(255,255,255,0.4)' 
              }} 
            />
          </div>

          {/* Title & Artist */}
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div 
              style={{ 
                fontSize: '13px', 
                fontWeight: 600, 
                color: 'var(--color-text-primary, #ffffff)', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis' 
              }}
            >
              {currentTrack.title}
            </div>
            <div 
              style={{ 
                fontSize: '11px', 
                color: 'var(--color-text-secondary, #a2a2b2)', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                marginTop: '1px'
              }}
            >
              {currentTrack.artist}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Like button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(currentTrack.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: isFav ? '#ff3b30' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={isFav ? 'В избранном' : 'Лайк SoundCloud'}
          >
            <Heart size={20} fill={isFav ? '#ff3b30' : 'none'} />
          </button>

          {/* Play/Pause */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#ff5500',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 85, 0, 0.4)',
            }}
            title={isPlaying ? 'Пауза' : 'Воспроизведение'}
          >
            {isPlaying ? <Pause size={18} fill="#ffffff" /> : <Play size={18} fill="#ffffff" style={{ marginLeft: '2px' }} />}
          </button>

          {/* Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Следующий трек"
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
