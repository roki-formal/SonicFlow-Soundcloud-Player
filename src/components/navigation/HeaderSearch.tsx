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
    toggleThemeEditor,
    customizationSettings
  } = usePlayer();

  // Dynamic frequency bands adapted to customizationSettings
  const barHeights = React.useMemo(() => {
    const barCount = customizationSettings?.visualizerMode === 'spectrum' ? 6 : 4;
    if (!isPlaying || !audioFrequencies || audioFrequencies.length === 0) {
      return Array(barCount).fill(4);
    }
    const step = Math.floor(audioFrequencies.length / barCount);
    return Array.from({ length: barCount }, (_, i) => {
      const freq = audioFrequencies[i * step] || 0;
      return Math.max(3, Math.min(20, Math.round(freq / 12)));
    });
  }, [isPlaying, audioFrequencies, customizationSettings?.visualizerMode]);

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
          placeholder="Поиск треков и артистов в SoundCloud..."
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
                width: '3.5px',
                height: `${h}px`,
                backgroundColor: isPlaying ? 'var(--color-accent)' : 'var(--color-text-muted)',
                boxShadow: isPlaying && customizationSettings.visualizerGlow ? '0 0 8px var(--color-accent)' : 'none',
                borderRadius: '2px',
                transition: 'height 80ms ease-out, box-shadow 0.2s ease',
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
