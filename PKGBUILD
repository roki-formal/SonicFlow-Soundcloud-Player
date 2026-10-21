# Maintainer: SonicFlow Team <sonicflow@roki.dev>
pkgname=sonicflow
pkgver=1.2.0
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
source=("https://github.com/roki-formal/SonicFlow-Soundcloud-Player/releases/download/v${pkgver}/SonicFlow-Linux-x86_64.tar.gz")
sha256sums=('feb1b2e2b71b4865d8de6c3137ccbc1016906ef64d2abef8d685ba2c017b4c39')

package() {
    cd "$srcdir/SonicFlow-Linux-x86_64"
    install -dm755 "$pkgdir/usr/share/sonicflow"
    cp -r dist sonicflow-linux.sh "$pkgdir/usr/share/sonicflow/"
    chmod 755 "$pkgdir/usr/share/sonicflow/sonicflow-linux.sh"

    install -dm755 "$pkgdir/usr/bin"
    ln -s /usr/share/sonicflow/sonicflow-linux.sh "$pkgdir/usr/bin/sonicflow"

    install -Dm644 SonicFlow.desktop "$pkgdir/usr/share/applications/sonicflow.desktop"
    if [ -f logo.svg ]; then
        install -Dm644 logo.svg "$pkgdir/usr/share/icons/hicolor/scalable/apps/sonicflow.svg"
    fi
}
