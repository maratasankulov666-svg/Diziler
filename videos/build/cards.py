"""Write one HTML per animated card of a video (card configs come from <video_dir>/plan.py).

usage: python cards.py <video_dir> <outdir>
Then render each with: node render_card.js <outdir>/<name>.html <outdir>/<name>.mp4
"""
import importlib.util, json, os, sys

vid, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
timing = json.load(open(os.path.join(vid, "timing.json")))
spec = importlib.util.spec_from_file_location("plan", os.path.join(vid, "plan.py"))
plan = importlib.util.module_from_spec(spec); spec.loader.exec_module(plan)
tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "card.html"), encoding="utf-8").read()

def span(i, tail=0.0):
    """Card covers segment i plus half of the surrounding pauses."""
    s = 0.0 if i == 0 else (timing[i - 1]["end"] + timing[i]["start"]) / 2
    e = (timing[i]["end"] + timing[i + 1]["start"]) / 2 if i + 1 < len(timing) else timing[i]["end"] + tail
    return round(s, 3), round(e, 3)

cards = plan.cards(span, timing)
for k, c in cards.items():
    c["duration"] = round(c["end"] - c["start"], 3)
    html = tpl.replace("<script src=", f"<script>window.CFG={json.dumps(c, ensure_ascii=False)};</script>\n<script src=", 1)
    open(os.path.join(out, f"{k}.html"), "w", encoding="utf-8").write(html)
json.dump(cards, open(os.path.join(out, "cards.json"), "w"), ensure_ascii=False, indent=1)
print({k: c["duration"] for k, c in cards.items()})
