# Проверка: Whisper распознаёт текст, считаем точность, слова/мин, высоту голоса, паузы
import sys, re, numpy as np, librosa
from faster_whisper import WhisperModel
ref = re.findall(r"[a-z']+", open("text.txt").read().lower())
m = WhisperModel("small.en", device="cpu", compute_type="int8")
for f in sys.argv[1:]:
    y, sr = librosa.load(f, sr=16000)
    segs, _ = m.transcribe(y, language="en", word_timestamps=True)
    words = [w for s in segs for w in s.words]
    hyp = re.findall(r"[a-z']+", " ".join(w.word for w in words).lower())
    import difflib; sm = difflib.SequenceMatcher(None, ref, hyp); acc = sum(b.size for b in sm.get_matching_blocks()) / len(ref)
    speech = words[-1].end - words[0].start
    f0, *_ = librosa.pyin(y, fmin=60, fmax=300, sr=sr); f0 = f0[~np.isnan(f0)]
    gaps = [b.start - a.end for a, b in zip(words, words[1:]) if b.start - a.end > 0.25]
    print(f"{f}: {len(y)/sr:.1f} c, совпадение {acc*100:.0f}%, {len(hyp)/speech*60:.0f} сл/мин, тон {np.median(f0):.0f} Гц, пауз>0.25с: {len(gaps)}")
    diff = [(t, ref[i1:i2], hyp[j1:j2]) for t, i1, i2, j1, j2 in sm.get_opcodes() if t != 'equal']
    if diff: print("   расхождения:", diff[:8])
