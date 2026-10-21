import './setup';
import { describe, it, expect, beforeEach } from 'vitest';
import { CustomizationManager, DEFAULT_SETTINGS } from '../src/core/settings/CustomizationManager';

describe('CustomizationManager', () => {
  let manager: CustomizationManager;

  beforeEach(() => {
    localStorage.clear();
    manager = CustomizationManager.getInstance();
    manager.resetToDefaults();
  });

  it('should initialize with default settings', () => {
    const settings = manager.getSettings();
    expect(settings.ambientGlowEnabled).toBe(DEFAULT_SETTINGS.ambientGlowEnabled);
    expect(settings.visualizerMode).toBe('spectrum');
    expect(settings.vinylStyle).toBe('classic');
    expect(settings.fontPreset).toBe('inter');
  });

  it('should update and persist settings', () => {
    manager.updateSettings({
      ambientGlowEnabled: false,
      vinylSpeedRpm: 45,
      visualizerMode: 'radial',
      customCss: '.custom-test { color: red; }',
    });

    const updated = manager.getSettings();
    expect(updated.ambientGlowEnabled).toBe(false);
    expect(updated.vinylSpeedRpm).toBe(45);
    expect(updated.visualizerMode).toBe('radial');
    expect(updated.customCss).toBe('.custom-test { color: red; }');
  });

  it('should notify subscribers on change', () => {
    let notified = false;
    const unsub = manager.subscribe((settings) => {
      if (settings.vinylStyle === 'gold') {
        notified = true;
      }
    });

    manager.updateSettings({ vinylStyle: 'gold' });
    expect(notified).toBe(true);
    unsub();
  });

  it('should reset back to defaults', () => {
    manager.updateSettings({ ambientGlowBlur: 100, visualizerBars: 48 });
    expect(manager.getSettings().ambientGlowBlur).toBe(100);

    manager.resetToDefaults();
    expect(manager.getSettings().ambientGlowBlur).toBe(DEFAULT_SETTINGS.ambientGlowBlur);
    expect(manager.getSettings().visualizerBars).toBe(DEFAULT_SETTINGS.visualizerBars);
  });
});
