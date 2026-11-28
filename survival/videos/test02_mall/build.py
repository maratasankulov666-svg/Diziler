"""Сборка теста 02: тайминги из Whisper -> анимация кадров -> заставки DAY/NIGHT -> звук.
/opt/dizi-venv/bin/python build.py
"""
import json, subprocess, os, re
import numpy as np, librosa
from faster_whisper import WhisperModel

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
ANIM = os.path.join(ROOT, "../../engine/animate.py")
PY = "/opt/dizi-venv/bin/python"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# 1. слова с таймингами + проверка текста
audio, _ = librosa.load("vo.wav", sr=16000, mono=True)
DUR = len(audio) / 16000
segs, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(audio, word_timestamps=True, language="en")
words = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
heard = " ".join(w for w, _, _ in words)
print("распознано:", heard)
json.dump(words, open("words.json", "w"))

def at(phrase):
    """время начала фразы (первое совпадение по словам)"""
    ph = [re.sub(r"\W", "", x.lower()) for x in phrase.split()]
    ws = [re.sub(r"\W", "", w.lower()) for w, _, _ in words]
    for i in range(len(ws) - len(ph) + 1):
        if ws[i:i + len(ph)] == ph:
            return words[i][1]
    raise SystemExit(f"не нашёл фразу: {phrase}")

t_day, t_math, t_night = at("Day one"), at("So you do"), at("Night one")
END = DUR + 0.8
CARD = 1.1
# план: (картинка или заставка, начало, конец)
plan = [("s1_cinema", 0, t_day), ("card:DAY 1", t_day, t_day + CARD), ("s2_mall", t_day + CARD, t_math),
        ("s3_foodcourt", t_math, t_night), ("card:NIGHT 1", t_night, t_night + CARD), ("s4_escalator", t_night + CARD, END)]
print(json.dumps(plan, indent=1))

# 2. клипы
parts = []
for i, (name, a, b) in enumerate(plan):
    out = f"part{i}.mp4"; d = b - a
    if name.startswith("card:"):
        txt = name[5:]
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"color=black:s=1280x720:d={d:.3f}:r=30",
                        "-vf", f"drawtext=fontfile={FONT}:text='{txt}':fontsize=80:fontcolor=white:x=(w-tw)/2:y=(h-th)/2",
                        "-c:v", "libx264", "-pix_fmt", "yuv420p", out], check=True)
    else:
        subprocess.run([PY, ANIM, f"{name}.png", out, f"{d:.3f}"], check=True)
    parts.append(out)

# 3. склейка + звук (только голос, как в образце; громкость -14 LUFS)
open("parts.txt", "w").write("".join(f"file '{p}'\n" for p in parts))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", "parts.txt", "-i", "vo.wav",
                "-filter_complex", "[1]apad,atrim=0:%.3f,loudnorm=I=-14:TP=-1.5:LRA=11[a]" % END,
                "-map", "0:v", "-map", "[a]", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "160k", "-shortest", "test02_mall.mp4"], check=True)
for p in parts + ["parts.txt"]:
    os.remove(p)
print("готово: test02_mall.mp4", round(END, 1), "с")
