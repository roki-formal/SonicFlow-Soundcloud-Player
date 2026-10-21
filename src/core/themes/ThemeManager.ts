import { ThemeDefinition } from '../../types';
import { THEME_PRESETS } from './presets';

const STORAGE_KEY = 'sonicflow_current_theme_id';
const CUSTOM_TOKENS_KEY = 'sonicflow_custom_theme_tokens';

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: ThemeDefinition;
  private themes: Map<string, ThemeDefinition> = new Map();
  private listeners: Set<(theme: ThemeDefinition) => void> = new Set();

  private constructor() {
    THEME_PRESETS.forEach((preset) => {
      this.themes.set(preset.id, preset);
    });

    // Load custom tokens if any
    const savedCustom = localStorage.getItem(CUSTOM_TOKENS_KEY);
    if (savedCustom) {
      try {
        const parsed = JSON.parse(savedCustom);
        const customTheme = this.themes.get('custom');
        if (customTheme && parsed.tokens) {
          customTheme.tokens = { ...customTheme.tokens, ...parsed.tokens };
        }
      } catch (e) {
        console.error('Failed to parse saved custom theme tokens:', e);
      }
    }

    const savedId = localStorage.getItem(STORAGE_KEY);
    const initial = (savedId && this.themes.get(savedId)) || this.themes.get('midnight-black') || THEME_PRESETS[0];
    this.currentTheme = initial;
    this.applyTheme(initial);
  }

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  public getThemes(): ThemeDefinition[] {
    return Array.from(this.themes.values());
  }

  public getCurrentTheme(): ThemeDefinition {
    return this.currentTheme;
  }

  public setTheme(themeId: string): boolean {
    const theme = this.themes.get(themeId);
    if (!theme) return false;

    this.currentTheme = theme;
    this.applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, themeId);
    this.notify();
    return true;
  }

  public updateCustomTokens(newTokens: Record<string, string>): void {
    const custom = this.themes.get('custom');
    if (!custom) return;

    custom.tokens = { ...custom.tokens, ...newTokens };
    localStorage.setItem(CUSTOM_TOKENS_KEY, JSON.stringify({ tokens: custom.tokens }));

    if (this.currentTheme.id === 'custom') {
      this.applyTheme(custom);
      this.notify();
    }
  }

  public exportThemeJson(themeId?: string): string {
    const theme = themeId ? this.themes.get(themeId) : this.currentTheme;
    if (!theme) throw new Error('Theme not found');

    const exportData = {
      $schema: 'https://sonicflow.app/schemas/theme-v1.json',
      schemaVersion: 1,
      id: theme.id,
      name: theme.name,
      description: theme.description,
      colorScheme: theme.colorScheme,
      preview: theme.preview,
      tokens: theme.tokens,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  }

  public importThemeJson(jsonString: string): { success: boolean; error?: string; themeId?: string } {
    try {
      if (jsonString.length > 65536) {
        return { success: false, error: 'Файл темы превышает допустимый размер (64 КБ)' };
      }

      const data = JSON.parse(jsonString);

      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Неверный формат JSON' };
      }

      if (data.schemaVersion !== 1) {
        return { success: false, error: 'Неподдерживаемая версия схемы темы' };
      }

      if (!data.tokens || typeof data.tokens !== 'object') {
        return { success: false, error: 'В теме отсутствуют токены оформления' };
      }

      // Security check: ensure no dangerous CSS injection
      for (const [key, value] of Object.entries(data.tokens)) {
        if (typeof value !== 'string') continue;
        if (/javascript:|expression|behavior|@import/i.test(value)) {
          return { success: false, error: `Обнаружено недопустимое значение токена: ${key}` };
        }
      }

      const newId = `imported-${Date.now()}`;
      const importedTheme: ThemeDefinition = {
        id: newId,
        name: data.name ? String(data.name).slice(0, 32) : 'Импортированная тема',
        description: data.description ? String(data.description).slice(0, 100) : 'Пользовательская тема',
        colorScheme: data.colorScheme === 'light' ? 'light' : 'dark',
        preview: data.preview || {
          bg: data.tokens['--color-bg-base'] || '#121212',
          surface: data.tokens['--color-bg-surface'] || '#1e1e1e',
          accent: data.tokens['--color-accent'] || '#ff5500',
          text: data.tokens['--color-text-primary'] || '#ffffff',
        },
        tokens: data.tokens,
        source: 'user',
      };

      this.themes.set(newId, importedTheme);
      this.setTheme(newId);
      return { success: true, themeId: newId };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Ошибка парсинга JSON' };
    }
  }

  public subscribe(callback: (theme: ThemeDefinition) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    this.listeners.forEach((cb) => cb(this.currentTheme));
  }

  private applyTheme(theme: ThemeDefinition): void {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.id);
    root.style.colorScheme = theme.colorScheme;

    // Apply tokens
    Object.entries(theme.tokens).forEach(([token, value]) => {
      root.style.setProperty(token, value);
    });
  }
}
