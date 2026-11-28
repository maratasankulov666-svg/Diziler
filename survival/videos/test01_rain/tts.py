import json,time,torch,soundfile as sf
from qwen_tts import Qwen3TTSModel
torch.set_num_threads(4)
t=time.time()
m=Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",device_map="cpu",dtype=torch.bfloat16)
print("load",round(time.time()-t),flush=True)
ins="Low, tense survival documentary narrator. Natural brisk pace, confident, short pauses only at full stops."
import sys
for l in [x for x in json.load(open("script.json"))["lines"] if len(sys.argv)<2 or str(x["id"]) in sys.argv[1:]]:
    t=time.time()
    w,sr=m.generate_custom_voice(text=l["text"],language="English",speaker="Ryan",instruct=ins)
    sf.write(f"vo_{l['id']}.wav",w[0],sr);print(l["id"],round(time.time()-t),"s",round(len(w[0])/sr,1),"audio",flush=True)
