#!/bin/bash
# Перерисовка s2 (вышел фото) и s4 (не успел). Усилен «рисованный» стиль: плоские цвета, cel-shading.
G=/home/user/Diziler/survival/styles/ai/gen.sh
STYLE="Flat 2D cartoon illustration, cel shaded, bold clean black ink outlines on everything including walls, floor and background, flat colors, simple shading, vector art look, not a photo, not photorealistic, no blur, no bokeh. Wide shot in the style of animated YouTube survival stories, detailed illustrated background, small cartoon character, cinematic composition, no logos, no text, no brand names, completely empty, no other people."
HERO="a cartoon young man with a big round white head, simple black dot eyes, a yellow knitted beanie, messy brown hair, a gray hoodie, black gloves and very thin black stick legs with gray sneakers"
$G s2_mall 302 "$STYLE $HERO, standing small at the railing of the upper floor of a gigantic empty three-level shopping mall at night, store windows still lit with warm light, escalators, glass ceiling with dark night sky, eerie silence, deep blue and warm amber colors."
$G s4_escalator 104 "$STYLE $HERO, hiding behind a big pillar and peeking out with scared eyes at a long escalator in a dark empty shopping mall at night, the escalator is moving by itself with its steps glowing, everything else in deep blue shadow, tense horror atmosphere."
echo REDO_DONE
