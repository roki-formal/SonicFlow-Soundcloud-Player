import React, { useEffect } from 'react';
import { PlayerProvider } from './core/player/PlayerContext';
import { AppShell } from './components/layout/AppShell';
import { ThemeManager } from './core/themes/ThemeManager';

export const App: React.FC = () => {
  useEffect(() => {
    // Ensure theme is applied on launch
    ThemeManager.getInstance();
  }, []);

  return (
    <PlayerProvider>
      <AppShell />
    </PlayerProvider>
  );
};

export default App;
