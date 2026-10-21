# SonicFlow Release v1.2.0 🎵

Кроссплатформенный музыкальный плеер нового поколения с прямой 1-клик синхронизацией SoundCloud, динамическими 60fps анимациями, Theme & Customization Studio и синхронизированными текстами песен (Synced Karaoke).

## 🚀 Что нового в версии 1.2.0:
- **📱 Полноценный мобильный плеер**: Полный адаптивный интерфейс для iOS и смартфонов с фотореалистичным виниловым диском, нижней пилл-панелью управления, мини-плеером и выдвижным экраном текстов песен.
- **🖥️ Чистый десктопный режим**: Убраны демонстрационные фреймы и мобильные примеры с экрана компьютера — десктопная версия работает как полноценная профессиональная темная аудио-студия.
- **🍎 Готовый пакет .ipa для iOS**: Скомпилирован и готов к установке через AltStore, Sideloadly, TrollStore или Scarlet.
- **🐧 Пакет для Arch Linux**: Готовый pacman-пакет `sonicflow-1.2.0-1-x86_64.pkg.tar.zst` и `PKGBUILD` для установки через `sudo pacman -U`.
- **☁️ Полная синхронизация с SoundCloud**: Прямое HLS-вещание треков через официальные CDN, сохранение аккаунта, поддержка профилей, лайков и личных плейлистов.
- **🎨 Theme Studio**: 9 встроенных тем оформления (включая OLED Pure Black и SoundCloud Orange), поддержка кастомных цветов и экспорт/импорт настроек.

## 📦 Файлы релиза (Downloads):
| Платформа | Файл | Описание |
|---|---|---|
| **Windows x64** | [`SonicFlow-Windows-x64.zip`](SonicFlow-Windows-x64.zip) | Готовая программа (включает SonicFlow.exe и все файлы) |
| **iOS** | [`SonicFlow.ipa`](SonicFlow.ipa) | Готовое iOS приложение для iPhone и iPad |
| **Arch Linux** | [`sonicflow-1.2.0-1-x86_64.pkg.tar.zst`](sonicflow-1.2.0-1-x86_64.pkg.tar.zst) | Нативный пакет Arch Linux (pacman -U) |
| **Linux (Все дистрибутивы)** | [`SonicFlow-Linux-x86_64.tar.gz`](SonicFlow-Linux-x86_64.tar.gz) | Портативная версия с лаунчером и скриптом установки |
| **Arch Build Recipe** | [`PKGBUILD`](PKGBUILD) | Рецепт сборки для makepkg и AUR |

## 🛠️ Установка и запуск:

### Windows:
Распакуйте `SonicFlow-Windows-x64.zip` в любую папку и запустите **`SonicFlow.exe`**.

### Arch Linux:
```bash
sudo pacman -U sonicflow-1.2.0-1-x86_64.pkg.tar.zst
# Запуск:
sonicflow
```

### iOS (iPhone / iPad):
Установите файл **`SonicFlow.ipa`** через **AltStore**, **Sideloadly** или **TrollStore**.

---
**Хеш-суммы SHA-256:**
```
822eda38a90ba912a41e50c8f4ea13a0dc16012470f49443a60857d12e8a06f8  PKGBUILD
9b9f73fd4850e031efd9e922aedf7f320f82300b5ada23c14a0cf1c612c71041  sonicflow-1.2.0-1-x86_64.pkg.tar.zst
feb1b2e2b71b4865d8de6c3137ccbc1016906ef64d2abef8d685ba2c017b4c39  SonicFlow-Linux-x86_64.tar.gz
7d9c65eeda9b42940c8fd23b384535300fc69b63d3434b289f05cc3ca19d12f3  SonicFlow-Windows-x64.zip
00726125b31ccd81542f52751be8677a30ce2c494f3c71c28bd118ddd016ac48  SonicFlow.ipa
```
