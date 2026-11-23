"""Plan for video #5: Uzak Şehir 75. bölüm fragman analizi (no 3D cards; cold open prepended)."""
BUILD_DIR = "build_v5"
CARDS_DIR = "cards_v5"
SHOTS_FILES = ["v5c_shots.json", "v5d_shots.json"]
CLIP_DIRS = {"fr75": "v5c", "f74a": "v5c", "f74b": "v5c", "ep73p": "v5d"}
FINAL = "body.mp4"
MUSIC_LOUD, MUSIC_DUCK = 0.24, 0.08

INTRO = {"src": "us/fr75.mp4", "chip": "75. BÖLÜM FRAGMANI", "moments": [
    [8.8, 12.7, "Her şey dışımızda kalsa, aramıza giren ne varsa her şey..."],
    [17.2, 20.0, "...annemin bakışları..."],
    [20.5, 24.1, "Çok değil, sadece bir gece dünya bizi unutsun."],
    [29.3, 33.8, "Babama gidip “senin kızın hasta, torun olmaz” deyip nişanı mı atacaksın?"],
    [36.0, 38.9, "Neden? Çürük malı geri çevirsin diye mi?"],
    [52.0, 55.5, "Senin benimle yaşayacağın hayat zaten yalandan ibaret olacaktı."],
    [55.5, 57.6, "Emin misin Cihan Ağa?"]]}

def cards(span, T):
    return {}

def music(CARDS, TOTAL):
    return [("Investigations.mp3", 0, TOTAL * 0.6 + 0.6), ("Thinking_Music.mp3", TOTAL * 0.6, TOTAL, 3.0)]

def layout(span, cap, fsec, CARDS, SHOTS):
    fr = lambda a, b: f"fr75@{a}-{b}"
    ep = lambda a, b: f"ep73p@{a}-{b}"
    bars = {
        "barF": dict(kind="bar", rank="75", title="Uzak Şehir", meta="75. BÖLÜM FRAGMANI · ANALİZ · 30 KASIM PAZARTESİ"),
        "barT": dict(kind="bar", rank="?", title="Hastaneden Koşan Kim?", meta="DİZİVİZYON TEORİLERİ"),
    }
    caps = {
        0: dict(kind="center", text="NİŞAN BOZULUYOR, SİLAH ÇEKİLİYOR 😱", small="Uzak Şehir 75. bölüm fragmanı"),
        3: dict(kind="chip", text="🧬 DNA: Sadakat'in öz oğlu Kaya"),
        4: dict(kind="chip", text="🌙 Alya ve Cihan'ın gece sahnesi"),
        5: dict(kind="chip", text="💬 “Sadece bir gece dünya bizi unutsun”"),
        6: dict(kind="meme", text="BİR GECE HUZUR = BİR SİLAH SESİ 😅"),
        7: dict(kind="chip", text="🔫 Sadakat'in elinde silah"),
        8: dict(kind="chip", text="🩸 Albora'da soy davası"),
        10: dict(kind="chip", text="💔 “Senin kızın hasta, torun olmaz”"),
        11: dict(kind="chip", text="🤫 Berfin'in sırrı ortaya çıktı"),
        12: dict(kind="chip", text="💍 Cihan nişanı bozuyor"),
        13: dict(kind="chip", text="⚔️ Mirza ile Albora arasında yeni savaş?"),
        14: dict(kind="center", text="HASTANEDEN KOŞAN KİM? 🏥", small="Fragmanın son saniyeleri"),
        15: dict(kind="chip", text="1️⃣ Alya ve bebeği için zor günler"),
        16: dict(kind="chip", text="2️⃣ Sadakat'in hedefi Alya olabilir"),
        17: dict(kind="meme", text="MARDİN'DE YÜZÜK TAKMAK KOLAY, ÇIKARMAK ZOR 💍"),
        18: dict(kind="center", text="SİZCE NE OLACAK? 💬", small="30 Kasım Pazartesi · Kanal D · 20.00"),
    }
    def part(i, pool):
        a, b = span(i); return (a, b, pool, False)
    tl = [
        fsec([part(0, [fr(15, 20), fr(55, 67)]), part(1, [fr(8, 14), ep(0, 125)])], "barF", [cap(0)]),
        fsec([part(2, [ep(0, 125), "f74a@8-66"]), part(3, [ep(125, 275), ep(550, 625)])], "barF", [cap(3)]),
        fsec([part(4, [fr(8, 17)]), part(5, [fr(19, 26), ep(625, 760)]), part(6, [ep(625, 760)])], "barF",
             [cap(i) for i in (4, 5, 6)]),
        fsec([part(7, [fr(16, 22)]), part(8, [ep(550, 625), ep(860, 895)])], "barF", [cap(7), cap(8)]),
        fsec([part(9, [fr(26, 40)]), part(10, [fr(27, 40)]), part(11, [fr(26, 40)]), part(12, [fr(40, 57)]),
              part(13, [fr(40, 57), ep(625, 760)])], "barF", [cap(i) for i in (10, 11, 12, 13)]),
        fsec([part(14, [fr(57, 68)]), part(15, ["f74b@8-60", ep(275, 400)]), part(16, [ep(550, 625), fr(16, 22)]),
              part(17, [ep(400, 550)])], "barT", [cap(i) for i in (14, 15, 16, 17)]),
        fsec([part(18, [fr(8, 68)]), part(19, [ep(0, 150), fr(40, 60)])], "barT", [cap(18)]),
    ]
    return bars, caps, {}, tl
