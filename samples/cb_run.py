import torch,torchaudio,sys,time
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
m=ChatterboxMultilingualTTS.from_pretrained(device='cpu')
T="Merhaba sevgili dizi severler! Bugün Uzak Şehir'in yeni bölüm fragmanını detaylıca inceliyoruz. Cihan ve Alya arasında neler olacak? Bu sahne gerçekten her şeyi değiştirebilir. Yorumlarda tahminlerinizi yazmayı unutmayın!"
t=time.time()
w=m.generate(T,language_id='tr',exaggeration=0.6,cfg_weight=0.5)
torchaudio.save(sys.argv[1],w,m.sr);print('sec',time.time()-t)
