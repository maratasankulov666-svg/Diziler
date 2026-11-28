# Бесплатная генерация для стиля A (проверено 28.11.2026)

## НОВОЕ (28.11.2026): Z-Image-Turbo — лучший бесплатный вариант
- [leejet/stable-diffusion.cpp](https://github.com/leejet/stable-diffusion.cpp) (сборка в `/opt/sd/src`) и модель Z-Image-Turbo (Apache 2.0).
- Файлы в `/opt/sd/models`:
  - `zit_q4k.gguf` из leejet/Z-Image-Turbo-GGUF;
  - `qwen3_4b_q8.gguf` из unsloth/Qwen3-4B-Instruct-2507-GGUF;
  - `ae.safetensors` из Comfy-Org/z_image_turbo.
- Запуск: `styles/ai/gen.sh имя seed "prompt"`, 8 шагов, cfg 1.0, 1024×576.
- **~7,5 мин на кадр на CPU** (4 потока). Качество как у образца: мультяшный герой рисуется вместе с фоном.
- Пример: `styles/ai/A_webcomic.png`.

## Старая схема: всё локально, без аккаунтов и ключей
1. **Фон** рисует `engine/background.py`: SDXL-Turbo через [huggingface/diffusers](https://github.com/huggingface/diffusers), на CPU.
   - Кадр 1024×576 за ~25 с, 30-минутное видео (60–80 фонов) примерно за 30 минут.
   - Работает здесь, в облачной сессии. Видеокарта не нужна.
2. **Героя** рисует `engine/stickman.py`, чистым кодом на PIL.
   - Белая голова, тело-палочка, белые перчатки, зелёная шапка, рюкзак.
   - 7 поз (`stand`, `wave`, `walk`, `point`, `scared`, `carry`, `sit`) и 5 выражений лица.
   - Герой одинаковый в каждом кадре.
3. Пример результата: `tests/style_a_prototype.jpg`.

Лицензия SDXL-Turbo: Stability AI Community License, коммерческое использование бесплатно при доходе до $1 млн в год.

## Другие проверенные варианты
| Вариант | Итог |
|---|---|
| [leejet/stable-diffusion.cpp](https://github.com/leejet/stable-diffusion.cpp) с FLUX.1-schnell или Z-Image-Turbo (GGUF) | Модели лучше по качеству и полностью открытые (Apache 2.0), но на CPU это минуты на кадр. Запасной вариант на ночь. |
| [rupeshs/fastsdcpu](https://github.com/rupeshs/fastsdcpu) | Тот же SD/SDXL-Turbo с ускорением OpenVINO. Альтернатива `background.py`. |
| [lllyasviel/Fooocus](https://github.com/lllyasviel/Fooocus), [camenduru/Fooocus-colab](https://github.com/camenduru/Fooocus-colab) | SDXL с образцом стиля (Image Prompt) на бесплатной видеокарте Google Colab. Нужен Google-аккаунт и браузер. |
| Pollinations, Hugging Face Spaces | Без регистрации: слабая модель или лимит. Отклонены. |
