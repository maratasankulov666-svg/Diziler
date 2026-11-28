# Темп речи, паузы и есть ли музыка/фон в паузах
import sys, json, subprocess, numpy as np
for n in sys.argv[1:]:
    S = json.load(open(n + ".json")); W = [w for s in S for w in s["w"]]
    dur = W[-1][1] - W[0][0]; wpm = len(W) / dur * 60
    gaps = [(a[1], b[0]) for a, b in zip(W, W[1:]) if b[0] - a[1] > 0.7]
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", n + ".mp4", "-ac", "1", "-ar", "8000", "-f", "f32le", "-"], capture_output=True).stdout
    y = np.frombuffer(raw, np.float32); sr = 8000
    rms = lambda a, b: float(np.sqrt(np.mean(y[int(a * sr):int(b * sr)] ** 2) + 1e-12)) if int(b*sr) > int(a*sr) + 10 else float("nan")
    sp = np.nanmedian([rms(w[0], w[1]) for w in W[::20]]); gp = [r for r in (rms(a + 0.15, b - 0.15) for a, b in gaps) if np.isfinite(r)]
    sent = [len(s["t"].split()) for s in S]
    print(f"{n}: {len(W)} слов, {dur/60:.1f} мин, {wpm:.0f} сл/мин, пауз>0.7с: {len(gaps)} (каждые {dur/max(1,len(gaps)):.0f} с), "
          f"фон в паузах {20*np.log10(np.median(gp)/sp):.0f} дБ от речи, фраза в ср. {np.mean(sent):.1f} слов")
