#!/usr/bin/env bash
# Скачивает внешние репозитории со стилями в survival/vendor (не коммитятся).
set -e
cd "$(dirname "$0")/.."
mkdir -p vendor
clone() { [ -d "vendor/$2/.git" ] || GIT_LFS_SKIP_SMUDGE=1 git clone -q --depth 1 "https://github.com/$1" "vendor/$2"; echo "ok $1"; }
clone kaomei/stickman-video-director stickman-video-director   # MIT, 17 стилей, B4 Survival Thriller
clone dsauce/stickman-kino stickman-kino                       # MIT, стикмен-анимация кодом, без генерации картинок
clone twri/sdxl_prompt_styler sdxl_prompt_styler               # JSON-библиотека стилей для промптов
echo "B4 style lock: vendor/stickman-video-director/skills/directing-stickman-videos/references/b4-survival-storytelling.md"
