"""Voice a segments.py script with VoxCPM2 in the channel host voice.

Each segment is checked with Whisper; if the transcript differs too much from the
script it is regenerated (up to MAX_TRIES). Segments are cached, so a rerun only
redoes missing ones (delete seg_XX.wav to force a redo).

usage: python voiceover.py <video_dir> <reference_voice.wav>
"""
import difflib, importlib.util, json, os, re, sys, time
import numpy as np, scipy.signal as ss, soundfile as sf
from faster_whisper import WhisperModel
from voxcpm import VoxCPM

vdir, ref = sys.argv[1], sys.argv[2]
spec = importlib.util.spec_from_file_location("segments", os.path.join(vdir, "segments.py"))
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
SEG = mod.SEGMENTS
cache = os.path.join(vdir, "segs"); os.makedirs(cache, exist_ok=True)
MAX_TRIES, THRESH = 3, 0.88

tts = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False, device="cpu", optimize=False)
SR = tts.tts_model.sample_rate
asr = WhisperModel("small", device="cpu", compute_type="int8")

def norm(s):
    s = s.lower().replace("i̇", "i")
    return re.sub(r"[^a-zçğıöşü ]", "", re.sub(r"\s+", " ", s)).replace(" ", "")

def check(w):
    a = ss.resample_poly(w, 16000, SR).astype(np.float32)
    segs, _ = asr.transcribe(a, language="tr")
    return " ".join(x.text for x in segs).strip()

report = []
for i, (block, style, text, pause) in enumerate(SEG):
    path = os.path.join(cache, f"seg_{i:02d}.wav")
    if os.path.exists(path):
        continue
    best = None
    for t in range(MAX_TRIES):
        t0 = time.time()
        w = tts.generate(text=f"({style}){text}", reference_wav_path=ref, cfg_value=2.0, inference_timesteps=10)
        w = w / (np.abs(w).max() + 1e-9) * 0.9
        heard = check(w)
        score = difflib.SequenceMatcher(None, norm(text), norm(heard)).ratio()
        print(f"[{i:02d}] try{t+1} score={score:.2f} {time.time()-t0:.0f}s | {heard}", flush=True)
        if best is None or score > best[0]:
            best = (score, w, heard)
        if score >= THRESH:
            break
    sf.write(path, best[1], SR)
    report.append({"i": i, "score": round(best[0], 3), "heard": best[2]})

# assemble + timing sheet for editing
out, t, marks = [np.zeros(int(0.3 * SR))], 0.3, []
for i, (block, style, text, pause) in enumerate(SEG):
    w, _ = sf.read(os.path.join(cache, f"seg_{i:02d}.wav"))
    marks.append({"i": i, "block": block, "start": round(t, 2), "end": round(t + len(w) / SR, 2), "text": text})
    out += [w, np.zeros(int(pause * SR))]; t += len(w) / SR + pause
full = np.concatenate(out)
sf.write(os.path.join(vdir, "voiceover.wav"), full, SR)
json.dump(marks, open(os.path.join(vdir, "timing.json"), "w"), ensure_ascii=False, indent=1)
if report:
    json.dump(report, open(os.path.join(vdir, "asr_report.json"), "w"), ensure_ascii=False, indent=1)
print("DONE total sec", round(len(full) / SR, 1))
