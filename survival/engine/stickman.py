"""Герой канала: стикмен в стиле B4 (белая голова, тело-палочка, белые перчатки, зелёная шапка).
Рисуется кодом, поэтому одинаков во всех кадрах. draw_hero(img, x, y, h, pose, ...)"""
import math
from PIL import Image, ImageDraw, ImageFilter

INK=(22,22,24,255); WHITE=(250,250,246,255); BEANIE=(58,150,92,255); BEANIE_D=(40,112,68,255)
PACK=(150,104,62,255); PACK_D=(112,76,44,255)

POSES={  # углы в градусах (0 = вниз), плечо/локоть/бедро/колено для левой (L) и правой (R) стороны
 "stand":   dict(sl=15, el=8, sr=-15, er=-8, hl=6,  kl=0,  hr=-6, kr=0),
 "wave":    dict(sl=15, el=8, sr=-150,er=-25,hl=6,  kl=0,  hr=-6, kr=0),
 "walk":    dict(sl=-25,el=-20,sr=30,er=25, hl=-22,kl=10, hr=24, kr=-4),
 "point":   dict(sl=15, el=8, sr=-95, er=-95,hl=6,  kl=0,  hr=-6, kr=0),
 "scared":  dict(sl=115,el=-35,sr=-115,er=35,hl=12,kl=-6,hr=-12,kr=6),
 "carry":   dict(sl=-60,el=-120,sr=60,er=120,hl=6, kl=0,  hr=-6, kr=0),
 "walk2":   dict(sl=30, el=25, sr=-25,er=-20,hl=24, kl=-4, hr=-22,kr=10),
 "sit":     dict(sl=30, el=60, sr=-30, er=-60,hl=-80,kl=0, hr=-75,kr=5),
}
FACES={"neutral":(0,0),"worried":(1,-1),"scared":(2,-1),"happy":(0,1),"determined":(-1,0)}

def _pt(o,ang,l):  # ang 0 = вниз, положительный = к правой стороне экрана
    a=math.radians(ang); return (o[0]+l*math.sin(a), o[1]+l*math.cos(a))

def draw_hero(base, x, y, h, pose="stand", face="neutral", look=1, backpack=True, beanie=True, ss=3, shadow=True, silhouette=None):
    """x,y — точка между стоп на земле; h — рост в пикселях; look=1 вправо, -1 влево."""
    p=dict(POSES[pose]) if isinstance(pose,str) else dict(pose); W=int(h*1.6)*ss; H=int(h*1.25)*ss
    L=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(L)
    u=h*ss; lw=max(3,int(u*0.034)); cx=W/2; gy=H-u*0.08
    r=u*0.175; leg=u*0.33; torso=u*0.29; arm=u*0.18
    sit = pose=="sit"
    hip=(cx, gy-(leg*0.55 if sit else leg*0.98)); neck=(cx, hip[1]-torso)
    head=(cx, neck[1]-r*0.92)
    def line(a,b,w=lw): d.line([a,b],fill=INK,width=int(w)); [d.ellipse([q[0]-w/2,q[1]-w/2,q[0]+w/2,q[1]+w/2],fill=INK) for q in (a,b)]
    # рюкзак за спиной
    if backpack:
        bx=cx-look*u*0.085; d.rounded_rectangle([bx-u*0.06,neck[1]+u*0.02,bx+u*0.06,neck[1]+u*0.17],radius=u*0.03,fill=PACK,outline=INK,width=lw)
        d.rectangle([bx-u*0.04,neck[1]+u*0.10,bx+u*0.04,neck[1]+u*0.145],fill=PACK_D,outline=INK,width=max(2,lw//2))
    # ноги
    for s in ("l","r"):
        k=_pt(hip,p["h"+s],leg/2); f=_pt(k,p["h"+s]+p["k"+s],leg/2); line(hip,k); line(k,f)
        d.ellipse([f[0]-u*0.035+look*u*0.012,f[1]-u*0.018,f[0]+u*0.035+look*u*0.012,f[1]+u*0.018],fill=INK)
    line(neck,hip)  # туловище
    # руки + перчатки
    # голова
    d.ellipse([head[0]-r,head[1]-r,head[0]+r,head[1]+r],fill=WHITE,outline=INK,width=lw)
    ex,mo=FACES[face]; fx=head[0]+look*r*0.28; ey=head[1]-r*0.05
    er=r*(0.085+0.03*(ex>0)); 
    for dx in (-r*0.2,r*0.2): d.ellipse([fx+dx-er*0.8,ey-er*1.15,fx+dx+er*0.8,ey+er*1.15],fill=INK)
    if ex<0: [d.line([(fx+dx-r*0.13,ey-r*0.27+(r*0.04 if dx*look>0 else -r*0.0)),(fx+dx+r*0.13,ey-r*0.22)],fill=INK,width=max(2,lw//1)) for dx in (-r*0.2,r*0.2)]
    my=head[1]+r*0.38
    if mo>0: d.arc([fx-r*0.16,my-r*0.14,fx+r*0.16,my+r*0.06],20,160,fill=INK,width=max(2,int(lw*0.8)))
    elif mo<0 and ex>=2: d.ellipse([fx-r*0.07,my-r*0.08,fx+r*0.07,my+r*0.1],fill=INK)
    elif mo<0: d.arc([fx-r*0.14,my-r*0.02,fx+r*0.14,my+r*0.16],200,340,fill=INK,width=max(2,int(lw*0.8)))
    else: d.line([(fx-r*0.1,my),(fx+r*0.1,my)],fill=INK,width=max(2,int(lw*0.8)))
    # шапка-бини
    if beanie:
        d.chord([head[0]-r*1.02,head[1]-r*1.35,head[0]+r*1.02,head[1]+r*0.5],180,360,fill=BEANIE,outline=INK,width=lw)
        for i in range(-2,3): d.arc([head[0]+i*r*0.32-r*0.5,head[1]-r*1.2,head[0]+i*r*0.32+r*0.5,head[1]+r*0.2],250,290,fill=BEANIE_D,width=max(1,lw//2))
        d.rounded_rectangle([head[0]-r*1.08,head[1]-r*0.55,head[0]+r*1.08,head[1]-r*0.3],radius=r*0.1,fill=BEANIE_D,outline=INK,width=lw)
        pr=r*0.17; d.ellipse([head[0]-pr,head[1]-r*1.03-pr*1.6,head[0]+pr,head[1]-r*1.03+pr*0.4],fill=BEANIE,outline=INK,width=max(2,int(lw*0.8)))
    def _arms():
        sh=(cx,neck[1]+u*0.03)
        for s in ("l","r"):
            e=_pt(sh,p["s"+s],arm); w_=_pt(e,p["s"+s]+p["e"+s],arm); line(sh,e); line(e,w_)
            gr=u*0.042; d.ellipse([w_[0]-gr,w_[1]-gr,w_[0]+gr,w_[1]+gr],fill=WHITE,outline=INK,width=max(2,int(lw*0.8)))
            tx=w_[0]+(gr*0.9 if s=="r" else -gr*0.9); d.ellipse([tx-gr*0.38,w_[1]-gr*0.75,tx+gr*0.38,w_[1]-gr*0.05],fill=WHITE,outline=INK,width=max(2,int(lw*0.6)))
    _arms()
    if look<0: L=L.transpose(Image.FLIP_LEFT_RIGHT)
    L=L.resize((W//ss,H//ss),Image.LANCZOS)
    # мягкая тень на земле
    if silhouette:
        a=L.getchannel('A'); L=Image.new('RGBA',L.size,silhouette); L.putalpha(a)
    if shadow:
      sh_=Image.new("RGBA",base.size,(0,0,0,0)); ImageDraw.Draw(sh_).ellipse([x-h*0.22,y-h*0.03,x+h*0.22,y+h*0.03],fill=(0,0,0,70))
      base.alpha_composite(sh_.filter(ImageFilter.GaussianBlur(h*0.02)))
    base.alpha_composite(L,(int(x-L.width/2),int(y-L.height+h*0.08)))
    return base
