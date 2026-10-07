#!/bin/zsh
# Gera os criativos do Joy Lapa em JPG (feed 1080x1350 e stories 1080x1920).
# Uso: ./gerar.sh            → todos
#      ./gerar.sh smart prime → só os informados
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
FONTE="file://$PWD/fonte/criativo.html"
TODOS=(oferta smart select prime garden mcmv localizacao lazer lancamento indique)
LISTA=(${@:-$TODOS})
mkdir -p feed stories
n=0
for c in $LISTA; do
  n=$((n + 1))
  num=$(printf "%02d" ${TODOS[(i)$c]})
  for f in feed story; do
    if [[ $f == feed ]]; then H=1350; DIR=feed; else H=1920; DIR=stories; fi
    TMP="$(mktemp -t joy).png"
    "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
      --window-size=1080,$H --virtual-time-budget=8000 \
      --screenshot="$TMP" "$FONTE?c=$c&f=$f" >/dev/null 2>&1
    sips -s format jpeg -s formatOptions 92 "$TMP" --out "$DIR/$num-$c-$DIR.jpg" >/dev/null
    rm -f "$TMP"
    echo "ok  $DIR/$num-$c-$DIR.jpg"
  done
done
