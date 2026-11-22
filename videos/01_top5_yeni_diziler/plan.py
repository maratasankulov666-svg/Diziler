"""Plan for video #1 (Top 5 new series). Used by build/cards.py and build/build.py."""
BUILD_DIR = "build"
CARDS_DIR = "cards"
SHOTS_FILES = ["shots.json"]
CLIP_DIRS = {}          # default: clips/
FINAL = "DiziVizyon_Top5_Yeni_Diziler.mp4"
MUSIC_LOUD, MUSIC_DUCK = 0.30, 0.09

def cards(span, T):
    RANKS = {
        4: dict(rank=5, title="Güneşin Doğduğu Yer", channel="ATV", kicker="BEŞİNCİ SIRA", note="Burak Özçivit"),
        8: dict(rank=4, title="Anne Yarısı", channel="NOW", kicker="DÖRDÜNCÜ SIRA", note="Burcu Özberk · Cihangir Ceyhan"),
        12: dict(rank=3, title="Tuzlu Kahve", channel="STAR TV", kicker="ÜÇÜNCÜ SIRA", note="Eda Ece · Buğra Gülsoy"),
        16: dict(rank=2, title="Ömür Usta", channel="NOW", kicker="İKİNCİ SIRA", note="Nurgül Yeşilçay · Bülent İnal"),
        20: dict(rank=1, title="Sevdan Bir Ateş", channel="SHOW TV", kicker="BİRİNCİ SIRA", note="Murat Ünalmış · Özge Özacar"),
    }
    c = {}
    s, e = span(0); c["intro"] = dict(mode="intro", start=s, end=e, sub="2026–2027 SEZONU · TOP 5 YENİ DİZİ")
    for i, r in RANKS.items():
        s, e = span(i); c[f"rank{r['rank']}"] = dict(mode="rank", start=s, end=e, **r)
    s, e = span(24); c["grave"] = dict(mode="grave", start=s, end=e, names=["Aşk ve Taht", "Mercan Köşk", "Sevdam Karadeniz", "Haysiyet"])
    s29, e29 = span(29); mid = round(s29 + (e29 - s29) * 0.52, 3)
    c["soon"] = dict(mode="soon", start=mid, end=e29, items=[
        dict(t="SUSUZ YAZ", s="Mert Ramazan Demir|Lizge Cömert", d="ARALIK", c1="#1d3b6b", c2="#0b1330"),
        dict(t="HAMAL", s="Oktay Kaynarca|Fahriye Evcen · Caner Cindoruk", d="ARALIK", c1="#5a1a2a", c2="#170a14")])
    s, e = span(len(T) - 1, tail=3.0); c["end"] = dict(mode="end", start=s, end=e)
    return c

def music(CARDS, TOTAL):
    g0 = CARDS["grave"]["start"]; s0 = CARDS["soon"]["start"] - 6.5
    return [("Local_Forecast_-_Elevator.mp3", 0, g0 + 0.6), ("Fluffing_a_Duck.mp3", g0, s0 + 0.6, 2.0),
            ("Local_Forecast_-_Elevator.mp3", s0, TOTAL, 40.0)]

def layout(span, cap, fsec, CARDS, SHOTS):
    P = {k: sorted(n for n in SHOTS if n.startswith(k + "_")) for k in ["gunes", "anne", "tuzlu", "omur", "sevdan"]}
    TOP = sum(P.values(), [])
    DEAD = ["ask", "mercan", "sevdam", "haysiyet"]

    # ---------- overlays ----------
    bars = {
        "bar_top": dict(kind="bar", title="2026–2027 Sezonu · Top 5 Yeni Dizi", meta="REYTİNG: TİAK / BOX OFFICE TÜRKİYE · 9-15 KASIM"),
        "bar5": dict(kind="bar", rank=5, title="Güneşin Doğduğu Yer", meta="ATV · TİMSBİ PRODUCTIONS"),
        "bar4": dict(kind="bar", rank=4, title="Anne Yarısı", meta="NOW · NTC MEDYA"),
        "bar3": dict(kind="bar", rank=3, title="Tuzlu Kahve", meta="STAR TV · POLL FILMS"),
        "bar2": dict(kind="bar", rank=2, title="Ömür Usta", meta="NOW · AY YAPIM"),
        "bar1": dict(kind="bar", rank=1, title="Sevdan Bir Ateş", meta="SHOW TV · CNP FİLM"),
        "bar_dead": dict(kind="bar", title="Dizi Mezarlığı 💀", meta="BU SEZON ERKEN FİNAL YAPAN DİZİLER"),
        "bar_soon": dict(kind="bar", title="Yakında: Susuz Yaz", meta="AY YAPIM · ARALIK 2026"),
        "stamp": dict(kind="stamp", text="FİNAL"),
    }
    caps = {  # segment index -> overlay
        1: dict(kind="chip", text="📺 Bu sonbahar onlarca yeni dizi başladı"),
        2: dict(kind="chip", text="📈 Bazıları zirvede… 💀 bazıları finalde"),
        3: dict(kind="center", text="TOP 5 YENİ DİZİ", small="+ sonunda: Dizi Mezarlığı 💀"),
        5: dict(kind="chip", text="⭐ Burak Özçivit · Kenan Kozan"),
        6: dict(kind="chip", text="✈️ Almanya ➜ Adana · 17 Eylül'den beri ATV'de"),
        7: dict(kind="meme", text="HERKES ALMANYA'DAN DÖNÜYOR 😂"),
        9: dict(kind="chip", text="⭐ Burcu Özberk · Cihangir Ceyhan"),
        10: dict(kind="chip", text="📈 Sessiz başlangıç ➜ her hafta yükseliş"),
        11: dict(kind="meme", text="ARKA SIRADAN KARNE ŞAMPİYONU 😎"),
        13: dict(kind="chip", text="⭐ Eda Ece · Buğra Gülsoy"),
        14: dict(kind="chip", text="⭐ Nebahat Çehre · Binnur Kaya"),
        15: dict(kind="meme", text="TUZ KAHVEDE DEĞİL, AİLELER ARASINDA ☕🧂"),
        17: dict(kind="chip", text="⭐ Nurgül Yeşilçay · Bülent İnal"),
        18: dict(kind="chip", text="🍞 Koca ekmek almaya çıktı… ve dönmedi"),
        19: dict(kind="meme", text="EKMEK ALMAYA ÇIKAN TELEFONUNU ALSIN! 📱"),
        21: dict(kind="chip", text="⭐ Murat Ünalmış · Özge Özacar · Kapadokya"),
        22: dict(kind="chip", text="🔥 Haftalık Top 10'da 3. sıra · Yeni diziler arasında lider"),
        23: dict(kind="meme", text="BALONLAR UÇUYOR, REYTİNGLER UÇUYOR 🎈"),
        25: dict(kind="meme", text="FİNAL KARARI FRAGMANDAN HIZLI ⚡"),
        27: dict(kind="chip", text="⚰️ Haysiyet · Kanal D · 13. bölümde veda"),
        28: dict(kind="meme", text="BİR DİZİ BİTER, YENİSİ BAŞLAR 😅"),
        30: dict(kind="center", text="SİZİN FAVORİNİZ HANGİSİ? 💬", small="Yorumlara yazın, en komiği bir sonraki videoda!"),
    }
    sub26 = [dict(kind="chip", text="⚰️ Aşk ve Taht · ATV"), dict(kind="chip", text="⚰️ Mercan Köşk · ATV · 7 bölüm"),
             dict(kind="chip", text="⚰️ Sevdam Karadeniz · NOW")]
    tl = [dict(type="card", name="intro")]
    tl.append(fsec([(span(1)[0], span(1)[1], TOP, False), (span(2)[0], span(2)[1], DEAD + TOP[:3], False), (span(3)[0], span(3)[1], TOP, False)],
                   "bar_top", [cap(1), cap(2), cap(3)]))
    blocks = [(4, "rank5", "gunes", "bar5"), (8, "rank4", "anne", "bar4"), (12, "rank3", "tuzlu", "bar3"),
              (16, "rank2", "omur", "bar2"), (20, "rank1", "sevdan", "bar1")]
    for k, (i0, card, key, bar) in enumerate(blocks):
        tl.append(dict(type="card", name=card))
        segs = [i0 + 1, i0 + 2, i0 + 3]
        tl.append(fsec([(span(segs[0])[0], span(segs[-1])[1], P[key], False)], bar, [cap(j) for j in segs]))
    tl.append(dict(type="card", name="grave"))
    s26, e26 = span(26); th = (e26 - s26) / 3
    parts = [(span(25)[0], span(25)[1], DEAD, True)] + [(s26 + j * th, s26 + (j + 1) * th, [d], True) for j, d in enumerate(DEAD[:3])] + \
            [(span(27)[0], span(27)[1], ["haysiyet"], True), (span(28)[0], span(28)[1], DEAD, True)]
    tl.append(fsec(parts, "bar_dead", [cap(25)] + [(s26 + j * th + .2, s26 + (j + 1) * th - .1, f"cap26_{j}") for j in range(3)] + [cap(27), cap(28)],
                   gray=True, stamp=True))
    s29, e29 = span(29)
    tl.append(fsec([(s29, CARDS["soon"]["start"], ["susuz"], False)], "bar_soon", []))
    tl.append(dict(type="card", name="soon"))
    tl.append(fsec([(span(30)[0], span(30)[1], TOP, False)], "bar_top", [cap(30)]))
    tl.append(dict(type="card", name="end"))

    extra = {f"cap26_{j}": v for j, v in enumerate(sub26)}
    return bars, caps, extra, tl
