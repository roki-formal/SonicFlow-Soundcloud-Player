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

## 2. Linux Desktop

- **Среда выполнения**: Ubuntu/Debian, Fedora, Arch Linux, Manjaro, openSUSE и другие дистрибутивы с поддержкой X11 и Wayland.
- **Файлы доставки**:
  - `sonicflow-linux.sh`: автономный исполняемый POSIX bash-скрипт запуска.
  - `SonicFlow.desktop`: файл для меню приложений GNOME / KDE / XFCE с категорией `AudioVideo;Player;`.
- **Интеграция с ОС**:
  - Поддержка системного управления звуком через MediaSession API / MPRIS.
  - HiDPI масштабирование для экранов высокой четкости.
  - HLS воспроизведение потоков через встроенный `hls.js`.

---

## 3. iOS (iPhone / iPad)

- **Нативный проект Capacitor (Xcode)**:
  - Проект инициализирован и сгенерирован в каталоге `ios/App/App.xcworkspace`.
  - В файле `ios/App/App/Info.plist` настроены:
    - `UIBackgroundModes: ["audio"]` — непрерывное воспроизведение в фоне при заблокированном экране и переключении приложений.
    - `NSAppTransportSecurity: NSAllowsArbitraryLoads = true` — доступ к CDN серверам транскодинга потоков SoundCloud.
  - Для компиляции `.ipa` и установки через Xcode / AltStore / Sideloadly / TestFlight требуется macOS.
- **PWA (Progressive Web App)**:
  - Поддержка установки на экран «Домой» через Safari без Xcode.
  - Настроены теги `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` и иконки.
- **Мобильный UX**:
  - Точное соответствие дизайну из референса 3: верхний остров Dynamic Island, крупный виниловый диск по центру, закругленная док-панель управления.
  - Нижняя шторка синхронизированных текстов песен с жестом смахивания (Swipe Down to dismiss).
  - Учет системных отступов `env(safe-area-inset-top)` и `env(safe-area-inset-bottom)`.
  - Управление одной рукой.
