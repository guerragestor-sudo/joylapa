#!/bin/zsh
# Gera as 8 telas do carrossel (1080x1350) e uma prévia do panorama.
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
FONTE="file://$PWD/fonte.html"
mkdir -p telas
for s in 1 2 3 4 5 6 7 8; do
  TMP="$(mktemp -t joycar).png"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size=1080,1350 --virtual-time-budget=8000 --screenshot="$TMP" "$FONTE?s=$s" >/dev/null 2>&1
  sips -s format jpeg -s formatOptions 92 "$TMP" --out "telas/0$s.jpg" >/dev/null
  rm -f "$TMP"
  echo "ok  telas/0$s.jpg"
done
TMP="$(mktemp -t joycar).png"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=8640,1350 --virtual-time-budget=8000 --screenshot="$TMP" "$FONTE?full=1" >/dev/null 2>&1
sips -s format jpeg -s formatOptions 80 -Z 4320 "$TMP" --out "panorama.jpg" >/dev/null
rm -f "$TMP"
echo "ok  panorama.jpg"
