"""Write one HTML per animated card (CFG injected) and optionally snapshot test stills.

usage: python cards.py <timing.json> <outdir> [--stills]
"""
import json, os, sys

timing = json.load(open(sys.argv[1]))
out = sys.argv[2]; os.makedirs(out, exist_ok=True)
tpl = open(os.path.join(os.path.dirname(__file__), "card.html"), encoding="utf-8").read()

def span(i, tail=0.0):
    """Card covers segment i plus half of the surrounding pauses."""
    s = 0.0 if i == 0 else (timing[i - 1]["end"] + timing[i]["start"]) / 2
    e = (timing[i]["end"] + timing[i + 1]["start"]) / 2 if i + 1 < len(timing) else timing[i]["end"] + tail
    return round(s, 3), round(e, 3)

RANKS = {
    4: dict(rank=5, title="Güneşin Doğduğu Yer", channel="ATV", kicker="BEŞİNCİ SIRA", note="Burak Özçivit"),
    8: dict(rank=4, title="Anne Yarısı", channel="NOW", kicker="DÖRDÜNCÜ SIRA", note="Burcu Özberk · Cihangir Ceyhan"),
    12: dict(rank=3, title="Tuzlu Kahve", channel="STAR TV", kicker="ÜÇÜNCÜ SIRA", note="Eda Ece · Buğra Gülsoy"),
    16: dict(rank=2, title="Ömür Usta", channel="NOW", kicker="İKİNCİ SIRA", note="Nurgül Yeşilçay · Bülent İnal"),
    20: dict(rank=1, title="Sevdan Bir Ateş", channel="SHOW TV", kicker="BİRİNCİ SIRA", note="Murat Ünalmış · Özge Özacar"),
}
cards = {}
s, e = span(0); cards["intro"] = dict(mode="intro", start=s, end=e, sub="2026–2027 SEZONU · TOP 5 YENİ DİZİ")
for i, c in RANKS.items():
    s, e = span(i); cards[f"rank{c['rank']}"] = dict(mode="rank", start=s, end=e, **c)
s, e = span(24); cards["grave"] = dict(mode="grave", start=s, end=e, names=["Aşk ve Taht", "Mercan Köşk", "Sevdam Karadeniz", "Haysiyet"])
# "soon" card takes the second part of segment 29 (Hamal has no footage)
s29, e29 = span(29); mid = round(s29 + (e29 - s29) * 0.52, 3)
cards["soon"] = dict(mode="soon", start=mid, end=e29, items=[
    dict(t="SUSUZ YAZ", s="Mert Ramazan Demir|Lizge Cömert", d="ARALIK", c1="#1d3b6b", c2="#0b1330"),
    dict(t="HAMAL", s="Oktay Kaynarca|Fahriye Evcen · Caner Cindoruk", d="ARALIK", c1="#5a1a2a", c2="#170a14")])
s, e = span(31, tail=3.0); cards["end"] = dict(mode="end", start=s, end=e)

for k, c in cards.items():
    c["duration"] = round(c["end"] - c["start"], 3)
    html = tpl.replace("<script src=", f"<script>window.CFG={json.dumps(c, ensure_ascii=False)};</script>\n<script src=", 1)
    open(os.path.join(out, f"{k}.html"), "w", encoding="utf-8").write(html)
json.dump(cards, open(os.path.join(out, "cards.json"), "w"), ensure_ascii=False, indent=1)
print({k: c["duration"] for k, c in cards.items()})

if "--stills" in sys.argv:
    from playwright.sync_api import sync_playwright
    import pathlib
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"])
        pg = b.new_page(viewport={"width": 1920, "height": 1080})
        pg.on("pageerror", lambda e: print("[page error]", e))
        for k, c in cards.items():
            pg.goto(pathlib.Path(out, f"{k}.html").resolve().as_uri(), wait_until="networkidle")
            pg.wait_for_function("window.READY===true")
            t = min(c["duration"] * 0.6, 2.6)
            pg.evaluate("t=>window.renderFrame(t)", t)
            pg.screenshot(path=os.path.join(out, f"still_{k}.jpg"), type="jpeg", quality=70)
        b.close()
