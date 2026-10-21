# SonicFlow (SonicFlow-Soundcloud-Player) 🎵

> **The new SoundCloud player is the best and most convenient one out there, offering full customization.**
> Кроссплатформенный музыкальный плеер нового поколения с прямой 1-клик авторизацией и синхронизацией SoundCloud, динамическими 60fps анимациями, Theme & Customization Studio и синхронизированными текстами песен уровня Яндекс Музыки / Spotify.

---

## 📸 Реализация по дизайн-референсам

Интерфейс SonicFlow до пикселя воссоздает и объединяет три ключевых визуальных референса:

1. **Desktop Dark Audio Studio** (Референс 1):
   - **Левая колонка**: Меню навигации (`Home`, `Albums`, `Local Files`, `Favorites`, `Playlists`), интерактивный список друзей с текущими треками (`Natalie Kowalska`, `Mark Stan`, и др.) и поиск друзей.
   - **Центральная зона**: Поиск с живым Web Audio визуализатором частот, баннер артиста (`Taco Hemingway`) с неоновым свечением и кнопкой `+ Follow`, горизонтальная полка альбомов (`Pocztówka z WWA`, `Café Belga`, `Szprycer`, `Marmur`, `Wosk`), таблица популярных треков (`Tamagotchi`, `Wszystko na niby`, `W piątki leżę w wannie`, `Saldo 0,7`) и блок похожих исполнителей (`Dawid Podsiadło`, `Billie Eilish`).
   - **Правая колонка (Play queue)**: Профиль пользователя (`Mark Makowsky`), интерактивный карточный плеер с вращающимся винилом, кнопками воспроизведения, скраббером, списком очереди и удалением треков.

2. **Экран синхронизированных текстов песен (Synced Lyrics)** (Референс 2):
   - Полноэкранный кинетический интерфейс текстов песен.
   - Вкладки в шапке: `Karaoke`, `• Synced`, `Unsynced`, `Genius`.
   - Крупная активная строка с максимальным контрастом и увеличенным кеглем.
   - Автоматическая плавная прокрутка с центрированием активной строки.
   - Клик по любой строке перематывает трек на эту секунду.
   - Возможность локального импорта собственных `.lrc` и `.txt` файлов.

3. **Мобильный интерфейс iPhone / iOS** (Референс 3):
   - Реалистичный фрейм iPhone с **Dynamic Island** и строкой состояния 9:41.
   - **Экран винила**: фотореалистичный вращающийся виниловый диск со срезом канавок и обложкой трека, журнальная типографика Serif (`The boy is mine`, `Ariana Grande`), пилл-панель управления.
   - **Выдвижная шторка текстов песен (Bottom Sheet)**: парящая светлая карточка трека и вертикальный скролл синхронизированного текста.

---

## 🎨 Система CSS-тем и Theme Studio

SonicFlow построен на семантических **CSS Custom Properties** и включает 9 готовых пресетов:
1. `Midnight Black` — нейтральный темный студийный интерфейс (по умолчанию).
2. `SoundCloud Orange` — фирменная теплая палитра с ярким оранжевым акцентом.
3. `Spotify Green` — культовая палитра Spotify с неоновым изумрудом.
4. `Ocean Blue` — сапфировые тона с лазурным акцентом.
5. `Violet Dream` — аметистовый градиент и фиолетовый акцент.
6. `AMOLED Pure Black` — истинный `#000000` для максимального энергосбережения OLED.
7. `Light Minimal` — элегантный кремовый журнальный стиль (как в референсе 3).
8. `Rose Neon` — неоновый киберпанк.
9. `Custom Theme` — динамическая пользовательская тема.

### Визуальный редактор тем (Theme Studio):
- Настройка акцентного цвета, фона, поверхностей и скруглений карточек (4px – 28px).
- **Валидатор контрастности WCAG 2.2 AA**: расчет коэффициента контраста в реальном времени с индикацией (`4.5:1+ Pass`).
- Экспорт и импорт пользовательских тем в JSON по строгой схеме v1 с защитой от XSS/инъекций.

---

## 🚀 Запуск и сборка

### 1. Установка зависимостей
```bash
npm install
```

### 2. Запуск в режиме разработки
```bash
npm run dev
```
Сервер запустится по адресу: `http://localhost:3000`

### 3. Проверка типов TypeScript
```bash
npm run typecheck
```

### 4. Запуск автоматических тестов (Vitest)
```bash
npm test
```

### 5. Сборка продакшн-дистрибутива
```bash
npm run build
```

---

## ⌨️ Горячие клавиши (Hotkeys)

- `Space`: Воспроизведение / Пауза
- `ArrowRight` / `ArrowLeft`: Перемотка на $\pm 5$ секунд
- `ArrowUp` / `ArrowDown`: Громкость $\pm 5\%$
- `KeyM`: Выключить / включить звук (Mute)
- `KeyL`: Открыть / закрыть экран текстов песен

---

## 📚 Каталог документации (`docs/`)

- [docs/PROGRESS.md](docs/PROGRESS.md) — Матрица статусов всех 12 этапов разработки
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Детальное описание архитектуры и потоков данных
- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) — Токены, сетка отступов, шрифты и компоненты
- [docs/THEMING_GUIDE.md](docs/THEMING_GUIDE.md) — Руководство по системе тем и формату JSON
- [docs/THEME_AUTHORING.md](docs/THEME_AUTHORING.md) — Инструкция по созданию новых тем
- [docs/COMPONENT_GUIDE.md](docs/COMPONENT_GUIDE.md) — Справочник UI-компонентов
- [docs/PLAYER_ARCHITECTURE.md](docs/PLAYER_ARCHITECTURE.md) — Устройство аудиодвижка и Web Audio API
- [docs/LYRICS_SYSTEM.md](docs/LYRICS_SYSTEM.md) — Парсер LRC, синхронизация и караоке
- [docs/MUSIC_PROVIDERS.md](docs/MUSIC_PROVIDERS.md) — SoundCloud API, каталог стримов и локальные файлы
- [docs/STORAGE.md](docs/STORAGE.md) — Персональная библиотека, плейлисты и история
- [docs/PLATFORM_SUPPORT.md](docs/PLATFORM_SUPPORT.md) — Windows, Linux и мобильный адаптив iOS
- [docs/BUILD_GUIDE.md](docs/BUILD_GUIDE.md) — Сборка установщиков десктопа и артефактов iOS
- [docs/TESTING.md](docs/TESTING.md) — Описание модульных тестов Vitest
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) — Решение проблем со звуком и синхронизацией
- [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) — Стандарты кодовой базы и правила для контрибьюторов
