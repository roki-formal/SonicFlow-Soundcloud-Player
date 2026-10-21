# SonicFlow — Создание собственной темы (Theme Authoring Guide)

Пошаговое руководство для разработчиков и дизайнеров, желающих добавить новую тему оформления в проект SonicFlow.

---

## Шаг 1. Определение параметров темы

Каждая тема в SonicFlow описывается TypeScript интерфейсом `ThemeDefinition`:

```typescript
export interface ThemeDefinition {
  id: string;               // Уникальный идентификатор (kebab-case)
  name: string;             // Человекопонятное имя
  description: string;      // Краткое описание темы
  colorScheme: 'dark' | 'light';
  preview: {
    bg: string;             // Цвет фона для карточки предпросмотра
    surface: string;        // Цвет карточки
    accent: string;         // Акцентный цвет
    text: string;           // Основной текст
  };
  tokens: Record<string, string>; // Карта CSS токенов
  source: 'builtin' | 'user';
}
```

---

## Шаг 2. Написание CSS-токенов

Создайте новый файл или дополните реестр в `src/core/themes/presets.ts`.

Пример новой темы **Cyberpunk Sunset**:

```typescript
export const cyberpunkSunsetTheme: ThemeDefinition = {
  id: 'cyberpunk-sunset',
  name: 'Cyberpunk Sunset',
  description: 'Неоновый градиент заката и темно-фиолетовая кибер-палитра',
  colorScheme: 'dark',
  preview: {
    bg: '#0c0817',
    surface: '#18122b',
    accent: '#f43f5e',
    text: '#fdf2f8',
  },
  tokens: {
    '--color-bg-base': '#0c0817',
    '--color-bg-sidebar': '#120d24',
    '--color-bg-surface': '#18122b',
    '--color-bg-surface-hover': '#241a3e',
    '--color-bg-surface-active': '#2f2152',
    '--color-bg-player': '#130d26',
    '--color-bg-queue': '#150f2b',
    '--color-text-primary': '#fdf2f8',
    '--color-text-secondary': '#caa4bd',
    '--color-text-muted': '#806275',
    '--color-accent': '#f43f5e',
    '--color-accent-hover': '#fb7185',
    '--color-accent-subtle': 'rgba(244, 63, 94, 0.16)',
    '--color-accent-contrast': '#ffffff',
    '--color-border': 'rgba(244, 63, 94, 0.18)',
    '--color-lyrics-active': '#ffffff',
    '--color-lyrics-inactive': 'rgba(253, 242, 248, 0.35)',
    '--radius-card': '16px',
    '--radius-control': '10px',
  },
  source: 'builtin',
};
```

---

## Шаг 3. Регистрация в `ThemeRegistry`

Откройте `src/core/themes/registry.ts` и зарегистрируйте созданную тему:

```typescript
import { cyberpunkSunsetTheme } from './presets';

export const BUILTIN_THEMES: ThemeDefinition[] = [
  midnightBlackTheme,
  soundCloudOrangeTheme,
  spotifyGreenTheme,
  cyberpunkSunsetTheme, // <- Новая тема добавлена в реестр
  // ...
];
```

Тема автоматически появится в списке доступных тем в модальном окне настроек и в выпадающем списке визуального редактора тем.

---

## Шаг 4. Проверка на экранах приложения

Перед отправкой изменений убедитесь, что новая тема протестирована на следующих экранах:
1. **Главная страница**: читаемость карточек "Albums" и списков "Popular".
2. **Шапка поиска**: видимость эквалайзера и поискового инпута.
3. **Правая панель очереди**: контраст треков и кнопки Play.
4. **Вращающийся винил**: читаемость белого/черного винилового блика.
5. **Экран текстов песен (Lyrics)**:
   - Активная строка должна быть ярко выражена и мгновенно считываться.
   - Неактивные строки должны иметь пониженную контрастность, но оставаться различимыми.
6. **Мобильный экран iOS**: корректное отображение в светлой/темной теме со шторкой.
7. **Тест контрастности**: убедитесь, что коэффициент контраста основного текста к фону карточек составляет не менее `4.5:1`.
