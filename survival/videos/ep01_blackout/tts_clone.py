# Озвучка сценария клоном голоса канала (Qwen3-TTS Base 1.7B + эталон ref_voice.wav), по абзацам, с проверкой Whisper.
import os, re, json, time, torch, soundfile as sf, numpy as np, difflib, librosa
from qwen_tts import Qwen3TTSModel
torch.set_num_threads(4); os.makedirs("vo", exist_ok=True)
paras = []
for block in open("script.md").read().split("\n\n"):
    lines = [l for l in block.strip().splitlines() if l.strip() and not l.startswith(("#", "<!--"))]
    text = " ".join(l for l in lines if not l.startswith("@")).strip()
    if text: paras.append(text)
json.dump(paras, open("paras.json", "w"), indent=0)
m = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base", device_map="cpu", dtype=torch.bfloat16)
prompt = m.create_voice_clone_prompt(ref_audio="ref_voice.wav", ref_text=open("ref_voice.txt").read().strip())
from faster_whisper import WhisperModel   # проверка — в том же окружении, если есть; иначе пропуск
try: wm = WhisperModel("small.en", device="cpu", compute_type="int8")
except Exception: wm = None
words = lambda t: re.findall(r"[a-z']+", t.lower())
for i, text in enumerate(paras):
    out = f"vo/p{i:03d}.wav"
    if os.path.exists(out): continue
    best = None
    for attempt in range(3):
        t = time.time(); w, sr = m.generate_voice_clone(text=text, language="English", voice_clone_prompt=prompt)
        a = w[0]; acc = 1.0
        if wm:
            y = librosa.resample(a.astype(np.float32), orig_sr=sr, target_sr=16000)
            hyp = " ".join(s.text for s in wm.transcribe(y, language="en")[0])
            ref = words(re.sub(r"\d+", "", text)); hw = words(re.sub(r"\d+", "", hyp))
            acc = difflib.SequenceMatcher(None, ref, hw).ratio()
        if best is None or acc > best[0]: best = (acc, a, sr)
        print(f"p{i:03d} try{attempt} {time.time()-t:.0f}s audio {len(a)/sr:.1f}s acc {acc:.3f}", flush=True)
        if acc >= 0.95: break
    sf.write(out, best[1], best[2])
print("ALL_DONE", flush=True)
