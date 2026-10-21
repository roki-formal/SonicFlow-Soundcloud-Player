import React, { useMemo } from 'react';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { QueuePanel } from '../player/QueuePanel';
import { LyricsScreen } from '../lyrics/LyricsScreen';
import { MobilePlayer } from '../mobile/MobilePlayer';
import { ThemeEditorModal } from '../theme-editor/ThemeEditorModal';
import { SoundCloudLoginModal } from '../auth/SoundCloudLoginModal';
import { usePlayer } from '../../core/player/PlayerContext';

export const AppShell: React.FC = () => {
  const { 
    isLoginModalOpen, 
    toggleLoginModal, 
    currentTrack, 
    isPlaying, 
    audioFrequencies, 
    customizationSettings 
  } = usePlayer();

  // Audio-reactive bass pulse factor (1.0 to 1.15)
  const pulseScale = useMemo(() => {
    if (!isPlaying || !customizationSettings.audioReactivePulse || !audioFrequencies) return 1;
    // Average of first 4 bass frequency bins
    const bass = (audioFrequencies[0] + audioFrequencies[1] + audioFrequencies[2] + audioFrequencies[3]) / 4;
    return 1 + (bass / 255) * 0.12;
  }, [isPlaying, customizationSettings.audioReactivePulse, audioFrequencies]);

  return (
    <div 
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#050507',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Dynamic Ambient Artwork Glow (Atmosphere) */}
      {customizationSettings.ambientGlowEnabled && currentTrack?.coverUrl && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: '-10%',
            zIndex: 0,
            backgroundImage: `url(${currentTrack.coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: `blur(var(--sf-ambient-glow-blur, 60px)) saturate(1.8)`,
            opacity: `var(--sf-ambient-glow-opacity, 0.55)`,
            transform: `scale(${pulseScale})`,
            transition: 'transform 0.15s ease-out, opacity 0.8s ease, filter 0.5s ease',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Subtle Dark Vignette Overlay */}
      <div 
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: 'radial-gradient(circle at center, transparent 40%, rgba(5, 5, 7, 0.85) 90%)',
          pointerEvents: 'none',
        }}
      />

      {/* Outer rounded desktop app frame (as seen in Reference 1) */}
      <div 
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '1440px',
          maxHeight: '940px',
          backgroundColor: 'var(--color-bg-base)',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          position: 'relative',
          zIndex: 2,
          transition: 'border-radius var(--transition-normal), background-color var(--transition-normal)',
        }}
      >
        {/* Left Column: Sidebar & Friends */}
        <Sidebar />

        {/* Center Column: Search & Main Artist/Music View */}
        <MainContent />

        {/* Right Column: Play queue & Vinyl Player Widget */}
        <QueuePanel />

        {/* Overlays */}
        <LyricsScreen />
        <MobilePlayer />
        <ThemeEditorModal />
        <SoundCloudLoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => toggleLoginModal(false)} 
        />
      </div>
    </div>
  );
};
