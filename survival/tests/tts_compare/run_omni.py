# OmniVoice (k2-fsa): дизайн голоса по атрибутам + клон голоса Qwen для честного сравнения тембра
import time, os, torch, soundfile as sf
from omnivoice import OmniVoice
torch.set_num_threads(4)
m = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map="cpu", dtype=torch.float32)
text = open("text.txt").read().strip()
for name, kw in [("omni_design_low", dict(instruct="male, middle-aged, low pitch, american accent")),
                 ("omni_design_mid", dict(instruct="male, young adult, moderate pitch, american accent"))]:
    t = time.time(); a = m.generate(text=text, num_step=32, **kw)
    sf.write(name + ".wav", a[0], 24000); print(name, round(time.time() - t), "s, audio", round(len(a[0]) / 24000, 1), "s", flush=True)
