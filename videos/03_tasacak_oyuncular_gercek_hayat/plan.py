"""Plan for video #3: Taşacak Bu Deniz oyuncuları gerçek hayatta.

Footage: per-actor close-up compilations cut from episode 39 (clipsA/<role>.mp4), built by
face clustering (OpenCV YuNet + SFace) and checked against dialogue (Şerif/İso/Oruç at the cliff).
"""
BUILD_DIR = "build_v3"
CARDS_DIR = "cards_v3"
SHOTS_FILES = ["clipsA/shots_actors.json"]
ROLES = ["eleni", "fadime", "iso", "oruc", "esme", "adil", "serif"]
CLIP_DIRS = {r: "clipsA" for r in ROLES}
FINAL = "DiziVizyon_Tasacak_Bu_Deniz_Oyuncular.mp4"
MUSIC_LOUD, MUSIC_DUCK = 0.26, 0.08

ACTORS = {  # segment index of the announcement -> card
    3: dict(key="a1", rank="20", title="Ava Yaman", channel="ELENİ", kicker="1 · KADRONUN EN GENCİ", note="19 Kasım 2006 · İstanbul"),
    7: dict(key="a2", rank="24", title="Zeynep Atılgan", channel="FADİME", kicker="2 · YARGI'NIN PARLA'SI", note="20 Mart 2002 · İstanbul"),
    11: dict(key="a3", rank="30", title="Erdem Şanlı", channel="İSO", kicker="3 · UÇURUMDAKİ SİLAH", note="2 Eylül 1996"),
    15: dict(key="a4", rank="31", title="Burak Yörük", channel="ORUÇ", kicker="4 · BASKETBOLDAN SETE", note="26 Mayıs 1995 · İstanbul"),
    20: dict(key="a5", rank="35", title="Deniz Baysal", channel="ESME", kicker="5 · DİZİNİN KALBİ", note="5 Nisan 1991 · İzmir, Karşıyaka"),
    25: dict(key="a6", rank="38", title="Ulaş Tuna Astepe", channel="ADİL KOÇARİ", kicker="6 · DİZİNİN BİR NUMARASI", note="5 Mayıs 1988 · İzmit"),
    30: dict(key="a7", rank="41", title="Aytek Şayan", channel="ŞERİF FURTUNA", kicker="7 · HERKESİN KORKTUĞU ADAM", note="1985 · İzmir"),
}

def cards(span, T):
    c = {}
    s, e = span(0); c["intro"] = dict(mode="intro", start=s, end=e, sub="TAŞACAK BU DENİZ · OYUNCULAR GERÇEK HAYATTA")
    for i, a in ACTORS.items():
        s, e = span(i)
        c[a["key"]] = dict(mode="rank", start=s, end=e, label="YAŞINDA",
                           **{k: v for k, v in a.items() if k != "key"})
    s, e = span(len(T) - 1, tail=3.0); c["end"] = dict(mode="end", start=s, end=e)
    return c

def music(CARDS, TOTAL):
    m1 = CARDS["a4"]["start"]; m2 = CARDS["a7"]["start"]
    return [("Local_Forecast_-_Elevator.mp3", 0, m1 + 0.6), ("Fluffing_a_Duck.mp3", m1, m2 + 0.6, 4.0),
            ("Investigations.mp3", m2, TOTAL, 20.0)]

def layout(span, cap, fsec, CARDS, SHOTS):
    bars = {}
    for i, a in ACTORS.items():
        bars["bar_" + a["key"]] = dict(kind="bar", rank=a["rank"], title=a["title"],
                                       meta=f"TAŞACAK BU DENİZ · {a['channel']} · {a['rank']} YAŞINDA")
    bars["bar_intro"] = dict(kind="bar", rank="7", title="Taşacak Bu Deniz", meta="OYUNCULAR GERÇEK HAYATTA · DİZİVİZYON")
    caps = {
        1: dict(kind="chip", text="🎂 Eleni 3 gün önce 20 yaşına girdi"),
        2: dict(kind="center", text="7 OYUNCU · 7 HİKAYE", small="En gençten en büyüğe 👇"),
        4: dict(kind="chip", text="🎂 19 Kasım 2006 · İstanbul"),
        5: dict(kind="chip", text="📺 İlk dizi: Bir Derdim Var (2023) · İlk başrol: Eleni"),
        6: dict(kind="meme", text="ANNESİNİ ARAMAYA GELDİ, MİLYONLARCA HAYRAN BULDU 🇬🇷➡️🇹🇷"),
        8: dict(kind="chip", text="🎂 20 Mart 2002 · İstanbul · İlk dizi: Arka Sokaklar"),
        9: dict(kind="chip", text="⚖️ Yargı'nın Parla'sı · Bahar · Kardelenler"),
        10: dict(kind="meme", text="ZEYNEP'E BİR ROMANTİK KOMEDİ LÜTFEN 🙏"),
        12: dict(kind="chip", text="🎂 2 Eylül 1996 · Ateş Kuşları'nın Zıpkın'ı"),
        13: dict(kind="chip", text="🔫 39. bölüm: uçurum sahnesi"),
        14: dict(kind="meme", text="SİLAH HEP EN MASUM KARAKTERE VERİLİR 😅"),
        16: dict(kind="chip", text="🎂 26 Mayıs 1995 · İstanbul · 6 yaşında ilk rol"),
        17: dict(kind="chip", text="🏀 12 yaşında basketbol · Üniversitede tiyatro, sonra gastronomi"),
        18: dict(kind="chip", text="🏆 Altın Kelebek (Seversin) · 💍 Eylül 2026'da evlendi"),
        19: dict(kind="meme", text="BİR HAMSİ TAVA, BÜTÜN KAN DAVALARI BİTER 🐟"),
        21: dict(kind="chip", text="🎂 5 Nisan 1991 · İzmir · Uluslararası ticaret okudu"),
        22: dict(kind="chip", text="🎭 10 yıl Karşıyaka Belediye Tiyatrosu · Fazilet Hanım · Söz · Teşkilat"),
        23: dict(kind="chip", text="👯 Beyaz Yalan'da iki ayrı karakter"),
        24: dict(kind="meme", text="İKİZ YOKSA, BENZEYEN YABANCI MUTLAKA ÇIKAR 👯"),
        26: dict(kind="chip", text="🎂 5 Mayıs 1988 · İzmit · Mimar Sinan Konservatuvarı"),
        27: dict(kind="chip", text="🧥 İlk iş: kostüm asistanı (Osmanlı Cumhuriyeti, 2008)"),
        28: dict(kind="chip", text="🏆 Sen Anlat Karadeniz · Karadayı · Barbaroslar"),
        29: dict(kind="meme", text="TRABZON, ADİL'E FAHRİ HEMŞEHRİLİK VERSİN 🌊"),
        31: dict(kind="chip", text="🎂 1985 · İzmir · Bilkent Tiyatro"),
        32: dict(kind="chip", text="⚔️ Barbaroslar · İnci Taneleri · Kübra"),
        33: dict(kind="chip", text="🤝 Ulaş Tuna Astepe ile Barbaroslar · Deniz Baysal ile hemşehri"),
        34: dict(kind="meme", text="VETERİNER OLACAKTI, EKRANIN EN KORKUNÇ KÖTÜSÜ OLDU 🐾"),
        35: dict(kind="center", text="SİZİN FAVORİNİZ KİM? 💬", small="Yorumlara yazın!"),
        36: dict(kind="chip", text="📺 40. bölüm · 27 Kasım Cuma · TRT 1 · 20.00"),
    }
    def part(i, pool):
        a, b = span(i); return (a, b, pool, False)
    tl = [dict(type="card", name="intro")]
    tl.append(fsec([part(1, ["eleni", "oruc"]), part(2, ROLES)], "bar_intro", [cap(1), cap(2)]))
    for i, a in ACTORS.items():
        k = a["key"]; role = ROLES[int(k[1]) - 1]
        tl.append(dict(type="card", name=k))
        last = {"a1": 6, "a2": 10, "a3": 14, "a4": 19, "a5": 24, "a6": 29, "a7": 34}[k]
        parts = []
        for j in range(i + 1, last + 1):
            pool = [role]
            if j == 33: pool = ["serif", "adil", "esme"]
            parts.append(part(j, pool))
        tl.append(fsec(parts, "bar_" + k, [cap(j) for j in range(i + 1, last + 1) if j in caps]))
    tl.append(fsec([part(35, ["adil", "esme", "eleni", "oruc"]), part(36, ["iso", "fadime", "serif"])], "bar_intro",
                   [cap(35), cap(36)]))
    tl.append(dict(type="card", name="end"))
    return bars, caps, {}, tl
