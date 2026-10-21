# SonicFlow — Руководство по сборке (Build Guide)

Документ описывает процесс подготовки production-сборок для веб, десктопа (Windows, Linux) и iOS.

---

## 1. Сборка веб-версии (Vite)

```bash
# Проверка типов
npm run typecheck

# Оптимизированная production-сборка
npm run build
```
Результат сборки помещается в директорию `dist/` и готов к развертыванию на любом статическом веб-сервере (Nginx, Vercel, Netlify).

---

## 2. Сборка Desktop для Windows (.exe)

Сборка десктопного приложения Windows на базе Electron / Tauri:

```bash
# 1. Сборка фронтенда
npm run build

# 2. Сборка установщика Windows
npm run build:electron
```
Итоговый файл `SonicFlow-Setup-1.0.0.exe` будет сгенерирован в каталоге `release/`.

---

## 3. Сборка Desktop для Linux (.AppImage / .deb)

В среде Linux (или через WSL2 / Docker):

```bash
npm run build
npx electron-builder --linux AppImage deb
```
Артефакты `SonicFlow-1.0.0.AppImage` и `sonicflow_1.0.0_amd64.deb` формируются в каталоге `release/`.

---

## 4. Сборка для iOS (Capacitor)

Для генерации нативного проекта iOS:

```bash
# 1. Сборка веб-бандла
npm run build

# 2. Добавление платформы iOS (выполняется один раз)
npx cap add ios

# 3. Синхронизация ассетов и плагинов
npx cap sync ios

# 4. Открытие проекта в Xcode (на macOS)
npx cap open ios
```
В Xcode:
1. Выберите вашу команду разработки в разделе **Signing & Capabilities**.
2. Убедитесь, что в **Background Modes** отмечен пункт **Audio, AirPlay, and Picture in Picture**.
3. Нажмите **Product -> Archive** для выгрузки в TestFlight или App Store.
