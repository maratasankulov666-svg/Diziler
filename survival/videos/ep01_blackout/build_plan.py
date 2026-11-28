# Сборка: озвучка по абзацам -> vo.wav (паузы, темп ~160 сл/мин) + plan.json (блоки с таймингами, субтитры).
# python3 build_plan.py [--fake]   (--fake: тайминги по числу слов, без аудио — для проверки картинки)
import json, re, sys, os, subprocess, difflib
FAKE = "--fake" in sys.argv
blocks = []
for raw in open("script.md").read().split("\n\n"):
    lines = [l for l in raw.strip().splitlines() if l.strip() and not l.startswith(("#", "<!--"))]
    d = {}
    for l in lines:
        if l.startswith("@"):
            for tok in l[1:].split():
                if "=" in tok: k, v = tok.split("=", 1); d[k] = v
                else: d[tok] = True
    text = " ".join(l for l in lines if not l.startswith("@")).strip()
    if text: blocks.append({"d": d, "text": text})
raw_tokens = lambda s: re.findall(r"[A-Za-z0-9'][^\s]*", s)
words = lambda s: [re.sub(r"[^A-Za-z0-9'-]", "", t).strip("-'") for t in raw_tokens(s)]
def groups(text):
    toks = raw_tokens(text); out, sent = [], []
    for i, tk in enumerate(toks):
        sent.append(i)
        if re.search(r"[.,?!;:]$", tk) or i == len(toks) - 1:
            k = -(-len(sent) // 4); base, extra = divmod(len(sent), k); p0 = 0
            for g in range(k):
                n = base + (1 if g < extra else 0); out.append(sent[p0:p0 + n]); p0 += n
            sent = []
    return out
CARD, GAP = 1.5, 0.3
if FAKE:
    t = 0.6; tempo = 1.0
    for i, b in enumerate(blocks):
        b["i"] = i; b["cardDur"] = CARD if "card" in b["d"] else 0; b["s"] = round(t, 3); t += b["cardDur"] + len(words(b["text"])) / 2.67; b["e"] = round(t + GAP, 3); t += GAP
    dur = t + 2.5
    subs = []
    for b in blocks:
        ws = words(b["text"]); st = b["s"] + b["cardDur"]; step = (b["e"] - GAP - st) / max(1, len(ws))
        for g in groups(b["text"]): subs.append({"s": round(st + g[0] * step, 2), "e": round(st + (g[-1] + 1) * step, 2), "t": " ".join(ws[j] for j in g)})
else:
    import numpy as np, soundfile as sf, librosa
    segs, t, parts = [], 0.6, [np.zeros(int(0.6 * 24000))]
    for i, b in enumerate(blocks):
        a, sr = sf.read(f"vo/p{i:03d}.wav"); a, _ = librosa.effects.trim(a, top_db=38)
        b["i"] = i; b["cardDur"] = CARD if "card" in b["d"] else 0
        pre = b["cardDur"] + (0.15 if b["cardDur"] else 0)
        parts.append(np.zeros(int(pre * sr))); b["s"] = t; t += pre; b["vs"] = t; parts.append(a); t += len(a) / sr; b["ve"] = t
        parts.append(np.zeros(int(GAP * sr))); t += GAP; b["e"] = t
    vo = np.concatenate(parts + [np.zeros(int(2.5 * 24000))]); sf.write("vo_raw_all.wav", vo, 24000)
    speech = sum(b["ve"] - b["vs"] for b in blocks); nw = sum(len(words(b["text"])) for b in blocks)
    tempo = min(1.15, max(1.0, 160 / (nw / speech * 60)))
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", "vo_raw_all.wav", "-af", f"atempo={tempo:.4f}", "-ar", "48000", "vo_all.wav"], check=True)
    for b in blocks:
        for k in ("s", "e", "vs", "ve"): b[k] = round(b[k] / tempo, 3)
        b["cardDur"] = round(b["cardDur"] / tempo, 3)
    dur = len(vo) / 24000 / tempo
    # субтитры: слова сценария, время из Whisper (выравнивание)
    from faster_whisper import WhisperModel
    y, _ = librosa.load("vo_all.wav", sr=16000); wm = WhisperModel("small.en", device="cpu", compute_type="int8")
    W = [w for s in wm.transcribe(y, language="en", word_timestamps=True)[0] for w in s.words]
    subs = []
    for b in blocks:
        ws = words(b["text"]); bw = [w for w in W if b["vs"] - 0.3 <= w.start < b["ve"] + 0.2]
        norm = lambda x: re.sub(r"[^a-z0-9']", "", x.lower())
        sm = difflib.SequenceMatcher(None, [norm(x) for x in ws], [norm(w.word) for w in bw]); tm = [None] * len(ws)
        for blk in sm.get_matching_blocks():
            for q in range(blk.size): tm[blk.a + q] = (bw[blk.b + q].start, bw[blk.b + q].end)
        n = len(ws)
        for q in range(n):   # заполнить пропуски интерполяцией
            if tm[q] is None:
                a0 = next((tm[r][1] for r in range(q - 1, -1, -1) if tm[r]), b["vs"]); a1 = next((tm[r][0] for r in range(q + 1, n) if tm[r]), b["ve"])
                tm[q] = (a0, a1)
        for g in groups(b["text"]): subs.append({"s": round(tm[g[0]][0], 2), "e": round(tm[g[-1]][1] + 0.08, 2), "t": " ".join(ws[j] for j in g)})
json.dump({"duration": round(dur, 2), "tempo": round(tempo, 4), "blocks": blocks, "subs": subs}, open("plan.json", "w"))
print("blocks", len(blocks), "duration", round(dur, 1), "s, tempo", round(tempo, 3), "subs", len(subs))
