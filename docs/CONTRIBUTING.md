# SonicFlow — Руководство для контрибьюторов (Contributing Guide)

Спасибо за интерес к развитию проекта SonicFlow!

---

## 1. Процесс разработки

1. Склонируйте репозиторий и создайте новую ветку из `master`:
   ```bash
   git checkout -b feature/awesome-feature
   ```
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Запустите dev-сервер:
   ```bash
   npm run dev
   ```

---

## 2. Стандарты кода

- **TypeScript**: Строгая типизация (`strict: true`). Избегайте использования типа `any`.
- **Компоненты**: Функциональные компоненты с хуками. Разделяйте логику и верстку.
- **Стилизация**: Используйте CSS Custom Properties из дизайн-системы. Не используйте жестко заданные HEX-цвета в стилях компонентов.
- **Тесты**: Любой новый модуль (особенно парсеры и расчеты) должен сопровождаться модульными тестами в каталоге `tests/`.

---

## 3. Коммиты и Pull Requests

- Формат сообщений коммитов по Conventional Commits:
  - `feat: add karaoke word highlighting mode`
  - `fix: resolve race condition in audio stream loader`
  - `docs: update lyrics synchronizer guide`
- Перед отправкой PR обязательно выполните:
  ```bash
  npm run typecheck
  npm test
  npm run build
  ```
