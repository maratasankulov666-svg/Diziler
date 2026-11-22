"""Voice a segments.py script. Default voice: Ahenk (VoxCPM2 + Turkish LoRA, female, emotional).

Each segment is checked with Whisper; if the transcript differs too much from the
script it is regenerated (up to MAX_TRIES). Segments are cached, so a rerun only
redoes missing ones (delete segs/seg_XX.wav to force a redo).

usage:
  python voiceover.py <video_dir>                       # Ahenk female voice (channel default since 22.11.2026)
  python voiceover.py <video_dir> <reference_voice.wav> # old male host voice (VoxCPM2 voice cloning)

Ahenk: the segment's style text is mapped to one of Ahenk's trained emotions
(surprised, sad, cheerful, laughing, angry, calm, empathetic, or plain). You can also put the
emotion name directly in the style field. Ahenk weights: CC BY 4.0, credit in the video description.
"""
import difflib, importlib.util, json, os, re, sys, time
import numpy as np, scipy.signal as ss, soundfile as sf
from faster_whisper import WhisperModel
from voxcpm import VoxCPM

vdir = sys.argv[1]
ref = sys.argv[2] if len(sys.argv) > 2 else None
spec = importlib.util.spec_from_file_location("segments", os.path.join(vdir, "segments.py"))
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
SEG = mod.SEGMENTS
cache = os.path.join(vdir, "segs"); os.makedirs(cache, exist_ok=True)
MAX_TRIES, THRESH = 3, 0.88

EMOTIONS = ["surprised", "sad", "cheerful", "laughing", "angry", "calm", "empathetic", ""]
KEYWORDS = [  # Turkish style words -> Ahenk emotion (first match wins)
    ("laughing", ["kahkaha", "gülerek konuş"]),
    ("angry", ["kızgın", "öfke", "sinirli"]),
    ("surprised", ["şaşkın", "şaşır", "şok", "inanamı"]),
    ("sad", ["hüzün", "üzgün", "duygusal", "içi burk", "ağla"]),
    ("cheerful", ["esprili", "neşeli", "enerjik", "coşku", "heyecan", "gülümse", "hafif gülerek", "samimi"]),
    ("empathetic", ["şefkat", "teselli", "sıcak"]),
    ("calm", ["sakin", "düşünceli"]),
]
def emotion_of(style):
    s = style.lower()
    if s in EMOTIONS: return s
    for emo, words in KEYWORDS:
        if any(w in s for w in words): return emo
    return ""   # plain reading (ciddi, gergin, gizemli ...)

if ref:
    tts = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False, device="cpu", optimize=False)
    def synth(style, text):
        return tts.generate(text=f"({style}){text}", reference_wav_path=ref, cfg_value=2.0, inference_timesteps=10)
else:
    from huggingface_hub import snapshot_download
    from trnorm import normalize
    from voxcpm.model.voxcpm import LoRAConfig
    d = snapshot_download("ozgurguler/ahenk-tts-tr", allow_patterns=["lora_*", "*.py", "instructions_tr.json", "config.json"])
    sys.path.insert(0, d)
    from instruction_pick import compose, pick
    from pause_clean import clean
    cfg = json.load(open(os.path.join(d, "lora_config.json"), encoding="utf-8"))["lora_config"]
    tts = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False, optimize=False, device="cpu",
                                 lora_config=LoRAConfig(**cfg), lora_weights_path=d)
    def synth(style, text):
        ins, mt, _ = pick(emotion_of(style), normalize(text), "auto")
        w = tts.generate(text=compose(ins, mt), cfg_value=2.0, inference_timesteps=16, normalize=False)
        return clean(w, tts.tts_model.sample_rate)[0]
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
        w = synth(style, text)
        w = w / (np.abs(w).max() + 1e-9) * 0.9
        heard = check(w)
        score = difflib.SequenceMatcher(None, norm(text), norm(heard)).ratio()
        emo = "" if ref else f" [{emotion_of(style) or 'plain'}]"
        print(f"[{i:02d}] try{t+1}{emo} score={score:.2f} {time.time()-t0:.0f}s | {heard}", flush=True)
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
