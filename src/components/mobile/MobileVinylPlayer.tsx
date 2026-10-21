import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  Heart, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Mic2, 
  Disc,
  Volume2,
  VolumeX,
  Palette,
  Cloud,
  ListMusic
} from 'lucide-react';
import { usePlayer } from '../../core/player/PlayerContext';
import { LrcParser } from '../../core/lyrics/LrcParser';

interface MobileVinylPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQueue?: () => void;
}

export const MobileVinylPlayer: React.FC<MobileVinylPlayerProps> = ({ 
  isOpen, 
  onClose,
  onOpenQueue 
}) => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    next, 
    previous, 
    seek, 
    currentTime, 
    duration, 
    isShuffle, 
    toggleShuffle, 
    repeatMode, 
    cycleRepeat, 
    isFavorite, 
    toggleFavorite,
    isMuted,
    toggleMute,
    volume,
    setVolume,
    toggleThemeEditor,
    soundCloudUser
  } = usePlayer();

  const [showLyricsSheet, setShowLyricsSheet] = useState(false);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !currentTrack) return null;

  const isFav = isFavorite(currentTrack.id);
  const remainingTime = Math.max(0, duration - currentTime);

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const parsedLyrics = LrcParser.parse(currentTrack.lyricsLrc || '');
  const activeLyricsIdx = LrcParser.findActiveIndex(parsedLyrics.lines, currentTime);

  // Auto-scroll lyrics in sheet
  useEffect(() => {
    if (!showLyricsSheet || !lyricsContainerRef.current) return;
    const activeEl = lyricsContainerRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLyricsIdx, showLyricsSheet]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'max(16px, env(safe-area-inset-top, 16px)) 20px max(24px, env(safe-area-inset-bottom, 24px)) 20px',
        overflow: 'hidden',
        animation: 'modal-pop 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Dynamic Ambient Glow Backdrop */}
      {currentTrack.coverUrl && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: '-20%',
            backgroundImage: `url(${currentTrack.coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(70px) saturate(1.8) brightness(0.4)',
            opacity: 0.65,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Top Header Bar */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2,
          padding: '4px 0',
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: 'var(--color-text-primary)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
          title="Свернуть плеер"
        >
          <ChevronDown size={22} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            СЕЙЧАС ИГРАЕТ
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#ff5500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Cloud size={12} />
            <span>SoundCloud Stream</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowLyricsSheet(!showLyricsSheet)}
            style={{
              background: showLyricsSheet ? '#ff5500' : 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'background var(--transition-fast)',
            }}
            title="Тексты песен (Synced Lyrics)"
          >
            <Mic2 size={18} />
          </button>

          <button
            onClick={() => toggleThemeEditor(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'var(--color-text-primary)',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
            title="Стили и Темы"
          >
            <Palette size={18} />
          </button>
        </div>
      </div>

      {/* Main Center Area: Vinyl Record or Synced Lyrics */}
      <div 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          margin: '12px 0',
          overflow: 'hidden',
        }}
      >
        {!showLyricsSheet ? (
          /* Photorealistic Rotating Vinyl Record */
          <div 
            onClick={() => setShowLyricsSheet(true)}
            title="Нажмите для открытия синхронизированных текстов"
            style={{
              position: 'relative',
              width: 'min(72vw, 290px)',
              height: 'min(72vw, 290px)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div 
              className={`animate-spin-slow ${!isPlaying ? 'animation-paused' : ''}`}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #222222 18%, #121212 45%, #050505 85%, #000000 100%)',
                boxShadow: '0 24px 50px rgba(0, 0, 0, 0.7), inset 0 0 12px rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* Vinyl Groove Rings */}
              <div style={{ position: 'absolute', inset: '12%', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.05)' }} />
              <div style={{ position: 'absolute', inset: '24%', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.04)' }} />
              <div style={{ position: 'absolute', inset: '36%', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.06)' }} />

              {/* Center Artwork Label */}
              <img 
                src={currentTrack.coverUrl} 
                alt={currentTrack.title}
                style={{
                  width: '38%',
                  height: '38%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                }}
              />
              {/* Spindle hole */}
              <div 
                style={{ 
                  position: 'absolute', 
                  width: '14px', 
                  height: '14px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--color-bg-base)', 
                  border: '2px solid rgba(255, 255, 255, 0.3)' 
                }} 
              />
            </div>
          </div>
        ) : (
          /* Synced Lyrics Sheet Inside Mobile Player */
          <div 
            ref={lyricsContainerRef}
            style={{
              width: '100%',
              height: '100%',
              maxHeight: '360px',
              overflowY: 'auto',
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '18px',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
            }}
          >
            {parsedLyrics.lines.length > 0 ? (
              parsedLyrics.lines.map((line, idx) => {
                const isActive = idx === activeLyricsIdx;
                return (
                  <p
                    key={idx}
                    data-active={isActive ? 'true' : 'false'}
                    onClick={() => seek(line.time)}
                    style={{
                      fontSize: isActive ? '20px' : '15px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--color-lyrics-active, #ffffff)' : 'var(--color-lyrics-inactive, rgba(255, 255, 255, 0.4))',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      margin: 0,
                      lineHeight: '1.4',
                      textShadow: isActive ? '0 0 20px rgba(255, 85, 0, 0.6)' : 'none',
                    }}
                  >
                    {line.text}
                  </p>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '40px' }}>
                <p style={{ fontSize: '16px', fontWeight: 600 }}>Текст песни отсутствует</p>
                <p style={{ fontSize: '13px', opacity: 0.7, marginTop: '6px' }}>Для этого трека нет синхронизированного LRC</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls Area */}
      <div 
        style={{ 
          position: 'relative', 
          zIndex: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          width: '100%',
        }}
      >
        {/* Track Title, Artist & Like Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ overflow: 'hidden', paddingRight: '12px' }}>
            <h1 
              style={{ 
                fontSize: '20px', 
                fontWeight: 700, 
                lineHeight: '1.2', 
                marginBottom: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentTrack.title}
            </h1>
            <p 
              style={{ 
                fontSize: '14px', 
                color: 'var(--color-text-secondary)', 
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentTrack.artist}
            </p>
          </div>

          <button
            onClick={() => toggleFavorite(currentTrack.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              color: isFav ? '#ff3b30' : 'var(--color-text-secondary)',
              transition: 'transform var(--transition-fast), color var(--transition-fast)',
            }}
            title={isFav ? 'Удалить из избранного' : 'Добавить в лайки SoundCloud'}
          >
            <Heart size={24} fill={isFav ? '#ff3b30' : 'none'} />
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div>
          <div style={{ position: 'relative', width: '100%', height: '24px', display: 'flex', alignItems: 'center' }}>
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.5}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              style={{
                width: '100%',
                height: '5px',
                accentColor: '#ff5500',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '-4px' }}>
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(remainingTime)}</span>
          </div>
        </div>

        {/* Main Playback Controls: Shuffle, Prev, Play/Pause, Next, Repeat */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '0 8px',
          }}
        >
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            style={{
              background: 'none',
              border: 'none',
              color: isShuffle ? '#ff5500' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
            title="Перемешать"
          >
            <Shuffle size={20} />
            {isShuffle && (
              <span style={{ position: 'absolute', bottom: '2px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#ff5500' }} />
            )}
          </button>

          {/* Previous */}
          <button
            onClick={previous}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Предыдущий трек"
          >
            <SkipBack size={26} />
          </button>

          {/* Large Center Play / Pause */}
          <button
            onClick={togglePlay}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#ff5500',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(255, 85, 0, 0.45)',
              transform: 'scale(1)',
              transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
            }}
            title={isPlaying ? 'Пауза' : 'Воспроизведение'}
          >
            {isPlaying ? <Pause size={28} fill="#ffffff" /> : <Play size={28} fill="#ffffff" style={{ marginLeft: '3px' }} />}
          </button>

          {/* Next */}
          <button
            onClick={next}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Следующий трек"
          >
            <SkipForward size={26} />
          </button>

          {/* Repeat */}
          <button
            onClick={cycleRepeat}
            style={{
              background: 'none',
              border: 'none',
              color: repeatMode !== 'off' ? '#ff5500' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
            title={`Повтор: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
            {repeatMode !== 'off' && (
              <span style={{ position: 'absolute', bottom: '2px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#ff5500' }} />
            )}
          </button>
        </div>

        {/* Volume & Queue Trigger Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginTop: '4px' }}>
          <button
            onClick={toggleMute}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{
              flex: 1,
              maxWidth: '160px',
              height: '4px',
              accentColor: '#ff5500',
              margin: '0 12px',
            }}
          />

          {onOpenQueue && (
            <button
              onClick={() => {
                onClose();
                onOpenQueue();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: 'var(--color-text-secondary)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
              }}
            >
              <ListMusic size={14} />
              <span>Очередь</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
