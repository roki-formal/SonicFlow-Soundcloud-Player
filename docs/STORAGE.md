# SonicFlow — Хранилище данных и библиотека (Storage System)

Документ описывает структуру локального хранилища, схемы данных плейлистов, избранного, истории и миграции.

---

## 1. Архитектура хранилища

Для обеспечения автономной и быстрой работы приложения используется двухуровневая схема:
1. **LocalStorage (`localStorage`)**:
   - Быстрые синхронные настройки интерфейса: выбранная тема (`sonicflow_theme`), уровень громкости (`sonicflow_volume`), состояние shuffle/repeat.
2. **IndexedDB (через `idb-keyval`)**:
   - Персональная музыкальная библиотека:
     - `sonicflow_favorites`: массив ID и объектов избранных треков.
     - `sonicflow_playlists`: массив пользовательских плейлистов с треками и метаданными.
     - `sonicflow_history`: стек недавно прослушанных композиций (до 100 элементов).
     - `sonicflow_custom_lyrics`: кэш импортированных пользователем LRC-файлов.

---

## 2. Схемы данных (TypeScript)

```typescript
export interface StoredPlaylist {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  createdAt: number;
  updatedAt: number;
  tracks: AudioTrack[];
}

export interface UserPreferences {
  themeId: string;
  volume: number;
  isMuted: boolean;
  repeatMode: 'off' | 'all' | 'one';
  isShuffle: boolean;
  lyricsFontSize: 'small' | 'medium' | 'large';
  visualizerEnabled: boolean;
}
```

---

## 3. Миграции данных

Хранилище поддерживает версионирование схемы (`schema_version = 1`). При изменении структуры полей функция `migrateStorageData()` плавно обновляет старые записи без риска потери созданных пользователем плейлистов и лайков.
