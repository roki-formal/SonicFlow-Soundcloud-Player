import React, { useEffect, useState } from 'react';
import { HeaderSearch } from '../navigation/HeaderSearch';
import { ArtistHeader } from '../artist/ArtistHeader';
import { AlbumShelf } from '../albums/AlbumShelf';
import { PopularTracks } from '../tracks/PopularTracks';
import { SimilarArtists } from '../artist/SimilarArtists';
import { LocalFilesView, FavoritesView, PlaylistsView } from '../library/LibraryViews';
import { usePlayer } from '../../core/player/PlayerContext';
import { INITIAL_TRACKS } from '../../core/music-providers/catalog';
import { SoundCloudClient } from '../../core/soundcloud/SoundCloudClient';
import { Play, Radio, Sparkles, Heart } from 'lucide-react';
import { AudioTrack } from '../../types';

export const MainContent: React.FC = () => {
  const { 
    activeSection, 
    searchQuery, 
    playTrack,
    soundCloudUser,
    soundCloudStream,
    toggleLoginModal,
    isFavorite,
    toggleFavorite
  } = usePlayer();

  const [scResults, setScResults] = useState<AudioTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
        console.error('SoundCloud search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Combined search results
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    // Filter local catalog
    const local = INITIAL_TRACKS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
    );

    // Merge with SoundCloud live results
    const combined = [...scResults];
    for (const loc of local) {
      if (!combined.some((s) => s.id === loc.id)) {
        combined.push(loc);
      }
    }
    return combined;
  }, [searchQuery, scResults]);

  return (
    <main 
      style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: 'var(--color-bg-base)',
        overflowY: 'auto',
        height: '100%',
      }}
    >
      <HeaderSearch />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {searchResults !== null ? (
          /* Search Results View */
          <div style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800 }}>
                Результаты поиска: &ldquo;{searchQuery}&rdquo;
              </h2>
              {isSearching && (
                <span style={{ fontSize: '12px', color: '#ff5500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Radio size={14} className="animate-pulse" />
                  Поиск в SoundCloud...
                </span>
              )}
            </div>

            {searchResults.length === 0 && !isSearching ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Ничего не найдено</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {searchResults.map((track) => {
                  const fav = isFavorite(track.id);
                  return (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track, searchResults)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-control)',
                        backgroundColor: 'var(--color-bg-surface)',
                        cursor: 'pointer',
                        transition: 'background-color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                        <img 
                          src={track.coverUrl} 
                          alt="" 
                          style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} 
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {track.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {track.artist} · {track.album}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleFavorite(track.id)}
                          style={{ background: 'none', border: 'none', color: fav ? '#ef4444' : 'var(--color-text-muted)', cursor: 'pointer' }}
                        >
                          <Heart size={16} fill={fav ? '#ef4444' : 'none'} />
                        </button>
                        <Play size={16} fill="currentColor" onClick={() => playTrack(track, searchResults)} style={{ cursor: 'pointer' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Section Switcher */
          <>
            {activeSection === 'home' && (
              <>
                {/* SoundCloud Stream banner if connected */}
                {soundCloudUser ? (
                  <div 
                    style={{
                      margin: '20px 28px 0 28px',
                      padding: '18px 24px',
                      borderRadius: 'var(--radius-card)',
                      backgroundColor: 'rgba(255, 85, 0, 0.1)',
                      border: '1px solid rgba(255, 85, 0, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img 
                        src={soundCloudUser.avatar_url} 
                        alt={soundCloudUser.username}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          Добро пожаловать, {soundCloudUser.username}!
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          Ваш аккаунт синхронизирован с soundcloud.com. Доступно {soundCloudUser.likes_count} лайков и {soundCloudUser.playlist_count} плейлистов.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleLoginModal(true)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        backgroundColor: '#ff5500',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Управление аккаунтом
                    </button>
                  </div>
                ) : (
                  <div 
                    style={{
                      margin: '16px 28px 0 28px',
                      padding: '14px 20px',
                      borderRadius: 'var(--radius-card)',
                      backgroundColor: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Radio size={18} style={{ color: '#ff5500' }} />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>
                        Хотите слушать свои личные треки из SoundCloud?
                      </span>
                    </div>
                    <button
                      onClick={() => toggleLoginModal(true)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        backgroundColor: '#ff5500',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Войти в SoundCloud
                    </button>
                  </div>
                )}

                {/* If user has stream tracks from SoundCloud, show stream section */}
                {soundCloudStream.length > 0 && (
                  <section style={{ padding: '24px 28px 0 28px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '14px' }}>
                      Ваша лента SoundCloud (Stream)
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                      {soundCloudStream.slice(0, 6).map((track) => (
                        <div 
                          key={track.id} 
                          onClick={() => playTrack(track, soundCloudStream)}
                          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                        >
                          <img 
                            src={track.coverUrl} 
                            alt={track.title} 
                            style={{ width: '100%', aspectRatio: '1/1', borderRadius: '14px', objectFit: 'cover', marginBottom: '8px' }} 
                          />
                          <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {track.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {track.artist}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <ArtistHeader />
                <AlbumShelf />
                <div 
                  style={{ 
                    display: 'flex', 
                    gap: '32px', 
                    padding: '0 28px 40px 28px',
                    flexWrap: 'wrap',
                  }}
                >
                  <PopularTracks />
                  <SimilarArtists />
                </div>
              </>
            )}

            {activeSection === 'albums' && (
              <div style={{ paddingTop: '20px' }}>
                <AlbumShelf />
                <div style={{ padding: '0 28px 40px 28px' }}>
                  <PopularTracks />
                </div>
              </div>
            )}

            {activeSection === 'local' && <LocalFilesView />}
            {activeSection === 'favorites' && <FavoritesView />}
            {activeSection === 'playlists' && <PlaylistsView />}
          </>
        )}
      </div>
    </main>
  );
};
