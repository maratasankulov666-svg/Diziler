"""Cold open: key moments of a trailer WITH original sound, full-screen, Turkish subtitles, channel chip.

usage: python fragman_intro.py <spec.json> <out.mp4>
spec = {"src": "trailer.mp4", "chip": "75. BÖLÜM 1. FRAGMANI",
        "moments": [[start, end, "subtitle text"], ...]}
Zoom 1.22 hides the broadcaster logo (top-left); a dark lower band covers the channel's on-screen text.
Each moment gets 80 ms audio fades so cuts don't click. Keep the total to 30-40 s (rest of the video
is our own commentary).
"""
import json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

spec = json.load(open(sys.argv[1])); out = sys.argv[2]
FONT = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
tmp = tempfile.mkdtemp()

# overlay: red chip top-left + lower dark band + small brand bottom-right
ov = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
for y in range(780, 1080):   # gradient band
    a = int(min(1, (y - 780) / 160) * 200); d.line([(0, y), (1920, y)], fill=(0, 0, 0, a))
f = ImageFont.truetype(FONT, 46); chip = "●  " + spec["chip"]
w = d.textlength(chip, font=f)
d.rounded_rectangle([40, 40, 40 + w + 56, 40 + 82], 18, fill=(227, 20, 45, 235))
d.text((40 + 28, 40 + 14), chip, font=f, fill="white")
fb = ImageFont.truetype(FONT, 34)
d.text((1880 - d.textlength("DiziVizyon", font=fb), 1020), "DiziVizyon", font=fb, fill=(255, 181, 71, 230))
ovp = os.path.join(tmp, "ov.png"); ov.save(ovp)

def esc(t):
    return t.replace("\\", "\\\\").replace(":", "\\:").replace("'", "’").replace("%", "\\%")

parts = []
for i, (a, b, text) in enumerate(spec["moments"]):
    d_ = b - a; p = os.path.join(tmp, f"m{i:02d}.mp4")
    vf = ("[0:v]scale=2342:-2,crop=1920:1080,eq=contrast=1.05:saturation=1.1,setsar=1,split[va][vb];"
          "[vb]crop=760:230:0:850,boxblur=28:3[bl];[va][bl]overlay=0:850[v0];[v0][1:v]overlay=0:0[v1];"
          f"[v1]drawtext=fontfile={FONT}:text='{esc(text)}':fontsize=58:fontcolor=white:borderw=4:bordercolor=black@0.85:"
          "x=(w-text_w)/2:y=h-150,fps=30,format=yuv420p[v]")
    af = f"afade=t=in:d=0.08,afade=t=out:st={max(0, d_ - 0.1):.3f}:d=0.1,aresample=48000"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{a:.3f}", "-t", f"{d_:.3f}", "-i", spec["src"],
                    "-loop", "1", "-t", f"{d_:.3f}", "-i", ovp, "-filter_complex", vf, "-map", "[v]", "-map", "0:a",
                    "-af", af, "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-r", "30",
                    "-c:a", "aac", "-b:a", "192k", "-ac", "2", p], check=True)
    parts.append(p)
lst = os.path.join(tmp, "l.txt"); open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst,
                "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-r", "30", "-c:a", "aac", "-b:a", "192k",
                "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", out], check=True)
print("intro", out, sum(b - a for a, b, _ in spec["moments"]))
