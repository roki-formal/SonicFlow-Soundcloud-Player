import './setup';
import { describe, it, expect, beforeEach } from 'vitest';
import { calculateContrastRatio, isWcagAa } from '../src/core/themes/contrast';
import { ThemeManager } from '../src/core/themes/ThemeManager';

describe('Contrast and Theme Calculation', () => {
  it('should calculate WCAG contrast ratio accurately for black and white', () => {
    const ratio = calculateContrastRatio('#ffffff', '#000000');
    expect(ratio).toBe(21);
    expect(isWcagAa(ratio)).toBe(true);
  });

  it('should flag low contrast ratios', () => {
    const ratio = calculateContrastRatio('#333333', '#222222');
    expect(ratio).toBeLessThan(4.5);
    expect(isWcagAa(ratio)).toBe(false);
  });
});

describe('ThemeManager', () => {
  let themeManager: ThemeManager;

  beforeEach(() => {
    themeManager = ThemeManager.getInstance();
  });

  it('should provide default presets', () => {
    const themes = themeManager.getThemes();
    expect(themes.length).toBeGreaterThanOrEqual(9);
    const names = themes.map((t) => t.id);
    expect(names).toContain('midnight-black');
    expect(names).toContain('soundcloud-orange');
    expect(names).toContain('spotify-green');
    expect(names).toContain('ocean-blue');
    expect(names).toContain('violet-dream');
    expect(names).toContain('amoled-pure-black');
    expect(names).toContain('light-minimal');
    expect(names).toContain('rose-neon');
  });

  it('should export valid JSON schema', () => {
    const jsonStr = themeManager.exportThemeJson('midnight-black');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.id).toBe('midnight-black');
    expect(parsed.tokens).toBeDefined();
  });

  it('should reject malicious CSS tokens on import', () => {
    const maliciousJson = JSON.stringify({
      schemaVersion: 1,
      id: 'hacked-theme',
      name: 'Hack',
      tokens: {
        '--color-bg-base': 'javascript:alert(1)',
      },
    });

    const res = themeManager.importThemeJson(maliciousJson);
    expect(res.success).toBe(false);
    expect(res.error).toContain('недопустимое значение');
  });
});
