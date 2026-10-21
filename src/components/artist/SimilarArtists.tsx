import React, { useState } from 'react';
import { Plus, Check, Radio } from 'lucide-react';
import { usePlayer } from '../../core/player/PlayerContext';
import { FEATURED_ARTIST_PROFILE } from '../../core/music-providers/catalog';
import { SoundCloudArtist } from '../../core/soundcloud/SoundCloudTypes';

export const SimilarArtists: React.FC = () => {
  const { soundCloudFollowings, setActiveArtist } = usePlayer();
  const [followedMap, setFollowedMap] = useState<Record<string | number, boolean>>({});

  const artists: (SoundCloudArtist | typeof FEATURED_ARTIST_PROFILE.similarArtists[0])[] = 
    soundCloudFollowings.length > 0 ? soundCloudFollowings.slice(0, 5) : FEATURED_ARTIST_PROFILE.similarArtists;

  const toggleFollow = (id: string | number) => {
    setFollowedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ flex: '1', minWidth: '220px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
          {soundCloudFollowings.length > 0 ? 'Ваши подписки' : 'Рекомендуемые артисты'}
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {artists.map((artist) => {
          const id = (artist as any).id;
          const name = (artist as any).username || (artist as any).name;
          const avatar = (artist as any).avatar_url || (artist as any).avatarUrl;
          const isFollowed = followedMap[id] ?? ((artist as any).isFollowed ?? true);

          return (
            <div 
              key={id}
              onClick={() => setActiveArtist(artist as SoundCloudArtist)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                transition: 'background-color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)')}
            >
              <img 
                src={avatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'} 
                alt={name} 
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '1.5px solid #ff5500',
                }}
              />

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {name}
                </div>
                <div style={{ fontSize: '10px', color: '#ff5500', fontWeight: 600 }}>
                  SoundCloud Артист
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFollow(id);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  backgroundColor: isFollowed ? 'var(--color-bg-surface-active)' : 'transparent',
                  border: '1px solid var(--color-border)',
                  color: isFollowed ? '#ff5500' : 'var(--color-text-secondary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isFollowed ? (
                  <>
                    <Check size={11} />
                    <span>Подписка</span>
                  </>
                ) : (
                  <>
                    <Plus size={11} />
                    <span>Подписаться</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
