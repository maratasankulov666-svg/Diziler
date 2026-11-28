#!/bin/bash
# Кадры теста 02 (стиль B). Герой описан одинаково в каждом кадре.
G=/home/user/Diziler/survival/styles/ai/gen.sh
STYLE="Wide shot, 2D cartoon illustration in the style of animated YouTube survival stories: highly detailed semi-realistic illustrated background with clean outlines, small cartoon character, cinematic composition, no logos, no text, no brand names."
HERO="a cartoon young man with a big round white head, simple black dot eyes, a yellow knitted beanie, messy brown hair, a gray hoodie, black gloves and very thin black stick legs with gray sneakers"
$G s1_cinema 101 "$STYLE $HERO, just waking up and stretching in a red velvet seat of a huge empty dark movie theater, rows of empty seats, the big screen is dark, only small aisle floor lights glow, dusty blue darkness, confused expression."
$G s2_mall 102 "$STYLE $HERO, standing small at the glass railing of the upper floor of a gigantic empty three-level shopping mall at night, all store windows still lit with warm light, escalators, glass ceiling with dark night sky, nobody anywhere, eerie silence, deep blue and warm amber colors."
$G s3_foodcourt 103 "$STYLE $HERO, holding a clipboard and a pencil, counting supplies in an empty shopping mall food court, rows of tables and chairs, open fast food counters with glass display freezers full of food, vending machines with water bottles, cool morning light, determined expression."
$G s4_escalator 104 "$STYLE $HERO, hiding behind a big pillar and peeking out with scared eyes at a long escalator in a dark empty shopping mall at night, the escalator is moving by itself with its steps glowing, everything else in deep blue shadow, tense horror atmosphere."
echo SHOTS_DONE
