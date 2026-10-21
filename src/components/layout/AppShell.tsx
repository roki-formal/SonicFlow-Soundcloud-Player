import React from 'react';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { QueuePanel } from '../player/QueuePanel';
import { LyricsScreen } from '../lyrics/LyricsScreen';
import { MobilePlayer } from '../mobile/MobilePlayer';
import { ThemeEditorModal } from '../theme-editor/ThemeEditorModal';

export const AppShell: React.FC = () => {
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
      }}
    >
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
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.07)',
          position: 'relative',
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
      </div>
    </div>
  );
};
