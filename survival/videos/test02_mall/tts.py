import time, torch, soundfile as sf, sys
from qwen_tts import Qwen3TTSModel
torch.set_num_threads(4)
m = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.bfloat16)
text = open("script.txt").read().replace("\n", " ").strip()
ins = ("A calm, low-pitched adult American male voice. Quiet and intimate, like telling a true story to a friend late at night. "
       "Steady natural pace, slight pauses between sentences, no drama, no announcer tone.")
t = time.time()
w, sr = m.generate_voice_design(text=text, instruct=ins, language="English")
sf.write(sys.argv[1] if len(sys.argv) > 1 else "vo.wav", w[0], sr)
print("tts", round(time.time() - t), "s, audio", round(len(w[0]) / sr, 1), "s")
