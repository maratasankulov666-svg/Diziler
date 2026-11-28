"""Тестовое видео «What If It Rained for 10 Years?»: кадры кодом, затем ffmpeg.
Вход: b*.png (фоны), timeline.json + narration.wav (озвучка Qwen3-TTS с таймингами Whisper)."""
import sys, json, math, random, subprocess
sys.path.insert(0, "/home/user/Diziler/survival/engine")
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
from stickman import draw_hero

W, H, FPS = 1920, 1080, 30
OFF = 0.3          # озвучка стартует с 0.3 с
TAIL = 2.2         # финальная плашка
TL = json.load(open("timeline.json"))
F_HUD = ImageFont.truetype("/usr/share/fonts/opentype/inter/InterDisplay-Black.otf", 54)
F_HUD_S = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf", 26)
F_CAP = ImageFont.truetype("/usr/share/fonts/opentype/inter/InterDisplay-Black.otf", 64)
F_END = ImageFont.truetype("/usr/share/fonts/opentype/inter/InterDisplay-Black.otf", 96)

# --- кадры (shots) ---
SHOTS = [
 dict(bg="b1_street", day=1, water=0, rain=0.35, zoom=(1.00, 1.08), focus=(0.42, 0.62),
      hero=dict(x=780, y=930, h=430, pose="stand", face="neutral", look=1), face2=(3.2, "happy")),
 dict(bg="b2_flooded", day=30, water=4, rain=0.8, zoom=(1.06, 1.0), focus=(0.5, 0.6), wade=True,
      hero=dict(x=560, y=1000, h=420, pose="walk", face="worried", look=1), walk=(560, 980)),
 dict(bg="b3_market", day=100, water=6, rain=0, zoom=(1.0, 1.10), focus=(0.5, 0.55), night=True,
      hero=dict(x=900, y=1000, h=460, pose="carry", face="determined", look=1), face2=(3.0, "scared"), others=3.2),
 dict(bg="b4_roof", day=300, water=30, rain=0.9, zoom=(1.08, 1.0), focus=(0.3, 0.7),
      hero=dict(x=640, y=1000, h=400, pose="stand", face="worried", look=1)),
 dict(bg="b5_night", day=300, water=30, rain=1.0, zoom=(1.0, 1.10), focus=(0.55, 0.62), blink=(1430, 560),
      hero=dict(x=600, y=960, h=380, pose="point", face="scared", look=1), face2=(2.5, "worried")),
]
# границы кадров по озвучке
for i, s in enumerate(SHOTS):
    s["t0"] = 0 if i == 0 else TL[i]["start"] + OFF - 0.15
    s["t1"] = TL[i + 1]["start"] + OFF - 0.15 if i + 1 < len(TL) else TL[-1]["end"] + OFF + TAIL
    s["base"] = Image.open(s["bg"] + ".png").convert("RGB").resize((W, H), Image.LANCZOS)
    if s.get("night"):
        b = ImageEnhance.Brightness(s["base"]).enhance(0.55)
        blue = Image.new("RGB", (W, H), (20, 40, 90))
        s["base"] = Image.blend(b, blue, 0.25)
TOTAL = SHOTS[-1]["t1"]

# --- субтитры: фразы по словам Whisper ---
phrases = []
for l in TL:
    cur = []
    for w in l["words"]:
        cur.append(w)
        if w["w"][-1] in ".,?!" or len(cur) >= 5:
            phrases.append((cur[0]["s"] + OFF, cur[-1]["e"] + OFF + 0.12, " ".join(x["w"] for x in cur)))
            cur = []
    if cur: phrases.append((cur[0]["s"] + OFF, cur[-1]["e"] + OFF + 0.12, " ".join(x["w"] for x in cur)))

# --- дождь: 12 заранее нарисованных слоёв ---
rnd = random.Random(3)
DROPS = [(rnd.uniform(0, W), rnd.uniform(0, H), rnd.uniform(30, 70), rnd.uniform(0.5, 1)) for _ in range(700)]
def rain_layer(t, k):
    L = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    n = int(len(DROPS) * k)
    for x, y, ln, sp in DROPS[:n]:
        yy = (y + t * 1900 * sp) % (H + 100) - 50; xx = (x - t * 260 * sp) % W
        d.line([(xx, yy), (xx - ln * 0.16, yy + ln)], fill=(210, 225, 240, int(110 * sp)), width=2)
    return L

def ease(a): return a * a * (3 - 2 * a)

def hud(img, day, water, t_in):
    a = min(1, t_in / 0.8); d = ImageDraw.Draw(img)
    x, y = 60, 50
    box = Image.new("RGBA", (470, 150), (10, 14, 20, 150)); img.alpha_composite(box, (x - 24, y - 20))
    d.text((x, y), "DAY", font=F_HUD_S, fill=(200, 210, 220))
    d.text((x, y + 24), f"{int(round(day))}", font=F_HUD, fill=(255, 214, 90))
    d.text((x + 230, y), "WATER LEVEL", font=F_HUD_S, fill=(200, 210, 220))
    d.text((x + 230, y + 24), f"{water:.0f} FT", font=F_HUD, fill=(120, 200, 255))

def caption(img, t):
    for s, e, txt in phrases:
        if s <= t <= e:
            d = ImageDraw.Draw(img); tw = d.textlength(txt, font=F_CAP)
            d.text(((W - tw) / 2, H - 150), txt, font=F_CAP, fill="white", stroke_width=7, stroke_fill=(10, 10, 12))
            return

prev_day, prev_water = 1, 0
ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                       "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", "video.mp4"], stdin=subprocess.PIPE)
N = int(TOTAL * FPS)
for f in range(N):
    t = f / FPS
    si = max(i for i, s in enumerate(SHOTS) if s["t0"] <= t); s = SHOTS[si]
    lt = t - s["t0"]; dur = s["t1"] - s["t0"]; p = ease(min(1, lt / dur))
    frame = s["base"].convert("RGBA")
    # другие выжившие (силуэты) в магазине
    if s.get("others") and lt > s["others"]:
        a = min(1, (lt - s["others"]) / 0.6)
        for ox in (1300, 1480):
            lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            draw_hero(lay, ox, 760, 230, pose="stand", look=-1, beanie=False, backpack=False, shadow=False, silhouette=(8, 10, 16, 255))
            lay.putalpha(lay.getchannel("A").point(lambda v: int(v * 0.9 * a)))
            frame.alpha_composite(lay)
            ImageDraw.Draw(frame).ellipse([ox - 28, 563, ox - 18, 575], fill=(255, 255, 255, int(255 * a)))
            ImageDraw.Draw(frame).ellipse([ox - 8, 563, ox + 2, 575], fill=(255, 255, 255, int(255 * a)))
    # герой
    hk = dict(s["hero"])
    if s.get("face2") and lt > s["face2"][0]: hk["face"] = s["face2"][1]
    if s.get("walk"):
        hk["x"] = s["walk"][0] + (s["walk"][1] - s["walk"][0]) * min(1, lt / dur)
        hk["pose"] = "walk" if int(lt * 4) % 2 == 0 else "walk2"
        hk["y"] += -6 * abs(math.sin(lt * math.pi * 4))
    else:
        hk["y"] += 3 * math.sin(lt * 2.2)  # дыхание
    draw_hero(frame, **hk)
    if s.get("wade"):  # вода по колено поверх ног
        wl = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(wl)
        top = hk["y"] - hk["h"] * 0.3
        pts = [(x, top + 6 * math.sin(x / 40 + lt * 3)) for x in range(0, W + 20, 20)] + [(W, H), (0, H)]
        d.polygon(pts, fill=(104, 86, 58, 215)); d.line(pts[:-2], fill=(200, 180, 140, 200), width=4)
        frame.alpha_composite(wl)
    if s.get("blink") and (lt % 0.9) < 0.5 and lt > 2.0:
        gx, gy = s["blink"]; g = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(g)
        d.ellipse([gx - 60, gy - 60, gx + 60, gy + 60], fill=(255, 220, 120, 170))
        frame.alpha_composite(g.filter(ImageFilter.GaussianBlur(18)))
        ImageDraw.Draw(frame).ellipse([gx - 10, gy - 10, gx + 10, gy + 10], fill=(255, 240, 190, 255))
    if s.get("night"):  # мерцание ламп
        if int(lt * 7) % 11 == 0: frame.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, 60)))
    # камера: медленный наезд/отъезд
    z = s["zoom"][0] + (s["zoom"][1] - s["zoom"][0]) * p
    cw, ch = W / z, H / z; fx, fy = s["focus"]
    x0 = min(max(fx * W - cw / 2, 0), W - cw); y0 = min(max(fy * H - ch / 2, 0), H - ch)
    frame = frame.resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + cw, y0 + ch))
    if s["rain"]: frame.alpha_composite(rain_layer(t, s["rain"]))
    # HUD со счётом дней
    tin = lt; k = ease(min(1, tin / 0.8)); pd = SHOTS[si - 1] if si else s
    hud(frame, pd["day"] + (s["day"] - pd["day"]) * k, pd["water"] + (s["water"] - pd["water"]) * k, tin)
    caption(frame, t)
    # финал
    end_t = TL[-1]["end"] + OFF + 0.2
    if t > end_t:
        a = min(1, (t - end_t) / 0.5)
        frame.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, int(170 * a))))
        d = ImageDraw.Draw(frame); txt = "HOW LONG WOULD YOU SURVIVE?"
        tw = d.textlength(txt, font=F_END)
        d.text(((W - tw) / 2, H / 2 - 60), txt, font=F_END, fill=(255, 214, 90, int(255 * a)), stroke_width=8, stroke_fill=(0, 0, 0, int(255 * a)))
    # затемнение в начале
    if t < 0.4: frame.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, int(255 * (1 - t / 0.4)))))
    ff.stdin.write(frame.convert("RGB").tobytes())
    if f % 150 == 0: print("frame", f, "/", N, flush=True)
ff.stdin.close(); ff.wait()
json.dump({"total": TOTAL, "shots": [[s["bg"], round(s["t0"], 2), round(s["t1"], 2)] for s in SHOTS]}, open("render_info.json", "w"))
print("done", round(TOTAL, 2))
