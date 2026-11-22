"""Assemble video #1: 3D cards + trailer footage sections + overlays + mixed audio.

usage: python3 build.py <scratch_dir>
scratch_dir holds: clips/*.mp4, shots.json, cards/*.mp4 + cards.json, music/*.mp3
"""
import json, math, os, subprocess, sys
import numpy as np, soundfile as sf

SCR = sys.argv[1]
VID = "/home/user/Diziler/videos/01_top5_yeni_diziler"
B = os.path.join(SCR, "build"); os.makedirs(B, exist_ok=True)
T = json.load(open(os.path.join(VID, "timing.json")))
SHOTS = json.load(open(os.path.join(SCR, "shots.json")))
CARDS = json.load(open(os.path.join(SCR, "cards", "cards.json")))
X = 0.4          # crossfade between shots
FPS = 30
def run(cmd): subprocess.run(cmd, check=True)

def span(i):
    s = 0.0 if i == 0 else (T[i - 1]["end"] + T[i]["start"]) / 2
    e = (T[i]["end"] + T[i + 1]["start"]) / 2 if i + 1 < len(T) else T[i]["end"]
    return round(s, 3), round(e, 3)

P = {k: sorted(n for n in SHOTS if n.startswith(k + "_")) for k in ["gunes", "anne", "tuzlu", "omur", "sevdan"]}
TOP = sum(P.values(), [])
DEAD = ["ask", "mercan", "sevdam", "haysiyet"]

# ---------- overlays ----------
bars = {
    "bar_top": dict(kind="bar", title="2026–2027 Sezonu · Top 5 Yeni Dizi", meta="REYTİNG: TİAK / BOX OFFICE TÜRKİYE · 9-15 KASIM"),
    "bar5": dict(kind="bar", rank=5, title="Güneşin Doğduğu Yer", meta="ATV · TİMSBİ PRODUCTIONS"),
    "bar4": dict(kind="bar", rank=4, title="Anne Yarısı", meta="NOW · NTC MEDYA"),
    "bar3": dict(kind="bar", rank=3, title="Tuzlu Kahve", meta="STAR TV · POLL FILMS"),
    "bar2": dict(kind="bar", rank=2, title="Ömür Usta", meta="NOW · AY YAPIM"),
    "bar1": dict(kind="bar", rank=1, title="Sevdan Bir Ateş", meta="SHOW TV · CNP FİLM"),
    "bar_dead": dict(kind="bar", title="Dizi Mezarlığı 💀", meta="BU SEZON ERKEN FİNAL YAPAN DİZİLER"),
    "bar_soon": dict(kind="bar", title="Yakında: Susuz Yaz", meta="AY YAPIM · ARALIK 2026"),
    "stamp": dict(kind="stamp", text="FİNAL"),
}
caps = {  # segment index -> overlay
    1: dict(kind="chip", text="📺 Bu sonbahar onlarca yeni dizi başladı"),
    2: dict(kind="chip", text="📈 Bazıları zirvede… 💀 bazıları finalde"),
    3: dict(kind="center", text="TOP 5 YENİ DİZİ", small="+ sonunda: Dizi Mezarlığı 💀"),
    5: dict(kind="chip", text="⭐ Burak Özçivit · Kenan Kozan"),
    6: dict(kind="chip", text="✈️ Almanya ➜ Adana · 17 Eylül'den beri ATV'de"),
    7: dict(kind="meme", text="HERKES ALMANYA'DAN DÖNÜYOR 😂"),
    9: dict(kind="chip", text="⭐ Burcu Özberk · Cihangir Ceyhan"),
    10: dict(kind="chip", text="📈 Sessiz başlangıç ➜ her hafta yükseliş"),
    11: dict(kind="meme", text="ARKA SIRADAN KARNE ŞAMPİYONU 😎"),
    13: dict(kind="chip", text="⭐ Eda Ece · Buğra Gülsoy"),
    14: dict(kind="chip", text="⭐ Nebahat Çehre · Binnur Kaya"),
    15: dict(kind="meme", text="TUZ KAHVEDE DEĞİL, AİLELER ARASINDA ☕🧂"),
    17: dict(kind="chip", text="⭐ Nurgül Yeşilçay · Bülent İnal"),
    18: dict(kind="chip", text="🍞 Koca ekmek almaya çıktı… ve dönmedi"),
    19: dict(kind="meme", text="EKMEK ALMAYA ÇIKAN TELEFONUNU ALSIN! 📱"),
    21: dict(kind="chip", text="⭐ Murat Ünalmış · Özge Özacar · Kapadokya"),
    22: dict(kind="chip", text="🔥 Haftalık Top 10'da 3. sıra · Yeni diziler arasında lider"),
    23: dict(kind="meme", text="BALONLAR UÇUYOR, REYTİNGLER UÇUYOR 🎈"),
    25: dict(kind="meme", text="FİNAL KARARI FRAGMANDAN HIZLI ⚡"),
    27: dict(kind="chip", text="⚰️ Haysiyet · Kanal D · 13. bölümde veda"),
    28: dict(kind="meme", text="BİR DİZİ BİTER, YENİSİ BAŞLAR 😅"),
    30: dict(kind="center", text="SİZİN FAVORİNİZ HANGİSİ? 💬", small="Yorumlara yazın, en komiği bir sonraki videoda!"),
}
sub26 = [dict(kind="chip", text="⚰️ Aşk ve Taht · ATV"), dict(kind="chip", text="⚰️ Mercan Köşk · ATV · 7 bölüm"),
         dict(kind="chip", text="⚰️ Sevdam Karadeniz · NOW")]
spec = [dict(id=k, **v) for k, v in bars.items()] + [dict(id=f"cap{i}", **v) for i, v in caps.items()] + \
       [dict(id=f"cap26_{j}", **v) for j, v in enumerate(sub26)]
json.dump(spec, open(os.path.join(B, "ov.json"), "w"), ensure_ascii=False)
OV = os.path.join(B, "ov")
if not os.path.exists(os.path.join(OV, "stamp.png")):
    env = dict(os.environ, NODE_PATH=subprocess.check_output(["npm", "root", "-g"], text=True).strip())
    subprocess.run(["node", "/home/user/Diziler/videos/build/overlays.js", os.path.join(B, "ov.json"), OV], check=True, env=env)

# ---------- timeline ----------
def fsec(parts, bar, caps_, gray=False, stamp=False):
    return dict(type="footage", parts=parts, bar=bar, caps=caps_, gray=gray, stamp=stamp)
def cap(i, oid=None, s=None, e=None):
    a, b = span(i)
    return (s if s is not None else a + .25, e if e is not None else b - .1, oid or f"cap{i}")

tl = [dict(type="card", name="intro")]
tl.append(fsec([(span(1)[0], span(1)[1], TOP, False), (span(2)[0], span(2)[1], DEAD + TOP[:3], False), (span(3)[0], span(3)[1], TOP, False)],
               "bar_top", [cap(1), cap(2), cap(3)]))
blocks = [(4, "rank5", "gunes", "bar5"), (8, "rank4", "anne", "bar4"), (12, "rank3", "tuzlu", "bar3"),
          (16, "rank2", "omur", "bar2"), (20, "rank1", "sevdan", "bar1")]
for k, (i0, card, key, bar) in enumerate(blocks):
    tl.append(dict(type="card", name=card))
    segs = [i0 + 1, i0 + 2, i0 + 3]
    tl.append(fsec([(span(segs[0])[0], span(segs[-1])[1], P[key], False)], bar, [cap(j) for j in segs]))
tl.append(dict(type="card", name="grave"))
s26, e26 = span(26); th = (e26 - s26) / 3
parts = [(span(25)[0], span(25)[1], DEAD, True)] + [(s26 + j * th, s26 + (j + 1) * th, [d], True) for j, d in enumerate(DEAD[:3])] + \
        [(span(27)[0], span(27)[1], ["haysiyet"], True), (span(28)[0], span(28)[1], DEAD, True)]
tl.append(fsec(parts, "bar_dead", [cap(25)] + [(s26 + j * th + .2, s26 + (j + 1) * th - .1, f"cap26_{j}") for j in range(3)] + [cap(27), cap(28)],
               gray=True, stamp=True))
s29, e29 = span(29)
tl.append(fsec([(s29, CARDS["soon"]["start"], ["susuz"], False)], "bar_soon", []))
tl.append(dict(type="card", name="soon"))
tl.append(fsec([(span(30)[0], span(30)[1], TOP, False)], "bar_top", [cap(30)]))
tl.append(dict(type="card", name="end"))

# ---------- shot picker ----------
cursor = {}
def windows(name):
    """Yield usable (start, length) windows from a trailer, splitting long shots."""
    out = []
    for a, b in SHOTS.get(name, []):
        L = b - a
        if L >= 5.6:
            k = int(L // 2.8)
            out += [(a + j * L / k, L / k) for j in range(k)]
        else:
            out.append((a, L))
    return out
WIN = {n: windows(n) for n in set(TOP + DEAD + ["susuz"])}
if not WIN["susuz"]:
    WIN["susuz"] = [(5 + j * 3.0, 3.0) for j in range(20)]
def pick(pool, d, k):
    for tries in range(len(pool)):
        n = pool[(k + tries) % len(pool)]
        ws = WIN[n]; c = cursor.get(n, 0)
        for off in range(len(ws)):
            a, L = ws[(c + off) % len(ws)]
            if L >= d - 0.05:
                cursor[n] = c + off + 1
                return n, a
    n = pool[k % len(pool)]; ws = WIN[n]; a, L = ws[cursor.get(n, 0) % len(ws)]; cursor[n] = cursor.get(n, 0) + 1
    return n, a   # shot shorter than needed: runs a bit into the next cut

TRANS = ["fade", "smoothleft", "circleopen", "slideup", "dissolve", "smoothright", "zoomin", "wipeleft", "radial", "smoothup"]

def shot_clip(src, a, d, gray, idx, out):
    w0, w1 = (2342, 2480) if idx % 2 == 0 else (2480, 2342)
    vf = (f"scale=w='trunc(({w0}+({w1}-{w0})*t/{d:.3f})/2)*2':h=-2:eval=frame:flags=bicubic,crop=1920:1080,"
          + ("hue=s=0,eq=contrast=1.12:brightness=-0.03," if gray else "eq=contrast=1.06:saturation=1.12,")
          + "vignette=PI/5,fps=30,setsar=1,format=yuv420p")
    run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{a:.3f}", "-t", f"{d + 0.05:.3f}", "-i", src, "-an", "-vf", vf,
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-r", "30", out])

def build_footage(sec, idx):
    out = os.path.join(B, f"sec{idx:02d}.mp4")
    if os.path.exists(out): return out
    s0, e0 = sec["parts"][0][0], sec["parts"][-1][1]; L = e0 - s0
    clips = []
    k = 0
    for (ps, pe, pool, gray) in sec["parts"]:
        Lp = pe - ps; n = max(1, round(Lp / 2.7)); d = (Lp + n * X) / n
        for j in range(n):
            name, a = pick(pool, d, k)
            c = os.path.join(B, f"s{idx:02d}_{k:02d}.mp4")
            shot_clip(os.path.join(SCR, "clips", name + ".mp4"), a, d, gray, k, c)
            clips.append((c, d)); k += 1
    inp, fc = [], []
    for c, d in clips: inp += ["-i", c]
    last = "[0:v]"; acc = clips[0][1]
    for j in range(1, len(clips)):
        off = acc - X
        fc.append(f"{last}[{j}:v]xfade=transition={TRANS[(idx + j) % len(TRANS)]}:duration={X}:offset={off:.3f}[x{j}]")
        last = f"[x{j}]"; acc = off + clips[j][1]
    ni = len(clips)
    # overlays
    ovs = [(0.0, L + 1, sec["bar"], True)]
    if sec["stamp"]: ovs.append((0.6, L + 1, "stamp", True))
    ovs += [(a - s0, b - s0, oid, False) for a, b, oid in sec["caps"]]
    for m, (a, b, oid, persist) in enumerate(ovs):
        inp += ["-loop", "1", "-t", f"{L + 1:.3f}", "-i", os.path.join(OV, oid + ".png")]
        f = f"[{ni + m}:v]format=rgba,fade=in:st={max(0, a):.3f}:d=0.35:alpha=1"
        if not persist: f += f",fade=out:st={b - 0.3:.3f}:d=0.3:alpha=1"
        fc.append(f + f"[o{m}]")
        fc.append(f"{last}[o{m}]overlay=0:0:format=auto[v{m}]"); last = f"[v{m}]"
    fc.append(f"{last}fade=in:st=0:d=0.25:color=white,trim=duration={L:.3f},setpts=PTS-STARTPTS,format=yuv420p[vout]")
    run(["ffmpeg", "-y", "-loglevel", "error", *inp, "-filter_complex", ";".join(fc), "-map", "[vout]",
         "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-r", "30", out])
    return out

parts_out = []
for idx, sec in enumerate(tl):
    if sec["type"] == "card":
        parts_out.append((os.path.join(SCR, "cards", sec["name"] + ".mp4"), CARDS[sec["name"]]["start"], CARDS[sec["name"]]["end"]))
    else:
        print("footage", idx, flush=True)
        parts_out.append((build_footage(sec, idx), sec["parts"][0][0], sec["parts"][-1][1]))
# sanity: contiguous timeline
for (f1, s1, e1), (f2, s2, e2) in zip(parts_out, parts_out[1:]):
    assert abs(e1 - s2) < 0.02, (f1, e1, f2, s2)
TOTAL = parts_out[-1][2]

# ---------- audio ----------
SR = 48000
def load(path):
    raw = subprocess.check_output(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"])
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
N = int(TOTAL * SR) + SR
voice = np.zeros((N, 2), np.float32); v = load(os.path.join(VID, "voiceover.wav")); voice[:len(v)] = v[:N]
def track(name, start, end, offset=0.0):
    m = load(os.path.join(SCR, "music", name)); seg_ = np.zeros((N, 2), np.float32)
    i0, i1, o = int(start * SR), int(end * SR), int(offset * SR)
    need = i1 - i0; src = np.concatenate([m[o:]] + [m] * 3)[:need]
    fade = int(1.2 * SR); env = np.ones(need, np.float32); env[:fade] = np.linspace(0, 1, fade); env[-fade:] = np.linspace(1, 0, fade)
    seg_[i0:i1] = src * env[:, None]; return seg_
g0 = CARDS["grave"]["start"]; s0 = CARDS["soon"]["start"] - 6.5
music = track("Local_Forecast_-_Elevator.mp3", 0, g0 + 0.6) + track("Fluffing_a_Duck.mp3", g0, s0 + 0.6, 2.0) + \
        track("Local_Forecast_-_Elevator.mp3", s0, TOTAL, 40.0)
# ducking: music loud when voice silent
mono = np.abs(voice.mean(1)); win = int(0.05 * SR)
envv = np.convolve(mono, np.ones(win) / win, "same"); active = (envv > 0.01).astype(np.float32)
sm = int(0.25 * SR); active = np.convolve(active, np.ones(sm) / sm, "same")
gain = 0.30 - 0.21 * np.clip(active * 1.5, 0, 1)
music *= gain[:, None]
# sfx
rng = np.random.default_rng(1); sfx = np.zeros((N, 2), np.float32)
def put(sig, t):
    i = int(t * SR); j = min(N, i + len(sig)); sfx[i:j] += sig[: j - i, None]
def whoosh(d=0.7):
    n = int(d * SR); x = rng.standard_normal(n).astype(np.float32)
    from scipy.signal import butter, sosfilt
    out = np.zeros(n, np.float32); steps = 24
    for k in range(steps):
        f = 300 + 5000 * (k / steps) ** 1.5; sos = butter(2, [f * .7, f * 1.3], "bandpass", fs=SR, output="sos")
        a, b = k * n // steps, (k + 1) * n // steps; out[a:b] = sosfilt(sos, x[a:b])
    env = np.sin(np.linspace(0, np.pi, n)) ** 2; return (out * env / (np.abs(out).max() + 1e-9) * 0.35).astype(np.float32)
def boom(d=0.9):
    t = np.arange(int(d * SR)) / SR; f = 90 * np.exp(-t * 4) + 40
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5) * 0.5).astype(np.float32)
def pop():
    t = np.arange(int(0.12 * SR)) / SR
    return (np.sin(2 * np.pi * (900 - 2500 * t) * t) * np.exp(-t * 35) * 0.3).astype(np.float32)
for name, c in CARDS.items():
    put(whoosh(), max(0, c["start"] - 0.15))
    if name.startswith("rank") or name == "intro": put(boom(), c["start"] + 0.9)
for sec in tl:
    if sec["type"] == "footage":
        put(whoosh(0.45) * 0.5, sec["parts"][0][0])
        for a, b, oid in sec["caps"]:
            put(pop(), a)
mix = voice * 1.0 + music + sfx
mix = mix[: int(TOTAL * SR)]
mix /= max(1.0, np.abs(mix).max() / 0.97)
sf.write(os.path.join(B, "mix.wav"), mix, SR)

# ---------- final ----------
lst = os.path.join(B, "concat.txt")
open(lst, "w").write("".join(f"file '{f}'\n" for f, _, _ in parts_out))
final = os.path.join(VID, "DiziVizyon_Top5_Yeni_Diziler.mp4")
inp = []
for f, _, _ in parts_out: inp += ["-i", f]
n = len(parts_out)
FR = [round(e * FPS) - round(s * FPS) for _, s, e in parts_out]   # exact frame budget per part (no drift)
fc = "".join(f"[{i}:v]fps=30,scale=1920:1080,setsar=1,format=yuv420p,tpad=stop_mode=clone:stop_duration=1,"
             f"trim=end_frame={FR[i]},setpts=PTS-STARTPTS[c{i}];" for i in range(n)) + \
     "".join(f"[c{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0[v]"
run(["ffmpeg", "-y", "-loglevel", "error", *inp, "-i", os.path.join(B, "mix.wav"), "-filter_complex", fc,
     "-map", "[v]", "-map", f"{n}:a", "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
     "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", final])
print("FINAL", final, round(TOTAL, 2))
