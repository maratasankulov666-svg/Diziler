# Тест 01: «What If It Rained for 10 Years?» (34 с)

| Этап | Чем делали | Время |
|---|---|---|
| Озвучка | Qwen3-TTS 1.7B CustomVoice, голос Ryan, локально на CPU (`tts.py`, окружение `/home/user/.venvs/qwen`) | ~25 с на фразу |
| Проверка и тайминги слов | faster-whisper small.en (`align.py`), текст распознан 1:1 | ~1 мин |
| Фоны | SDXL-Turbo на CPU (`bgs.py` → `engine/background.py`) | ~26 с на фон |
| Герой, дождь, вода, счётчик, субтитры | `render.py` + `engine/stickman.py` | ~4,5 мин на 34 с |
| Звук | озвучка, музыка «Investigations» (Kevin MacLeod, CC BY), розовый шум как дождь, loudnorm −15 LUFS | секунды |

Уроки:
- «Year one» TTS читает как «You're one»: числа и годы лучше писать словами в формате «Day three hundred».
- Инструкция «slow pacing» растягивает озвучку на 30%, нужна «natural brisk pace».
- Нельзя ставить qwen-tts в основное окружение `/opt/dizi-venv`: он понижает transformers и huggingface-hub. Для него отдельное окружение.

Атрибуция для описания: Music: "Investigations" Kevin MacLeod (incompetech.com), Licensed under Creative Commons: By Attribution 4.0.
