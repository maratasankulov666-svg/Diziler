#!/bin/bash
# Кадры теста 02 (стиль B). Герой описан одинаково в каждом кадре.
G=/home/user/Diziler/survival/styles/ai/gen.sh
STYLE="Wide shot, hand-drawn 2D cartoon illustration, everything drawn with clean ink outlines including the background, not a photo, not photorealistic in the style of animated YouTube survival stories: highly detailed semi-realistic illustrated background with clean outlines, small cartoon character, cinematic composition, no logos, no text, no brand names, completely empty, no other people."
HERO="a cartoon young man with a big round white head, simple black dot eyes, a yellow knitted beanie, messy brown hair, a gray hoodie, black gloves and very thin black stick legs with gray sneakers"
$G s2_mall 202 "$STYLE $HERO, standing small at the glass railing of the upper floor of a gigantic empty three-level shopping mall at night, all store windows still lit with warm light, escalators, glass ceiling with dark night sky, eerie silence, deep blue and warm amber colors."
echo REDO_DONE
