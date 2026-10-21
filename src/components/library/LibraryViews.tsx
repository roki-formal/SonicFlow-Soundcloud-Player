import React, { useRef, useState } from 'react';
import { 
  FolderDown, 
  Heart, 
  ListMusic, 
  Play, 
  Plus, 
  Trash2, 
  Music, 
  Upload,
  Disc 
} from 'lucide-react';
import { usePlayer } from '../../core/player/PlayerContext';
import { LocalFilesProvider } from '../../core/music-providers/LocalFilesProvider';
import { StorageManager } from '../../core/storage/StorageManager';
import { INITIAL_TRACKS } from '../../core/music-providers/catalog';
import { AudioTrack, StoredPlaylist } from '../../types';

export const LocalFilesView: React.FC = () => {
  const { playTrack } = usePlayer();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localTracks, setLocalTracks] = useState<AudioTrack[]>([]);
  const [provider] = useState(() => new LocalFilesProvider());

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const tracks = await provider.processFiles(files);
    setLocalTracks((prev) => [...prev, ...tracks]);
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>Local Files</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            Воспроизводите MP3, WAV, FLAC и OGG аудиофайлы с вашего компьютера
          </p>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          multiple 
          accept="audio/*,.mp3,.wav,.flac,.ogg,.m4a" 
          style={{ display: 'none' }} 
          onChange={(e) => handleFiles(e.target.files)} 
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-contrast)',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Upload size={16} />
          <span>Выбрать аудиофайлы</span>
        </button>
      </div>

      {localTracks.length === 0 ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '60px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: 'var(--color-bg-surface)',
          }}
        >
          <FolderDown size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
            Нажмите сюда, чтобы загрузить локальные треки
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
            Поддерживаются форматы MP3, WAV, FLAC, M4A, OGG
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {localTracks.map((track) => (
            <div
              key={track.id}
              onClick={() => playTrack(track, localTracks)}
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
                <Music size={18} style={{ color: 'var(--color-accent)' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{track.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{track.artist}</div>
                </div>
              </div>
              <Play size={16} fill="currentColor" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const FavoritesView: React.FC = () => {
  const { 
    playTrack, 
    isFavorite, 
    toggleFavorite, 
    soundCloudUser, 
    soundCloudLikes,
    toggleLoginModal,
    syncSoundCloudData 
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<'soundcloud' | 'local'>(soundCloudUser ? 'soundcloud' : 'local');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const localFavTracks = INITIAL_TRACKS.filter((t) => isFavorite(t.id));
  const currentList = activeTab === 'soundcloud' && soundCloudUser ? soundCloudLikes : localFavTracks;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncSoundCloudData();
    setIsRefreshing(false);
  };

  return (
    <div style={{ padding: '28px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>Favorites</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            Ваши любимые композиции и треки из SoundCloud
          </p>
        </div>

        {soundCloudUser && (
          <button
            onClick={handleRefresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span>{isRefreshing ? 'Синхронизация...' : 'Обновить из SoundCloud'}</span>
          </button>
        )}
      </div>

      {/* Tabs if connected to SoundCloud */}
      {soundCloudUser ? (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('soundcloud')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              backgroundColor: activeTab === 'soundcloud' ? '#ff5500' : 'var(--color-bg-surface)',
              color: activeTab === 'soundcloud' ? '#ffffff' : 'var(--color-text-secondary)',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            SoundCloud Likes ({soundCloudLikes.length})
          </button>
          <button
            onClick={() => setActiveTab('local')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              backgroundColor: activeTab === 'local' ? 'var(--color-accent)' : 'var(--color-bg-surface)',
              color: activeTab === 'local' ? 'var(--color-accent-contrast)' : 'var(--color-text-secondary)',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Локальные ({localFavTracks.length})
          </button>
        </div>
      ) : (
        <div 
          style={{
            padding: '12px 18px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 85, 0, 0.1)',
            border: '1px solid rgba(255, 85, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
            Хотите синхронизировать свои лайки с <strong>soundcloud.com/you/likes</strong>?
          </span>
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
            Войти в аккаунт
          </button>
        </div>
      )}

      {currentList.length === 0 ? (
        <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'center', padding: '60px 0' }}>
          {activeTab === 'soundcloud'
            ? 'В вашем SoundCloud аккаунте пока нет лайков или они загружаются...'
            : 'У вас пока нет локальных избранных треков. Нажмите на сердечко у любого трека!'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {currentList.map((track) => {
            const fav = isFavorite(track.id) || track.isFavorite;
            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, currentList)}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                  <img src={track.coverUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
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
                    title="Синхронизировать лайк в SoundCloud"
                  >
                    <Heart size={16} fill={fav ? '#ef4444' : 'none'} />
                  </button>
                  <Play size={16} fill="currentColor" onClick={() => playTrack(track, currentList)} style={{ cursor: 'pointer' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const PlaylistsView: React.FC = () => {
  const { playTrack, soundCloudUser, soundCloudPlaylists, toggleLoginModal } = usePlayer();
  const storage = StorageManager.getInstance();
  const [playlists, setPlaylists] = useState<StoredPlaylist[]>(storage.getPlaylists());
  const [newTitle, setNewTitle] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    storage.createPlaylist(newTitle);
    setPlaylists(storage.getPlaylists());
    setNewTitle('');
    setShowCreate(false);
  };

  const handleDelete = (id: string) => {
    storage.deletePlaylist(id);
    setPlaylists(storage.getPlaylists());
  };

  return (
    <div style={{ padding: '28px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>Playlists</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            Ваши плейлисты из SoundCloud и локальные подборки
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-contrast)',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          <span>Создать локальный плейлист</span>
        </button>
      </div>

      {/* SoundCloud Playlists section */}
      {soundCloudUser && soundCloudPlaylists.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px', color: '#ff5500' }}>
            Плейлисты из вашего аккаунта SoundCloud
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {soundCloudPlaylists.map((pl) => (
              <div
                key={pl.id}
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  padding: '16px',
                  borderRadius: 'var(--radius-card)',
                  border: '1px solid rgba(255, 85, 0, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '160px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    {pl.coverUrl ? (
                      <img src={pl.coverUrl} alt="" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                    ) : (
                      <ListMusic size={28} style={{ color: '#ff5500' }} />
                    )}
                    <span style={{ fontSize: '10px', color: '#ff5500', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255, 85, 0, 0.15)' }}>
                      SoundCloud
                    </span>
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{pl.title}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {pl.description || `${pl.tracks.length} треков`}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (pl.tracks.length > 0) {
                      playTrack(pl.tracks[0], pl.tracks);
                    }
                  }}
                  style={{
                    marginTop: '12px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    backgroundColor: '#ff5500',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    width: 'fit-content',
                  }}
                >
                  <Play size={12} fill="currentColor" />
                  <span>Слушать сет</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input 
            type="text" 
            value={newTitle} 
            onChange={(e) => setNewTitle(e.target.value)} 
            placeholder="Название нового плейлиста..." 
            autoFocus
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
          <button 
            type="submit" 
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-contrast)',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Сохранить
          </button>
        </form>
      )}

      {/* Local playlists */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>
        Локальные плейлисты
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {playlists.map((pl) => (
          <div
            key={pl.id}
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              padding: '16px',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '140px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <ListMusic size={24} style={{ color: 'var(--color-accent)', marginBottom: '10px' }} />
                <button
                  onClick={() => handleDelete(pl.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                  title="Удалить плейлист"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{pl.title}</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {pl.description || `${pl.tracks.length} треков`}
              </p>
            </div>

            <button
              onClick={() => {
                const tracksToPlay = pl.tracks.length > 0 ? pl.tracks : INITIAL_TRACKS;
                playTrack(tracksToPlay[0], tracksToPlay);
              }}
              style={{
                marginTop: '12px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: 'var(--color-bg-surface-active)',
                border: 'none',
                color: 'var(--color-text-primary)',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                width: 'fit-content',
              }}
            >
              <Play size={12} fill="currentColor" />
              <span>Слушать</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
