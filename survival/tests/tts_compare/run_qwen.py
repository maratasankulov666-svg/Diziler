# Qwen3-TTS VoiceDesign 1.7B: голос по описанию (как в тесте 02)
import time, torch, soundfile as sf
from qwen_tts import Qwen3TTSModel
torch.set_num_threads(4)
m = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.bfloat16)
text = open("text.txt").read().strip()
ins = ("A calm, low-pitched adult American male voice. Quiet and intimate, like telling a true story to a friend late at night. "
       "Steady natural pace, slight pauses between sentences, no drama, no announcer tone.")
t = time.time(); w, sr = m.generate_voice_design(text=text, instruct=ins, language="English")
sf.write("qwen_design.wav", w[0], sr); print("qwen_design", round(time.time() - t), "s, audio", round(len(w[0]) / sr, 1), "s", flush=True)
