# OmniVoice: низкий голос, темп как в образце (~160 сл/мин) — speed 0.84
import time, torch, soundfile as sf
from omnivoice import OmniVoice
torch.set_num_threads(4)
m = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map="cpu", dtype=torch.float32)
text = open("text.txt").read().strip()
for name, ins in [("omni_low_slow", "male, middle-aged, low pitch, american accent"), ("omni_mid_slow", "male, young adult, moderate pitch, american accent")]:
    t = time.time(); a = m.generate(text=text, instruct=ins, num_step=32, speed=0.84)
    sf.write(name + ".wav", a[0], 24000); print(name, round(time.time() - t), "s, audio", round(len(a[0]) / 24000, 1), "s", flush=True)
