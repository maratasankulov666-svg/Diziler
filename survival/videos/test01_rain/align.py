import json,numpy as np,soundfile as sf
from faster_whisper import WhisperModel
sc=json.load(open("script.json"));m=WhisperModel("small.en",device="cpu",compute_type="int8")
GAP=0.35;track=[];t=0;out=[]
for l in sc["lines"]:
    a,sr=sf.read(f"vo_{l['id']}.wav");a=a if a.ndim==1 else a.mean(1)
    thr=0.01;idx=np.where(np.abs(a)>thr)[0];a=a[max(0,idx[0]-int(.05*sr)):idx[-1]+int(.12*sr)]
    sf.write(f"vot_{l['id']}.wav",a,sr)
    import librosa;a16=librosa.resample(a.astype("float32"),orig_sr=sr,target_sr=16000);segs,_=m.transcribe(a16,word_timestamps=True,language="en")
    words=[dict(w=w.word.strip(),s=round(t+w.start,2),e=round(t+w.end,2)) for s in segs for w in s.words]
    heard=" ".join(x["w"] for x in words)
    print(l["id"],round(len(a)/sr,2),"|",heard)
    out.append(dict(l,start=round(t,2),end=round(t+len(a)/sr,2),words=words))
    track.append(a);track.append(np.zeros(int(GAP*sr)));t+=len(a)/sr+GAP
sf.write("narration.wav",np.concatenate(track),sr);json.dump(out,open("timeline.json","w"),indent=1);print("total",round(t,2))
