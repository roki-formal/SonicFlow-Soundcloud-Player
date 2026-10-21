import React, { useState } from 'react';
import { Play, Check, Plus } from 'lucide-react';
import { TACO_ARTIST_PROFILE } from '../../core/music-providers/catalog';
import { usePlayer } from '../../core/player/PlayerContext';

export const ArtistHeader: React.FC = () => {
  const { playTrack } = usePlayer();
  const [isFollowed, setIsFollowed] = useState<boolean>(TACO_ARTIST_PROFILE.isFollowed);

  const handlePlayArtist = () => {
    if (TACO_ARTIST_PROFILE.popularTracks.length > 0) {
      playTrack(TACO_ARTIST_PROFILE.popularTracks[0], TACO_ARTIST_PROFILE.popularTracks);
    }
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '24px', 
        padding: '24px 28px',
      }}
    >
      {/* Circular Avatar with soft glow & play button overlay */}
      <div 
        style={{ 
          position: 'relative', 
          width: '96px', 
          height: '96px', 
          borderRadius: '50%',
          boxShadow: '0 0 35px rgba(168, 85, 247, 0.35)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
        onClick={handlePlayArtist}
        title="Play Artist Top Tracks"
      >
        <img 
          src={TACO_ARTIST_PROFILE.avatarUrl} 
          alt={TACO_ARTIST_PROFILE.name}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
        {/* Play Overlay Badge */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.9,
            transition: 'opacity var(--transition-fast)',
          }}
        >
          <div 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Play size={16} fill="#ffffff" style={{ marginLeft: '2px' }} />
          </div>
        </div>
      </div>

      {/* Artist Info & Follow */}
      <div>
        <h1 
          style={{ 
            fontSize: '38px', 
            fontWeight: 800, 
            letterSpacing: '-0.03em',
            marginBottom: '10px',
            color: 'var(--color-text-primary)',
          }}
        >
          {TACO_ARTIST_PROFILE.name}
        </h1>

        <button
          onClick={() => setIsFollowed(!isFollowed)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            borderRadius: '9999px',
            backgroundColor: isFollowed ? 'var(--color-bg-surface-active)' : 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            color: isFollowed ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          {isFollowed ? (
            <>
              <Check size={13} style={{ color: 'var(--color-accent)' }} />
              <span>Following</span>
            </>
          ) : (
            <>
              <Plus size={13} />
              <span>Follow</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
