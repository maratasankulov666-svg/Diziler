"""Detect shots in trailers and keep usable ones (no slates/black/logo cards)."""
import subprocess, json, re, sys, glob, os
import numpy as np
from PIL import Image
CL = sys.argv[1]; OUT = sys.argv[2]
res = {}
def dur(f):
    return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f]))
def frame(f, t):
    raw = subprocess.check_output(["ffmpeg","-loglevel","error","-ss",str(t),"-i",f,"-frames:v","1","-vf","scale=160:90","-f","rawvideo","-pix_fmt","rgb24","-"])
    return np.frombuffer(raw, np.uint8).reshape(90,160,3).astype(float)
for f in sorted(glob.glob(os.path.join(CL,"*.mp4"))):
    name = os.path.basename(f)[:-4]; D = dur(f)
    log = subprocess.run(["ffmpeg","-i",f,"-vf","select='gt(scene,0.28)',showinfo","-f","null","-"],capture_output=True,text=True).stderr
    cuts = [0.0]+[float(x) for x in re.findall(r"pts_time:([\d.]+)", log)]+[D]
    shots=[]
    for a,b in zip(cuts,cuts[1:]):
        a2,b2=a+0.12,b-0.12
        if b2-a2<1.4 or a2<1.5 or b2>D-7: continue
        bad=False; lums=[]
        for tt in (a2+0.1,(a2+b2)/2,b2-0.1):
            im = frame(f,tt); lum=im.mean(); std=im.std(); lums.append(lum)
            R,G,Bc=im[...,0],im[...,1],im[...,2]
            red = ((R>150)&(G<80)&(Bc<80)).mean()
            orange = ((R>200)&(G>90)&(G<190)&(Bc<90)).mean()
            white = (im.min(2)>215).mean()
            if lum<30 or std<26 or white>0.25 or red>0.15 or orange>0.06: bad=True
        if bad or np.mean(lums)<42: continue
        shots.append([round(a2,2),round(b2,2)])
    res[name]=shots; print(name, len(shots), round(sum(b-a for a,b in shots),1),"s")
json.dump(res,open(OUT,"w"),indent=0)
