import React, { useState } from 'react';
import { Play, Check, Plus, Radio, Zap } from 'lucide-react';
import { usePlayer } from '../../core/player/PlayerContext';
import { FEATURED_ARTIST_PROFILE } from '../../core/music-providers/catalog';

export const ArtistHeader: React.FC = () => {
  const { 
    playTrack, 
    soundCloudUser, 
    soundCloudLikes, 
    activeArtist, 
    setActiveArtist,
    toggleLoginModal,
    trendingTracks,
    isMobileView
  } = usePlayer();

  const [isFollowed, setIsFollowed] = useState<boolean>(true);

  // If user selected an artist from followings/search, show them;
  // otherwise show logged-in SoundCloud user profile; otherwise show featured artist
  const isUserProfile = !activeArtist && Boolean(soundCloudUser);
  const title = activeArtist ? activeArtist.username : soundCloudUser ? soundCloudUser.username : FEATURED_ARTIST_PROFILE.name;
  const avatar = activeArtist ? activeArtist.avatar_url : soundCloudUser?.avatar_url || FEATURED_ARTIST_PROFILE.avatarUrl;
  const subtitle = activeArtist 
    ? (activeArtist.city ? `${activeArtist.city}, ` : '') + (activeArtist.country || 'SoundCloud Артист')
    : soundCloudUser 
      ? `SoundCloud Аккаунт · ${soundCloudUser.likes_count ?? soundCloudLikes.length} лайков · ${soundCloudUser.playlist_count ?? 0} плейлистов`
      : 'SoundCloud Featured Artist · 6.7M подписчиков';

  const handlePlay = () => {
    if (isUserProfile && soundCloudLikes.length > 0) {
      playTrack(soundCloudLikes[0], soundCloudLikes);
    } else if (trendingTracks.length > 0) {
      playTrack(trendingTracks[0], trendingTracks);
    }
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: isMobileView ? 'column' : 'row',
        alignItems: isMobileView ? 'stretch' : 'center', 
        justifyContent: 'space-between',
        gap: isMobileView ? '16px' : '24px', 
        padding: isMobileView ? '16px' : '28px 32px',
        margin: isMobileView ? '12px 16px 8px 16px' : '16px 24px 8px 24px',
        borderRadius: 'var(--radius-panel, 16px)',
        background: 'radial-gradient(ellipse 70% 100% at 10% 50%, rgba(255, 85, 0, 0.16), transparent 80%), var(--color-bg-surface)',
        border: '1px solid rgba(255, 85, 0, 0.25)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobileView ? '16px' : '24px', minWidth: 0 }}>
        {/* Circular Avatar with soft glow & play button overlay */}
        <div 
          className="card-interactive"
          style={{ 
            position: 'relative', 
            width: isMobileView ? '70px' : '96px', 
            height: isMobileView ? '70px' : '96px', 
            borderRadius: '50%',
            boxShadow: '0 0 35px rgba(255, 85, 0, 0.35)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          onClick={handlePlay}
          title={isUserProfile ? "Слушать мои лайки" : "Воспроизвести треки"}
        >
          <img 
            src={avatar} 
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #ff5500',
            }}
          />
          {/* Play Overlay Badge */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.9,
              transition: 'opacity var(--transition-fast)',
            }}
          >
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#ff5500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
              }}
            >
              <Play size={18} fill="#ffffff" style={{ marginLeft: '2px' }} />
            </div>
          </div>
        </div>

        {/* Info & Badges */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span 
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#ff5500',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Radio size={12} />
              {isUserProfile ? 'Ваш профиль' : 'SoundCloud'}
            </span>
            {activeArtist && (
              <button
                onClick={() => setActiveArtist(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                (назад к моему профилю)
              </button>
            )}
          </div>

          <h1 
            style={{ 
              fontSize: isMobileView ? '22px' : '34px', 
              fontWeight: 800, 
              letterSpacing: '-0.03em',
              marginBottom: '4px',
              color: 'var(--color-text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </h1>

          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 12px 0' }}>
            {subtitle}
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePlay}
              className="btn-interactive"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 18px',
                borderRadius: '9999px',
                backgroundColor: '#ff5500',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255, 85, 0, 0.35)',
              }}
            >
              <Play size={14} fill="#ffffff" />
              <span>{isUserProfile ? 'Слушать все лайки' : 'Слушать треки'}</span>
            </button>

            {!isUserProfile && (
              <button
                onClick={() => setIsFollowed(!isFollowed)}
                className="btn-interactive"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  backgroundColor: isFollowed ? 'var(--color-bg-surface-active)' : 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  color: isFollowed ? '#ff5500' : 'var(--color-text-secondary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isFollowed ? (
                  <>
                    <Check size={13} />
                    <span>В подписках</span>
                  </>
                ) : (
                  <>
                    <Plus size={13} />
                    <span>Подписаться</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {!soundCloudUser && (
        <button
          onClick={() => toggleLoginModal(true)}
          className="btn-interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 85, 0, 0.15)',
            border: '1px solid rgba(255, 85, 0, 0.4)',
            color: '#ff5500',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Zap size={14} fill="currentColor" />
          <span>Подключить свой аккаунт</span>
        </button>
      )}
    </div>
  );
};
