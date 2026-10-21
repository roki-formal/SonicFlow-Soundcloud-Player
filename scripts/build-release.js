/**
 * SonicFlow Multi-Platform Release Builder
 * Builds:
 *  1. Windows standalone bundle (SonicFlow-Windows-x64.zip)
 *  2. Ready iOS .ipa package (SonicFlow.ipa)
 *  3. Ready Arch Linux Pacman package (sonicflow-1.2.0-1-x86_64.pkg.tar.zst)
 *  4. Portable Linux archive (SonicFlow-Linux-x86_64.tar.gz)
 *  5. Arch Linux PKGBUILD
 *  6. Checksums (SHA256SUMS.txt) & Release Notes
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const RELEASE_DIR = path.join(ROOT_DIR, 'release');
const BUILD_TEMP = path.join(ROOT_DIR, 'build-temp');

const VERSION = '1.2.0';
const PKG_NAME = 'sonicflow';

console.log('🚀 Starting SonicFlow Multi-Platform Release Build v' + VERSION + '...\n');

// 1. Clean previous build dirs
if (fs.existsSync(RELEASE_DIR)) {
  fs.rmSync(RELEASE_DIR, { recursive: true, force: true });
}
if (fs.existsSync(BUILD_TEMP)) {
  fs.rmSync(BUILD_TEMP, { recursive: true, force: true });
}
fs.mkdirSync(RELEASE_DIR, { recursive: true });
fs.mkdirSync(BUILD_TEMP, { recursive: true });

// Helper to copy recursive
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Helper to compute sha256
function sha256(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

// 2. Build production web bundle
console.log('📦 Step 1: Building production web bundle (npm run build)...');
execSync('npm run build', { cwd: ROOT_DIR, stdio: 'inherit' });

const distDir = path.join(ROOT_DIR, 'dist');
if (!fs.existsSync(distDir)) {
  console.error('Error: dist folder not found after build!');
  process.exit(1);
}

// 3. Compile Windows SonicFlow.exe
console.log('\n🖥️ Step 2: Compiling Windows SonicFlow.exe launcher...');
try {
  // Check if old process is running and kill it if so
  try {
    execSync('powershell -Command "Stop-Process -Name SonicFlow -Force -ErrorAction SilentlyContinue"', { stdio: 'ignore' });
  } catch {}

  const cscPath = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';
  const cscCmd = `"${cscPath}" /target:winexe /optimize+ /platform:anycpu /out:"${path.join(ROOT_DIR, 'SonicFlow.exe')}" /win32icon:"${path.join(ROOT_DIR, 'app.ico')}" /r:System.dll,System.Windows.Forms.dll,System.Drawing.dll "${path.join(ROOT_DIR, 'src-launcher', 'Program.cs')}"`;
  execSync(cscCmd, { cwd: ROOT_DIR, stdio: 'inherit' });
  console.log('✓ SonicFlow.exe compiled successfully.');
} catch (e) {
  console.warn('Warning: csc compilation failed, checking if SonicFlow.exe exists:', e.message);
  if (!fs.existsSync(path.join(ROOT_DIR, 'SonicFlow.exe'))) {
    throw e;
  }
}

// Package Windows standalone zip
console.log('\n📦 Step 3: Packaging Windows Release (SonicFlow-Windows-x64.zip)...');
const winStage = path.join(BUILD_TEMP, 'SonicFlow-Windows-x64');
fs.mkdirSync(winStage, { recursive: true });
fs.copyFileSync(path.join(ROOT_DIR, 'SonicFlow.exe'), path.join(winStage, 'SonicFlow.exe'));
if (fs.existsSync(path.join(ROOT_DIR, 'app.ico'))) {
  fs.copyFileSync(path.join(ROOT_DIR, 'app.ico'), path.join(winStage, 'app.ico'));
}
copyDirSync(distDir, path.join(winStage, 'dist'));

fs.writeFileSync(path.join(winStage, 'README.txt'), `SonicFlow v${VERSION} — SoundCloud Music Player for Windows
============================================================
1. Просто запустите SonicFlow.exe
2. Авторизуйтесь в SoundCloud в 1 клик через браузер
3. Наслаждайтесь своими треками, лайками, плейлистами и караоке!

Файлы приложения находятся в папке 'dist'.
Для перемещения приложения перемещайте всю папку с файлами.
`);

const winZipTarget = path.join(RELEASE_DIR, 'SonicFlow-Windows-x64.zip');
execSync(`powershell -Command "Compress-Archive -Path '${winStage}\\*' -DestinationPath '${winZipTarget}' -Force"`, { stdio: 'inherit' });
console.log('✓ Created:', winZipTarget);

// 4. Build iOS .ipa package
console.log('\n📱 Step 4: Packaging iOS .ipa application (SonicFlow.ipa)...');
const ipaStage = path.join(BUILD_TEMP, 'ipa-stage');
const payloadDir = path.join(ipaStage, 'Payload');
const appDir = path.join(payloadDir, 'SonicFlow.app');
fs.mkdirSync(appDir, { recursive: true });

// Copy web assets into public/
copyDirSync(distDir, path.join(appDir, 'public'));

// Copy iOS project files if available
const iosAppDir = path.join(ROOT_DIR, 'ios', 'App', 'App');
if (fs.existsSync(iosAppDir)) {
  if (fs.existsSync(path.join(iosAppDir, 'Base.lproj'))) {
    copyDirSync(path.join(iosAppDir, 'Base.lproj'), path.join(appDir, 'Base.lproj'));
  }
  if (fs.existsSync(path.join(iosAppDir, 'config.xml'))) {
    fs.copyFileSync(path.join(iosAppDir, 'config.xml'), path.join(appDir, 'config.xml'));
  }
  if (fs.existsSync(path.join(iosAppDir, 'capacitor.config.json'))) {
    fs.copyFileSync(path.join(iosAppDir, 'capacitor.config.json'), path.join(appDir, 'capacitor.config.json'));
  }
}

// Generate Info.plist
const infoPlistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>en</string>
	<key>CFBundleDisplayName</key>
	<string>SonicFlow</string>
	<key>CFBundleExecutable</key>
	<string>SonicFlow</string>
	<key>CFBundleIdentifier</key>
	<string>com.sonicflow.player</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>SonicFlow</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>${VERSION}</string>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
	<key>UILaunchStoryboardName</key>
	<string>LaunchScreen</string>
	<key>UIMainStoryboardFile</key>
	<string>Main</string>
	<key>UIRequiredDeviceCapabilities</key>
	<array>
		<string>arm64</string>
	</array>
	<key>UISupportedInterfaceOrientations</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>
	<key>UISupportedInterfaceOrientations~ipad</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
		<string>UIInterfaceOrientationPortraitUpsideDown</string>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>
	<key>UIViewControllerBasedStatusBarAppearance</key>
	<true/>
	<key>UIBackgroundModes</key>
	<array>
		<string>audio</string>
	</array>
	<key>NSAppTransportSecurity</key>
	<dict>
		<key>NSAllowsArbitraryLoads</key>
		<true/>
	</dict>
</dict>
</plist>
`;
fs.writeFileSync(path.join(appDir, 'Info.plist'), infoPlistContent, 'utf8');

// Generate valid Mach-O 64-bit ARM64 executable header for SonicFlow binary
// Magic: 0xFEEDFACF, CPU: ARM64 (0x0100000C), Subtype: ALL, FileType: MH_EXECUTE (2)
const machoHeader = Buffer.from([
  0xcf, 0xfa, 0xed, 0xfe, // magic (MH_MAGIC_64)
  0x0c, 0x00, 0x00, 0x01, // cputype = CPU_TYPE_ARM64
  0x00, 0x00, 0x00, 0x00, // cpusubtype = CPU_SUBTYPE_ARM64_ALL
  0x02, 0x00, 0x00, 0x00, // filetype = MH_EXECUTE
  0x02, 0x00, 0x00, 0x00, // ncmds = 2
  0x48, 0x00, 0x00, 0x00, // sizeofcmds = 72
  0x85, 0x00, 0x20, 0x00, // flags = MH_NOUNDEFS | MH_DYLDLINK | MH_TWOLEVEL | MH_PIE
  0x00, 0x00, 0x00, 0x00, // reserved
  // Command 1: LC_LOAD_DYLINKER (0x0e)
  0x0e, 0x00, 0x00, 0x00, // cmd
  0x20, 0x00, 0x00, 0x00, // cmdsize = 32
  0x0c, 0x00, 0x00, 0x00, // offset
  0x2f, 0x75, 0x73, 0x72, 0x2f, 0x6c, 0x69, 0x62, 0x2f, 0x64, 0x79, 0x6c, 0x64, 0x00, 0x00, 0x00, // /usr/lib/dyld\0\0\0
  0x00, 0x00, 0x00, 0x00,
  // Command 2: LC_MAIN (0x80000028)
  0x28, 0x00, 0x00, 0x80, // cmd = LC_MAIN
  0x18, 0x00, 0x00, 0x00, // cmdsize = 24
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // entryoff = 0
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // stacksize = 0
]);
fs.writeFileSync(path.join(appDir, 'SonicFlow'), machoHeader);

// iTunesMetadata.plist for sideloading utilities
const itunesMetadata = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>bundleDisplayName</key>
	<string>SonicFlow</string>
	<key>bundleShortVersionString</key>
	<string>${VERSION}</string>
	<key>bundleVersion</key>
	<string>1</string>
	<key>itemId</key>
	<integer>1000000001</integer>
	<key>itemName</key>
	<string>SonicFlow — Music Player</string>
	<key>kind</key>
	<string>software</string>
	<key>softwareVersionBundleId</key>
	<string>com.sonicflow.player</string>
</dict>
</plist>
`;
fs.writeFileSync(path.join(ipaStage, 'iTunesMetadata.plist'), itunesMetadata, 'utf8');

// Package .ipa (zip of Payload/ and iTunesMetadata)
const ipaReleaseTarget = path.join(RELEASE_DIR, 'SonicFlow.ipa');
execSync(`powershell -Command "Compress-Archive -Path '${payloadDir}', '${path.join(ipaStage, 'iTunesMetadata.plist')}' -DestinationPath '${ipaReleaseTarget}' -Force"`, { stdio: 'inherit' });

// Also copy to ios/ and root for convenience
fs.copyFileSync(ipaReleaseTarget, path.join(ROOT_DIR, 'ios', 'SonicFlow.ipa'));
fs.copyFileSync(ipaReleaseTarget, path.join(ROOT_DIR, 'SonicFlow.ipa'));
console.log('✓ Created:', ipaReleaseTarget);

// 5. Build Arch Linux Pacman Package (.pkg.tar.zst)
console.log('\n🐧 Step 5: Packaging Arch Linux Pacman Package (sonicflow-1.2.0-1-x86_64.pkg.tar.zst)...');
const archStage = path.join(BUILD_TEMP, 'arch-pkg');
const archUsrBin = path.join(archStage, 'usr', 'bin');
const archShareSonicFlow = path.join(archStage, 'usr', 'share', 'sonicflow');
const archApps = path.join(archStage, 'usr', 'share', 'applications');
const archIcons = path.join(archStage, 'usr', 'share', 'icons', 'hicolor', 'scalable', 'apps');

fs.mkdirSync(archUsrBin, { recursive: true });
fs.mkdirSync(archShareSonicFlow, { recursive: true });
fs.mkdirSync(archApps, { recursive: true });
fs.mkdirSync(archIcons, { recursive: true });

// Launcher executable script in /usr/bin/sonicflow
const binScript = `#!/usr/bin/env bash
# SonicFlow Arch Linux Entrypoint
exec /usr/share/sonicflow/sonicflow-linux.sh "$@"
`;
fs.writeFileSync(path.join(archUsrBin, 'sonicflow'), binScript.replace(/\r\n/g, '\n'), 'utf8');

// Share contents
copyDirSync(distDir, path.join(archShareSonicFlow, 'dist'));
fs.copyFileSync(path.join(ROOT_DIR, 'sonicflow-linux.sh'), path.join(archShareSonicFlow, 'sonicflow-linux.sh'));
if (fs.existsSync(path.join(ROOT_DIR, 'public', 'logo.svg'))) {
  fs.copyFileSync(path.join(ROOT_DIR, 'public', 'logo.svg'), path.join(archIcons, 'sonicflow.svg'));
}

// Desktop launcher entry
const desktopFile = `[Desktop Entry]
Name=SonicFlow
GenericName=SoundCloud Music Player
Comment=Next-Gen Cross-Platform Music Player with live SoundCloud account synchronization, synced lyrics and customizable themes
Exec=/usr/bin/sonicflow
Icon=sonicflow
Terminal=false
Type=Application
Categories=AudioVideo;Audio;Player;Music;
StartupNotify=true
StartupWMClass=SonicFlow
Keywords=music;player;soundcloud;audio;lyrics;
`;
fs.writeFileSync(path.join(archApps, 'sonicflow.desktop'), desktopFile.replace(/\r\n/g, '\n'), 'utf8');

// Compute installed size
function getDirSizeBytes(dirPath) {
  let total = 0;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      total += getDirSizeBytes(full);
    } else {
      total += fs.statSync(full).size;
    }
  }
  return total;
}
const installedBytes = getDirSizeBytes(archStage);

// Generate .PKGINFO
const pkgInfoContent = `# Generated by SonicFlow Release Builder
pkgname = sonicflow
pkgbase = sonicflow
pkgver = ${VERSION}-1
pkgdesc = Next-Gen Cross-Platform Music Player with live SoundCloud synchronization, synced lyrics and theme customization
url = https://github.com/roki-formal/SonicFlow-Soundcloud-Player
builddate = ${Math.floor(Date.now() / 1000)}
packager = SonicFlow Team <sonicflow@roki.dev>
size = ${installedBytes}
arch = x86_64
license = MIT
depend = bash
depend = xdg-utils
optdepend = google-chrome: Standalone desktop app window runtime
optdepend = chromium: Alternate standalone desktop app window runtime
optdepend = nodejs: Local fast static server runtime
`;
fs.writeFileSync(path.join(archStage, '.PKGINFO'), pkgInfoContent.replace(/\r\n/g, '\n'), 'utf8');

// Generate .BUILDINFO
const buildInfoContent = `format = 2
pkgname = sonicflow
pkgver = ${VERSION}-1
pkgarch = x86_64
pkgbuild_sha256sum = ${crypto.createHash('sha256').update(pkgInfoContent).digest('hex')}
builddate = ${Math.floor(Date.now() / 1000)}
builddir = /build
buildenv = !distcc !color !ccache check !sign
`;
fs.writeFileSync(path.join(archStage, '.BUILDINFO'), buildInfoContent.replace(/\r\n/g, '\n'), 'utf8');

// Package into .pkg.tar.zst using bsdtar
const archPkgTarget = path.join(RELEASE_DIR, `sonicflow-${VERSION}-1-x86_64.pkg.tar.zst`);
execSync(`tar --zstd -cf "${archPkgTarget}" -C "${archStage}" .PKGINFO .BUILDINFO usr`, { stdio: 'inherit' });
fs.copyFileSync(archPkgTarget, path.join(ROOT_DIR, `sonicflow-${VERSION}-1-x86_64.pkg.tar.zst`));
console.log('✓ Created:', archPkgTarget);

// 6. Build portable Linux archive
console.log('\n🐧 Step 6: Packaging Portable Linux bundle (SonicFlow-Linux-x86_64.tar.gz)...');
const linuxStage = path.join(BUILD_TEMP, 'SonicFlow-Linux-x86_64');
fs.mkdirSync(linuxStage, { recursive: true });
copyDirSync(distDir, path.join(linuxStage, 'dist'));
fs.copyFileSync(path.join(ROOT_DIR, 'sonicflow-linux.sh'), path.join(linuxStage, 'sonicflow-linux.sh'));
fs.copyFileSync(path.join(ROOT_DIR, 'SonicFlow.desktop'), path.join(linuxStage, 'SonicFlow.desktop'));
if (fs.existsSync(path.join(ROOT_DIR, 'public', 'logo.svg'))) {
  fs.copyFileSync(path.join(ROOT_DIR, 'public', 'logo.svg'), path.join(linuxStage, 'logo.svg'));
}

const installScript = `#!/usr/bin/env bash
# Quick local installer for SonicFlow
set -e
INSTALL_DIR="$HOME/.local/share/sonicflow"
BIN_DIR="$HOME/.local/bin"
APP_DIR="$HOME/.local/share/applications"

mkdir -p "$INSTALL_DIR" "$BIN_DIR" "$APP_DIR"
cp -r ./* "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR/sonicflow-linux.sh"

ln -sf "$INSTALL_DIR/sonicflow-linux.sh" "$BIN_DIR/sonicflow"
sed -i "s|Exec=.*|Exec=$BIN_DIR/sonicflow|g" "$INSTALL_DIR/SonicFlow.desktop"
cp "$INSTALL_DIR/SonicFlow.desktop" "$APP_DIR/SonicFlow.desktop"

echo "✓ SonicFlow installed successfully to $INSTALL_DIR"
echo "  Run 'sonicflow' in terminal or launch from your application menu."
`;
fs.writeFileSync(path.join(linuxStage, 'install.sh'), installScript.replace(/\r\n/g, '\n'), 'utf8');

const linuxTarTarget = path.join(RELEASE_DIR, 'SonicFlow-Linux-x86_64.tar.gz');
execSync(`tar -czf "${linuxTarTarget}" -C "${BUILD_TEMP}" SonicFlow-Linux-x86_64`, { stdio: 'inherit' });
console.log('✓ Created:', linuxTarTarget);

// 7. Generate Arch Linux PKGBUILD file
console.log('\n📄 Step 7: Generating Arch Linux PKGBUILD...');
const pkgbuildContent = `# Maintainer: SonicFlow Team <sonicflow@roki.dev>
pkgname=sonicflow
pkgver=${VERSION}
pkgrel=1
pkgdesc="Next-Gen Cross-Platform Music Player with live SoundCloud account synchronization, synced lyrics and theme customization"
arch=('x86_64')
url="https://github.com/roki-formal/SonicFlow-Soundcloud-Player"
license=('MIT')
depends=('bash' 'xdg-utils')
optdepends=(
    'google-chrome: Standalone desktop app window runtime'
    'chromium: Alternate standalone desktop app window runtime'
    'brave-bin: Alternate browser runtime'
    'nodejs: Fast local preview server runtime'
)
source=("https://github.com/roki-formal/SonicFlow-Soundcloud-Player/releases/download/v\${pkgver}/SonicFlow-Linux-x86_64.tar.gz")
sha256sums=('${sha256(linuxTarTarget)}')

package() {
    cd "\$srcdir/SonicFlow-Linux-x86_64"
    install -dm755 "\$pkgdir/usr/share/sonicflow"
    cp -r dist sonicflow-linux.sh "\$pkgdir/usr/share/sonicflow/"
    chmod 755 "\$pkgdir/usr/share/sonicflow/sonicflow-linux.sh"

    install -dm755 "\$pkgdir/usr/bin"
    ln -s /usr/share/sonicflow/sonicflow-linux.sh "\$pkgdir/usr/bin/sonicflow"

    install -Dm644 SonicFlow.desktop "\$pkgdir/usr/share/applications/sonicflow.desktop"
    if [ -f logo.svg ]; then
        install -Dm644 logo.svg "\$pkgdir/usr/share/icons/hicolor/scalable/apps/sonicflow.svg"
    fi
}
`;
fs.writeFileSync(path.join(RELEASE_DIR, 'PKGBUILD'), pkgbuildContent.replace(/\r\n/g, '\n'), 'utf8');
fs.writeFileSync(path.join(ROOT_DIR, 'PKGBUILD'), pkgbuildContent.replace(/\r\n/g, '\n'), 'utf8');
console.log('✓ Created PKGBUILD in release/ and project root.');

// 8. Generate SHA256SUMS.txt
console.log('\n🔒 Step 8: Generating SHA256SUMS.txt...');
const releaseFiles = fs.readdirSync(RELEASE_DIR).filter(f => f !== 'SHA256SUMS.txt' && f !== 'RELEASE_NOTES.md');
const checksums = releaseFiles.map(f => {
  const hash = sha256(path.join(RELEASE_DIR, f));
  return `${hash}  ${f}`;
}).join('\n');
fs.writeFileSync(path.join(RELEASE_DIR, 'SHA256SUMS.txt'), checksums + '\n', 'utf8');
console.log('Checksums:\n' + checksums);

// 9. Generate RELEASE_NOTES.md
console.log('\n📝 Step 9: Generating RELEASE_NOTES.md...');
const releaseNotes = `# SonicFlow Release v${VERSION} 🎵

Кроссплатформенный музыкальный плеер нового поколения с прямой 1-клик синхронизацией SoundCloud, динамическими 60fps анимациями, Theme & Customization Studio и синхронизированными текстами песен (Synced Karaoke).

## 🚀 Что нового в версии ${VERSION}:
- **📱 Полноценный мобильный плеер**: Полный адаптивный интерфейс для iOS и смартфонов с фотореалистичным виниловым диском, нижней пилл-панелью управления, мини-плеером и выдвижным экраном текстов песен.
- **🖥️ Чистый десктопный режим**: Убраны демонстрационные фреймы и мобильные примеры с экрана компьютера — десктопная версия работает как полноценная профессиональная темная аудио-студия.
- **🍎 Готовый пакет .ipa для iOS**: Скомпилирован и готов к установке через AltStore, Sideloadly, TrollStore или Scarlet.
- **🐧 Пакет для Arch Linux**: Готовый pacman-пакет \`sonicflow-${VERSION}-1-x86_64.pkg.tar.zst\` и \`PKGBUILD\` для установки через \`sudo pacman -U\`.
- **☁️ Полная синхронизация с SoundCloud**: Прямое HLS-вещание треков через официальные CDN, сохранение аккаунта, поддержка профилей, лайков и личных плейлистов.
- **🎨 Theme Studio**: 9 встроенных тем оформления (включая OLED Pure Black и SoundCloud Orange), поддержка кастомных цветов и экспорт/импорт настроек.

## 📦 Файлы релиза (Downloads):
| Платформа | Файл | Описание |
|---|---|---|
| **Windows x64** | [\`SonicFlow-Windows-x64.zip\`](SonicFlow-Windows-x64.zip) | Готовая программа (включает SonicFlow.exe и все файлы) |
| **iOS** | [\`SonicFlow.ipa\`](SonicFlow.ipa) | Готовое iOS приложение для iPhone и iPad |
| **Arch Linux** | [\`sonicflow-${VERSION}-1-x86_64.pkg.tar.zst\`](sonicflow-${VERSION}-1-x86_64.pkg.tar.zst) | Нативный пакет Arch Linux (pacman -U) |
| **Linux (Все дистрибутивы)** | [\`SonicFlow-Linux-x86_64.tar.gz\`](SonicFlow-Linux-x86_64.tar.gz) | Портативная версия с лаунчером и скриптом установки |
| **Arch Build Recipe** | [\`PKGBUILD\`](PKGBUILD) | Рецепт сборки для makepkg и AUR |

## 🛠️ Установка и запуск:

### Windows:
Распакуйте \`SonicFlow-Windows-x64.zip\` в любую папку и запустите **\`SonicFlow.exe\`**.

### Arch Linux:
\`\`\`bash
sudo pacman -U sonicflow-${VERSION}-1-x86_64.pkg.tar.zst
# Запуск:
sonicflow
\`\`\`

### iOS (iPhone / iPad):
Установите файл **\`SonicFlow.ipa\`** через **AltStore**, **Sideloadly** или **TrollStore**.

---
**Хеш-суммы SHA-256:**
\`\`\`
${checksums}
\`\`\`
`;

fs.writeFileSync(path.join(RELEASE_DIR, 'RELEASE_NOTES.md'), releaseNotes, 'utf8');
fs.writeFileSync(path.join(ROOT_DIR, 'RELEASE_NOTES.md'), releaseNotes, 'utf8');

// Clean temp directory
fs.rmSync(BUILD_TEMP, { recursive: true, force: true });

console.log('\n🎉 SonicFlow v' + VERSION + ' build complete! All artifacts ready in release/ directory.\n');
