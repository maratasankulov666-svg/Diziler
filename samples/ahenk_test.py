import json, sys, time
from pathlib import Path
import numpy as np, soundfile as sf
from huggingface_hub import snapshot_download
from trnorm import normalize
from voxcpm import VoxCPM
from voxcpm.model.voxcpm import LoRAConfig
d = snapshot_download("ozgurguler/ahenk-tts-tr", allow_patterns=["lora_*", "*.py", "instructions_tr.json", "config.json"])
sys.path.insert(0, d)
from instruction_pick import compose, pick
from pause_clean import clean
cfg = json.loads(Path(d, "lora_config.json").read_text(encoding="utf-8"))["lora_config"]
tts = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False, optimize=False, device="cpu",
                             lora_config=LoRAConfig(**cfg), lora_weights_path=d)
SR = tts.tts_model.sample_rate
SEG = [("surprised", "Taşacak Bu Deniz'de Adil gerçekten ölüyor mu?", .4),
       ("", "Otuz dokuzuncu bölümün sonunda Şerif, İso'ya bir silah verdi: ya Adil'i vurursun... ya da ben Oruç'u vururum.", .4),
       ("sad", "Ve Adil, İso'ya döndü: vur beni İso... seni çok seviyorum.", .5),
       ("surprised", "Kırkıncı bölüm fragmanının son cümlesi ise: Adil abi... kurtulamamış.", .5),
       ("cheerful", "Ama unutmayın, Türk dizilerinin kuralı: fragmanda ölen, bölümde dirilir!", .4),
       ("cheerful", "Sizce Adil yaşayacak mı? Yorumlara yazın! Üç teorimin hepsi kanaldaki videoda.", .3)]
for name, ref in [("ahenk_kadin", None), ("ahenk_erkek_ref", "/home/user/Diziler/samples/channel_voice_announcer.wav")]:
    out = [np.zeros(int(.3 * SR))]
    for emo, text, p in SEG:
        t = time.time()
        ins, mt, _ = pick(emo, normalize(text), "auto")
        kw = dict(text=compose(ins, mt), cfg_value=2.0, inference_timesteps=16, normalize=False)
        if ref: kw["reference_wav_path"] = ref
        w = tts.generate(**kw)
        w = clean(w, SR)[0]; w = w / (np.abs(w).max() + 1e-9) * .9
        out += [w, np.zeros(int(p * SR))]; print(name, emo, round(time.time() - t), flush=True)
    sf.write(f"/home/user/Diziler/samples/{name}.wav", np.concatenate(out), SR)
