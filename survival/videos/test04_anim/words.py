# Тайминги слов озвучки (Whisper) -> words.json
import json, re, librosa
from faster_whisper import WhisperModel
y, _ = librosa.load("vo.wav", sr=16000)
m = WhisperModel("small.en", device="cpu", compute_type="int8")
segs, _ = m.transcribe(y, language="en", word_timestamps=True)
W = [{"w": re.sub(r"[^a-z']", "", w.word.lower()), "s": round(w.start, 2), "e": round(w.end, 2)} for s in segs for w in s.words]
json.dump(W, open("words.json", "w")); print(len(y) / 16000, " ".join(f"{w['w']}@{w['s']}" for w in W))
