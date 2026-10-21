# SonicFlow — Документация проекта

Добро пожаловать в инженерную документацию **SonicFlow** — кроссплатформенного музыкального приложения нового поколения с поддержкой SoundCloud, визуальной эстетикой Spotify и Яндекс Музыки, синхронизированными текстами песен и развитой дизайн-системой тем.

## Структура документации

В каталоге `docs/` содержатся исчерпывающие спецификации и руководства по всем аспектам системы:

| Документ | Описание |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Архитектура кодовой базы, модули, потоки данных и принципы разделения ответственности |
| [PROGRESS.md](PROGRESS.md) | Текущий статус выполнения этапов разработки и верификации |
| [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) | Детальная дорожная карта по этапам с критериями приёмки и рисками |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Токены дизайна, типографика, сетка, компоненты и дизайн-система Dark Audio Studio |
| [THEMING_GUIDE.md](THEMING_GUIDE.md) | Архитектура CSS Custom Properties, управление темами, импорт/экспорт и доступность |
| [THEME_AUTHORING.md](THEME_AUTHORING.md) | Пошаговое руководство по созданию и регистрации новых тем |
| [COMPONENT_GUIDE.md](COMPONENT_GUIDE.md) | Справочник UI-компонентов: пропсы, состояния и сценарии использования |
| [PLAYER_ARCHITECTURE.md](PLAYER_ARCHITECTURE.md) | Устройство аудиодвижка, Web Audio API, управление очередью и жизненный цикл воспроизведения |
| [LYRICS_SYSTEM.md](LYRICS_SYSTEM.md) | Парсер LRC-таймкодов, режимы караоке, синхронизация и пользовательский импорт |
| [MUSIC_PROVIDERS.md](MUSIC_PROVIDERS.md) | Интеграция с SoundCloud API, fallback-потоки, локальные файлы и политика квот |
| [STORAGE.md](STORAGE.md) | Хранение персональной библиотеки, IndexedDB/LocalStorage, миграции данных |
| [PLATFORM_SUPPORT.md](PLATFORM_SUPPORT.md) | Платформенная адаптация под Windows, Linux и мобильный интерфейс iOS |
| [BUILD_GUIDE.md](BUILD_GUIDE.md) | Инструкция по сборке десктопных установщиков и мобильных артефактов |
| [TESTING.md](TESTING.md) | Стратегия тестирования, запуск модульных и интеграционных тестов |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Решение типичных проблем, сетевых ошибок и неполадок воспроизведения |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Руководство для контрибьюторов и стандарты кодовой базы |

## Быстрый старт

```bash
# 1. Установка зависимостей
npm install

# 2. Запуск локального сервера разработки
npm run dev

# 3. Проверка типов TypeScript
npm run typecheck

# 4. Запуск тестов
npm test

# 5. Сборка продакшн-бандла
npm run build
```
