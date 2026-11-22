# Video #3: Taşacak Bu Deniz oyuncuları gerçek hayatta (yaşları, memleketleri, eski dizileri)
# Order: youngest -> oldest. Facts: tr.wikipedia (Astepe, Baysal, Yörük, Ava Yaman, dizi sayfası)
# + news bios (Erdem Şanlı, Zeynep Atılgan, Aytek Şayan). Ages as of 22.11.2026.
# (block, style instruction, text, pause after)
SEGMENTS = [
    # 0
    ("intro", "Enerjik ve neşeli sunucu, gülümseyerek",
     "Çaylar demlendi, kumanda elinizde... DiziVizyon'a hoş geldiniz! Bugün Taşacak Bu Deniz'in oyuncularını ekranın dışında tanıyoruz.", 0.6),
    ("intro", "Şaşkın ve merak uyandıran",
     "Biliyor muydunuz? Eleni'yi canlandıran oyuncu, daha üç gün önce yirmi yaşına girdi. Oruç ise çocukken oyunculuğu bırakıp basketbolcu olmak istemiş!", 0.6),
    ("intro", "Enerjik ve samimi, sunucu gibi",
     "Yedi oyuncu, yedi hikaye. En gençten en büyüğe doğru sıralıyoruz. Bakalım en sevdiğiniz oyuncu kaçıncı sırada?", 1.0),

    # 3 Ava Yaman
    ("a1", "Enerjik sunucu, heyecanlı bir duyuru yapar gibi",
     "Kadromuzun en genci: Eleni'yi canlandıran Ava Yaman.", 0.6),
    ("a1", "Sakin ve anlatıcı, sıcak bir sesle",
     "Ava Yaman, on dokuz Kasım iki bin altıda İstanbul'da doğdu. Yani bu hafta yirmi yaşına girdi. İyi ki doğdun Ava!", 0.5),
    ("a1", "Sakin ve anlatıcı, sıcak bir sesle",
     "Küçük yaştan beri müziğe ve oyunculuğa ilgi duyan Ava, kamera önü oyunculuk eğitimi aldı. İlk dizisi iki bin yirmi üçte Bir Derdim Var oldu. Taşacak Bu Deniz ise onun ilk başrolü.", 0.5),
    ("a1", "Esprili, göz kırpar gibi, hafif gülerek",
     "Dizinin ilk bölümünden sonra sosyal medya takipçileri bir anda patladı. Yunanistan'dan annesini aramaya gelen Eleni, Türkiye'de milyonlarca hayran buldu!", 0.9),

    # 7 Zeynep Atılgan
    ("a2", "Enerjik sunucu, heyecanlı bir duyuru yapar gibi",
     "İkinci sırada Adil'in kız kardeşi Fadime var: Zeynep Atılgan.", 0.6),
    ("a2", "Sakin ve anlatıcı, sıcak bir sesle",
     "Zeynep Atılgan, yirmi Mart iki bin ikide İstanbul'da doğdu ve yirmi dört yaşında. Ekrana iki bin yirmi birde Arka Sokaklar'da konuk oyuncu olarak adım attı.", 0.5),
    ("a2", "Sakin ve anlatıcı, sıcak bir sesle",
     "Onu asıl tanıtan rol ise Yargı dizisindeki Parla oldu. Bahar ve Kardelenler de onun dizileri arasında.", 0.5),
    ("a2", "Esprili, göz kırpar gibi, hafif gülerek",
     "Yargı'da mahkeme, Taşacak Bu Deniz'de kan davası... Zeynep'e bir romantik komedi lütfen, kızcağız biraz nefes alsın!", 0.9),

    # 11 Erdem Şanlı
    ("a3", "Enerjik sunucu, heyecanlı bir duyuru yapar gibi",
     "Üçüncü sırada, son bölümün en ağır yükünü taşıyan isim: İso'yu canlandıran Erdem Şanlı.", 0.6),
    ("a3", "Sakin ve anlatıcı, sıcak bir sesle",
     "Erdem Şanlı, iki Eylül bin dokuz yüz doksan altı doğumlu, yani otuz yaşında. Daha önce Ateş Kuşları dizisinde Zıpkın karakteriyle dikkat çekti.", 0.5),
    ("a3", "Duygusal ve hüzünlü, içi burkularak",
     "Otuz dokuzuncu bölümde uçurum kenarındaki o sahne... İso'nun elleri titrerken, Erdem'in gözlerindeki korku hepimizi ekrana kilitledi.", 0.5),
    ("a3", "Esprili, göz kırpar gibi, hafif gülerek",
     "Bu arada, Türk dizilerinde silahı hep en masum karaktere verirler. Senaristler, bu ne acımasızlık!", 0.9),

    # 15 Burak Yörük
    ("a4", "Enerjik sunucu, heyecanlı bir duyuru yapar gibi",
     "Dördüncü sırada Furtuna'ların hırçın oğlu Oruç: Burak Yörük.", 0.6),
    ("a4", "Sakin ve anlatıcı, sıcak bir sesle",
     "Burak Yörük, yirmi altı Mayıs bin dokuz yüz doksan beşte İstanbul'da doğdu ve otuz bir yaşında. Kamera karşısına ilk kez sadece altı yaşındayken geçti.", 0.5),
    ("a4", "Şaşkın ve merak uyandıran",
     "Ama on iki yaşında oyunculuğu bıraktı ve basketbol oynamaya başladı! On dört yaşında ise oyunculuk eğitimine geri döndü. Üniversitede önce tiyatro, sonra gastronomi okudu.", 0.5),
    ("a4", "Enerjik ve neşeli",
     "Dört N Bir K İlk Aşk, Aşk Mantık İntikam ve Seversin ile tanındı. Seversin dizisiyle Altın Kelebek ödülünü kazandı. Ve bu yıl, Eylül ayında Tuana Yılmaz ile sürpriz bir düğünle evlendi.", 0.5),
    ("a4", "Esprili, göz kırpar gibi, hafif gülerek",
     "Gastronomi okumuş bir Oruç... Kavga bitince bir hamsi tava yapsa, Karadeniz'deki bütün kan davaları biterdi!", 0.9),

    # 20 Deniz Baysal
    ("a5", "Enerjik sunucu, heyecanlı bir duyuru yapar gibi",
     "Beşinci sırada dizinin kalbi Esme: Deniz Baysal.", 0.6),
    ("a5", "Sakin ve anlatıcı, sıcak bir sesle",
     "Deniz Baysal, beş Nisan bin dokuz yüz doksan birde İzmir Karşıyaka'da doğdu ve otuz beş yaşında. Üniversitede oyunculuk değil, uluslararası ticaret okudu.", 0.5),
    ("a5", "Sakin ve anlatıcı, sıcak bir sesle",
     "Ama sahneden hiç kopmadı: tam on yıl Karşıyaka Belediye Tiyatrosu'nda oynadı. Sonra Fazilet Hanım ve Kızları, Söz ve Teşkilat ile zirveye çıktı. Yedinci Koğuştaki Mucize filmindeki öğretmeni de o canlandırdı.", 0.5),
    ("a5", "Şaşkın ve merak uyandıran",
     "Küçük bir sır: Beyaz Yalan dizisinde birbirine tıpatıp benzeyen iki farklı karakteri aynı anda oynadı.", 0.5),
    ("a5", "Esprili, göz kırpar gibi, hafif gülerek",
     "Türk dizilerinin değişmez kuralı: ikiz yoksa, birbirine benzeyen yabancı mutlaka çıkar!", 0.9),

    # 25 Ulaş Tuna Astepe
    ("a6", "Enerjik sunucu, heyecanlı bir duyuru yapar gibi",
     "Altıncı sırada dizinin bir numarası Adil Koçari: Ulaş Tuna Astepe.", 0.6),
    ("a6", "Sakin ve anlatıcı, sıcak bir sesle",
     "Ulaş Tuna Astepe, beş Mayıs bin dokuz yüz seksen sekizde İzmit'te doğdu ve otuz sekiz yaşında. Lisede İstanbul Erkek Lisesi'nde yatılı okudu, sonra Mimar Sinan Konservatuvarı'nda tiyatro eğitimi aldı.", 0.5),
    ("a6", "Şaşkın ve merak uyandıran",
     "Peki ilk film işi neydi? Oyunculuk değil! İki bin sekizde Osmanlı Cumhuriyeti filminde kostüm asistanı olarak çalıştı.", 0.5),
    ("a6", "Enerjik ve neşeli",
     "Sonra Karadayı'da Orhan, Barbaroslar'da Hızır Reis oldu. Ve tabii Sen Anlat Karadeniz'in Tahir'i! O diziyle Altın Kelebek'te en iyi dizi çifti ödülünü aldı.", 0.5),
    ("a6", "Esprili, göz kırpar gibi, hafif gülerek",
     "İzmitli ama Karadeniz onu bırakmıyor. Önce Tahir, şimdi Adil... Trabzon artık ona fahri hemşehrilik vermeli!", 0.9),

    # 30 Aytek Şayan
    ("a7", "Gizemli ve ciddi, alçak sesle",
     "Ve listenin son ismi, herkesin korktuğu adam: Şerif Furtuna'yı canlandıran Aytek Şayan.", 0.6),
    ("a7", "Sakin ve anlatıcı, sıcak bir sesle",
     "Aytek Şayan, bin dokuz yüz seksen beşte İzmir'de doğdu ve kırk bir yaşında. Gençliğinde veteriner olmak istiyordu ama Bilkent Üniversitesi'nde tiyatro okudu.", 0.5),
    ("a7", "Sakin ve anlatıcı, sıcak bir sesle",
     "Barbaroslar'da Şahbaz, İnci Taneleri'nde polis Veli, Netflix dizisi Kübra'da Serhat... Bana Karanlığını Anlat filminde de rol aldı.", 0.5),
    ("a7", "Şaşkın ve merak uyandıran",
     "İlginç bir detay: Ulaş Tuna Astepe ile Barbaroslar'da da aynı dizideydiler. Deniz Baysal ile de hemşehriler, ikisi de İzmirli!", 0.5),
    ("a7", "Esprili, göz kırpar gibi, hafif gülerek",
     "Hayvanları iyileştirmek isteyen bir çocuk büyüyünce ekranın en korkutucu kötüsü oldu. Şerif, sen aslında iyi birisin değil mi?", 0.9),

    # 35 outro
    ("outro", "Samimi ve sıcak, izleyiciyle sohbet eder gibi",
     "Peki sizin favoriniz hangisi? Hangi oyuncuyu daha önce başka bir dizide izlemiştiniz? Yorumlara yazın, en güzel yorumu bir sonraki videoda okuyacağım.", 0.5),
    ("outro", "Enerjik ve samimi, sunucu gibi",
     "Kırkıncı bölüm yirmi yedi Kasım Cuma akşamı TRT bir'de. Biz de yayından hemen sonra burada olacağız.", 0.5),
    ("outro", "Enerjik ve neşeli sunucu, programı kapatır gibi",
     "Abone olmayı ve bildirimleri açmayı unutmayın. Kumandayı bırakmayın, görüşmek üzere!", 0.0),
]
