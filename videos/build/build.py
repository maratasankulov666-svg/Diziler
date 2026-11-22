"""Assemble a DiziVizyon video: 3D cards + footage sections + overlays + mixed audio.

usage: python3 build.py <scratch_dir> <video_dir>
video_dir holds segments.py, timing.json, voiceover.wav and plan.py (pools, overlays, timeline, music).
scratch_dir holds the downloaded clips, shots json, rendered cards and music.
"""
import importlib.util, json, math, os, subprocess, sys
import numpy as np, soundfile as sf

SCR, VID = sys.argv[1], sys.argv[2]
spec_ = importlib.util.spec_from_file_location("plan", os.path.join(VID, "plan.py"))
plan = importlib.util.module_from_spec(spec_); spec_.loader.exec_module(plan)
B = os.path.join(SCR, plan.BUILD_DIR); os.makedirs(B, exist_ok=True)
T = json.load(open(os.path.join(VID, "timing.json")))
SHOTS = {}
for f in plan.SHOTS_FILES: SHOTS.update(json.load(open(os.path.join(SCR, f))))
CARDS = json.load(open(os.path.join(SCR, plan.CARDS_DIR, "cards.json")))
X = 0.4          # crossfade between shots
FPS = 30
def run(cmd): subprocess.run(cmd, check=True)

def span(i):
    s = 0.0 if i == 0 else (T[i - 1]["end"] + T[i]["start"]) / 2
    e = (T[i]["end"] + T[i + 1]["start"]) / 2 if i + 1 < len(T) else T[i]["end"]
    return round(s, 3), round(e, 3)
def fsec(parts, bar, caps_, gray=False, stamp=False):
    return dict(type="footage", parts=parts, bar=bar, caps=caps_, gray=gray, stamp=stamp)
def cap(i, oid=None, s=None, e=None):
    a, b = span(i)
    return (s if s is not None else a + .25, e if e is not None else b - .1, oid or f"cap{i}")

bars, caps, extra, tl = plan.layout(span, cap, fsec, CARDS, SHOTS)
spec = [dict(id=k, **v) for k, v in bars.items()] + [dict(id=f"cap{i}", **v) for i, v in caps.items()] + \
       [dict(id=k, **v) for k, v in extra.items()]
json.dump(spec, open(os.path.join(B, "ov.json"), "w"), ensure_ascii=False)
OV = os.path.join(B, "ov")
if not os.path.exists(os.path.join(OV, ".done")):
    env = dict(os.environ, NODE_PATH=subprocess.check_output(["npm", "root", "-g"], text=True).strip())
    subprocess.run(["node", "/home/user/Diziler/videos/build/overlays.js", os.path.join(B, "ov.json"), OV], check=True, env=env)
    open(os.path.join(OV, ".done"), "w").close()

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
def windows_in(key):
    """'name' -> all windows; 'name@a-b' -> windows inside [a,b] (fixed 2.6s windows if none detected)."""
    if "@" not in key:
        w = windows(key)
        return w or [(5 + j * 3.0, 3.0) for j in range(20)]
    name, rng = key.split("@"); a, b = map(float, rng.split("-"))
    w = [(s, L) for s, L in windows(name) if s >= a and s + L <= b]
    return w or [(a + j * 2.6, 2.6) for j in range(max(1, int((b - a) // 2.6)))]
ALL = {k for sec in tl if sec["type"] == "footage" for p in sec["parts"] for k in p[2]}
WIN = {k: windows_in(k) for k in ALL}
def srcfile(key): return os.path.join(SCR, plan.CLIP_DIRS.get(key.split("@")[0], "clips"), key.split("@")[0] + ".mp4")
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
            shot_clip(srcfile(name), a, d, gray, k, c)
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
        parts_out.append((os.path.join(SCR, plan.CARDS_DIR, sec["name"] + ".mp4"), CARDS[sec["name"]]["start"], CARDS[sec["name"]]["end"]))
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
music = sum(track(*m) for m in plan.music(CARDS, TOTAL))
# ducking: music loud when voice silent
mono = np.abs(voice.mean(1)); win = int(0.05 * SR)
envv = np.convolve(mono, np.ones(win) / win, "same"); active = (envv > 0.01).astype(np.float32)
sm = int(0.25 * SR); active = np.convolve(active, np.ones(sm) / sm, "same")
gain = plan.MUSIC_LOUD - (plan.MUSIC_LOUD - plan.MUSIC_DUCK) * np.clip(active * 1.5, 0, 1)
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
final = os.path.join(VID, plan.FINAL)
inp = []
for f, _, _ in parts_out: inp += ["-i", f]
n = len(parts_out)
FR = [round(e * FPS) - round(s * FPS) for _, s, e in parts_out]   # exact frame budget per part (no drift)
fc = "".join(f"[{i}:v]fps=30,scale=1920:1080,setsar=1,format=yuv420p,tpad=stop_mode=clone:stop_duration=1,"
             f"trim=end_frame={FR[i]},setpts=PTS-STARTPTS[c{i}];" for i in range(n)) + \
     "".join(f"[c{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0[v]"
run(["ffmpeg", "-y", "-loglevel", "error", *inp, "-i", os.path.join(B, "mix.wav"), "-filter_complex", fc,
     "-map", "[v]", "-map", f"{n}:a", "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
     "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", final])
print("FINAL", final, round(TOTAL, 2))
