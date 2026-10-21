import React from 'react';
import { MobileShell } from './MobileShell';
import { MobileVinylPlayer } from './MobileVinylPlayer';
import { MobileMiniPlayer } from './MobileMiniPlayer';

export const MobilePlayer: React.FC = () => {
  return <MobileShell />;
};

export { MobileVinylPlayer, MobileMiniPlayer, MobileShell };
