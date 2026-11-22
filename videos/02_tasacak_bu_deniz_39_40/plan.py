"""Plan for video #2: Taşacak Bu Deniz 39. bölüm özeti + 40. bölüm fragman analizi."""
BUILD_DIR = "build_v2"
CARDS_DIR = "cards_v2"
SHOTS_FILES = ["v2/shots_v2.json"]
CLIP_DIRS = {"tbd39_end": "v2", "tbd40_fragman": "v2"}
FINAL = "DiziVizyon_Tasacak_Bu_Deniz_39_40.mp4"
MUSIC_LOUD, MUSIC_DUCK = 0.26, 0.08

EP = "tbd39_end"      # last 31 minutes of episode 39 (starts at 2:06:40 of the episode)
FR = "tbd40_fragman"  # episode 40 trailer (first ~7 s is a sponsor ad, skipped)

def cards(span, T):
    c = {}
    s, e = span(0); c["intro"] = dict(mode="intro", start=s, end=e, sub="TAŞACAK BU DENİZ · 39. BÖLÜM + 40. BÖLÜM FRAGMANI")
    s, e = span(3); c["ch1"] = dict(mode="rank", start=s, end=e, rank="39", label="BÖLÜM", kicker="1. DURAK",
                                    title="39. Bölümde Neler Oldu?", channel="TRT 1", note="Taşacak Bu Deniz")
    s, e = span(13); c["ch2"] = dict(mode="rank", start=s, end=e, rank="40", label="FRAGMAN", kicker="2. DURAK",
                                     title="40. Bölüm Fragman Analizi", channel="27 KASIM CUMA", note="TRT 1 · 20.00")
    s, e = span(18); c["ch3"] = dict(mode="rank", start=s, end=e, rank="?", label="TEORİ", kicker="3. DURAK",
                                     title="Adil Ölüyor mu?", channel="3 TEORİ", note="Hangisi doğru? Yorumlara yazın")
    s, e = span(len(T) - 1, tail=3.0); c["end"] = dict(mode="end", start=s, end=e)
    return c

def music(CARDS, TOTAL):
    t3 = CARDS["ch3"]["start"]; t4 = CARDS["end"]["start"] - 9
    return [("Investigations.mp3", 0, t3 + 0.6), ("Thinking_Music.mp3", t3, t4 + 0.6, 5.0),
            ("Investigations.mp3", t4, TOTAL, 60.0)]

def layout(span, cap, fsec, CARDS, SHOTS):
    ep = lambda a, b: f"{EP}@{a}-{b}"
    fr = lambda a, b: f"{FR}@{a}-{b}"
    bars = {
        "bar39": dict(kind="bar", rank="39", title="Taşacak Bu Deniz", meta="TRT 1 · 39. BÖLÜM ÖZETİ"),
        "bar40": dict(kind="bar", rank="40", title="Taşacak Bu Deniz", meta="TRT 1 · 40. BÖLÜM FRAGMAN ANALİZİ · 27 KASIM"),
        "barT": dict(kind="bar", rank="?", title="Adil Ölüyor mu?", meta="DİZİVİZYON TEORİLERİ"),
    }
    caps = {
        1: dict(kind="chip", text="⚠️ Dikkat: 39. bölümden spoiler içerir"),
        2: dict(kind="center", text="39. BÖLÜM + 40. BÖLÜM FRAGMANI", small="Adil ölüyor mu? 🤔"),
        4: dict(kind="chip", text="📺 TRT 1 · Cuma 20.00 · Haftanın 1 numarası"),
        5: dict(kind="chip", text="♟️ Esme'nin planı: araziyi kirala, madeni kendin işlet"),
        6: dict(kind="meme", text="ŞERİF DAMA OYNUYOR, ESME ŞAH MAT DİYOR ♟️"),
        7: dict(kind="chip", text="🔍 Eski sır: suç yıllarca Koçarilere atılmış"),
        8: dict(kind="chip", text="⛓️ Şerif, Fadime ile İso'yu kaçırdı"),
        9: dict(kind="chip", text="🔫 “Ya Adil'i vurursun… ya da ben Oruç'u vururum”"),
        10: dict(kind="chip", text="💔 “Vur beni İso… seni çok seviyorum”"),
        12: dict(kind="meme", text="ARKADAŞLAR, BİRAZ DA ÇAY BAHÇESİNDE KONUŞUN ☕"),
        14: dict(kind="chip", text="🏥 “Sol tarafta solunum sesi yok”"),
        15: dict(kind="chip", text="🩺 “Doktor olunca ağlayamıyorum”"),
        16: dict(kind="chip", text="😢 “Ya uyanamazsın?”"),
        17: dict(kind="center", text="“ADİL ABİ… KURTULAMAMIŞ”", small="40. bölüm · 27 Kasım Cuma"),
        19: dict(kind="chip", text="1️⃣ Adil yaşıyor"),
        20: dict(kind="chip", text="2️⃣ Adil komaya giriyor"),
        21: dict(kind="chip", text="3️⃣ Ölmüş gibi gösterilecek (favorim)"),
        22: dict(kind="meme", text="FRAGMANDA ÖLEN, BÖLÜMDE DİRİLİR 😅"),
        23: dict(kind="chip", text="🤔 İso bu yükle nasıl yaşayacak?"),
        24: dict(kind="center", text="SİZCE ADİL YAŞAYACAK MI? 💬", small="Teorinizi yorumlara yazın!"),
    }
    def part(i, pool, gray=False):
        a, b = span(i); return (a, b, pool, gray)
    tl = [dict(type="card", name="intro")]
    tl.append(fsec([part(1, [ep(1100, 1640)]), part(2, [fr(7, 66), ep(1500, 1790)])], "bar39", [cap(1), cap(2)]))
    tl.append(dict(type="card", name="ch1"))
    tl.append(fsec([part(4, [ep(0, 330)]), part(5, [ep(380, 530)]), part(6, [ep(400, 530)]), part(7, [ep(530, 700)]),
                    part(8, [ep(690, 1100)]), part(9, [ep(1100, 1340)]), part(10, [ep(1380, 1620)]),
                    part(11, [ep(1600, 1790)]), part(12, [ep(850, 1400)])],
                   "bar39", [cap(i) for i in (4, 5, 6, 7, 8, 9, 10, 12)]))
    tl.append(dict(type="card", name="ch2"))
    tl.append(fsec([part(14, [fr(36, 66)]), part(15, [fr(18, 48)]), part(16, [fr(28, 58)]), part(17, [fr(52, 70)])],
                   "bar40", [cap(i) for i in (14, 15, 16, 17)]))
    tl.append(dict(type="card", name="ch3"))
    tl.append(fsec([part(19, [fr(7, 66)]), part(20, [fr(30, 66), ep(1640, 1790)]), part(21, [ep(1100, 1640)]),
                    part(22, [fr(7, 66)]), part(23, [ep(1380, 1640)]), part(24, [fr(7, 66), ep(1100, 1790)])],
                   "barT", [cap(i) for i in (19, 20, 21, 22, 23, 24)]))
    tl.append(dict(type="card", name="end"))
    return bars, caps, {}, tl
