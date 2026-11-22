import soundfile as sf,numpy as np,time
from voxcpm import VoxCPM
m=VoxCPM.from_pretrained('openbmb/VoxCPM2',load_denoiser=False,device='cpu',optimize=False)
SR=m.tts_model.sample_rate
VOICE="A young Turkish man in his late twenties, charismatic YouTube TV-series commentator, warm medium-deep voice"
# 1) fix the channel voice
import os

segs=[
 ("Very excited and energetic, smiling, fast pace","Merhaba sevgili dizi severler, DiziVizyon'a hoş geldiniz!",0.6),
 ("Mysterious, slow and low voice, with dramatic pauses","Bu akşam... size öyle bir fragman göstereceğim ki... gözlerinize inanamayacaksınız.",0.9),
 ("Çok şaşırmış, inanamıyormuş gibi sesi yükselerek","Cihan, Alya'nın yıllardır sakladığı sırrı sonunda öğreniyor!",0.6),
 ("Sad and quiet, with a heavy heart, slow","Ve bu gerçek... ikisinin arasındaki her şeyi yıkabilir.",1.0),
 ("Angry and frustrated, voice getting louder","Peki ama Ecmel neden susuyor? Bu sessizlik tesadüf olamaz!",0.7),
 ("Thoughtful and calm, like sharing a secret theory","Benim teorim şu: Ecmel, Deniz'in kaçırılmasından en başından beri haberdardı.",0.8),
 ("Cheerful and warm, friendly, smiling","Siz ne düşünüyorsunuz? Tahminlerinizi yorumlara yazın, ve videoyu beğenmeyi unutmayın!",0.0),
]
out=[np.zeros(int(0.3*SR))]
for i,(st,tx,p) in enumerate(segs):
    t=time.time()
    w=m.generate(text=f"({st}){tx}",reference_wav_path='ref_voice.wav',cfg_value=2.0,inference_timesteps=10)
    w=w/ (np.abs(w).max()+1e-9)*0.9
    out+= [w,np.zeros(int(p*SR))]; print(i,round(time.time()-t))
sf.write('/home/user/Diziler/samples/voxcpm2_emotions.wav',np.concatenate(out),SR)
