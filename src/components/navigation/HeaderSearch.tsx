import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Volume2, 
  VolumeX, 
  Sparkles,
  SlidersHorizontal 
} from 'lucide-react';
import { usePlayer } from '../../core/player/PlayerContext';

export const HeaderSearch: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    volume, 
    setVolume, 
    isMuted, 
    toggleMute,
    audioFrequencies,
    isPlaying,
    toggleThemeEditor
  } = usePlayer();

  // Average 4 frequency bands for the 4 equalizer bars in the header
  const barHeights = React.useMemo(() => {
    if (!isPlaying || !audioFrequencies || audioFrequencies.length === 0) {
      return [4, 6, 8, 4];
    }
    const b1 = Math.max(3, Math.min(18, (audioFrequencies[1] || 0) / 14));
    const b2 = Math.max(3, Math.min(22, (audioFrequencies[4] || 0) / 11));
    const b3 = Math.max(3, Math.min(20, (audioFrequencies[8] || 0) / 12));
    const b4 = Math.max(3, Math.min(16, (audioFrequencies[14] || 0) / 16));
    return [b1, b2, b3, b4];
  }, [isPlaying, audioFrequencies]);

  return (
    <header 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '16px 28px',
        gap: '20px',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      {/* Navigation history controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
          }}
          title="Back"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
          }}
          title="Forward"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Central Search Bar */}
      <div style={{ flex: 1, maxWidth: '460px', position: 'relative' }}>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Taco Hemingway"
          style={{
            width: '100%',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '9999px',
            padding: '8px 36px 8px 16px',
            color: 'var(--color-text-primary)',
            fontSize: '13px',
            outline: 'none',
            transition: 'border-color var(--transition-fast)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
        />
        <Search 
          size={16} 
          style={{ 
            position: 'absolute', 
            right: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'var(--color-text-muted)',
            pointerEvents: 'none',
          }} 
        />
      </div>

      {/* Right controls: Visualizer, Volume, Theme Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Animated 4-bar Audio Visualizer */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: '3px', 
            height: '22px', 
            padding: '2px',
          }}
          title={isPlaying ? 'Audio Visualizer (Live FFT)' : 'Paused'}
        >
          {barHeights.map((h, i) => (
            <span 
              key={i}
              style={{
                width: '3px',
                height: `${h}px`,
                backgroundColor: isPlaying ? 'var(--color-accent)' : 'var(--color-text-muted)',
                borderRadius: '1px',
                transition: 'height 80ms ease-out',
              }}
            />
          ))}
        </div>

        {/* Volume Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={toggleMute}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: isMuted ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <input 
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ width: '70px' }}
          />
        </div>

        {/* Theme Settings quick button */}
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
            borderRadius: '6px',
          }}
          title="Customize Theme"
        >
          <SlidersHorizontal size={17} />
        </button>
      </div>
    </header>
  );
};
