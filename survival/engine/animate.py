"""Оживление одной картинки (2.5D), всё бесплатно и на CPU.
1) Карта глубины Depth-Anything-V2-Small -> параллакс: ближнее двигается сильнее дальнего.
2) Герой вырезается rembg, «дышит» и чуть покачивается отдельным слоем.
3) Мерцание ламп, пылинки в лунном свете, медленный наезд камеры.

/opt/dizi-venv/bin/python engine/animate.py in.png out.mp4 [секунды]
"""
import sys, subprocess, numpy as np, cv2
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
DUR = float(sys.argv[3]) if len(sys.argv) > 3 else 8.0
FPS, OW, OH = 30, 1280, 720
rng = np.random.default_rng(3)

img = Image.open(src).convert("RGB")
W, H = 1920, 1080                                   # запас под наезд и сдвиг
base = np.array(img.resize((W, H), Image.LANCZOS))

# --- глубина
from transformers import pipeline
dep = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf", device="cpu")
d = np.array(dep(img)["depth"].resize((W, H), Image.BICUBIC)).astype(np.float32)
d = (d - d.min()) / (d.max() - d.min() + 1e-6)       # 1 = близко
d = cv2.GaussianBlur(d, (0, 0), 6)

# --- герой
from rembg import remove, new_session
m = np.array(remove(img, session=new_session("isnet-general-use"), only_mask=True).resize((W, H), Image.BILINEAR)).astype(np.float32) / 255
n, lab, st, _ = cv2.connectedComponentsWithStats((m > 0.5).astype(np.uint8))
if n > 1:  # берём самый крупный объект
    k = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); m = m * (lab == k)
ys, xs = np.nonzero(m > 0.5)
feet = (int(xs.mean()), int(ys.max()))
hero_depth = float(np.median(d[m > 0.5])) if len(ys) else 1.0
hole = cv2.dilate((m > 0.2).astype(np.uint8) * 255, np.ones((25, 25), np.uint8))
bg = cv2.inpaint(base, hole, 9, cv2.INPAINT_TELEA)
hero_rgba = np.dstack([base, (cv2.GaussianBlur(m, (0, 0), 1.2) * 255).astype(np.uint8)])

# --- моргание: ищем два тёмных пятна-глаза на белом лице, рисуем закрытые глаза
blink = None
if len(ys):
    top, bot = ys.min(), ys.max()
    face = (m > 0.5) & (np.arange(H)[:, None] < top + (bot - top) * 0.6)
    dark = (face & (base.max(axis=2) < 70)).astype(np.uint8)
    k_, lab_, st_, cen_ = cv2.connectedComponentsWithStats(dark)
    cand = [j for j in range(1, k_) if 30 < st_[j, cv2.CC_STAT_AREA] < 2500
            and st_[j, cv2.CC_STAT_HEIGHT] > st_[j, cv2.CC_STAT_WIDTH] * 0.8]
    pairs = [(a_, b_) for a_ in cand for b_ in cand if a_ < b_ and abs(cen_[a_][1] - cen_[b_][1]) < 25
             and 15 < abs(cen_[a_][0] - cen_[b_][0]) < 200]
    if pairs:
        a_, b_ = max(pairs, key=lambda q: st_[q[0], cv2.CC_STAT_AREA] + st_[q[1], cv2.CC_STAT_AREA])
        blink = hero_rgba.copy()
        skin = np.median(base[face & (base.min(axis=2) > 200)], axis=0) if (face & (base.min(axis=2) > 200)).any() else (240, 240, 240)
        for j in (a_, b_):
            x_, y_, w_, h_ = st_[j, :4]
            cv2.ellipse(blink, (int(cen_[j][0]), int(cen_[j][1])), (w_ // 2 + 4, h_ // 2 + 4), 0, 0, 360,
                        (*[int(c) for c in skin], 255), -1, cv2.LINE_AA)
            cv2.line(blink, (x_ - 2, int(cen_[j][1] + h_ * 0.15)), (x_ + w_ + 2, int(cen_[j][1] + h_ * 0.15)),
                     (20, 20, 20, 255), max(3, h_ // 6), cv2.LINE_AA)
        print("blink: глаза найдены")
blinks = {int(FPS * s_): 4 for s_ in (1.6, 5.3, 7.1)}

# --- лампы (яркие пятна в верхней половине) для мерцания
hsv = cv2.cvtColor(base, cv2.COLOR_RGB2HSV)
lamps = ((hsv[..., 2] > 235) & (np.arange(H)[:, None] < H * 0.45)).astype(np.float32)
lamps = cv2.GaussianBlur(cv2.dilate(lamps, np.ones((15, 15))), (0, 0), 12)[..., None]

# --- пылинки
P = 70
px, py = rng.uniform(0, W, P), rng.uniform(0, H, P)
pr, pv = rng.uniform(1.5, 4, P), rng.uniform(4, 14, P)

gx, gy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
N = int(DUR * FPS)
ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{OW}x{OH}",
                       "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", out],
                      stdin=subprocess.PIPE)
for i in range(N):
    t = i / FPS; u = i / max(N - 1, 1)
    ease = 0.5 - 0.5 * np.cos(np.pi * u)
    cam = (ease - 0.5) * 60                              # сдвиг камеры, px на ближнем плане
    shift = (cam * d).astype(np.float32)
    frame = cv2.remap(bg, gx - shift, gy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

    # герой: дыхание + покачивание, сдвиг по своей глубине
    sy = 1 + 0.012 * np.sin(2 * np.pi * t / 3.2)
    ang = 0.7 * np.sin(2 * np.pi * t / 5.0)
    M = cv2.getRotationMatrix2D(feet, ang, 1.0)
    M[1] *= [1, sy, 1]; M[1, 2] += feet[1] * (1 - sy)   # растяжение по вертикали от ног
    M[0, 2] += cam * hero_depth
    src_h = hero_rgba
    if blink is not None and any(0 <= i - b0 < n0 for b0, n0 in blinks.items()):
        src_h = blink
    hr = cv2.warpAffine(src_h, M, (W, H), flags=cv2.INTER_LINEAR, borderValue=0)
    a = hr[..., 3:4].astype(np.float32) / 255
    frame = (frame * (1 - a) + hr[..., :3] * a)

    # мерцание ламп
    fl = 1.0 + (0.35 if rng.random() < 0.06 else 0.0) * rng.uniform(-1, 1)
    frame = frame * (1 + (fl - 1) * lamps * 0.8)

    # пылинки
    ov = np.zeros((H, W), np.float32)
    for k in range(P):
        x = (px[k] + 8 * np.sin(t * 0.6 + k)) % W; y = (py[k] + pv[k] * t) % H
        cv2.circle(ov, (int(x), int(y)), int(pr[k]), 1.0, -1, cv2.LINE_AA)
    ov = cv2.GaussianBlur(ov, (0, 0), 1.5)[..., None]
    frame = frame + ov * 70 * (0.4 + 0.6 * d[..., None])

    # медленный наезд и кадрирование в 1280x720
    z = 1.0 + 0.06 * ease
    cw, ch = W / z, H / z
    x0, y0 = (W - cw) / 2, (H - ch) / 2
    crop = cv2.resize(np.clip(frame, 0, 255).astype(np.uint8)[int(y0):int(y0 + ch), int(x0):int(x0 + cw)], (OW, OH),
                      interpolation=cv2.INTER_AREA)
    ff.stdin.write(crop.tobytes())
ff.stdin.close(); ff.wait()
cv2.imwrite(out.replace(".mp4", "_depth.jpg"), (d * 255).astype(np.uint8))
cv2.imwrite(out.replace(".mp4", "_mask.jpg"), (m * 255).astype(np.uint8))
print("ok", out)
