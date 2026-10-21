# SonicFlow (SonicFlow-Soundcloud-Player) 🎵

> **The new SoundCloud player is the best and most convenient one out there, offering full customization.**
> Кроссплатформенный музыкальный плеер нового поколения с прямой 1-клик синхронизацией SoundCloud, динамическими 60fps анимациями, Theme & Customization Studio, синхронизированными текстами песен (Synced Karaoke) и поддержкой Windows, Linux (Arch) и iOS.

---

## 📦 Скачать готовые приложения (Releases v1.2.0)

[![GitHub Release](https://img.shields.io/github/v/release/roki-formal/SonicFlow-Soundcloud-Player?color=orange&label=GitHub%20Release&logo=github)](https://github.com/roki-formal/SonicFlow-Soundcloud-Player/releases/latest)

Готовые скомпилированные сборки плеера для всех поддерживаемых систем доступны на официальной странице [**GitHub Releases v1.2.0**](https://github.com/roki-formal/SonicFlow-Soundcloud-Player/releases/tag/v1.2.0):

| Платформа | Файл загрузки | Инструкция по запуску / установке |
|---|---|---|
| **Windows 10 / 11** | [**`SonicFlow-Windows-x64.zip`**](https://github.com/roki-formal/SonicFlow-Soundcloud-Player/releases/download/v1.2.0/SonicFlow-Windows-x64.zip) / [**`SonicFlow.exe`**](https://github.com/roki-formal/SonicFlow-Soundcloud-Player/releases/download/v1.2.0/SonicFlow.exe) | Распаковать архив и запустить `SonicFlow.exe` |
| **iOS (iPhone & iPad)** | [**`SonicFlow.ipa`**](https://github.com/roki-formal/SonicFlow-Soundcloud-Player/releases/download/v1.2.0/SonicFlow.ipa) | Установить через **AltStore**, **Sideloadly** или **TrollStore** |
| **Arch Linux** | [**`sonicflow-1.2.0-1-x86_64.pkg.tar.zst`**](https://github.com/roki-formal/SonicFlow-Soundcloud-Player/releases/download/v1.2.0/sonicflow-1.2.0-1-x86_64.pkg.tar.zst) | `sudo pacman -U sonicflow-1.2.0-1-x86_64.pkg.tar.zst` |
| **Arch Linux (AUR)** | [**`PKGBUILD`**](https://github.com/roki-formal/SonicFlow-Soundcloud-Player/releases/download/v1.2.0/PKGBUILD) | Сборка через `makepkg -si` в директории с `PKGBUILD` |
| **Linux (Все дистрибутивы)** | [**`SonicFlow-Linux-x86_64.tar.gz`**](https://github.com/roki-formal/SonicFlow-Soundcloud-Player/releases/download/v1.2.0/SonicFlow-Linux-x86_64.tar.gz) | Распаковать и выполнить `./sonicflow-linux.sh` или `./install.sh` |

> Все хеш-суммы SHA-256 доступны в файле [SHA256SUMS.txt](https://github.com/roki-formal/SonicFlow-Soundcloud-Player/releases/download/v1.2.0/SHA256SUMS.txt).

---

## ✨ Ключевые возможности

### ☁️ Настоящая синхронизация с SoundCloud
- **1-клик авторизация**: Авторизация через системный браузер (Edge, Chrome, Firefox) по официальному OAuth flow или по имени профиля.
- **Синхронизация лайков**: Мгновенный импорт и отображение всех композиций из вашего раздела `soundcloud.com/you/likes` с двусторонним обновлением.
- **Стриминг и плейлисты**: Доступ к персональной ленте (Stream), личным плейлистам, подборкам трендов и любимым артистам.
- **Прямой HLS Audio CDN**: Потоковое вещание треков напрямую с официальных CDN-серверов SoundCloud без конверсий и задержек.

### 🎧 Студийный аудиодвижок и живой визуализатор
- **Web Audio API**: 32-полосный частотный анализатор в реальном времени с выводом спектра прямо в строку поиска.
- **Ambient Artwork Glow**: Динамическая атмосферная подсветка вокруг интерфейса, генерируемая из обложки текущего трека с аудио-реактивной пульсацией в такт басам.
- **Gapless Playback**: Плавный переход между треками, управление очередью воспроизведения (Play Queue) и история прослушиваний.

### 🎤 Синхронизированные тексты песен (Synced Karaoke)
- Кинетический полноэкранный интерфейс караоке уровня Spotify и Яндекс Музыки.
- Плавный авто-скролл с центрированием активной строки и неоновым свечением.
- Интерактивный клик по строке для мгновенной перемотки аудио на выбранное место.
- Поддержка вкладок (`Karaoke`, `Synced`, `Unsynced`, `Genius`) и локальный импорт собственных `.lrc` / `.txt` файлов.

### 📱 Полноценный плеер для мобильных устройств (iOS)
- **Адаптивный нативный интерфейс**: Автоматическая адаптация под мобильные экраны и безопасные зоны iOS (Safe Area).
- **Плавающий мини-плеер**: Закреплен над нижней панелью навигации с микро-скраббером, обложкой и быстрым управлением.
- **Полноэкранный виниловый плеер**: Фотореалистичный вращающийся виниловый диск со срезом канавок, тактильный скраббер, управление повтором, перемешиванием и быстрый вызов шторки синхронизированных текстов песен.

### 🎨 Theme Studio и визуальная кастомизация
- **9 встроенных цветовых пресетов**:
  1. `Midnight Black` — нейтральная темная аудио-студия (по умолчанию).
  2. `SoundCloud Orange` — фирменная теплая оранжевая палитра SoundCloud.
  3. `Spotify Green` — неоновый изумрудный стиль Spotify.
  4. `Ocean Blue` — сапфировые тона с лазурным акцентом.
  5. `Violet Dream` — аметистовый градиент и фиолетовый акцент.
  6. `AMOLED Pure Black` — истинный `#000000` для максимальной контрастности и экономии батареи OLED/AMOLED экранов.
  7. `Light Minimal` — элегантный светлый журнальный стиль.
  8. `Rose Neon` — неоновый киберпанк.
  9. `Custom Theme` — свободная настройка цветов через Theme Studio.
- **Валидатор контрастности WCAG 2.2 AA**: расчет коэффициента контраста в реальном времени с подтверждением читаемости (`4.5:1+ Pass`).
- Экспорт и импорт пользовательских тем в JSON по строгой схеме v1.

---

## 🚀 Сборка из исходного кода

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

### 5. Сборка продакшн-бандла
```bash
npm run build
```

### 6. Сборка исполняемого файла Windows (`SonicFlow.exe`)
```bash
npm run build:exe
```

### 7. Сборка всех релизных пакетов (Windows, iOS .ipa, Arch Linux)
```bash
npm run build:release
```
Все готовые артефакты будут упакованы в директорию `release/`.

---

## ⌨️ Горячие клавиши (Hotkeys)

- `Space`: Воспроизведение / Пауза
- `ArrowRight` / `ArrowLeft`: Перемотка на $\pm 5$ секунд
- `ArrowUp` / `ArrowDown`: Громкость $\pm 5\%$
- `KeyM`: Выключить / включить звук (Mute)
- `KeyL`: Открыть / закрыть экран текстов песен (Lyrics)

---

## 📚 Каталог документации (`docs/`)

- [docs/PROGRESS.md](docs/PROGRESS.md) — Матрица статусов разработки
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Детальное описание архитектуры и потоков данных
- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) — Токены, сетка отступов, шрифты и компоненты
- [docs/THEMING_GUIDE.md](docs/THEMING_GUIDE.md) — Руководство по системе тем и формату JSON
- [docs/THEME_AUTHORING.md](docs/THEME_AUTHORING.md) — Инструкция по созданию новых тем
- [docs/COMPONENT_GUIDE.md](docs/COMPONENT_GUIDE.md) — Справочник UI-компонентов
- [docs/PLAYER_ARCHITECTURE.md](docs/PLAYER_ARCHITECTURE.md) — Устройство аудиодвижка и Web Audio API
- [docs/LYRICS_SYSTEM.md](docs/LYRICS_SYSTEM.md) — Парсер LRC, синхронизация и караоке
- [docs/MUSIC_PROVIDERS.md](docs/MUSIC_PROVIDERS.md) — SoundCloud API, каталог стримов и локальные файлы
- [docs/STORAGE.md](docs/STORAGE.md) — Персональная библиотека, плейлисты и история
- [docs/PLATFORM_SUPPORT.md](docs/PLATFORM_SUPPORT.md) — Windows, Linux (Arch) и мобильный адаптив iOS
- [docs/BUILD_GUIDE.md](docs/BUILD_GUIDE.md) — Сборка установщиков десктопа и артефактов iOS
- [docs/TESTING.md](docs/TESTING.md) — Описание модульных тестов Vitest
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) — Решение проблем со звуком и синхронизацией
- [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) — Стандарты кодовой базы и правила для контрибьюторов
