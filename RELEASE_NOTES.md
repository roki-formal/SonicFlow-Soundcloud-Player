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
| **Windows x64 (Archive)** | [`SonicFlow-Windows-x64.zip`](SonicFlow-Windows-x64.zip) | Готовая программа (включает SonicFlow.exe и все файлы) |
| **Windows Launcher** | [`SonicFlow.exe`](SonicFlow.exe) | Автономный исполняемый файл лаунчера |
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
bc65095aeeb4237b75c8a5d0ab2d5ca1da3f3b4e648a20470d91e017938996f8  PKGBUILD
5ffb86eb297785241bf1b846b139c061da6b48e12369615a93df0cd2ee089086  sonicflow-1.2.0-1-x86_64.pkg.tar.zst
636fc3563a9c479766a62f915015f7528c5e02a8b9e44fdb06de6bf13b8a624e  SonicFlow-Linux-x86_64.tar.gz
5b13567f0ea58fa62e06d83a3373dd8ac3666c053af2f174a5f16d07add544ae  SonicFlow-Windows-x64.zip
61ef3c9492aa05ce1d2e3ddaf14e46dbba1576b42580f1a8ea16098cd496469a  SonicFlow.exe
852a86a74b02be7b98e29bba66cdb4902580bf2477dc280dc25bedbeff77917f  SonicFlow.ipa
```
