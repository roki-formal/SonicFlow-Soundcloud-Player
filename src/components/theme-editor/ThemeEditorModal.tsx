import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Sliders, 
  Palette, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { ThemeManager } from '../../core/themes/ThemeManager';
import { calculateContrastRatio, isWcagAa } from '../../core/themes/contrast';
import { ThemeDefinition } from '../../types';
import { usePlayer } from '../../core/player/PlayerContext';

export const ThemeEditorModal: React.FC = () => {
  const { isThemeEditorOpen, toggleThemeEditor } = usePlayer();
  const themeManager = useMemo(() => ThemeManager.getInstance(), []);

  const [themes, setThemes] = useState<ThemeDefinition[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ThemeDefinition>(themeManager.getCurrentTheme());
  
  // Custom token overrides
  const [accentColor, setAccentColor] = useState<string>('#3b82f6');
  const [bgColor, setBgColor] = useState<string>('#0a0a0d');
  const [surfaceColor, setSurfaceColor] = useState<string>('#17171f');
  const [textColor, setTextColor] = useState<string>('#f8f8fa');
  const [radiusCard, setRadiusCard] = useState<number>(16);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setThemes(themeManager.getThemes());
    const cur = themeManager.getCurrentTheme();
    setCurrentTheme(cur);
    setAccentColor(cur.tokens['--color-accent'] || '#3b82f6');
    setBgColor(cur.tokens['--color-bg-base'] || '#0a0a0d');
    setSurfaceColor(cur.tokens['--color-bg-surface'] || '#17171f');
    setTextColor(cur.tokens['--color-text-primary'] || '#f8f8fa');
    setRadiusCard(parseInt(cur.tokens['--radius-card'] || '16', 10) || 16);

    const unsub = themeManager.subscribe((th) => {
      setCurrentTheme(th);
      setThemes(themeManager.getThemes());
    });
    return unsub;
  }, [themeManager, isThemeEditorOpen]);

  // Calculate real-time contrast ratio
  const contrastRatio = useMemo(() => {
    return calculateContrastRatio(textColor, surfaceColor);
  }, [textColor, surfaceColor]);

  const wcagPassed = useMemo(() => {
    return isWcagAa(contrastRatio, false);
  }, [contrastRatio]);

  if (!isThemeEditorOpen) return null;

  const handleSelectPreset = (id: string) => {
    themeManager.setTheme(id);
    const th = themeManager.getCurrentTheme();
    setCurrentTheme(th);
    setAccentColor(th.tokens['--color-accent'] || '#3b82f6');
    setBgColor(th.tokens['--color-bg-base'] || '#0a0a0d');
    setSurfaceColor(th.tokens['--color-bg-surface'] || '#17171f');
    setTextColor(th.tokens['--color-text-primary'] || '#f8f8fa');
    setRadiusCard(parseInt(th.tokens['--radius-card'] || '16', 10) || 16);
  };

  const handleApplyCustomToken = (token: string, value: string) => {
    themeManager.setTheme('custom');
    themeManager.updateCustomTokens({ [token]: value });
  };

  const handleExportJson = () => {
    try {
      const jsonStr = themeManager.exportThemeJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sonicflow-theme-${currentTheme.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ text: 'Тема успешно экспортирована в JSON', type: 'success' });
    } catch (e: any) {
      setMessage({ text: 'Ошибка экспорта темы: ' + e.message, type: 'error' });
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = themeManager.importThemeJson(text);
      if (res.success) {
        setMessage({ text: 'Тема успешно импортирована и применена!', type: 'success' });
      } else {
        setMessage({ text: res.error || 'Ошибка импорта', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    handleSelectPreset('midnight-black');
    setMessage({ text: 'Сброшено к теме по умолчанию (Midnight Black)', type: 'success' });
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div 
        style={{
          width: '680px',
          maxWidth: '100%',
          maxHeight: '90vh',
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-modal)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Palette size={20} style={{ color: 'var(--color-accent)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Theme Studio & Visual Editor</h2>
          </div>

          <button
            onClick={() => toggleThemeEditor(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Notification Alert */}
          {message && (
            <div 
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: message.type === 'success' ? '#10b981' : '#ef4444',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {message.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Preset Selector Grid */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '10px', display: 'block' }}>
              Выберите готовую тему (9 пресетов)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
              {themes.map((th) => {
                const isSelected = currentTheme.id === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => handleSelectPreset(th.id)}
                    style={{
                      padding: '10px',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? 'var(--color-bg-surface-active)' : 'var(--color-bg-base)',
                      border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {/* Swatch preview */}
                    <div style={{ display: 'flex', gap: '4px', height: '14px', borderRadius: '4px', overflow: 'hidden' }}>
                      <span style={{ flex: 1, backgroundColor: th.preview.bg }} />
                      <span style={{ flex: 1, backgroundColor: th.preview.surface }} />
                      <span style={{ flex: 1, backgroundColor: th.preview.accent }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                      {th.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Customizer Controls */}
          <div style={{ backgroundColor: 'var(--color-bg-base)', padding: '18px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sliders size={16} style={{ color: 'var(--color-accent)' }} />
              <span>Тонкая настройка CSS-токенов</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Accent Color */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Акцентный цвет (Accent)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="color" 
                    value={accentColor}
                    onChange={(e) => {
                      setAccentColor(e.target.value);
                      handleApplyCustomToken('--color-accent', e.target.value);
                    }}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{accentColor}</span>
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Основной фон (Base Background)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="color" 
                    value={bgColor}
                    onChange={(e) => {
                      setBgColor(e.target.value);
                      handleApplyCustomToken('--color-bg-base', e.target.value);
                    }}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{bgColor}</span>
                </div>
              </div>

              {/* Surface Color */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Цвет карточек (Surface)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="color" 
                    value={surfaceColor}
                    onChange={(e) => {
                      setSurfaceColor(e.target.value);
                      handleApplyCustomToken('--color-bg-surface', e.target.value);
                    }}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{surfaceColor}</span>
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Цвет текста (Text Primary)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="color" 
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                      handleApplyCustomToken('--color-text-primary', e.target.value);
                    }}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{textColor}</span>
                </div>
              </div>
            </div>

            {/* Radius Card Slider */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Скругление карточек (Border Radius)</span>
                <span style={{ fontWeight: 600 }}>{radiusCard}px</span>
              </div>
              <input 
                type="range"
                min={4}
                max={28}
                value={radiusCard}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setRadiusCard(val);
                  handleApplyCustomToken('--radius-card', `${val}px`);
                }}
                style={{ width: '100%' }}
              />
            </div>

            {/* WCAG 2.2 AA Contrast Checker Badge */}
            <div 
              style={{
                marginTop: '16px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: wcagPassed ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                border: `1px solid ${wcagPassed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {wcagPassed ? (
                  <ShieldCheck size={18} style={{ color: '#10b981' }} />
                ) : (
                  <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
                )}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: wcagPassed ? '#10b981' : '#f59e0b' }}>
                    {wcagPassed ? 'WCAG 2.2 AA Соответствие' : 'Низкий контраст (Warning)'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Коэффициент контрастности текста: {contrastRatio}:1 (минимум 4.5:1)
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: wcagPassed ? '#10b981' : '#f59e0b', color: '#ffffff' }}>
                {contrastRatio}:1
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions: Export, Import, Reset */}
        <div 
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleExportJson}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Download size={14} />
              <span>Экспорт JSON</span>
            </button>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImportJson} 
              accept=".json" 
              style={{ display: 'none' }} 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Upload size={14} />
              <span>Импорт JSON</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleResetDefaults}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--color-text-secondary)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} />
              <span>Сбросить</span>
            </button>

            <button
              onClick={() => toggleThemeEditor(false)}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-contrast)',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Готово
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
