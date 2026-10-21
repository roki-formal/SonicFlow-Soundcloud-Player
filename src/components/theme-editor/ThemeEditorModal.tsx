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
  AlertTriangle,
  Flame,
  Activity,
  Disc,
  Type,
  Code,
  Zap,
  Eye
} from 'lucide-react';
import { ThemeManager } from '../../core/themes/ThemeManager';
import { calculateContrastRatio, isWcagAa } from '../../core/themes/contrast';
import { ThemeDefinition } from '../../types';
import { usePlayer } from '../../core/player/PlayerContext';
import { 
  VisualizerMode, 
  AnimationPreset, 
  FontPreset, 
  VinylStyle 
} from '../../core/settings/CustomizationManager';

type StudioTab = 'themes' | 'atmosphere' | 'visualizer' | 'vinyl' | 'css';

export const ThemeEditorModal: React.FC = () => {
  const { 
    isThemeEditorOpen, 
    toggleThemeEditor, 
    customizationSettings, 
    updateCustomizationSettings, 
    resetCustomizationSettings,
    currentTrack
  } = usePlayer();

  const themeManager = useMemo(() => ThemeManager.getInstance(), []);

  const [activeTab, setActiveTab] = useState<StudioTab>('themes');
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
    resetCustomizationSettings();
    setMessage({ text: 'Сброшено к заводским настройкам темы и анимаций', type: 'success' });
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div 
        className="animate-modal-pop"
        style={{
          width: '740px',
          maxWidth: '100%',
          maxHeight: '92vh',
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-modal)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.65), 0 0 40px var(--color-accent-subtle)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-bg-base)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-accent)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px var(--color-accent)',
              }}
            >
              <Palette size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Customization Studio</h2>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Полная визуальная настройка, эффекты, винил и CSS
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleThemeEditor(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div 
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-base)',
            padding: '0 16px',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'themes', label: 'Темы и цвета', icon: <Palette size={15} /> },
            { id: 'atmosphere', label: 'Атмосфера и неон', icon: <Sparkles size={15} /> },
            { id: 'visualizer', label: 'Визуализатор', icon: <Activity size={15} /> },
            { id: 'vinyl', label: 'Винил и шрифты', icon: <Disc size={15} /> },
            { id: 'css', label: 'Кастомный CSS', icon: <Code size={15} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudioTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-accent)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
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

          {/* TAB 1: ТЕМЫ И ЦВЕТА */}
          {activeTab === 'themes' && (
            <>
              {/* Presets */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '10px', display: 'block' }}>
                  Готовые темы (9 пресетов)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {themes.map((th) => {
                    const isSelected = currentTheme.id === th.id;
                    return (
                      <button
                        key={th.id}
                        onClick={() => handleSelectPreset(th.id)}
                        className="btn-interactive"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-control)',
                          backgroundColor: isSelected ? 'var(--color-bg-surface-active)' : 'var(--color-bg-base)',
                          border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          position: 'relative',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: th.preview.bg, border: '1px solid rgba(255,255,255,0.2)' }} />
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: th.preview.accent }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {th.name}
                        </span>
                        {isSelected && <Check size={14} style={{ color: 'var(--color-accent)' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '14px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)' }}>
                  <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Цвет акцента (Accent)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="color" 
                      value={accentColor} 
                      onChange={(e) => {
                        setAccentColor(e.target.value);
                        handleApplyCustomToken('--color-accent', e.target.value);
                      }}
                      style={{ width: '36px', height: '36px', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                    <span style={{ fontSize: '13px', fontFamily: 'monospace' }}>{accentColor}</span>
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)' }}>
                  <label style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Цвет фона (Background Base)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="color" 
                      value={bgColor} 
                      onChange={(e) => {
                        setBgColor(e.target.value);
                        handleApplyCustomToken('--color-bg-base', e.target.value);
                      }}
                      style={{ width: '36px', height: '36px', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                    <span style={{ fontSize: '13px', fontFamily: 'monospace' }}>{bgColor}</span>
                  </div>
                </div>
              </div>

              {/* WCAG Contrast Validator */}
              <div 
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: wcagPassed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${wcagPassed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={18} style={{ color: wcagPassed ? '#10b981' : '#ef4444' }} />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: wcagPassed ? '#10b981' : '#ef4444' }}>
                      WCAG 2.2 AA: {wcagPassed ? 'Пройден (Pass)' : 'Низкий контраст'}
                    </span>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                      Коэффициент читаемости текста: <strong>{contrastRatio.toFixed(2)}:1</strong> (норма от 4.5:1)
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Radius Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Скругление карточек</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{radiusCard}px</span>
                </div>
                <input 
                  type="range"
                  min={4}
                  max={28}
                  step={2}
                  value={radiusCard}
                  onChange={(e) => {
                    const r = parseInt(e.target.value, 10);
                    setRadiusCard(r);
                    handleApplyCustomToken('--radius-card', `${r}px`);
                  }}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Import/Export buttons */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  onClick={handleExportJson}
                  className="btn-interactive"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-control)',
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

                <input type="file" ref={fileInputRef} onChange={handleImportJson} accept=".json" style={{ display: 'none' }} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-interactive"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-control)',
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

                <button
                  onClick={handleResetDefaults}
                  className="btn-interactive"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-control)',
                    backgroundColor: 'var(--color-bg-base)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title="Сбросить все"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </>
          )}

          {/* TAB 2: АТМОСФЕРА И НЕОН */}
          {activeTab === 'atmosphere' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Dynamic Ambient Glow Switch */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} color="#ff7700" />
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>Динамическая подсветка обложки (Ambient Glow)</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Окрашивает фон в цвет текущего трека с кинематографичным размытием
                  </p>
                </div>

                <input 
                  type="checkbox"
                  checked={customizationSettings.ambientGlowEnabled}
                  onChange={(e) => updateCustomizationSettings({ ambientGlowEnabled: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                />
              </div>

              {/* Audio Reactive Pulse */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flame size={16} color="#ff3300" />
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>Пульсация в такт музыке (Audio-Reactive)</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Аура и подсветка плавно дышат в ритм басовых частот
                  </p>
                </div>

                <input 
                  type="checkbox"
                  checked={customizationSettings.audioReactivePulse}
                  onChange={(e) => updateCustomizationSettings({ audioReactivePulse: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                />
              </div>

              {/* Glow Blur Intensity */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Интенсивность размытия свечения (Blur)</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{customizationSettings.ambientGlowBlur}px</span>
                </div>
                <input 
                  type="range"
                  min={20}
                  max={120}
                  step={5}
                  value={customizationSettings.ambientGlowBlur}
                  onChange={(e) => updateCustomizationSettings({ ambientGlowBlur: parseInt(e.target.value, 10) })}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Glassmorphism Blur */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Эффект матового стекла (Glassmorphism Blur)</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{customizationSettings.glassmorphismBlur}px</span>
                </div>
                <input 
                  type="range"
                  min={0}
                  max={30}
                  step={2}
                  value={customizationSettings.glassmorphismBlur}
                  onChange={(e) => updateCustomizationSettings({ glassmorphismBlur: parseInt(e.target.value, 10) })}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Animation Speed Presets */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Стиль и динамика интерфейсных анимаций
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'cinematic', label: 'Cinematic Smooth', desc: 'Плавная инерция (300ms)' },
                    { id: 'snappy', label: 'Fast & Snappy', desc: 'Мгновенный отклик (150ms)' },
                    { id: 'reduced', label: 'Reduced Motion', desc: 'Минимум движения' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => updateCustomizationSettings({ animationPreset: p.id as AnimationPreset })}
                      className="btn-interactive"
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-control)',
                        backgroundColor: customizationSettings.animationPreset === p.id ? 'var(--color-bg-surface-active)' : 'var(--color-bg-base)',
                        border: customizationSettings.animationPreset === p.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{p.label}</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ВИЗУАЛИЗАТОР */}
          {activeTab === 'visualizer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block' }}>
                Форма и режим визуализатора Web Audio
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {[
                  { id: 'spectrum', label: 'Неоновая спектрограмма', desc: 'Столбцы частот с пиковыми значениями' },
                  { id: 'wave', label: 'Звуковая волна', desc: 'Плавная синусоидальная кинетика' },
                  { id: 'radial', label: 'Радиальный бит', desc: 'Круговое расширение от центра' },
                  { id: 'minimal', label: 'Минималистичные точки', desc: 'Элегантные микро-индикаторы' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => updateCustomizationSettings({ visualizerMode: mode.id as VisualizerMode })}
                    className="btn-interactive"
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-control)',
                      backgroundColor: customizationSettings.visualizerMode === mode.id ? 'var(--color-bg-surface-active)' : 'var(--color-bg-base)',
                      border: customizationSettings.visualizerMode === mode.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{mode.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{mode.desc}</div>
                  </button>
                ))}
              </div>

              {/* Visualizer Glow Checkbox */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>Неоновое свечение полос</span>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Добавляет яркий световой ореол (glow effect) вокруг спектра
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={customizationSettings.visualizerGlow}
                  onChange={(e) => updateCustomizationSettings({ visualizerGlow: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                />
              </div>

              {/* Number of Bars */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Плотность частотных полос</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{customizationSettings.visualizerBars} полос</span>
                </div>
                <input 
                  type="range"
                  min={16}
                  max={64}
                  step={8}
                  value={customizationSettings.visualizerBars}
                  onChange={(e) => updateCustomizationSettings({ visualizerBars: parseInt(e.target.value, 10) })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* TAB 4: ВИНИЛ И ШРИФТЫ */}
          {activeTab === 'vinyl' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Скорость вращения винилового диска
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { rpm: 33, label: '33 RPM (Классика)', desc: '18 сек / оборот' },
                    { rpm: 45, label: '45 RPM (Сингл)', desc: '12 сек / оборот' },
                    { rpm: 0, label: 'Статично (0 RPM)', desc: 'Без вращения' },
                  ].map((item) => (
                    <button
                      key={item.rpm}
                      onClick={() => updateCustomizationSettings({ vinylSpeedRpm: item.rpm })}
                      className="btn-interactive"
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-control)',
                        backgroundColor: customizationSettings.vinylSpeedRpm === item.rpm ? 'var(--color-bg-surface-active)' : 'var(--color-bg-base)',
                        border: customizationSettings.vinylSpeedRpm === item.rpm ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.label}</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Типографика и шрифтовой пресет
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'inter', label: 'Inter Modern', desc: 'Чистый гротеск (по умолчанию)' },
                    { id: 'serif', label: 'Editorial Serif', desc: 'Журнальный элегантный шрифт' },
                    { id: 'display', label: 'Cyberpunk Sans', desc: 'Системный технологичный гротеск' },
                    { id: 'mono', label: 'Studio Mono', desc: 'Студийный моноширинный код' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => updateCustomizationSettings({ fontPreset: f.id as FontPreset })}
                      className="btn-interactive"
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-control)',
                        backgroundColor: customizationSettings.fontPreset === f.id ? 'var(--color-bg-surface-active)' : 'var(--color-bg-base)',
                        border: customizationSettings.fontPreset === f.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{f.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: КАСТОМНЫЙ CSS */}
          {activeTab === 'css' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>Редактор пользовательского CSS</span>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Внесите любые собственные стили — они применяются к плееру в реальном времени!
                </p>
              </div>

              <textarea 
                value={customizationSettings.customCss}
                onChange={(e) => updateCustomizationSettings({ customCss: e.target.value })}
                placeholder={`/* Пример пользовательских стилей */\n.card-interactive {\n  border-radius: 20px !important;\n}\n\nheader {\n  backdrop-filter: blur(20px);\n}`}
                rows={10}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: '#07070a',
                  border: '1px solid var(--color-border)',
                  color: '#60a5fa',
                  fontFamily: 'Consolas, monospace',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  💡 Изменения сохраняются в локальном хранилище и действуют сразу
                </span>
                <button
                  onClick={() => updateCustomizationSettings({ customCss: '' })}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#ef4444',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Очистить CSS
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
