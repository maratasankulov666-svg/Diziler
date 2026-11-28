# Голос канала: Qwen3-TTS VoiceDesign 1.7B (выбран 29.11), весь текст одним дублем
import time, torch, soundfile as sf
from qwen_tts import Qwen3TTSModel
torch.set_num_threads(4)
m = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.bfloat16)
text = open("script.txt").read().replace("\n", " ").strip()
ins = ("A calm, low-pitched adult American male voice. Quiet and intimate, like telling a true story to a friend late at night. "
       "Steady natural pace, slight pauses between sentences, no drama, no announcer tone.")
t = time.time(); w, sr = m.generate_voice_design(text=text, instruct=ins, language="English")
sf.write("vo_raw.wav", w[0], sr); print("tts", round(time.time() - t), "s, audio", round(len(w[0]) / sr, 1), "s")
