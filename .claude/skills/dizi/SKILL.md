---
name: dizi
description: Производство видео для YouTube-канала DiziVizyon (@DiziiVizyon) о турецких сериалах — разборы серий и фрагманов, топы, Shorts, обложки в стиле TRT. Запускать, когда пользователь пишет «дизи», «dizi», «/dizi» или просит сделать видео/шортс/обложку для канала.
---

# DiziVizyon: как делать видео

Пользователь — владелец канала DiziVizyon (турецкие сериалы, язык видео — **турецкий**, общение — **по-русски**). Сам по-турецки не говорит и не озвучивает. Работает с телефона: всё делаешь сам, отдаёшь готовые файлы через SendUserFile (видео до ~50 МБ, иначе дай 720p-версию), тексты для YouTube — прямо в чате блоками для копирования.

## 0. Старт сессии («дизи»)

1. Запусти установку инструментов (если окружение её ещё не сделало): `bash tools/setup.sh` (≈1 мин, создаёт `/opt/dizi-venv`).
2. Прочитай `CHANNEL.md` (история канала, что уже вышло, уроки) и последнюю папку в `videos/`.
3. Спроси коротко по-русски, какое видео делаем, и предложи 2–3 варианта по ситуации:
   - разбор последней серии + фрагман следующей самого рейтингового сериала (сейчас — Taşacak Bu Deniz, TRT 1, пятница 20:00);
   - топ/подборка (новые сериалы, пары, актёры);
   - Shorts из готового видео;
   - обложка/название для уже загруженного видео.
   Используй AskUserQuestion с вариантами.

## 1. Факты (никогда не выдумывать)

- Рейтинги: Box Office Türkiye (недельный топ-10, TİAK), CNN Türk/Habertürk (дневные). Ищи WebSearch, читай страницы через агента web-fetch.
- Сюжет: **не верь пересказам СМИ** — они часто описывают только фрагман. Скачай саму серию/фрагман и распознай речь (раздел 3).
- Расписание TRT для Taşacak Bu Deniz: серия — пятница 20:00; 1-й фрагман следующей серии — пятница ~22:45 (после эфира); 2-й фрагман — обычно **понедельник**. Ролики «2. Fragmanı» от сторонних каналов до понедельника — фейки, не повторять.
- Узнавание героев по лицам ненадёжно: сверяйся с репликами («Vur beni İso» и т.п.) и Wikipedia.

## 2. Где брать видео

- YouTube с этого сервера не качается (бот-проверка). Используй **Dailymotion**: API `https://api.dailymotion.com/videos?search=...&fields=id,title,duration,owner.screenname,created_time&sort=recent`. Официальные трейлеры заливает **BeyazPerde**; полные серии иногда выкладывает аккаунт сериала.
- Скачать: `yt-dlp -f "best[height<=720]/best" -o name.mp4 https://www.dailymotion.com/video/<id>`.
- Кусок длинной серии (HLS fmp4 по 3 с): получи URL `yt-dlp -g -f hls-720 <url>`, сохрани манифест один раз, качай сегменты `curl -A "Mozilla/5.0" ${BASE}{N}.m4s` + `init.mp4`, склей `cat` → `ffmpeg -c copy` (пример в истории: последние 31 мин серии = сегменты 2520..конец).
- Всё скачанное — в scratchpad, не в репозиторий.

## 3. Распознавание речи (сюжет и проверка озвучки)

```bash
/opt/dizi-venv/bin/python - <<'EOF'
import subprocess, numpy as np
from faster_whisper import WhisperModel
a = np.frombuffer(subprocess.check_output(["ffmpeg","-loglevel","error","-i","IN.mp4","-ac","1","-ar","16000","-f","f32le","-"]), np.float32)
for s in WhisperModel("medium", device="cpu", compute_type="int8").transcribe(a, language="tr", vad_filter=True)[0]:
    print(f"{s.start:7.1f} {s.text}")
EOF
```
`medium` для фрагманов (точнее), `small` для длинных кусков (быстрее). Контактные листы кадров: `ffmpeg -i X -vf "fps=1/8,scale=400:-1,tile=6x4" -frames:v 1 sheet.jpg`.

## 4. Сценарий и озвучка

- Папка видео: `videos/NN_<slug>/` с `segments.py`: список `(block, стиль_на_турецком, текст, пауза)`.
- Стиль **ведущего** обязателен: фирменное начало «Çaylar demlendi, kumanda elinizde... DiziVizyon'a hoş geldiniz!», конец «Kumandayı bırakmayın, görüşmek üzere!», 1 шутка на блок (про клише турецких сериалов), вопрос зрителям в конце («en iyi tahmini bir sonraki videoda okuyacağım»).
- Числа писать словами («kırkıncı bölüm»). Стиль-инструкции писать **по-турецки** (английские ломают слова на C/Ç/Ş в начале).
- Озвучка — **голос канала Ahenk (женский, турецкая LoRA для VoxCPM2, эмоции)**, выбран пользователем 22.11.2026 вместо мужского ведущего (тот звучал недостаточно живо для турок):
  `/opt/dizi-venv/bin/python videos/voiceover.py videos/NN_<slug>` (без второго аргумента = Ahenk). Эмоция берётся из поля стиля: ключевые слова (şaşkın/şok → surprised, hüzün/duygusal → sad, esprili/neşeli/enerjik/samimi → cheerful, kahkaha → laughing, kızgın → angry, sakin/düşünceli → calm, иначе plain) или прямо имя эмоции. Нужен пакет `trnorm` (ставит setup.sh). ≈30–40 с на фразу на CPU, авто-проверка Whisper. Старый мужской голос: второй аргумент `samples/channel_voice_announcer.wav`.
  В описание каждого видео добавлять: `🎙️ Seslendirme: Ahenk TTS (ozgurguler/ahenk-tts-tr, CC BY 4.0)`.
- Пользователю показывай перевод сценария на русский.

## 5. Монтаж длинного видео

Конвейер в `videos/build/` (запуск из scratchpad-папки `$S`, где лежат `clips/`, `v2/`, …):
1. `python3 videos/build/shots.py <папка_с_mp4> <out_shots.json>` — нарезка на планы, отсев заставок/тёмных кадров.
2. `videos/NN/plan.py` — что где (см. `videos/02_*/plan.py` как образец): карточки (`cards()`), бары/подписи/мемы и пулы кадров по сегментам (`layout()`, пулы `name@a-b`), музыка (`music()`).
3. Карточки 3D (скилл html-3d-video, шаблон `card.html`): `python3 videos/build/cards.py videos/NN $S/cards_vN` → `NODE_PATH=$(npm root -g) node videos/build/render_card.js <html> <mp4>` (параллельно `xargs -P 3`). Проверь стоп-кадры `--still t out.jpg` ДО полного рендера.
4. Сборка: `/opt/dizi-venv/bin/python videos/build/build.py $S videos/NN` → mp4 с громкостью −14 LUFS.
5. Проверь сетку кадров глазами (каждые ~10 с). Сделай 720p-копию (`-b:v 1300k`) для скачивания с телефона.

Правила картинки: кадры ≤3 с, оригинальный звук фрагмана выключен, зум ~1.22 прячет логотипы каналов, нижняя плашка канала закрывает титры TRT. Музыка — Kevin MacLeod (`assets/music`, CC BY, атрибуция в описании обязательна).

## 6. Shorts

`videos/shorts/<slug>/segments.py` (block = пул кадров `name@a-b` или `a|b`), `short.json` (kicker, title, captions с `||` для второй строки, music, out, опц. shots_files/clip_dirs). Озвучить тем же voiceover.py, собрать: `/opt/dizi-venv/bin/python videos/build/shorts.py $S videos/shorts/<slug>`. 25–40 с, крючок в 1-ю секунду, CTA «Tam video kanalda 👆». Напомнить пользователю привязать «Связанное видео».

## 7. Обложка

Шаблон в стиле TRT: `videos/build/thumb_trt_style.html` (засечный Cinzel «40. BÖLÜM FRAGMANI» на бирюзовой волне с брызгами, логотип сериала курсивом справа, коллаж: родные приглушены слева, главный герой справа). Выделение героя: rembg (`u2net_human_seg`) → маска → резкость внутри маски + тёплый ореол/контурный свет (см. `CHANNEL.md` → «Обложки»). Рендер — Playwright (`page.screenshot`). Без логотипа TRT1 и без ложных надписей («2. FRAGMANI» только когда он реально вышел).

## 8. Публикация (что сказать пользователю)

- Название **начинается с поискового запроса**: `Taşacak Bu Deniz 41. Bölüm Fragmanı Analizi | <крючок>`.
- Скорость решает: разбор фрагмана — в течение нескольких часов после выхода.
- Дать: название, описание (с таймкодами из timing/cards и строкой атрибуции музыки), теги, обложку; тексты в чат блоками + `YOUTUBE.txt`.
- Коммитить исходники и тексты в ветку разработки; mp4 — только 720p-версии и Shorts (<100 МБ, `git add -f`).
