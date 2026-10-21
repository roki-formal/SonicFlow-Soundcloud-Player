import React from 'react';
import { HeaderSearch } from '../navigation/HeaderSearch';
import { ArtistHeader } from '../artist/ArtistHeader';
import { AlbumShelf } from '../albums/AlbumShelf';
import { PopularTracks } from '../tracks/PopularTracks';
import { SimilarArtists } from '../artist/SimilarArtists';
import { LocalFilesView, FavoritesView, PlaylistsView } from '../library/LibraryViews';
import { usePlayer } from '../../core/player/PlayerContext';
import { INITIAL_TRACKS } from '../../core/music-providers/catalog';
import { Play } from 'lucide-react';

export const MainContent: React.FC = () => {
  const { activeSection, searchQuery, playTrack } = usePlayer();

  // If search query is present, show search results
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return INITIAL_TRACKS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
    );
  }, [searchQuery]);

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
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>
              Результаты поиска: &ldquo;{searchQuery}&rdquo;
            </h2>
            {searchResults.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Ничего не найдено</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {searchResults.map((track) => (
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
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={track.coverUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{track.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{track.artist} · {track.album}</div>
                      </div>
                    </div>
                    <Play size={16} fill="currentColor" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Section Switcher */
          <>
            {activeSection === 'home' && (
              <>
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
