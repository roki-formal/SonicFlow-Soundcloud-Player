import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { TACO_ARTIST_PROFILE } from '../../core/music-providers/catalog';

export const SimilarArtists: React.FC = () => {
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({
    'sim-1': true,
    'sim-2': false,
    'sim-3': false,
  });

  const toggleFollow = (id: string) => {
    setFollowedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ flex: '1', minWidth: '220px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '16px' }}>
        Similar Artist
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {TACO_ARTIST_PROFILE.similarArtists.map((artist) => {
          const isFollowed = followedMap[artist.id] ?? false;

          return (
            <div 
              key={artist.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <img 
                src={artist.avatarUrl} 
                alt={artist.name} 
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {artist.name}
                </div>
                <button
                  onClick={() => toggleFollow(artist.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    marginTop: '2px',
                    borderRadius: '9999px',
                    backgroundColor: isFollowed ? 'var(--color-bg-surface-active)' : 'transparent',
                    border: '1px solid var(--color-border)',
                    color: isFollowed ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {isFollowed ? (
                    <>
                      <Check size={11} />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <Plus size={11} />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
