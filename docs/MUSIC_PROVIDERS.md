# SonicFlow — Музыкальные провайдеры (Music Providers)

Документ описывает систему интеграции с музыкальными сервисами, обработку SoundCloud API, работу с квотами и fallback-источниками.

---

## 1. Архитектурный контракт `MusicProvider`

Все поставщики контента реализуют единый TypeScript интерфейс:

```typescript
export interface MusicProvider {
  id: string;
  name: string;
  search(query: string, limit?: number): Promise<AudioTrack[]>;
  getTrack(trackId: string): Promise<AudioTrack | null>;
  getStreamUrl(track: AudioTrack): Promise<string>;
  getArtistProfile?(artistName: string): Promise<ArtistProfile | null>;
}
```

---

## 2. SoundCloud Provider (`SoundCloudProvider`)

- **API Эндпоинты**:
  - Поиск: `https://api.soundcloud.com/tracks?q={query}&client_id={id}`
  - Стриминг: Прогрессивный HTTP/HLS поток через разрешенный `stream_url`.
- **Политика квот и ограничений**:
  - В соответствии с условиями SoundCloud Developers, клиентские запросы кэшируются в памяти на 5 минут для предотвращения превышения rate limits.
  - При отсутствии ключа клиента `VITE_SOUNDCLOUD_CLIENT_ID` в `.env`, система автоматически переключается на открытый стриминг-каталог и локальные файлы.
- **Безопасность**: Секретные ключи API никогда не коммитятся в клиентский репозиторий.

---

## 3. Каталог открытых стримов (`OpenStreamProvider`)

Для гарантированного и надежного воспроизведения музыки "из коробки" без внешних блокировок подготовлен встроенный каталог треков (Creative Commons / Open Audio) с реальными высококачественными MP3-потоками, обложками высокого разрешения и синхронизированными LRC-текстами:
- Треки Taco Hemingway (в соответствии с дизайн-референсом 1).
- Треки Half•Alive ("Tip Toes", в соответствии с референсом 2 текстов).
- Треки Ariana Grande ("The boy is mine", в соответствии с референсом 3 мобильного экрана).
- Открытые chillhop, synthwave и lo-fi аудиопотоки.

---

## 4. Провайдер локальных файлов (`LocalFilesProvider`)

- Позволяет пользователю перетащить или выбрать локальные файлы с диска (`.mp3`, `.wav`, `.ogg`, `.flac`, `.m4a`).
- Извлекает метаданные через File API (`name`, `size`, `type`) и генерирует blob URL через `URL.createObjectURL(file)`.
- Локальные треки добавляются в раздел "Local Files" и могут быть включены в пользовательские плейлисты и очередь воспроизведения.
