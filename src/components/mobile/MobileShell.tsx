import React, { useState, useEffect, useMemo } from 'react';
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
  X,
  Radio,
  ArrowLeft,
  Sparkles,
  Zap
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
import { SoundCloudClient } from '../../core/soundcloud/SoundCloudClient';
import { INITIAL_TRACKS } from '../../core/music-providers/catalog';
import { AudioTrack } from '../../types';

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
    soundCloudStream,
    soundCloudLikes,
    trendingTracks,
    activeArtist,
    setActiveArtist,
    toggleLoginModal, 
    isLoginModalOpen, 
    toggleThemeEditor,
    isThemeEditorOpen,
    isLyricsOpen,
    toggleLyrics,
    searchQuery,
    setSearchQuery,
    isFavorite,
    toggleFavorite
  } = usePlayer();

  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [scResults, setScResults] = useState<AudioTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Quick search presets for mobile discovery
  const searchGenres = [
    'Phonk', 'Deep House', 'Lo-Fi', 'Synthwave', 'Trap', 'Techno', 'Rock', 'Ambient'
  ];

  // SoundCloud API search with 300ms debounce
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setScResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const client = SoundCloudClient.getInstance();
        const results = await client.search(q, 30);
        setScResults(results);
      } catch (e) {
        console.error('SoundCloud mobile search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Combined search results (local catalog + SoundCloud live)
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const local = INITIAL_TRACKS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
    );

    const combined = [...scResults];
    for (const loc of local) {
      if (!combined.some((s) => s.id === loc.id)) {
        combined.push(loc);
      }
    }
    return combined;
  }, [searchQuery, scResults]);

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
            filter: 'blur(80px) saturate(1.8) brightness(0.22)',
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
          backgroundColor: 'rgba(10, 10, 13, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border)',
          position: 'relative',
          zIndex: 30,
        }}
      >
        {/* Brand / Logo */}
        <div 
          onClick={() => {
            setActiveSection('home');
            setActiveArtist(null);
            setSearchQuery('');
          }}
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
              padding: '5px 12px',
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
        {/* If user entered search query, prioritize Search Results across sections */}
        {searchResults !== null ? (
          <div style={{ padding: '16px 16px 135px 16px' }}>
            <HeaderSearch />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 12px 0' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>
                Результаты поиска
              </h2>
              {isSearching ? (
                <span style={{ fontSize: '11px', color: '#ff5500', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Radio size={13} className="animate-pulse" />
                  Поиск в SoundCloud...
                </span>
              ) : (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '12px', cursor: 'pointer' }}
                >
                  Очистить
                </button>
              )}
            </div>

            {searchResults.length === 0 && !isSearching ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--color-text-muted)' }}>
                <Search size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
                <p style={{ fontSize: '15px', fontWeight: 600 }}>Ничего не найдено</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>Попробуйте изменить поисковый запрос</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {searchResults.map((track) => {
                  const fav = isFavorite(track.id);
                  const isCurrent = currentTrack?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track, searchResults)}
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
                          alt="" 
                          style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} 
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
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
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {track.artist}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleFavorite(track.id)}
                          style={{ background: 'none', border: 'none', color: fav ? '#ef4444' : 'var(--color-text-muted)', cursor: 'pointer', padding: '6px' }}
                        >
                          <Heart size={18} fill={fav ? '#ef4444' : 'none'} />
                        </button>
                        <button
                          onClick={() => playTrack(track, searchResults)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isCurrent && isPlaying ? '#ff5500' : 'rgba(255, 255, 255, 0.08)',
                            border: 'none',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          {isCurrent && isPlaying ? <Pause size={14} fill="#ffffff" /> : <Play size={14} fill="#ffffff" style={{ marginLeft: '2px' }} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Normal Tab Content */
          <>
            {activeSection === 'home' && (
              <div style={{ paddingBottom: '135px' }}>
                <HeaderSearch />

                {/* SoundCloud Stream Section if user has personal stream tracks */}
                {soundCloudStream.length > 0 && (
                  <section style={{ padding: '16px 16px 8px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                        Ваша лента SoundCloud
                      </h2>
                      <span style={{ fontSize: '10px', color: '#ff5500', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255, 85, 0, 0.12)' }}>
                        Stream
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '6px' }}>
                      {soundCloudStream.slice(0, 10).map((track) => (
                        <div 
                          key={track.id}
                          onClick={() => playTrack(track, soundCloudStream)}
                          style={{ width: '120px', minWidth: '120px', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                        >
                          <img 
                            src={track.coverUrl} 
                            alt={track.title} 
                            style={{ width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover', marginBottom: '6px' }}
                          />
                          <div style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {track.title}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {track.artist}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <ArtistHeader />
                <AlbumShelf />
                <div style={{ padding: '0 16px' }}>
                  <PopularTracks />
                  <div style={{ marginTop: '20px' }}>
                    <SimilarArtists />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'albums' && (
              /* Mobile Search & Discovery Screen */
              <div style={{ padding: '0 16px 135px 16px' }}>
                <HeaderSearch />

                {/* Quick Genre Chips */}
                <div style={{ margin: '14px 0 16px 0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                    Популярные жанры
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {searchGenres.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => setSearchQuery(genre)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          backgroundColor: 'var(--color-bg-surface)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <AlbumShelf />
                </div>
                <PopularTracks />
              </div>
            )}

            {activeSection === 'favorites' && (
              <div style={{ paddingBottom: '135px' }}>
                <FavoritesView />
              </div>
            )}

            {activeSection === 'playlists' && (
              <div style={{ paddingBottom: '135px' }}>
                <PlaylistsView />
              </div>
            )}

            {activeSection === 'local' && (
              /* Mobile Queue View */
              <div style={{ padding: '16px 16px 135px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Очередь воспроизведения</h2>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Всего {queue.length} треков · {queueIndex + 1}-й трек сейчас играет
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
          </>
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
          backgroundColor: 'rgba(12, 12, 16, 0.96)',
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
              onClick={() => {
                setActiveSection(tab.id);
                if (tab.id === 'home') {
                  setActiveArtist(null);
                }
              }}
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
