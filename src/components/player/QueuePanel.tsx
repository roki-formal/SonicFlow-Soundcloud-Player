import React from 'react';
import { 
  Settings, 
  Heart, 
  X, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1,
  GripVertical, 
  Mic2,
  Disc
} from 'lucide-react';
import { usePlayer } from '../../core/player/PlayerContext';

export const QueuePanel: React.FC = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    next, 
    previous, 
    seek, 
    currentTime, 
    duration, 
    queue, 
    queueIndex,
    isShuffle, 
    toggleShuffle, 
    repeatMode, 
    cycleRepeat,
    removeFromQueue,
    playTrack,
    toggleLyrics,
    isFavorite,
    toggleFavorite,
    toggleThemeEditor
  } = usePlayer();

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isFav = currentTrack ? isFavorite(currentTrack.id) : false;

  return (
    <aside
      style={{
        width: '340px',
        minWidth: '340px',
        backgroundColor: 'var(--color-bg-queue)',
        borderLeft: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '24px 20px',
        overflowY: 'auto',
      }}
    >
      {/* Top Profile & Settings */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80" 
            alt="Mark Makowsky"
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Mark Makowsky</span>
        </div>

        <button
          onClick={() => toggleThemeEditor(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Settings & Themes"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Header: Play queue & Counter */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Play queue
        </h2>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          {queueIndex + 1}/{queue.length}
        </span>
      </div>

      {/* Card Player Widget */}
      {currentTrack && (
        <div 
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-card)',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid var(--color-border)',
            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Top widget actions */}
          <div 
            style={{ 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              style={{
                background: 'none',
                border: 'none',
                color: isFav ? '#ef4444' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Like track"
            >
              <Heart size={16} fill={isFav ? '#ef4444' : 'none'} />
            </button>

            <button
              onClick={() => toggleLyrics(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600,
              }}
              title="Show Synced Lyrics"
            >
              <Mic2 size={15} />
              <span>Lyrics</span>
            </button>
          </div>

          {/* Rotating Vinyl Circle with Album Cover */}
          <div 
            style={{
              position: 'relative',
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              backgroundColor: '#121212',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
            }}
          >
            <div 
              className={`animate-spin-slow ${!isPlaying ? 'animation-paused' : ''}`}
              style={{
                position: 'relative',
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle, #2a2a2a 20%, #111111 70%, #000000 100%)',
              }}
            >
              <img 
                src={currentTrack.coverUrl} 
                alt={currentTrack.title}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
              {/* Spindle hole */}
              <div 
                style={{
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1.5px solid #444',
                }}
              />
            </div>
          </div>

          {/* Song Info */}
          <div style={{ textAlign: 'center', marginBottom: '16px', maxWidth: '100%', padding: '0 8px' }}>
            <div 
              style={{ 
                fontSize: '15px', 
                fontWeight: 700, 
                color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: '2px',
              }}
            >
              {currentTrack.title}
            </div>
            <div 
              style={{ 
                fontSize: '12px', 
                color: 'var(--color-text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentTrack.artist}
            </div>
          </div>

          {/* Player Controls (Shuffle, Prev, Play/Pause, Next, Repeat) */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '14px',
              marginBottom: '14px',
            }}
          >
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              style={{
                background: 'none',
                border: 'none',
                color: isShuffle ? 'var(--color-accent)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Shuffle"
            >
              <Shuffle size={15} />
            </button>

            {/* Previous */}
            <button
              onClick={previous}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Previous"
            >
              <SkipBack size={18} fill="currentColor" />
            </button>

            {/* Play/Pause Main Circle */}
            <button
              onClick={togglePlay}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-contrast)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px var(--color-accent-subtle)',
                transition: 'transform var(--transition-fast)',
              }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />
              )}
            </button>

            {/* Next */}
            <button
              onClick={next}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Next"
            >
              <SkipForward size={18} fill="currentColor" />
            </button>

            {/* Repeat */}
            <button
              onClick={cycleRepeat}
              style={{
                background: 'none',
                border: 'none',
                color: repeatMode !== 'off' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>

          {/* Scrubber Progress Bar */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <input 
              type="range"
              min={0}
              max={duration || 1}
              step={0.5}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '11px', 
                color: 'var(--color-text-muted)',
              }}
            >
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Queue Track List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
        {queue.map((track, idx) => {
          const isCurrent = idx === queueIndex;

          return (
            <div
              key={`${track.id}-${idx}`}
              onClick={() => playTrack(track)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: isCurrent ? 'var(--color-bg-surface-active)' : 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                transition: 'background-color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!isCurrent) e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isCurrent) e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)';
              }}
            >
              {/* Thumbnail & Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                <img 
                  src={track.coverUrl} 
                  alt={track.title}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '6px',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />

                <div style={{ minWidth: 0 }}>
                  <div 
                    style={{ 
                      fontSize: '12px', 
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
                    {track.artist}
                  </div>
                </div>
              </div>

              {/* Delete / Reorder actions */}
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => removeFromQueue(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Remove from queue"
                >
                  <X size={14} />
                </button>

                <div style={{ color: 'var(--color-text-muted)', cursor: 'grab', padding: '2px' }}>
                  <GripVertical size={14} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
