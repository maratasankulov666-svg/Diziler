"""Plan for video #4: Taşacak Bu Deniz 40. bölüm 2. fragman analizi.

New format (23.11.2026): no 3D cards. The cold open (fragman_intro.py, original sound) is prepended
after build; this plan covers the commentary part, which starts with footage + voice immediately.
"""
BUILD_DIR = "build_v4"
CARDS_DIR = "cards_v4"
SHOTS_FILES = ["v4/shots_v4.json", "clipsA/shots_actors.json"]
CLIP_DIRS = {"fr2": "v4c", **{r: "clipsA" for r in ["eleni", "fadime", "iso", "oruc", "esme", "adil", "serif"]}}
FINAL = "body.mp4"
MUSIC_LOUD, MUSIC_DUCK = 0.24, 0.08

INTRO = {"src": "v4/fr2.mp4", "chip": "40. BÖLÜM 2. FRAGMANI", "moments": [
    [8.0, 14.2, "Başımıza gelenleri biri bana anlatsa, bir türküden duysam..."],
    [14.2, 17.5, "...oturur ağlardım."],
    [17.9, 20.4, "Ama bunların hepsi bizim başımıza geldi."],
    [20.5, 24.2, "Biz seninle aynı taraftayız. Dağılmaya vaktimiz yok."],
    [55.3, 59.3, "Önce babamı, sonra kardeşimi öldürdüler. Yani senin babanı."],
    [59.3, 63.0, "Hırçın denizin fırtına kızı. Anam da öyle derdi."]]}

def cards(span, T):
    return {}

def music(CARDS, TOTAL):
    return [("Investigations.mp3", 0, TOTAL * 0.55 + 0.6), ("Thinking_Music.mp3", TOTAL * 0.55, TOTAL, 3.0)]

def layout(span, cap, fsec, CARDS, SHOTS):
    fr = lambda a, b: f"fr2@{a}-{b}"
    bars = {
        "barF": dict(kind="bar", rank="40", title="Taşacak Bu Deniz", meta="40. BÖLÜM 2. FRAGMANI · ANALİZ · 27 KASIM CUMA"),
        "barT": dict(kind="bar", rank="?", title="Adil Öldü mü?", meta="DİZİVİZYON TEORİLERİ"),
    }
    caps = {
        0: dict(kind="center", text="“ADİL KOÇARİ” YAZAN BİR MEZAR 😱", small="40. bölüm 2. fragmanı"),
        2: dict(kind="chip", text="⚰️ Fragman bir cenazeyle açılıyor"),
        3: dict(kind="chip", text="🪦 Mezar işaretinde: ADİL KOÇARİ"),
        4: dict(kind="chip", text="🧊 Esme'nin yüzü taş gibi"),
        5: dict(kind="meme", text="MEZAR TAŞI GÖRMEK ÖLÜM DEMEK DEĞİLDİR 😅"),
        7: dict(kind="chip", text="🎶 “Bir türküden duysam, oturur ağlardım”"),
        8: dict(kind="chip", text="🤝 “Biz seninle aynı taraftayız”"),
        9: dict(kind="chip", text="🩸 “Önce babamı, sonra kardeşimi öldürdüler”"),
        10: dict(kind="chip", text="🌊 “Hırçın denizin fırtına kızı”"),
        11: dict(kind="center", text="ADİL AYAKTA?! 👀", small="Fragmanın son saniyeleri"),
        13: dict(kind="chip", text="1️⃣ Ölmüş gibi gösteriliyor (favorim)"),
        14: dict(kind="chip", text="2️⃣ Son sahne bir anı ya da rüya"),
        15: dict(kind="chip", text="3️⃣ Tabutta bambaşka biri var"),
        16: dict(kind="meme", text="40. BÖLÜMDE BAŞROL GÖMÜLMEZ ARKADAŞLAR 😎"),
        17: dict(kind="center", text="SİZCE ADİL YAŞIYOR MU? 💬", small="27 Kasım Cuma · TRT 1 · 20.00"),
    }
    def part(i, pool):
        a, b = span(i); return (a, b, pool, False)
    tl = [
        fsec([part(0, [fr(9, 26)]), part(1, ["esme", "adil"])], "barF", [cap(0)]),
        fsec([part(2, [fr(8, 26)]), part(3, [fr(12, 26)]), part(4, [fr(12, 26), "esme"]), part(5, ["adil"])],
             "barF", [cap(i) for i in (2, 3, 4, 5)]),
        fsec([part(6, [fr(26, 66)]), part(7, ["esme", fr(26, 66)]), part(8, ["oruc", "eleni"]),
              part(9, ["serif", fr(44, 62)]), part(10, ["esme"])], "barF", [cap(i) for i in (7, 8, 9, 10)]),
        fsec([part(11, ["adil", "esme"]), part(12, [fr(44, 66)]), part(13, ["serif", "adil"]), part(14, ["esme"]),
              part(15, [fr(8, 26)]), part(16, ["adil"])], "barT", [cap(i) for i in (11, 13, 14, 15, 16)]),
        fsec([part(17, ["esme", "adil", "eleni"]), part(18, ["oruc", "iso", "fadime"])], "barT", [cap(17)]),
    ]
    return bars, caps, {}, tl
