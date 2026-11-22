import soundfile as sf,time
from voxcpm import VoxCPM
m=VoxCPM.from_pretrained('openbmb/VoxCPM2',load_denoiser=False,device='cpu',optimize=False)
T="Merhaba sevgili dizi severler! Bugün Uzak Şehir'in yeni bölüm fragmanını detaylıca inceliyoruz. Cihan ve Alya arasında neler olacak? Bu sahne gerçekten her şeyi değiştirebilir. Yorumlarda tahminlerinizi yazmayı unutmayın!"
for name,desc in [('male','A young Turkish man, energetic and excited YouTube presenter, warm voice'),('female','A young Turkish woman, lively and emotional TV series commentator, clear warm voice')]:
    t=time.time();w=m.generate(text=f"({desc}){T}",cfg_value=2.0,inference_timesteps=10)
    sf.write(f'/home/user/Diziler/samples/voxcpm2_{name}.wav',w,m.tts_model.sample_rate);print(name,time.time()-t)
