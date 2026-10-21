# SonicFlow — Музыкальные провайдеры (Music Providers)

Документ описывает систему интеграции с музыкальными сервисами, архитектуру 1-клик авторизации SoundCloud, работу с квотами, обходом блокировок и fallback-источниками.

---

## 1. Авторизация в 1 клик (архитектура SoundCloud-Desktop)

Плеер SonicFlow использует архитектуру прямой авторизации через официальный OAuth-шлюз SoundCloud:

### Поток входа:
1. Клиент делает запрос на `GET https://api.scnative.dev/auth/login`.
2. Сервер генерирует сессионный `loginRequestId` и возвращает официальный URL авторизации:  
   `https://secure.soundcloud.com/authorize?client_id=...&response_type=code...`
3. SonicFlow автоматически открывает страницу входа в браузере.
4. Пользователь нажимает **«Connect with SoundCloud»** или входит под своим аккаунтом.
5. Приложение в фоновом режиме каждые 800 мс опрашивает `GET https://api.scnative.dev/auth/login/status?id={loginRequestId}`.
6. При успешной авторизации сервер отдает `{ status: 'completed', sessionId: '...' }`.
7. SonicFlow сохраняет `sessionId` в защищенном локальном хранилище и использует заголовок `x-session-id` для всех последующих запросов к API.

### Преимущества:
- **Никаких копирований токенов из F12**: вход выполняется нажатием одной кнопки.
- **Работает в России и по всему миру без VPN**: шлюз автоматически маршрутизирует запросы и стриминг аудио в обход региональных блокировок РКН.
- **Без рекламы и капчи**.

---

## 2. Синхронизация данных пользователя

Все данные пользователя синхронизируются в реальном времени с его аккаунтом на `soundcloud.com`:

- **Профиль**: `GET https://api.scnative.dev/me/cold` (аватар, имя, количество лайков, плейлистов и подписчиков).
- **Лайки (Likes)**: `GET https://api.scnative.dev/me/likes/tracks?limit=50`.
- **Плейлисты**: `GET https://api.scnative.dev/me/playlists`.
- **Лента релизов (Stream)**: `GET https://api.scnative.dev/stream?limit=40` (новые треки артистов, на которых подписан пользователь).
- **Двусторонняя синхронизация лайков**:
  - Поставить лайк: `POST https://api.scnative.dev/likes/tracks/{trackUrn}`.
  - Удалить лайк: `DELETE https://api.scnative.dev/likes/tracks/{trackUrn}`.
  - Лайк сразу же отображается в веб-версии на `soundcloud.com/you/likes`.

---

## 3. Разрешение аудиопотоков (Streaming Resolution)

- Потоки разрешаются через шлюз `https://stream.scnative.dev/resolve?urn=...` с автоматическим резервным переключением на HLS-декодер (`hls.js`) и прямые транскодинги SoundCloud.
- Поддерживаются протоколы:
  - `progressive` (MP3 128 kbps).
  - `hls` (M3U8 / AAC 160–256 kbps) с адаптивным битрейтом.
- На iOS поддерживается нативное декодирование через AVPlayer / WebKit Audio Engine.

---

## 4. Каталог открытых стримов и локальные файлы (Fallback)

- **Открытый каталог**: треки Taco Hemingway, Half•Alive, Ariana Grande, открытые chillhop, synthwave и lo-fi аудиопотоки.
- **Локальные файлы (`LocalFilesProvider`)**: перетаскивание любых треков `.mp3`, `.wav`, `.flac`, `.ogg` с диска.
