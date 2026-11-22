import soundfile as sf,numpy as np,time,os
from voxcpm import VoxCPM
m=VoxCPM.from_pretrained('openbmb/VoxCPM2',load_denoiser=False,device='cpu',optimize=False)
SR=m.tts_model.sample_rate
REF='ref_announcer.wav'
if not os.path.exists(REF):
    r=m.generate(text="(A Turkish male TV and radio announcer in his thirties, deep, resonant, polished studio voice, charismatic and slightly playful, perfect diction)İyi akşamlar sayın seyirciler. Karşınızda DiziVizyon. Haftanın en çok konuşulan dizilerini birlikte masaya yatırıyoruz.",cfg_value=2.0,inference_timesteps=10)
    sf.write(REF,r,SR)
segs=[
 ("Profesyonel televizyon sunucusu, enerjik ve karizmatik, gülümseyerek","Çaylar demlendi, kumanda elinizde... DiziVizyon'a hoş geldiniz! Ben de sizin dizi dostunuzum.",0.8),
 ("Playful and ironic, storytelling like a stand-up comedian","Bu hafta Uzak Şehir'de yine aynı şey oldu. Adam kıza tam üç dakika baktı. Hiç konuşmadan.",0.5),
 ("Deadpan, dry humor, slow","Ben o sürede çay demledim, içtim... bardağı da yıkadım.",1.0),
 ("Dramatic news announcer, serious and intense","Ama şaka bir yana... yeni fragmanda öyle bir sahne var ki, sosyal medya resmen yıkıldı!",0.8),
 ("Mock-serious, conspiratorial, lowering the voice","Türk dizilerinin değişmez kuralını biliyorsunuz. Bir karakter 'Sana bir şey söylemem lazım' diyorsa... o şey asla o bölümde söylenmez.",0.5),
 ("Amused and ironic, fast, almost laughing","Telefon çalar, kapı çalar, biri bayılır, araba fren yapar... ama o cümle asla bitmez!",1.0),
 ("Warm and energetic TV host closing the show","Tahminlerinizi yorumlara yazın, en komik yorumu bir sonraki videoda okuyacağım. Kumandayı bırakmayın, görüşmek üzere!",0.0),
]
out=[np.zeros(int(0.3*SR))]
for i,(st,tx,p) in enumerate(segs):
    t=time.time()
    w=m.generate(text=f"({st}){tx}",reference_wav_path=REF,cfg_value=2.0,inference_timesteps=10)
    w=w/(np.abs(w).max()+1e-9)*0.9
    out+=[w,np.zeros(int(p*SR))];print(i,round(time.time()-t))
sf.write('/home/user/Diziler/samples/voxcpm2_host.wav',np.concatenate(out),SR)
