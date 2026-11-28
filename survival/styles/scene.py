"""Один кадр (ночь, пустой проход супермаркета, герой с фонариком) в разных стилях.
Всё рисуется кодом в SVG, рендер в PNG через Chromium (render.js).
python3 scene.py  -> out/*.svg
"""
import random, os

W, H = 1280, 720
VX, VY = 640, 300          # точка схода
ZF = 6.8                   # дальняя стена
ZN = 0.42                  # ближний край (за кадром)

def X(xw, z):  return VX + xw / z
def Y(yw, z):  return VY + yw / z
def pt(xw, yw, z): return f"{X(xw,z):.1f},{Y(yw,z):.1f}"

# мировые координаты: полка слева xw=-340, справа +340, пол yw=+420, верх полок yw=-180, потолок yw=-330
SH_TOP, FLOOR, CEIL = -180, 420, -330
PRODUCT = ["#d9412b", "#f2b632", "#2f8f4e", "#3b6fd1", "#e7e2d3", "#8a4fb0", "#f07c2a", "#c9a46a", "#1f9fb0", "#e85d8c"]

STYLES = {
    "cartoon": dict(bg="#cfd6e4", ceil="#e9edf3", floor="#c4ccd9", shelf="#1f4fa8", shelf_dark="#163a7c",
                    wall="#aab6c8", stroke="#111", sw=2.2, hoodie="#9a9da3", hoodie_dark="#7d8087",
                    beanie="#e9b326", beanie_dark="#c7921a", hair="#6b4024", skin="#f6f5f1",
                    night=0.62, nightcol="#0a1638", paper=False, ink=False),
    "paper":   dict(bg="#e8d9bd", ceil="#f3e6cc", floor="#d8c29c", shelf="#2a8f86", shelf_dark="#1f6b65",
                    wall="#c9b48e", stroke="none", sw=0, hoodie="#8f9196", hoodie_dark="#76787d",
                    beanie="#f0b429", beanie_dark="#d39516", hair="#7a4a2a", skin="#fbf7ee",
                    night=0.30, nightcol="#4a2a5e", paper=True, ink=False),
    "ink":     dict(bg="#f3ecdc", ceil="#f3ecdc", floor="#efe6d2", shelf="#f3ecdc", shelf_dark="#e6dcc6",
                    wall="#ebe2cd", stroke="#1d1a17", sw=2.6, hoodie="#f3ecdc", hoodie_dark="#e2d7bf",
                    beanie="#efb02a", beanie_dark="#d8961a", hair="#f3ecdc", skin="#f8f3e7",
                    night=0.0, nightcol="#000", paper=False, ink=True),
}

def poly(points, fill, s, extra=""):
    st = f' stroke="{s["stroke"]}" stroke-width="{s["sw"]}" stroke-linejoin="round"' if s["stroke"] != "none" else ""
    return f'<polygon points="{" ".join(points)}" fill="{fill}"{st} {extra}/>'

def hatch_or(fill, s, dark=False):
    if s["ink"] and dark: return "url(#hatch)"
    return fill

def aisle(s, rnd):
    o = []
    # потолок, стена, пол
    o.append(f'<rect width="{W}" height="{H}" fill="{s["bg"]}"/>')
    o.append(poly([pt(-340,CEIL,ZN), pt(340,CEIL,ZN), pt(340,CEIL,ZF), pt(-340,CEIL,ZF)], s["ceil"], s))
    o.append(f'<rect x="0" y="0" width="{W}" height="{Y(CEIL,1):.0f}" fill="{s["ceil"]}"/>')
    o.append(poly([pt(-340,FLOOR,ZN), pt(340,FLOOR,ZN), pt(340,FLOOR,ZF), pt(-340,FLOOR,ZF)], s["floor"], s))
    o.append(f'<rect x="0" y="{Y(FLOOR,1):.0f}" width="{W}" height="200" fill="{s["floor"]}"/>')
    # дальняя стена с дверями склада
    o.append(poly([pt(-340,CEIL,ZF), pt(340,CEIL,ZF), pt(340,FLOOR,ZF), pt(-340,FLOOR,ZF)], s["wall"], s))
    o.append(poly([pt(-90,40,ZF), pt(90,40,ZF), pt(90,FLOOR,ZF), pt(-90,FLOOR,ZF)], hatch_or(s["shelf_dark"], s, True), s))
    o.append(f'<line x1="{X(0,ZF)}" y1="{Y(40,ZF)}" x2="{X(0,ZF)}" y2="{Y(FLOOR,ZF)}" stroke="{s["stroke"] if s["stroke"]!="none" else "#22334f"}" stroke-width="1.5"/>')
    # плиточные швы пола
    for i in range(-6, 7):
        xw = i * 110
        o.append(f'<line x1="{X(xw,ZN):.1f}" y1="{Y(FLOOR,ZN):.1f}" x2="{X(xw,ZF):.1f}" y2="{Y(FLOOR,ZF):.1f}" stroke="#000" stroke-opacity="0.07" stroke-width="1.5"/>')
    z = ZN
    while z < ZF:
        o.append(f'<line x1="{X(-340,z):.1f}" y1="{Y(FLOOR,z):.1f}" x2="{X(340,z):.1f}" y2="{Y(FLOOR,z):.1f}" stroke="#000" stroke-opacity="0.06" stroke-width="1.2"/>')
        z += z * 0.16
    # лампы на потолке и их отражения на полу
    for z in [0.6, 0.85, 1.2, 1.7, 2.4, 3.3, 4.5, 6.0]:
        d = z * 0.12
        o.append(f'<polygon points="{pt(-60,CEIL,z)} {pt(60,CEIL,z)} {pt(60,CEIL,z+d)} {pt(-60,CEIL,z+d)}" fill="#fffdf0" class="lamp"/>')
        if not s["ink"]:
            o.append(f'<polygon points="{pt(-45,FLOOR,z)} {pt(45,FLOOR,z)} {pt(45,FLOOR,z+d*1.5)} {pt(-45,FLOOR,z+d*1.5)}" fill="#ffffff" opacity="0.22"/>')
    # полки
    for side in (-1, 1):
        xs = 340 * side
        levels = [SH_TOP, -60, 60, 180, 300, FLOOR]
        # корпус
        o.append(poly([pt(xs,SH_TOP-40,ZN), pt(xs,SH_TOP-40,ZF), pt(xs,FLOOR,ZF), pt(xs,FLOOR,ZN)], s["shelf_dark"], s))
        for li in range(len(levels) - 1):
            ya, yb = levels[li] + 14, levels[li + 1]
            zz = ZN
            while zz < ZF - 0.05:
                w = zz * rnd.uniform(0.045, 0.09)
                z2 = min(zz + w, ZF)
                hgt = rnd.choice([0.35, 0.45, 0.55, 0.62, 0.7])
                top = yb - (yb - ya) * hgt
                col = rnd.choice(PRODUCT)
                if s["ink"]:
                    col = "#f3ecdc" if rnd.random() < .7 else "url(#hatch)"
                o.append(f'<polygon points="{pt(xs,top,zz)} {pt(xs,top,z2)} {pt(xs,yb,z2)} {pt(xs,yb,zz)}" fill="{col}" '
                         + (f'stroke="{s["stroke"]}" stroke-width="{max(0.6, s["sw"]*0.45/zz):.2f}"' if s["stroke"] != "none" else 'stroke="#00000022" stroke-width="0.8"') + '/>')
                if s["paper"]:  # бумажная тень снизу коробки
                    o.append(f'<polygon points="{pt(xs,yb-6,zz)} {pt(xs,yb-6,z2)} {pt(xs,yb,z2)} {pt(xs,yb,zz)}" fill="#000" opacity="0.18"/>')
                zz = z2 + zz * 0.008
            # кромка полки
            o.append(poly([pt(xs,yb-2,ZN), pt(xs,yb-2,ZF), pt(xs,yb+14,ZF), pt(xs,yb+14,ZN)], s["shelf"], s))
            tz = ZN + 0.05
            while tz < ZF - 0.3:   # ценники
                o.append(f'<polygon points="{pt(xs,yb+1,tz)} {pt(xs,yb+1,tz+tz*0.05)} {pt(xs,yb+11,tz+tz*0.05)} {pt(xs,yb+11,tz)}" fill="#f7f4e8" opacity="0.9"/>')
                tz += tz * 0.22
        # верхний короб
        o.append(poly([pt(xs,SH_TOP-60,ZN), pt(xs,SH_TOP-60,ZF), pt(xs,SH_TOP+12,ZF), pt(xs,SH_TOP+12,ZN)], s["shelf"], s))
        # стойки
        for zz in [0.42, 0.7, 1.05, 1.6, 2.4, 3.4, 4.8, 6.6]:
            o.append(poly([pt(xs,SH_TOP-60,zz), pt(xs,SH_TOP-60,zz+0.05), pt(xs,FLOOR,zz+0.05), pt(xs,FLOOR,zz)], s["shelf"], s))
    # табличка ряда, висит с потолка
    zc = 2.2
    o.append(f'<line x1="{X(0,zc)}" y1="{Y(CEIL,zc)}" x2="{X(0,zc)}" y2="{Y(-250,zc)}" stroke="#333" stroke-width="2"/>')
    o.append(poly([pt(-40,-250,zc), pt(40,-250,zc), pt(40,-190,zc), pt(-40,-190,zc)], s["shelf"] if not s["ink"] else "#1d1a17", s))
    o.append(f'<text x="{X(0,zc)}" y="{Y(-208,zc)}" font-family="Inter" font-weight="800" font-size="{36/zc:.0f}" fill="#fff" text-anchor="middle">12</text>')
    return "\n".join(o)

def hero(s, x, y, sc):
    k = s["stroke"]; sw = s["sw"] / sc * 1.6 if k != "none" else 0
    st = f'stroke="{k}" stroke-width="{sw:.2f}" stroke-linejoin="round" stroke-linecap="round"' if k != "none" else ""
    shade = "url(#hatch)" if s["ink"] else s["hoodie_dark"]
    g = [f'<g transform="translate({x},{y}) scale({sc})" {"filter=\"url(#paperShadow)\"" if s["paper"] else ""}>']
    # тень на полу
    g.append('<ellipse cx="0" cy="2" rx="80" ry="12" fill="#000" opacity="0.25"/>')
    # ноги-палочки и кроссовки
    legc = "#141414" if not s["ink"] else "#1d1a17"
    g.append(f'<path d="M-18,-150 L-26,-16" stroke="{legc}" stroke-width="9" stroke-linecap="round"/>')
    g.append(f'<path d="M18,-150 L30,-16" stroke="{legc}" stroke-width="9" stroke-linecap="round"/>')
    for fx in (-30, 32):
        g.append(f'<path d="M{fx-20},-4 Q{fx-22},-26 {fx-2},-24 L{fx+18},-14 Q{fx+30},-8 {fx+26},0 Z" fill="#6f747c" {st}/>')
        g.append(f'<path d="M{fx-21},-4 L{fx+27},-4 L{fx+26},2 L{fx-20},2 Z" fill="#f2f2f2" {st}/>')
    # левая рука (висит), за корпусом
    g.append(f'<path d="M-52,-250 Q-80,-200 -78,-150 L-58,-148 Q-60,-195 -40,-230 Z" fill="{s["hoodie"]}" {st}/>')
    g.append(f'<circle cx="-68" cy="-140" r="13" fill="#161616" {st}/>')
    # худи
    g.append(f'<path d="M-50,-262 Q0,-280 50,-262 Q66,-240 62,-200 L66,-142 Q0,-128 -66,-142 L-62,-200 Q-66,-240 -50,-262 Z" fill="{s["hoodie"]}" {st}/>')
    g.append(f'<path d="M-62,-170 Q0,-160 62,-170 L66,-142 Q0,-128 -66,-142 Z" fill="{shade}" opacity="{1 if s["ink"] else 0.55}"/>')
    g.append(f'<path d="M-30,-190 L30,-190 L38,-158 L-38,-158 Z" fill="none" {st if st else "stroke=\"#00000030\" stroke-width=\"2\""}/>')
    # капюшон-воротник и шнурки
    g.append(f'<path d="M-40,-262 Q0,-238 40,-262 Q22,-246 0,-244 Q-22,-246 -40,-262 Z" fill="{s["hoodie_dark"] if not s["ink"] else "#e2d7bf"}" {st}/>')
    g.append(f'<path d="M-9,-248 L-11,-214 M9,-248 L11,-214" stroke="#eaeaea" stroke-width="3" stroke-linecap="round"/>')
    # правая рука вперёд с фонариком
    g.append(f'<path d="M48,-252 Q92,-232 118,-206 L104,-190 Q80,-212 44,-224 Z" fill="{s["hoodie"]}" {st}/>')
    g.append(f'<circle cx="116" cy="-196" r="13" fill="#161616" {st}/>')
    g.append(f'<g transform="translate(122,-202) rotate(-18)"><rect x="0" y="-8" width="46" height="16" rx="3" fill="#2b2b2b" {st}/><rect x="40" y="-11" width="12" height="22" rx="2" fill="#555" {st}/></g>')
    # голова
    g.append(f'<circle cx="0" cy="-332" r="80" fill="{s["skin"]}" {st}/>')
    # волосы из-под шапки
    hair = s["hair"] if not s["ink"] else "url(#hatch)"
    g.append(f'<path d="M-78,-345 Q-92,-318 -74,-300 Q-70,-318 -60,-322 Q-56,-306 -44,-300 Q-46,-322 -30,-330 Q-22,-312 -8,-310 Q-12,-330 6,-336 Q14,-318 30,-316 L40,-352 L-74,-372 Z" fill="{hair}" {st}/>')
    g.append(f'<path d="M78,-345 Q90,-322 74,-304 Q70,-322 60,-330 L66,-360 Z" fill="{hair}" {st}/>')
    # шапка
    g.append(f'<path d="M-84,-352 Q-86,-440 0,-448 Q86,-440 84,-352 Z" fill="{s["beanie"]}" {st}/>')
    g.append(f'<path d="M-88,-362 Q0,-382 88,-362 L86,-332 Q0,-352 -86,-332 Z" fill="{s["beanie_dark"]}" {st}/>')
    for i in range(-80, 84, 12):
        g.append(f'<line x1="{i}" y1="{-368 + abs(i)*0.03}" x2="{i}" y2="{-340 + abs(i)*0.03}" stroke="#00000035" stroke-width="2"/>')
    for i in range(-60, 64, 16):
        g.append(f'<path d="M{i},-382 Q{i*1.05},-410 {i*0.9},-436" stroke="#00000020" stroke-width="2" fill="none"/>')
    # лицо: испуганное, смотрит вперёд по проходу
    g.append(f'<ellipse cx="-24" cy="-312" rx="9" ry="12" fill="#151515"/><ellipse cx="26" cy="-312" rx="9" ry="12" fill="#151515"/>')
    g.append('<circle cx="-21" cy="-316" r="3" fill="#fff"/><circle cx="29" cy="-316" r="3" fill="#fff"/>')
    g.append(f'<path d="M-40,-334 Q-28,-344 -12,-338 M12,-338 Q28,-344 40,-334" stroke="#151515" stroke-width="4" fill="none" stroke-linecap="round"/>')
    g.append(f'<path d="M-12,-280 Q-4,-286 2,-281 Q8,-276 14,-282" stroke="#151515" stroke-width="3.5" fill="none" stroke-linecap="round"/>')
    if not s["ink"]:
        g.append('<ellipse cx="-46" cy="-296" rx="10" ry="5" fill="#e88" opacity="0.18"/><ellipse cx="48" cy="-296" rx="10" ry="5" fill="#e88" opacity="0.18"/>')
    g.append('</g>')
    return "\n".join(g)

def defs(s):
    d = ['<defs>',
         '<pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">'
         '<rect width="7" height="7" fill="#f3ecdc"/><line x1="0" y1="0" x2="0" y2="7" stroke="#1d1a17" stroke-width="1.6"/></pattern>',
         '<pattern id="xhatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">'
         '<line x1="0" y1="0" x2="0" y2="8" stroke="#1d1a17" stroke-width="1.3"/></pattern>',
         '<filter id="wobble"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3"/>'
         '<feDisplacementMap in="SourceGraphic" scale="3.2"/></filter>',
         '<filter id="paperShadow"><feDropShadow dx="4" dy="5" stdDeviation="3" flood-opacity="0.35"/></filter>',
         '<filter id="tear"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="7"/>'
         '<feDisplacementMap in="SourceGraphic" scale="5"/><feDropShadow dx="3" dy="4" stdDeviation="2.5" flood-opacity="0.3"/></filter>',
         '<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2"/>'
         '<feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0.22 0"/></filter>',
         '<radialGradient id="beam" cx="0" cy="0.5" r="1"><stop offset="0" stop-color="#fff6c8" stop-opacity="0.85"/>'
         '<stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></radialGradient>',
         '<radialGradient id="vign" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/>'
         '<stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient>',
         '</defs>']
    return "\n".join(d)

def build(name):
    s = STYLES[name]; rnd = random.Random(11)
    hx, hy, hsc = 430, 712, 1.0
    body = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">', defs(s)]
    flt = 'filter="url(#wobble)"' if s["ink"] else ('filter="url(#tear)"' if s["paper"] else "")
    body.append(f'<g {flt}>{aisle(s, rnd)}</g>')
    # ночь
    if s["night"]:
        body.append(f'<rect width="{W}" height="{H}" fill="{s["nightcol"]}" opacity="{s["night"]}" style="mix-blend-mode:multiply"/>')
        body.append(f'<rect width="{W}" height="{H}" fill="#203a80" opacity="0.18" style="mix-blend-mode:screen"/>')
    # луч фонарика
    bx, by = hx + 170 * hsc, hy - 215 * hsc
    if s["ink"]:
        body.append(f'<polygon points="{bx},{by} 860,250 900,360" fill="#efb02a" opacity="0.55"/>')
    else:
        body.append(f'<polygon points="{bx},{by} 820,235 880,385" fill="url(#beam)" style="mix-blend-mode:screen"/>')
        body.append(f'<ellipse cx="860" cy="312" rx="30" ry="62" fill="#fff6c8" opacity="0.35" style="mix-blend-mode:screen"/>')
    body.append(f'<g {"filter=\"url(#wobble)\"" if s["ink"] else ""}>{hero(s, hx, hy, hsc)}</g>')
    if s["night"]:
        body.append(f'<rect width="{W}" height="{H}" fill="url(#vign)"/>')
    if s["paper"] or s["ink"]:
        body.append(f'<rect width="{W}" height="{H}" filter="url(#grain)" style="mix-blend-mode:multiply"/>')
    if s["ink"]:  # подпись от руки, как в скетч-стиле
        body.append('<text x="60" y="80" font-family="DejaVu Serif" font-style="italic" font-size="40" fill="#1d1a17">Night 14.</text>')
    body.append('</svg>')
    os.makedirs("out", exist_ok=True)
    open(f"out/{name}.svg", "w").write("\n".join(body))

if __name__ == "__main__":
    for n in STYLES: build(n)
    print("ok")
