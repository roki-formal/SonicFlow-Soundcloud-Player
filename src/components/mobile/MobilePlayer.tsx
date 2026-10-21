import React, { useState } from 'react';
import { 
  ChevronDown, 
  Heart, 
  MoreHorizontal, 
  Settings, 
  Share2, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  X,
  Disc,
  SlidersHorizontal
} from 'lucide-react';
import { usePlayer } from '../../core/player/PlayerContext';
import { LrcParser } from '../../core/lyrics/LrcParser';

export const MobilePlayer: React.FC = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    next, 
    previous, 
    seek, 
    currentTime, 
    duration,
    isMobileView,
    toggleMobileView,
    isFavorite,
    toggleFavorite,
    toggleThemeEditor
  } = usePlayer();

  const [isLyricsSheetOpen, setIsLyricsSheetOpen] = useState(false);

  if (!isMobileView || !currentTrack) return null;

  const isFav = isFavorite(currentTrack.id);
  const remainingTime = Math.max(0, duration - currentTime);

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const parsedLyrics = LrcParser.parse(currentTrack.lyricsLrc || '');
  const activeIdx = LrcParser.findActiveIndex(parsedLyrics.lines, currentTime);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      {/* Container simulating dual iPhone view or single iPhone viewport */}
      <div 
        style={{
          display: 'flex',
          gap: '32px',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: '860px',
        }}
      >
        {/* ================= Screen 1: Vinyl Player (Reference 3 Left) ================= */}
        <div 
          style={{
            width: '360px',
            height: '740px',
            borderRadius: '48px',
            backgroundColor: '#eae8e1',
            color: '#111111',
            position: 'relative',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 0 12px #202020, 0 0 0 14px #333333',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px 24px 28px 24px',
          }}
        >
          {/* iOS Dynamic Island & Status Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 600, padding: '0 8px', marginBottom: '8px' }}>
              <span>9:41</span>
              {/* Dynamic Island */}
              <div style={{ width: '92px', height: '24px', backgroundColor: '#000000', borderRadius: '16px' }} />
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px' }}>5G</span>
                <span>●</span>
              </div>
            </div>

            {/* Top Navigation Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" 
                alt="Profile"
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#111111' }}>
                <MoreHorizontal size={18} style={{ cursor: 'pointer' }} />
                <Settings size={18} style={{ cursor: 'pointer' }} onClick={() => toggleThemeEditor(true)} />
              </div>
            </div>
          </div>

          {/* Photorealistic Vinyl Record in Center */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              margin: '20px 0',
              cursor: 'pointer',
            }}
            onClick={() => setIsLyricsSheetOpen(true)}
            title="Click to view synchronized lyrics sheet"
          >
            <div 
              className={`animate-spin-slow ${!isPlaying ? 'animation-paused' : ''}`}
              style={{
                width: '230px',
                height: '230px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #2c2c2c 15%, #151515 45%, #050505 85%, #000000 100%)',
                boxShadow: '0 18px 40px rgba(0, 0, 0, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* Vinyl grooves ring effect */}
              <div style={{ position: 'absolute', inset: '16px', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.05)' }} />
              <div style={{ position: 'absolute', inset: '32px', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.04)' }} />
              <div style={{ position: 'absolute', inset: '48px', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.06)' }} />

              {/* Center hole artwork */}
              <img 
                src={currentTrack.coverUrl} 
                alt={currentTrack.title}
                style={{
                  width: '88px',
                  height: '88px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
              />
              <div style={{ position: 'absolute', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eae8e1', border: '2px solid #222' }} />
            </div>
          </div>

          {/* Song Info (Editorial Serif Typography) */}
          <div style={{ textAlign: 'center' }}>
            <h2 
              className="font-editorial"
              style={{ 
                fontSize: '28px', 
                fontWeight: 700, 
                letterSpacing: '-0.02em', 
                lineHeight: '1.15',
                marginBottom: '4px',
                color: '#111111',
              }}
            >
              {currentTrack.title}
            </h2>
            <p style={{ fontSize: '13px', color: '#555555', fontWeight: 500 }}>
              {currentTrack.artist}
            </p>
          </div>

          {/* Timeline Scrubber */}
          <div style={{ marginTop: '16px' }}>
            <input 
              type="range"
              min={0}
              max={duration || 1}
              step={0.5}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#111111' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#777777', marginTop: '4px', fontWeight: 500 }}>
              <span>{formatTime(currentTime)}</span>
              <span>-{formatTime(remainingTime)}</span>
            </div>
          </div>

          {/* Pill dock controls: Prev, Main Play Circle, Next */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '16px',
              marginTop: '10px',
            }}
          >
            <button
              onClick={previous}
              style={{
                width: '56px',
                height: '42px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                border: 'none',
                color: '#111111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <SkipBack size={18} fill="currentColor" />
            </button>

            <button
              onClick={togglePlay}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#111111',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
              }}
            >
              {isPlaying ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" style={{ marginLeft: '3px' }} />
              )}
            </button>

            <button
              onClick={next}
              style={{
                width: '56px',
                height: '42px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                border: 'none',
                color: '#111111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <SkipForward size={18} fill="currentColor" />
            </button>
          </div>

          {/* Bottom pull-up hint */}
          <div 
            onClick={() => setIsLyricsSheetOpen(true)}
            style={{ 
              textAlign: 'center', 
              marginTop: '8px', 
              fontSize: '11px', 
              color: '#666666',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ▲ Pull up for Lyrics Sheet
          </div>
        </div>

        {/* ================= Screen 2: Lyrics Bottom Sheet (Reference 3 Right) ================= */}
        <div 
          style={{
            width: '360px',
            height: '740px',
            borderRadius: '48px',
            backgroundColor: '#050505',
            color: '#ffffff',
            position: 'relative',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 0 12px #202020, 0 0 0 14px #333333',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px 20px 28px 20px',
          }}
        >
          {/* Top Floating Cream Card */}
          <div 
            style={{
              backgroundColor: '#eae8e1',
              color: '#111111',
              borderRadius: '28px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setIsLyricsSheetOpen(false)}
            >
              <ChevronDown size={18} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3 
                className="font-editorial"
                style={{ fontSize: '16px', fontWeight: 700, margin: 0, lineHeight: 1.1 }}
              >
                {currentTrack.title}
              </h3>
              <p style={{ fontSize: '11px', color: '#555555', margin: 0 }}>
                {currentTrack.artist}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Share2 size={16} style={{ cursor: 'pointer' }} />
              <Heart 
                size={16} 
                fill={isFav ? '#ef4444' : 'none'} 
                color={isFav ? '#ef4444' : '#111111'} 
                style={{ cursor: 'pointer' }} 
                onClick={() => toggleFavorite(currentTrack.id)}
              />
            </div>
          </div>

          {/* Scrolling Lyrics on Dark Background */}
          <div 
            style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '28px 8px',
              textAlign: 'left',
              lineHeight: '1.6',
            }}
          >
            {parsedLyrics.lines.map((line, idx) => {
              const isActive = idx === activeIdx;
              return (
                <div
                  key={idx}
                  onClick={() => seek(line.time)}
                  style={{
                    fontSize: isActive ? '20px' : '16px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
                    margin: '12px 0',
                    cursor: 'pointer',
                    transition: 'all 150ms ease-out',
                  }}
                >
                  {line.text}
                </div>
              );
            })}
          </div>

          {/* Bottom Bar: scrubber & Circular Play button */}
          <div>
            <input 
              type="range"
              min={0}
              max={duration || 1}
              step={0.5}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#ffffff' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
              <span>{formatTime(currentTime)}</span>
              <span>-{formatTime(remainingTime)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
              <button
                onClick={togglePlay}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(255, 255, 255, 0.2)',
                }}
              >
                {isPlaying ? (
                  <Pause size={22} fill="currentColor" />
                ) : (
                  <Play size={22} fill="currentColor" style={{ marginLeft: '2px' }} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Exit Button */}
      <button
        onClick={() => toggleMobileView(false)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '8px 16px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
      >
        ✕ Close Mobile View
      </button>
    </div>
  );
};
