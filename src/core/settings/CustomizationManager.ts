export type VisualizerMode = 'spectrum' | 'wave' | 'radial' | 'minimal';
export type AnimationPreset = 'cinematic' | 'snappy' | 'reduced';
export type FontPreset = 'inter' | 'serif' | 'display' | 'mono';
export type VinylStyle = 'classic' | 'gold' | 'neon' | 'matte';

export interface CustomizationSettings {
  ambientGlowEnabled: boolean;
  ambientGlowBlur: number; // 20 to 100 px
  ambientGlowOpacity: number; // 0.1 to 1.0
  audioReactivePulse: boolean;
  visualizerMode: VisualizerMode;
  visualizerGlow: boolean;
  visualizerBars: number; // 16 to 64
  animationPreset: AnimationPreset;
  fontPreset: FontPreset;
  vinylStyle: VinylStyle;
  vinylSpeedRpm: number; // 0, 33, 45
  vinylGroovesIntensity: number; // 0.1 to 1.0
  glassmorphismBlur: number; // 0 to 30 px
  customCss: string;
}

const STORAGE_KEY = 'sonicflow_customization_settings';

export const DEFAULT_SETTINGS: CustomizationSettings = {
  ambientGlowEnabled: true,
  ambientGlowBlur: 60,
  ambientGlowOpacity: 0.6,
  audioReactivePulse: true,
  visualizerMode: 'spectrum',
  visualizerGlow: true,
  visualizerBars: 32,
  animationPreset: 'cinematic',
  fontPreset: 'inter',
  vinylStyle: 'classic',
  vinylSpeedRpm: 33,
  vinylGroovesIntensity: 0.7,
  glassmorphismBlur: 16,
  customCss: '',
};

export class CustomizationManager {
  private static instance: CustomizationManager;
  private settings: CustomizationSettings;
  private listeners: Set<(settings: CustomizationSettings) => void> = new Set();

  private constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        this.settings = { ...DEFAULT_SETTINGS };
      }
    } else {
      this.settings = { ...DEFAULT_SETTINGS };
    }

    this.applyAll();
  }

  public static getInstance(): CustomizationManager {
    if (!CustomizationManager.instance) {
      CustomizationManager.instance = new CustomizationManager();
    }
    return CustomizationManager.instance;
  }

  public getSettings(): CustomizationSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<CustomizationSettings>): void {
    this.settings = { ...this.settings, ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    this.applyAll();
    this.notify();
  }

  public resetToDefaults(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    localStorage.removeItem(STORAGE_KEY);
    this.applyAll();
    this.notify();
  }

  public subscribe(cb: (settings: CustomizationSettings) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    this.listeners.forEach((cb) => cb(this.settings));
  }

  public applyAll(): void {
    const root = document.documentElement;

    // Ambient glow tokens
    root.style.setProperty('--sf-ambient-glow-blur', `${this.settings.ambientGlowBlur}px`);
    root.style.setProperty('--sf-ambient-glow-opacity', `${this.settings.ambientGlowOpacity}`);
    root.style.setProperty('--sf-glass-blur', `${this.settings.glassmorphismBlur}px`);

    // Animation speed
    if (this.settings.animationPreset === 'reduced') {
      root.style.setProperty('--transition-fast', '0ms');
      root.style.setProperty('--transition-normal', '0ms');
      root.style.setProperty('--transition-slow', '0ms');
    } else if (this.settings.animationPreset === 'snappy') {
      root.style.setProperty('--transition-fast', '80ms cubic-bezier(0, 0, 0.2, 1)');
      root.style.setProperty('--transition-normal', '160ms cubic-bezier(0, 0, 0.2, 1)');
      root.style.setProperty('--transition-slow', '250ms cubic-bezier(0, 0, 0.2, 1)');
    } else {
      // Cinematic
      root.style.setProperty('--transition-fast', '150ms cubic-bezier(0.16, 1, 0.3, 1)');
      root.style.setProperty('--transition-normal', '300ms cubic-bezier(0.16, 1, 0.3, 1)');
      root.style.setProperty('--transition-slow', '500ms cubic-bezier(0.16, 1, 0.3, 1)');
    }

    // Font preset
    let fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    if (this.settings.fontPreset === 'serif') {
      fontFamily = "'Playfair Display', Georgia, serif";
    } else if (this.settings.fontPreset === 'display') {
      fontFamily = "'Inter', system-ui, sans-serif";
    } else if (this.settings.fontPreset === 'mono') {
      fontFamily = "'Consolas', 'Courier New', monospace";
    }
    root.style.setProperty('--font-main', fontFamily);

    // Vinyl speed
    const rpm = this.settings.vinylSpeedRpm;
    const duration = rpm > 0 ? `${60 / rpm}s` : '0s';
    root.style.setProperty('--sf-vinyl-duration', duration);

    // Custom CSS injection
    if (typeof document.getElementById === 'function' && typeof document.createElement === 'function' && document.head) {
      let styleTag = document.getElementById('sonicflow-custom-css') as HTMLStyleElement | null;
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'sonicflow-custom-css';
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = this.settings.customCss || '';
    }
  }
}
