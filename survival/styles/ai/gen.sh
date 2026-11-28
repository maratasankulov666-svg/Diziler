#!/bin/bash
# usage: gen.sh name seed "prompt"
M=/opt/sd/models
/opt/sd/src/build/bin/sd-cli --diffusion-model $M/zit_q4k.gguf --llm $M/qwen3_4b_q8.gguf --vae $M/ae.safetensors \
  --cfg-scale 1.0 --steps 8 --sampling-method euler -W 1024 -H 576 -t 4 --seed "$2" -o "$1.png" -p "$3" 2>&1 | grep -E "sampling completed|saved"
