# Бесплатная генерация картинок для стиля A (проверено 28.11.2026)

## Что проверено отсюда
| Вариант | Результат |
|---|---|
| Pollinations без ключа | Работает, но только модель `sana`: промпт игнорирует, ставит водяной знак, 1 картинка в 45 с. **Не годится.** |
| Pollinations с бесплатным аккаунтом ([pollinations/pollinations](https://github.com/pollinations/pollinations), ключ на enter.pollinations.ai) | Бесплатно (FREE): `flux.1-kontext-pro`, `flux.2-klein-4b`, `flux.2-flex` (все принимают картинку-образец), `flux.1-schnell`, `z-image-turbo`, `mai-image-2.7`. **Лучший вариант.** |
| Hugging Face Spaces (FLUX.1-schnell, FLUX Kontext) через `gradio_client` | Без токена квота кончается сразу. С бесплатным токеном hf.co даётся несколько минут ZeroGPU в день, это примерно 15–40 картинок. |
| Локально на CPU: [leejet/stable-diffusion.cpp](https://github.com/leejet/stable-diffusion.cpp), [rupeshs/fastsdcpu](https://github.com/rupeshs/fastsdcpu) | Бесплатно и без лимитов, но видеокарты нет: FLUX выдаёт минуты на кадр, SD-Turbo быстрее, но хуже качеством. Подходит только для фонов. |

## Как сделать стиль A бесплатно
1. **Фоны** генерируем ИИ: без персонажей, в стиле B4 (`vendor/stickman-video-director/.../assets/b4/style-lock.txt`). Один фон переиспользуется на 3–6 кадров (крупный план, наезд, панорама).
2. **Героя** (белая голова, тело-палочка, белые перчатки, зелёная шапка) рисуем кодом поверх фона, по позам из [dsauce/stickman-kino](https://github.com/dsauce/stickman-kino). Тогда герой одинаковый во всех кадрах, может ходить и махать руками, а генерация на него не тратится.
3. Ключевые кадры с героем «внутри» сцены и обложку делаем через `flux.1-kontext-pro` с образцом.

Так на 30-минутное видео нужно около 60–80 генераций фонов вместо 200+.
