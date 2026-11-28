# Расшифровка видео конкурентов: сегменты + слова -> NAME.json, NAME.txt
import sys, json, subprocess, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("small.en", device="cpu", compute_type="int8", cpu_threads=4)
for name in sys.argv[1:]:
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", name + ".mp4", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
    y = np.frombuffer(raw, np.float32)
    segs, _ = m.transcribe(y, language="en", word_timestamps=True, vad_filter=False)
    S = [{"s": round(s.start, 2), "e": round(s.end, 2), "t": s.text.strip(), "w": [[round(w.start, 2), round(w.end, 2), w.word] for w in s.words]} for s in segs]
    json.dump(S, open(name + ".json", "w"))
    open(name + ".txt", "w").write("\n".join(f"[{int(s['s'])//60:02d}:{int(s['s'])%60:02d}] {s['t']}" for s in S))
    print(name, "done", len(S), "segments", flush=True)
