import React from 'react';
import { 
  Home, 
  Disc, 
  FolderDown, 
  Heart, 
  ListMusic, 
  Search, 
  Palette, 
  Smartphone,
  Radio
} from 'lucide-react';
import { usePlayer, NavSection } from '../../core/player/PlayerContext';
import { INITIAL_FRIENDS } from '../../core/music-providers/catalog';

export const Sidebar: React.FC = () => {
  const { 
    activeSection, 
    setActiveSection, 
    toggleThemeEditor, 
    toggleMobileView,
    isMobileView 
  } = usePlayer();

  const navItems: { id: NavSection; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'albums', label: 'Albums', icon: <Disc size={18} /> },
    { id: 'local', label: 'Local Files', icon: <FolderDown size={18} /> },
    { id: 'favorites', label: 'Favorites', icon: <Heart size={18} /> },
    { id: 'playlists', label: 'Playlists', icon: <ListMusic size={18} /> },
  ];

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
              backgroundColor: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent-contrast)',
            }}
          >
            <Radio size={18} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            SonicFlow
          </span>
        </div>

        <h3 
          style={{ 
            fontSize: '12px', 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em', 
            color: 'var(--color-text-muted)', 
            marginBottom: '12px',
            fontWeight: 600,
          }}
        >
          Menu
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
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '14px',
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
                <span style={{ color: isActive ? 'var(--color-accent)' : 'inherit' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Friends Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 
          style={{ 
            fontSize: '12px', 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em', 
            color: 'var(--color-text-muted)', 
            marginBottom: '14px',
            fontWeight: 600,
          }}
        >
          Friends
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1 }}>
          {INITIAL_FRIENDS.map((friend) => (
            <div 
              key={friend.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                padding: '4px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              title={`${friend.name} is listening to ${friend.currentTrack} — ${friend.artist}`}
            >
              <div style={{ position: 'relative', width: '32px', height: '32px', flexShrink: 0 }}>
                <img 
                  src={friend.avatarUrl} 
                  alt={friend.name} 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
                {friend.isOnline && (
                  <span 
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#10b981',
                      borderRadius: '50%',
                      border: '1.5px solid var(--color-bg-sidebar)',
                    }}
                  />
                )}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {friend.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {friend.currentTrack} · {friend.artist}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Find more friends button */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginTop: '16px',
            padding: '8px 12px',
            backgroundColor: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-control)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          <Search size={14} />
          <span style={{ flex: 1 }}>Find more friends</span>
        </div>
      </div>

      {/* Bottom Actions: Theme & Mobile Toggle */}
      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
          <Palette size={15} style={{ color: 'var(--color-accent)' }} />
          <span>Theme Studio</span>
        </button>

        <button
          onClick={() => toggleMobileView(!isMobileView)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-control)',
            backgroundColor: isMobileView ? 'var(--color-accent)' : 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            color: isMobileView ? 'var(--color-accent-contrast)' : 'var(--color-text-secondary)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast)',
          }}
        >
          <Smartphone size={15} />
          <span>{isMobileView ? 'Desktop Layout' : 'iOS Mobile View'}</span>
        </button>
      </div>
    </aside>
  );
};
