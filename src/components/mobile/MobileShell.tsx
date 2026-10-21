import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Heart, 
  ListMusic, 
  ListOrdered, 
  Palette, 
  Cloud, 
  Music,
  Trash2,
  Play,
  Pause,
  X
} from 'lucide-react';
import { usePlayer, NavSection } from '../../core/player/PlayerContext';
import { MobileMiniPlayer } from './MobileMiniPlayer';
import { MobileVinylPlayer } from './MobileVinylPlayer';
import { ArtistHeader } from '../artist/ArtistHeader';
import { AlbumShelf } from '../albums/AlbumShelf';
import { PopularTracks } from '../tracks/PopularTracks';
import { SimilarArtists } from '../artist/SimilarArtists';
import { HeaderSearch } from '../navigation/HeaderSearch';
import { FavoritesView, PlaylistsView, LocalFilesView } from '../library/LibraryViews';
import { ThemeEditorModal } from '../theme-editor/ThemeEditorModal';
import { SoundCloudLoginModal } from '../auth/SoundCloudLoginModal';
import { LyricsScreen } from '../lyrics/LyricsScreen';

export const MobileShell: React.FC = () => {
  const { 
    activeSection, 
    setActiveSection, 
    currentTrack, 
    isPlaying, 
    queue, 
    queueIndex, 
    playTrack, 
    removeFromQueue,
    soundCloudUser, 
    toggleLoginModal, 
    isLoginModalOpen, 
    toggleThemeEditor,
    isThemeEditorOpen,
    isLyricsOpen,
    toggleLyrics
  } = usePlayer();

  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  // Tab definitions
  const tabs: { id: NavSection; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Главная', icon: <Home size={20} /> },
    { id: 'albums', label: 'Поиск', icon: <Search size={20} /> },
    { id: 'favorites', label: 'Лайки', icon: <Heart size={20} /> },
    { id: 'playlists', label: 'Плейлисты', icon: <ListMusic size={20} /> },
    { id: 'local', label: 'Очередь', icon: <ListOrdered size={20} /> },
  ];

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Dynamic Background Atmosphere Glow */}
      {currentTrack?.coverUrl && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: '-25%',
            backgroundImage: `url(${currentTrack.coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(80px) saturate(1.8) brightness(0.25)',
            opacity: 0.5,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Mobile Top Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: 'rgba(10, 10, 13, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border)',
          position: 'relative',
          zIndex: 30,
        }}
      >
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveSection('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ff5500 0%, #ff8800 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(255, 85, 0, 0.4)',
            }}
          >
            <Music size={16} color="#ffffff" />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Sonic<span style={{ color: '#ff5500' }}>Flow</span>
          </span>
        </div>

        {/* Right Actions: SoundCloud Account & Theme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => toggleLoginModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '20px',
              backgroundColor: soundCloudUser ? 'rgba(255, 85, 0, 0.15)' : '#ff5500',
              border: soundCloudUser ? '1px solid rgba(255, 85, 0, 0.4)' : 'none',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {soundCloudUser?.avatar_url ? (
              <img 
                src={soundCloudUser.avatar_url} 
                alt={soundCloudUser.username}
                style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <Cloud size={14} />
            )}
            <span style={{ maxWidth: '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {soundCloudUser ? soundCloudUser.username : 'Войти'}
            </span>
          </button>

          <button
            onClick={() => toggleThemeEditor(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'var(--color-text-secondary)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Темы оформления"
          >
            <Palette size={16} />
          </button>
        </div>
      </header>

      {/* Scrollable Main Content Area */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          position: 'relative',
          zIndex: 10,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {activeSection === 'home' && (
          <div style={{ paddingBottom: '24px' }}>
            <HeaderSearch />
            <ArtistHeader />
            <AlbumShelf />
            <PopularTracks />
            <SimilarArtists />
          </div>
        )}

        {activeSection === 'albums' && (
          <div style={{ paddingBottom: '24px' }}>
            <HeaderSearch />
            <div style={{ padding: '0 16px 16px 16px' }}>
              <AlbumShelf />
            </div>
            <PopularTracks />
          </div>
        )}

        {activeSection === 'favorites' && (
          <div style={{ paddingBottom: '24px' }}>
            <FavoritesView />
          </div>
        )}

        {activeSection === 'playlists' && (
          <div style={{ paddingBottom: '24px' }}>
            <PlaylistsView />
          </div>
        )}

        {activeSection === 'local' && (
          /* Mobile Queue View */
          <div style={{ padding: '20px 16px 24px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Очередь воспроизведения</h2>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Всего {queue.length} треков
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                      padding: '10px 12px',
                      borderRadius: '12px',
                      backgroundColor: isCurrent ? 'rgba(255, 85, 0, 0.15)' : 'var(--color-bg-surface)',
                      border: isCurrent ? '1px solid #ff5500' : '1px solid var(--color-border)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      <img 
                        src={track.coverUrl} 
                        alt={track.title}
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div style={{ overflow: 'hidden', flex: 1 }}>
                        <div style={{ 
                          fontSize: '13px', 
                          fontWeight: 600, 
                          color: isCurrent ? '#ff5500' : 'var(--color-text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {track.title}
                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: 'var(--color-text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {track.artist}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(idx);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        padding: '6px',
                        cursor: 'pointer',
                      }}
                      title="Удалить из очереди"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Docked Mini-Player above bottom navigation */}
      <MobileMiniPlayer onExpand={() => setIsFullPlayerOpen(true)} />

      {/* Full-Screen Mobile Vinyl Player */}
      <MobileVinylPlayer 
        isOpen={isFullPlayerOpen} 
        onClose={() => setIsFullPlayerOpen(false)} 
        onOpenQueue={() => {
          setActiveSection('local');
          setIsFullPlayerOpen(false);
        }}
      />

      {/* Mobile Bottom Navigation Bar */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          height: '56px',
          backgroundColor: 'rgba(12, 12, 16, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--color-border)',
          position: 'relative',
          zIndex: 30,
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                height: '100%',
                background: 'none',
                border: 'none',
                color: isActive ? '#ff5500' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'color var(--transition-fast)',
                userSelect: 'none',
              }}
            >
              {tab.icon}
              <span style={{ fontSize: '10px', fontWeight: isActive ? 700 : 500 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Modals & Overlays */}
      <ThemeEditorModal />
      <SoundCloudLoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => toggleLoginModal(false)} 
      />
      <LyricsScreen />
    </div>
  );
};
