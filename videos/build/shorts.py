"""Build a vertical YouTube Short (1080x1920) from a voiced segments.py + footage pools.

usage: python3 shorts.py <scratch_dir> <short_dir>
short_dir: segments.py (block field = footage pool), timing.json, voiceover.wav, short.json (titles/captions/music)
Pools: "name" | "name@a-b" (time range) | several joined with "|".
"""
import importlib.util, json, os, subprocess, sys
import numpy as np, soundfile as sf

SCR, SD = sys.argv[1], sys.argv[2]
cfg = json.load(open(os.path.join(SD, "short.json")))
T = json.load(open(os.path.join(SD, "timing.json")))
spec = importlib.util.spec_from_file_location("s", os.path.join(SD, "segments.py"))
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); SEG = m.SEGMENTS
B = os.path.join(SCR, "short_" + os.path.basename(SD)); os.makedirs(B, exist_ok=True)
SHOTS = {}
for f in ["shots.json", "v2/shots_v2.json"]:
    SHOTS.update(json.load(open(os.path.join(SCR, f))))
CLIPDIR = {"tbd39_end": "v2", "tbd40_fragman": "v2"}
W, H, FPS, SHOT = 1080, 1920, 30, 1.7
FG_Y = 560
def run(c): subprocess.run(c, check=True)

# ---------- overlays ----------
CSS = """html,body{margin:0;background:transparent;font-family:"Inter Display","Inter",Arial,sans-serif;color:#fff;overflow:hidden}
.top{position:absolute;left:0;right:0;top:0;height:560px;display:flex;flex-direction:column;align-items:center;justify-content:center;
 background:linear-gradient(to bottom,rgba(6,7,16,.92),rgba(6,7,16,.55) 75%,rgba(6,7,16,0))}
.kick{font-weight:800;font-size:40px;letter-spacing:.22em;color:#ffb547;margin-bottom:22px}
.big{font-weight:900;font-size:92px;line-height:1.02;text-align:center;padding:0 50px;text-shadow:0 8px 30px rgba(0,0,0,.7)}
.brand{position:absolute;left:0;right:0;bottom:120px;text-align:center;font-weight:900;font-size:46px}
.brand b{color:#ffb547}.brand i{display:inline-block;width:18px;height:18px;border-radius:50%;background:#ff3d3d;margin-right:14px;vertical-align:middle;box-shadow:0 0 16px #ff3d3d}
.cap{position:absolute;left:50px;right:50px;top:1250px;text-align:center}
.cap span{display:inline-block;font-weight:900;font-size:76px;line-height:1.1;color:#ffe14d;-webkit-text-stroke:4px #000;paint-order:stroke fill;text-shadow:0 7px 0 #000}
.cap small{display:block;margin-top:24px;font-weight:800;font-size:50px;color:#fff;-webkit-text-stroke:3px #000;paint-order:stroke fill}"""
def doc(body): return f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body style="width:{W}px;height:{H}px">{body}</body></html>'
ov = [dict(id="frame", w=W, h=H, html=doc(f'<div class="top"><div class="kick">{cfg["kicker"]}</div><div class="big">{cfg["title"]}</div></div>'
                                           f'<div style="position:absolute;left:0;right:0;top:{FG_Y + 608 - 95}px;height:96px;background:linear-gradient(to bottom,rgba(6,7,16,0) 0%,rgba(6,7,16,.97) 50%,rgba(6,7,16,.97) 100%)"></div>'
                                           f'<div class="brand"><i></i>Dizi<b>Vizyon</b> · @DiziiVizyon</div>'))]
for i, c in enumerate(cfg["captions"]):
    main, _, small = c.partition("||")
    ov.append(dict(id=f"cap{i}", w=W, h=H, html=doc(f'<div class="cap"><span>{main}</span>{f"<small>{small}</small>" if small else ""}</div>')))
json.dump(ov, open(os.path.join(B, "ov.json"), "w"), ensure_ascii=False)
env = dict(os.environ, NODE_PATH=subprocess.check_output(["npm", "root", "-g"], text=True).strip())
run(["node", "/home/user/Diziler/videos/build/html_png.js", os.path.join(B, "ov.json"), os.path.join(B, "ov")])

# ---------- shots ----------
def windows(name, a=None, b=None):
    out = []
    for s, e in SHOTS.get(name, []):
        if a is not None and (s < a or e > b): continue
        L = e - s; k = max(1, int(L // SHOT))
        out += [(s + j * L / k, L / k) for j in range(k)]
    if not out and a is not None:
        out = [(a + j * SHOT, SHOT) for j in range(max(1, int((b - a) // SHOT)))]
    return out
cursor = {}
def pick(pool, k, d):
    keys = pool.split("|"); key = keys[k % len(keys)]
    name, _, rng = key.partition("@")
    ws = windows(name, *map(float, rng.split("-"))) if rng else windows(name)
    good = [w for w in ws if w[1] >= d - 0.05] or ws
    c = cursor.get(key, 0); cursor[key] = c + 1
    return name, good[(c * 3) % len(good)][0]   # stride through the trailer for variety

def shot(src, a, d, out, k):
    z0, z1 = (1512, 1590) if k % 2 == 0 else (1590, 1512)
    fc = (f"[0:v]split[a][b];"
          f"[a]scale=-2:{H},crop={W}:{H},boxblur=24:3,eq=brightness=-0.18:saturation=1.15[bg];"
          f"[b]scale=w='trunc(({z0}+({z1}-{z0})*t/{d:.3f})/2)*2':h=-2:eval=frame,crop={W}:608:(iw-{W})/2:ih*0.075,eq=contrast=1.06:saturation=1.12[fg];"
          f"[bg][fg]overlay=0:{FG_Y},fps={FPS},setsar=1,format=yuv420p[v]")
    run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{a:.3f}", "-t", f"{d:.3f}", "-i", src, "-filter_complex", fc,
         "-map", "[v]", "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-r", str(FPS), out])

def bounds(i):
    s = 0.0 if i == 0 else (T[i - 1]["end"] + T[i]["start"]) / 2
    e = (T[i]["end"] + T[i + 1]["start"]) / 2 if i + 1 < len(T) else T[i]["end"] + 1.2
    return s, e
clips, k = [], 0
for i, (pool, _, _, _) in enumerate(SEG):
    s, e = bounds(i); L = e - s; n = max(1, round(L / SHOT)); d = L / n
    for j in range(n):
        name, a = pick(pool, k, d)
        out = os.path.join(B, f"c{k:03d}.mp4")
        shot(os.path.join(SCR, CLIPDIR.get(name, "clips"), name + ".mp4"), a, d, out, k)
        clips.append((out, round(e * FPS) if j == n - 1 else None)); k += 1
TOTAL = bounds(len(SEG) - 1)[1]

# ---------- assemble video ----------
inp = []
for c, _ in clips: inp += ["-i", c]
fc = "".join(f"[{j}:v]" for j in range(len(clips))) + f"concat=n={len(clips)}:v=1:a=0,trim=duration={TOTAL:.3f}[base];"
nf = len(clips)
inp += ["-loop", "1", "-t", f"{TOTAL:.3f}", "-i", os.path.join(B, "ov", "frame.png")]
fc += f"[base][{nf}:v]overlay=0:0[v0];"; last = "[v0]"
for i in range(len(SEG)):
    s, e = bounds(i)
    inp += ["-loop", "1", "-t", f"{TOTAL:.3f}", "-i", os.path.join(B, "ov", f"cap{i}.png")]
    fc += (f"[{nf + 1 + i}:v]format=rgba,fade=in:st={s + 0.05:.3f}:d=0.15:alpha=1,fade=out:st={e - 0.12:.3f}:d=0.12:alpha=1[o{i}];"
           f"{last}[o{i}]overlay=0:0[v{i + 1}];"); last = f"[v{i + 1}]"
fc += f"{last}format=yuv420p[vout]"
silent = os.path.join(B, "video.mp4")
run(["ffmpeg", "-y", "-loglevel", "error", *inp, "-filter_complex", fc, "-map", "[vout]", "-c:v", "libx264",
     "-preset", "medium", "-crf", "19", "-r", str(FPS), silent])

# ---------- audio ----------
SR = 48000; N = int(TOTAL * SR)
def load(p):
    raw = subprocess.check_output(["ffmpeg", "-loglevel", "error", "-i", p, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"])
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
voice = np.zeros((N, 2), np.float32); v = load(os.path.join(SD, "voiceover.wav"))[:N]; voice[:len(v)] = v
mus = load(os.path.join(SCR, "music", cfg["music"]))[int(cfg.get("music_offset", 0) * SR):][:N]
music = np.zeros((N, 2), np.float32); music[:len(mus)] = mus
env = np.convolve(np.abs(voice.mean(1)), np.ones(2400) / 2400, "same") > 0.01
env = np.convolve(env.astype(np.float32), np.ones(12000) / 12000, "same")
music *= (0.28 - 0.2 * np.clip(env * 1.5, 0, 1))[:, None]
fo = int(1.0 * SR); music[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix = voice + music; mix /= max(1.0, np.abs(mix).max() / 0.97)
sf.write(os.path.join(B, "mix.wav"), mix, SR)
final = os.path.join(SD, cfg["out"])
run(["ffmpeg", "-y", "-loglevel", "error", "-i", silent, "-i", os.path.join(B, "mix.wav"), "-map", "0:v", "-map", "1:a",
     "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "160k",
     "-shortest", "-movflags", "+faststart", final])
print("SHORT", final, round(TOTAL, 2))
