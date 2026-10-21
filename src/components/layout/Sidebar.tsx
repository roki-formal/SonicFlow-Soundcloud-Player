import React from 'react';
import { 
  Home, 
  Disc, 
  FolderDown, 
  Heart, 
  ListMusic, 
  Search, 
  Palette, 
  Radio,
  RefreshCw,
  Zap,
  Users,
  ExternalLink
} from 'lucide-react';
import { usePlayer, NavSection } from '../../core/player/PlayerContext';
import { SoundCloudArtist } from '../../core/soundcloud/SoundCloudTypes';

export const Sidebar: React.FC = () => {
  const { 
    activeSection, 
    setActiveSection, 
    toggleThemeEditor, 
    soundCloudUser,
    soundCloudFollowings,
    toggleLoginModal,
    syncSoundCloudData,
    isSyncing,
    setActiveArtist
  } = usePlayer();

  const navItems: { id: NavSection; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Главная', icon: <Home size={18} /> },
    { id: 'albums', label: 'Плейлисты & Альбомы', icon: <Disc size={18} /> },
    { id: 'favorites', label: 'Избранное & Лайки', icon: <Heart size={18} /> },
    { id: 'playlists', label: 'Мои подборки', icon: <ListMusic size={18} /> },
    { id: 'local', label: 'Локальные файлы', icon: <FolderDown size={18} /> },
  ];

  const defaultArtists: SoundCloudArtist[] = [
    {
      id: 856062,
      username: 'Skrillex',
      avatar_url: 'https://i1.sndcdn.com/avatars-000329593282-3lshg4-t500x500.jpg',
      permalink_url: 'https://soundcloud.com/skrillex',
      followers_count: 6710000,
    },
    {
      id: 110294,
      username: 'San Holo',
      avatar_url: 'https://i1.sndcdn.com/avatars-000185919315-8i8q2g-t500x500.jpg',
      permalink_url: 'https://soundcloud.com/sanholobeats',
      followers_count: 1420000,
    },
    {
      id: 38812,
      username: 'Monstercat',
      avatar_url: 'https://i1.sndcdn.com/avatars-000305888204-i6a9y7-t500x500.jpg',
      permalink_url: 'https://soundcloud.com/monstercat',
      followers_count: 2850000,
    },
  ];

  const displayArtists = soundCloudFollowings.length > 0 ? soundCloudFollowings.slice(0, 8) : defaultArtists;

  return (
    <aside 
      style={{
        backgroundColor: 'var(--color-bg-sidebar)',
        width: '240px',
        minWidth: '240px',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '24px 18px',
        overflowY: 'auto',
      }}
    >
      {/* Brand & Menu */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#ff5500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 10px rgba(255, 85, 0, 0.4)',
            }}
          >
            <Radio size={18} />
          </div>
          <div>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
              SonicFlow
            </span>
            <span style={{ fontSize: '10px', color: '#ff5500', fontWeight: 700, letterSpacing: '0.04em' }}>
              SoundCloud Sync
            </span>
          </div>
        </div>

        <h3 
          style={{ 
            fontSize: '11px', 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em', 
            color: 'var(--color-text-muted)', 
            marginBottom: '10px',
            fontWeight: 700,
          }}
        >
          Навигация
        </h3>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: isActive ? 'var(--color-bg-surface-active)' : 'transparent',
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  fontWeight: isActive ? 700 : 400,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                <span style={{ color: isActive ? '#ff5500' : 'inherit' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Following / Artists Section (Real SoundCloud Artists) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 
            style={{ 
              fontSize: '11px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em', 
              color: 'var(--color-text-muted)', 
              margin: 0,
              fontWeight: 700,
            }}
          >
            {soundCloudFollowings.length > 0 ? 'Ваши подписки' : 'Артисты SoundCloud'}
          </h3>
          <Users size={13} style={{ color: 'var(--color-text-muted)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {displayArtists.map((artist) => (
            <div 
              key={artist.id} 
              onClick={() => setActiveArtist(artist)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                padding: '6px 8px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              title={`Открыть треки ${artist.username}`}
            >
              <img 
                src={artist.avatar_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'} 
                alt={artist.username} 
                style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {artist.username}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {artist.followers_count ? `${Math.round(artist.followers_count / 1000)}K подписчиков` : 'SoundCloud'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SoundCloud Account / Sync Widget */}
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
        {soundCloudUser ? (
          <div 
            onClick={() => toggleLoginModal(true)}
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid rgba(255, 85, 0, 0.25)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            }}
            title="Управление аккаунтом SoundCloud"
          >
            <img 
              src={soundCloudUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
              alt={soundCloudUser.username}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #ff5500', flexShrink: 0 }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {soundCloudUser.username}
              </div>
              <div style={{ fontSize: '10px', color: '#ff5500', fontWeight: 600 }}>
                {isSyncing ? 'Синхронизация...' : 'Сохранен ✓'}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                syncSoundCloudData();
              }}
              disabled={isSyncing}
              title="Синхронизировать сейчас"
              style={{
                background: 'none',
                border: 'none',
                color: isSyncing ? '#ff5500' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => toggleLoginModal(true)}
            className="btn-interactive"
            title="Подключить аккаунт SoundCloud для полной синхронизации"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-control)',
              background: 'linear-gradient(135deg, #ff5500 0%, #ff2200 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255, 85, 0, 0.35)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Zap size={15} fill="currentColor" />
            <span>Войти в SoundCloud</span>
          </button>
        )}
      </div>

      {/* Bottom Actions: Theme */}
      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => toggleThemeEditor(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-control)',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
        >
          <Palette size={15} style={{ color: '#ff5500' }} />
          <span>Стили и Темы</span>
        </button>
      </div>
    </aside>
  );
};
