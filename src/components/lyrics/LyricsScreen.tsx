import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  X, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Heart, 
  Upload, 
  Volume2, 
  Type,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { usePlayer } from '../../core/player/PlayerContext';
import { LrcParser } from '../../core/lyrics/LrcParser';
import { LyricsTab } from '../../types';

export const LyricsScreen: React.FC = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    next, 
    previous, 
    seek, 
    currentTime, 
    duration, 
    isLyricsOpen, 
    toggleLyrics,
    lyricsTab,
    setLyricsTab,
    volume,
    setVolume,
    isShuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
    isFavorite,
    toggleFavorite
  } = usePlayer();

  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');
  const [userScrolled, setUserScrolled] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedLrc, setImportedLrc] = useState<string | null>(null);

  // Parse lyrics from current track or imported LRC
  const parsedLyrics = useMemo(() => {
    const raw = importedLrc || currentTrack?.lyricsLrc || '';
    if (!raw) return { lines: [], isSynced: false, metadata: {} };
    return LrcParser.parse(raw);
  }, [importedLrc, currentTrack]);

  // Find active line index
  const activeIndex = useMemo(() => {
    if (!parsedLyrics.isSynced || lyricsTab === 'unsynced') return -1;
    return LrcParser.findActiveIndex(parsedLyrics.lines, currentTime);
  }, [parsedLyrics, currentTime, lyricsTab]);

  // Reset imported lyrics when track changes
  useEffect(() => {
    setImportedLrc(null);
  }, [currentTrack?.id]);

  // Auto-scroll to active line
  useEffect(() => {
    if (userScrolled || activeIndex === -1 || !activeLineRef.current || !containerRef.current) {
      return;
    }

    activeLineRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [activeIndex, userScrolled]);

  const handleUserScroll = () => {
    setUserScrolled(true);
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    // Resume auto-scroll after 4 seconds of inactivity
    scrollTimeoutRef.current = window.setTimeout(() => {
      setUserScrolled(false);
    }, 4000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setImportedLrc(text);
      }
    };
    reader.readAsText(file);
  };

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isLyricsOpen) return null;

  const tabs: { id: LyricsTab; label: string }[] = [
    { id: 'karaoke', label: 'Karaoke' },
    { id: 'synced', label: '• Synced' },
    { id: 'unsynced', label: 'Unsynced' },
    { id: 'genius', label: 'Genius' },
  ];

  const fontSizeStyles = {
    normal: { active: '26px', inactive: '20px' },
    large: { active: '38px', inactive: '26px' },
    huge: { active: '48px', inactive: '32px' },
  }[fontSize];

  const isFav = currentTrack ? isFavorite(currentTrack.id) : false;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: '#1b1d22',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Navigation Bar (Reference 2 style) */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <button
          onClick={() => toggleLyrics(false)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title="Back to Player"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Tabs: Karaoke, • Synced, Unsynced, Genius */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {tabs.map((tab) => {
            const isActive = lyricsTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setLyricsTab(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Font size & Import LRC buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              const sizes: ('normal' | 'large' | 'huge')[] = ['normal', 'large', 'huge'];
              const nextIdx = (sizes.indexOf(fontSize) + 1) % sizes.length;
              setFontSize(sizes[nextIdx]);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
            }}
            title="Adjust text size"
          >
            <Type size={16} />
            <span style={{ textTransform: 'capitalize' }}>{fontSize}</span>
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportFile} 
            accept=".lrc,.txt" 
            style={{ display: 'none' }} 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              fontSize: '12px',
              cursor: 'pointer',
            }}
            title="Import custom LRC or TXT"
          >
            <Upload size={14} />
            <span>Import LRC</span>
          </button>

          <button
            onClick={() => toggleLyrics(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Lyrics Body */}
      <div 
        ref={containerRef}
        onWheel={handleUserScroll}
        onTouchMove={handleUserScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '60px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Floating Return to Current button if user manually scrolled */}
        {userScrolled && activeIndex !== -1 && (
          <button
            onClick={() => {
              setUserScrolled(false);
              activeLineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            style={{
              position: 'sticky',
              top: '20px',
              zIndex: 10,
              padding: '8px 16px',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-contrast)',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            }}
          >
            Sync with playback
          </button>
        )}

        {/* Genius Mode Info Tab */}
        {lyricsTab === 'genius' ? (
          <div style={{ maxWidth: '640px', textAlign: 'left', lineHeight: '1.7' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
              About &ldquo;{currentTrack?.title}&rdquo;
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '16px', marginBottom: '16px' }}>
              Композиция &laquo;{currentTrack?.title}&raquo; от {currentTrack?.artist} вошла в альбом &laquo;{currentTrack?.album}&raquo;.
              Трек исследует темы личностного взросления, ритма ночного мегаполиса и преодоления внутренней тревоги.
            </p>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '12px' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--color-accent)' }}>
                Интересный факт:
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                Синхронизированные строки в SonicFlow поддерживают высокоточную миллисекундную привязку и навигацию по клику.
              </p>
            </div>
          </div>
        ) : parsedLyrics.lines.length > 0 ? (
          <div style={{ maxWidth: '780px', width: '100%', textAlign: 'center' }}>
            {parsedLyrics.lines.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = activeIndex !== -1 && idx < activeIndex;

              return (
                <div
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => parsedLyrics.isSynced && seek(line.time)}
                  style={{
                    fontSize: isActive ? fontSizeStyles.active : fontSizeStyles.inactive,
                    fontWeight: isActive ? 800 : 600,
                    letterSpacing: '-0.02em',
                    lineHeight: '1.4',
                    margin: isActive ? '32px 0' : '22px 0',
                    color: isActive 
                      ? (lyricsTab === 'karaoke' ? 'var(--color-accent)' : '#ffffff') 
                      : isPast 
                        ? 'rgba(255, 255, 255, 0.28)' 
                        : 'rgba(255, 255, 255, 0.55)',
                    textShadow: isActive 
                      ? '0 0 30px rgba(var(--color-accent-rgb, 255, 85, 0), 0.55), 0 4px 14px rgba(0, 0, 0, 0.8)' 
                      : 'none',
                    filter: !isActive && activeIndex !== -1 ? 'blur(0.3px)' : 'none',
                    cursor: parsedLyrics.isSynced ? 'pointer' : 'default',
                    transition: 'all 280ms cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: isActive ? 'scale(1.06)' : 'scale(1.0)',
                  }}
                >
                  {line.text}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ marginTop: '100px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
            <p style={{ fontSize: '18px', marginBottom: '16px' }}>Текст для этого трека пока не найден</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              Загрузить .lrc файл
            </button>
          </div>
        )}

        {/* Source attribution at bottom */}
        <div 
          style={{ 
            marginTop: 'auto', 
            paddingTop: '40px',
            alignSelf: 'flex-start', 
            fontSize: '12px', 
            color: 'rgba(255, 255, 255, 0.4)' 
          }}
        >
          Provided by {importedLrc ? 'Local LRC File' : 'Netease & LRCLIB'}
        </div>
      </div>

      {/* Bottom Compact Player Bar (Matching Reference 2) */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 28px',
          backgroundColor: '#121214',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Track info on left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '240px' }}>
          {currentTrack && (
            <>
              <img 
                src={currentTrack.coverUrl} 
                alt={currentTrack.title}
                style={{ width: '46px', height: '46px', borderRadius: '6px', objectFit: 'cover' }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentTrack.title}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentTrack.artist}
                </div>
              </div>
              <button 
                onClick={() => toggleFavorite(currentTrack.id)}
                style={{ background: 'none', border: 'none', color: isFav ? '#ef4444' : 'rgba(255, 255, 255, 0.5)', cursor: 'pointer' }}
              >
                <Heart size={16} fill={isFav ? '#ef4444' : 'none'} />
              </button>
            </>
          )}
        </div>

        {/* Center Controls & Scrubber */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '580px', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <button onClick={toggleShuffle} style={{ background: 'none', border: 'none', color: isShuffle ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.5)', cursor: 'pointer' }}>
              <Shuffle size={15} />
            </button>
            <button onClick={previous} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
              <SkipBack size={18} fill="currentColor" />
            </button>
            <button 
              onClick={togglePlay}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" style={{ marginLeft: '2px' }} />}
            </button>
            <button onClick={next} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
              <SkipForward size={18} fill="currentColor" />
            </button>
            <button onClick={cycleRepeat} style={{ background: 'none', border: 'none', color: repeatMode !== 'off' ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.5)', cursor: 'pointer' }}>
              <Repeat size={15} />
            </button>
          </div>

          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>{formatTime(currentTime)}</span>
            <input 
              type="range"
              min={0}
              max={duration || 1}
              step={0.5}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right actions: Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '180px', justifyContent: 'flex-end' }}>
          <Volume2 size={16} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
          <input 
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ width: '70px' }}
          />
        </div>
      </div>
    </div>
  );
};
