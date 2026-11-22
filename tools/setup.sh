#!/usr/bin/env bash
# DiziVizyon toolchain: creates /opt/dizi-venv with TTS (VoxCPM2), ASR (faster-whisper),
# person segmentation (rembg), downloader (yt-dlp). Idempotent. Models download on first use.
set -e
V=/opt/dizi-venv
if [ ! -x "$V/bin/python" ]; then python3 -m venv "$V"; fi
if ! "$V/bin/python" -c "import torch" 2>/dev/null; then
  "$V/bin/pip" install -q torch torchaudio --index-url https://download.pytorch.org/whl/cpu
fi
"$V/bin/pip" install -q voxcpm faster-whisper "rembg[cpu]" yt-dlp soundfile scipy edge-tts
# trnorm (Turkish text normalisation for the Ahenk voice): pure Python, from the author's repo
"$V/bin/python" -c "import trnorm" 2>/dev/null || "$V/bin/pip" install -q --no-deps "git+https://github.com/ozguradmin/ahenk-turkish-tts"
echo "dizi toolchain ready: $V"
