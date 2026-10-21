/**
 * WCAG 2.2 Relative Luminance and Contrast Ratio Calculation
 */

function parseColorToRgb(color: string): [number, number, number] | null {
  if (!color) return null;
  const hex = color.trim().toLowerCase();

  // #ffffff or #fff
  if (hex.startsWith('#')) {
    const raw = hex.slice(1);
    if (raw.length === 3) {
      return [
        parseInt(raw[0] + raw[0], 16),
        parseInt(raw[1] + raw[1], 16),
        parseInt(raw[2] + raw[2], 16),
      ];
    } else if (raw.length >= 6) {
      return [
        parseInt(raw.slice(0, 2), 16),
        parseInt(raw.slice(2, 4), 16),
        parseInt(raw.slice(4, 6), 16),
      ];
    }
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1], 10), parseInt(rgbMatch[2], 10), parseInt(rgbMatch[3], 10)];
  }

  return null;
}

function getChannelLuminance(value: number): number {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function getRelativeLuminance(color: string): number {
  const rgb = parseColorToRgb(color);
  if (!rgb) return 0.5;
  const r = getChannelLuminance(rgb[0]);
  const g = getChannelLuminance(rgb[1]);
  const b = getChannelLuminance(rgb[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function calculateContrastRatio(foreground: string, background: string): number {
  const lum1 = getRelativeLuminance(foreground);
  const lum2 = getRelativeLuminance(background);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  return Math.round(ratio * 100) / 100;
}

export function isWcagAa(ratio: number, isLargeText = false): boolean {
  return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
}
