# Синтез звуков по событиям из sfx.json: дверь (глухой удар + дребезг стекла), банка (стук стекла об пол)
import json, numpy as np, soundfile as sf
info = json.load(open("sfx.json")); sr = 44100; out = np.zeros(int((info["duration"] + 1) * sr)); rng = np.random.default_rng(3)
def env(n, k): return np.exp(-np.arange(n) / sr * k)
def place(x, t, g):
    i = int(t * sr); out[i:i + len(x)] += g * x[:len(out) - i]
for e in info["sfx"]:
    n = int(0.6 * sr); tt = np.arange(n) / sr
    if e["kind"] == "door":
        thump = np.sin(2 * np.pi * 70 * tt) * env(n, 18)
        rattle = sum(np.sin(2 * np.pi * f * tt + rng.uniform(0, 6)) for f in (1180, 1730, 2410)) * env(n, 22) * (1 + 0.5 * np.sin(2 * np.pi * 38 * tt))
        place(thump * 0.8 + rattle * 0.06 + rng.normal(0, 1, n) * env(n, 60) * 0.08, e["t"], 0.5)
    else:
        v = min(1.0, e["v"] / 1500)
        clink = sum(np.sin(2 * np.pi * f * tt) / (k + 1) for k, f in enumerate((1650, 2890, 4210))) * env(n, 30)
        knock = np.sin(2 * np.pi * 140 * tt) * env(n, 40)
        place(clink * 0.35 + knock * 0.6 + rng.normal(0, 1, n) * env(n, 120) * 0.15, e["t"], 0.55 * v)
sf.write("sfx.wav", out / max(1, np.abs(out).max() * 1.05), sr); print("sfx ok", len(info["sfx"]), "events")
