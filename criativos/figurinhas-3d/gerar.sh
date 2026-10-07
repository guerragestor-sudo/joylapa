#!/bin/zsh
# Renderiza as figurinhas 3D (three.js) em PNG transparente 2x, recortadas na borda.
# Uso: ./gerar.sh              → todas
#      ./gerar.sh pin-joy-3d   → só as informadas
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
FONTE="file://$PWD/fonte.html"
TODAS=($(grep -oE "^S\['[a-z0-9-]+'\]" fonte.html | sed -E "s/S\['(.*)'\]/\1/"))
LISTA=(${@:-$TODAS})
mkdir -p png
for s in $LISTA; do
  TMP="$(mktemp -t joy3d).png"
  "$CHROME" --headless=new --hide-scrollbars --default-background-color=00000000 --use-angle=metal \
    --force-device-scale-factor=2 --window-size=1400,1400 --virtual-time-budget=20000 \
    --screenshot="$TMP" "$FONTE?s=$s" >/dev/null 2>&1
  dim=$(swift recortar.swift "$TMP" "png/$s.png" 40)
  rm -f "$TMP"
  echo "ok  png/$s.png  ($dim)"
done
