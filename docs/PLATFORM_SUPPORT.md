# SonicFlow — Поддержка платформ (Platform Support)

Документ описывает особенности сборки и функционирования приложения на Windows, Linux и iOS.

---

## 1. Windows Desktop

- **Среда выполнения**: Поддержка Windows 10 (1809+) и Windows 11.
- **Готовый бинарник**:
  - `SonicFlow.exe` скомпилирован в корне репозитория с встроенной иконкой `app.ico`.
  - Ярлык на рабочем столе: `SonicFlow.lnk`.
  - Не требует сторонних runtime/установщиков, использует встроенный .NET HTTP-сервер и нативный браузерный движок в режиме `--app` без рамок и лишних панелей.
- **Интеграция с ОС**:
  - `MediaSession API`: отображение информации о текущем треке в оверлее Windows Volume Flyout и виджете медиаплеера на панели задач / Win+G.
  - Поддержка мультимедийных клавиш клавиатуры (Play/Pause, Next Track, Prev Track).
  - Аппаратное ускорение декодирования аудио и рендеринга CSS-анимаций (вращающийся винил, скролл текстов).

---

## 2. Linux Desktop (Arch Linux & Other Distributions)

- **Среда выполнения**: Arch Linux, Manjaro, Ubuntu/Debian, Fedora, openSUSE и другие дистрибутивы с поддержкой X11 и Wayland.
- **Готовые пакеты доставки**:
  - `sonicflow-1.2.0-1-x86_64.pkg.tar.zst`: официальный пакет pacman для Arch Linux (`sudo pacman -U sonicflow-1.2.0-1-x86_64.pkg.tar.zst`).
  - `PKGBUILD`: стандартный рецепт сборки Arch Linux для AUR и `makepkg -si`.
  - `SonicFlow-Linux-x86_64.tar.gz`: универсальный портативный архив с лаунчером и скриптом `install.sh`.
  - `SonicFlow.desktop`: файл для меню приложений GNOME / KDE / XFCE / Sway с категорией `AudioVideo;Player;`.
- **Интеграция с ОС**:
  - Поддержка системного управления звуком через MediaSession API / MPRIS.
  - HiDPI масштабирование для экранов высокой четкости.
  - HLS воспроизведение потоков через встроенный `hls.js`.

---

## 3. iOS (iPhone / iPad)

- **Готовый пакет `.ipa`**:
  - Скомпилированный готовый пакет `release/SonicFlow.ipa` (и в корне `SonicFlow.ipa`).
  - Подходит для прямой установки через **AltStore**, **Sideloadly**, **TrollStore** или **Scarlet**.
- **Нативный проект Capacitor (Xcode)**:
  - Проект инициализирован и сгенерирован в каталоге `ios/App/App.xcworkspace`.
  - В файле `ios/App/App/Info.plist` настроены:
    - `UIBackgroundModes: ["audio"]` — непрерывное воспроизведение в фоне при заблокированном экране и переключении приложений.
    - `NSAppTransportSecurity: NSAllowsArbitraryLoads = true` — доступ к CDN серверам транскодинга потоков SoundCloud.
- **PWA (Progressive Web App)**:
  - Поддержка установки на экран «Домой» через Safari без Xcode.
  - Настроены теги `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` и иконки.
- **Мобильный UX**:
  - Адаптивный нативный интерфейс с полноэкранным виниловым плеером и плавающим мини-плеером над нижней панелью навигации.
  - Выдвижная шторка синхронизированных текстов песен с автоматическим скроллом и переходом по строкам.
  - Учет системных отступов `env(safe-area-inset-top)` и `env(safe-area-inset-bottom)`.
  - Удобное управление одной рукой.
