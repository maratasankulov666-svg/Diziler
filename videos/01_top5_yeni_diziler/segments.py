# Script segments: (block, style instruction in Turkish, text, pause in seconds after)
# Numbers are written out as words so the model reads them correctly.
SEGMENTS = [
    # --- INTRO ---
    ("intro", "Profesyonel televizyon sunucusu, enerjik ve karizmatik, gülümseyerek",
     "Çaylar demlendi, kumanda elinizde... DiziVizyon'a hoş geldiniz! Ben de sizin dizi dostunuzum.", 0.7),
    ("intro", "Esprili ve ironik, hikaye anlatır gibi",
     "Bu sonbahar ekranlara o kadar çok yeni dizi geldi ki, kumandanın pilleri bile yetişemedi.", 0.6),
    ("intro", "Ciddi ve dramatik, haber spikeri gibi",
     "Ama reytingler acımasız. Bazı diziler zirveye oturdu... bazıları ise daha adımızı öğrenemeden veda etti.", 0.7),
    ("intro", "Enerjik ve merak uyandıran, sunucu gibi",
     "Bugün, bu sezon başlayan ve reyting listelerinde en üstte yer alan beş yeni diziyi sıralıyoruz. Sonunda da küçük bir sürprizim var: dizi mezarlığı! Hazırsanız başlıyoruz.", 1.0),

    # --- 5. Güneşin Doğduğu Yer ---
    ("5", "Enerjik sunucu, heyecanlı bir duyuru yapar gibi",
     "Beşinci sırada... ATV'nin iddialı yapımı, Güneşin Doğduğu Yer!", 0.6),
    ("5", "Sakin ve anlatıcı, sıcak bir sesle",
     "Dizinin başrolünde Burak Özçivit var ve Kenan Kozan karakterine hayat veriyor. Yanında Sibel Taşçıoğlu, Görkem Sevindik ve Devrim Yakut gibi güçlü isimler yer alıyor.", 0.5),
    ("5", "Sakin ve anlatıcı, sıcak bir sesle",
     "Hikaye Almanya'da başlayan bir aşkın Adana'ya uzanan yolculuğunu anlatıyor. Dizi on yedi Eylül'de başladı ve kanalın en önemli kozlarından biri olarak görülüyor.", 0.5),
    ("5", "Esprili, göz kırpar gibi, hafif gülerek",
     "Bu arada fark ettiniz mi? Bu sezon herkes Almanya'dan dönüyor. Gurbetçiler bile bu kadar sık dönmüyor!", 0.9),

    # --- 4. Anne Yarısı ---
    ("4", "Enerjik sunucu, heyecanlı bir duyuru yapar gibi",
     "Dördüncü sırada... NOW ekranlarının sessiz yükselişi, Anne Yarısı!", 0.6),
    ("4", "Duygusal ve sıcak, yumuşak bir sesle",
     "Burcu Özberk ve Cihangir Ceyhan'ın başrolünü paylaştığı dizi, Almanya'da hayatını kaybeden kardeşinin mirasını üstlenen bir kadının hikayesini anlatıyor. Hikaye Kapadokya'da başlıyor.", 0.5),
    ("4", "Etkilenmiş ve şaşkın, yükselen bir tonlamayla",
     "Dizi ilk bölümde oldukça sessiz başladı, hatta final dedikoduları bile çıktı. Ama sonra her hafta biraz daha yükseldi ve haftalık listede ilk ona girmeyi başardı.", 0.5),
    ("4", "Esprili ve ironik, hikaye anlatır gibi",
     "Kısacası Anne Yarısı, sınıfın arka sırasında oturup karne gününde herkesi şaşırtan öğrenci gibi!", 0.9),

    # --- 3. Tuzlu Kahve ---
    ("3", "Enerjik sunucu, heyecanlı bir duyuru yapar gibi",
     "Ve üçüncü sırada... Star TV'nin romantik komedisi, Tuzlu Kahve!", 0.6),
    ("3", "Neşeli ve sıcak, konuşurken gülümseyerek",
     "Başrollerde Eda Ece ve Buğra Gülsoy var. Derin köklü bir İstanbul ailesinin kızı, Mehmet ise Amerika'dan dönen bir holding veliahdı. İkisi tanışınca, birbirine hiç benzemeyen iki aile de mecburen bir araya geliyor.", 0.5),
    ("3", "Neşeli ve sıcak, konuşurken gülümseyerek",
     "Kadroda Nebahat Çehre ve Binnur Kaya'nın olması da ayrı bir keyif. Komedi ile dramı karıştıran, hafif ama tatlı bir dizi.", 0.5),
    ("3", "Esprili, göz kırpar gibi, hafif gülerek",
     "Adı da çok yerinde. Kız isteme geleneğini bilenler bilir: damadın kahvesine tuz koymak. Bu dizide tuz kahvede değil, iki ailenin arasında!", 0.9),

    # --- 2. Ömür Usta ---
    ("2", "Enerjik sunucu, heyecanlı bir duyuru yapar gibi",
     "İkinci sıraya geldik... NOW'ın güçlü kozu, Ömür Usta!", 0.6),
    ("2", "Sakin ve anlatıcı, sıcak bir sesle",
     "Başrollerde Nurgül Yeşilçay ve Bülent İnal var, yapım Ay Yapım imzalı. Dizi kısa sürede haftanın en çok izlenen yapımları arasına girdi.", 0.5),
    ("2", "Ciddi ve gizemli, alçak sesle",
     "Hikaye şöyle: bir kadının kocası bir gün ekmek almaya çıkıyor... ve bir daha geri dönmüyor. Kadın da çocuklarıyla birlikte hayatını yeniden kurmak zorunda kalıyor.", 0.6),
    ("2", "Esprili ve ironik, neredeyse gülerek",
     "Evet, yıllardır şakasını yaptığımız o efsane, sonunda dizi oldu! Bundan sonra evde biri ekmek almaya çıkacaksa, lütfen telefonunu yanına alsın.", 1.0),

    # --- 1. Sevdan Bir Ateş ---
    ("1", "Çok heyecanlı ve coşkulu, büyük bir duyuru yapar gibi",
     "Ve birinci sırada... bu sezonun en çok izlenen yeni dizisi... Show TV'den, Sevdan Bir Ateş!", 0.8),
    ("1", "Tutkulu ve dramatik, sıcak bir sesle",
     "Murat Ünalmış ve Özge Özacar'ın başrolünde olduğu dizi, Kapadokya'da geçiyor. Kozaklı ailesinin büyük oğlu Mirza ile Leyla'nın yıllara yayılan, imkansız ve tutkulu aşkını anlatıyor.", 0.5),
    ("1", "Etkilenmiş ve heyecanlı, yükselen bir tonlamayla",
     "Haftalık listede sadece Taşacak Bu Deniz ve Uzak Şehir'in arkasında, üçüncü sırada yer aldı. Yani yeni diziler arasında açık ara lider!", 0.6),
    ("1", "Esprili, göz kırpar gibi, hafif gülerek",
     "Kapadokya'da balonlar uçuyor, Mirza ile Leyla'nın aşkı ise reytingleri uçuruyor!", 1.0),

    # --- Dizi mezarlığı ---
    ("graveyard", "Abartılı derecede hüzünlü, şakayla karışık bir yas tutar gibi",
     "Ve şimdi... söz verdiğim gibi... dizi mezarlığı.", 0.8),
    ("graveyard", "Esprili ve ironik, hikaye anlatır gibi",
     "Bu sezon final kararları, fragmanlardan bile hızlı geldi.", 0.5),
    ("graveyard", "Sakin ve anlatıcı, hafif hüzünlü",
     "Akın Akınözü'nün Alaaddin Keykubat'ı canlandırdığı Aşk ve Taht, sadece birkaç bölümde vedalaştı. Mercan Köşk yedinci bölümünde, Sevdam Karadeniz ise dördüncü bölümünde final yaptı.", 0.5),
    ("graveyard", "Sakin ve anlatıcı, hafif hüzünlü",
     "Kanal D'nin Haysiyet dizisi için de final kararı alındı. Dizinin on üçüncü bölümüyle ekrana veda edeceği konuşuluyor.", 0.5),
    ("graveyard", "Esprili ve ironik, neredeyse gülerek",
     "Bu dizilerin oyuncularına buradan sesleniyorum: üzülmeyin, Türkiye'de bir dizinin bitmesi, yeni bir dizinin başlaması demek!", 1.0),

    # --- Yakında ---
    ("soon", "Merak uyandıran ve heyecanlı, sunucu gibi",
     "Ve yakında... Aralık ayında iki yeni dizi daha geliyor. Mert Ramazan Demir ve Lizge Cömert'in başrolündeki Susuz Yaz ile, Oktay Kaynarca, Fahriye Evcen ve Caner Cindoruk'un buluştuğu Hamal.", 0.8),

    # --- OUTRO ---
    ("outro", "Samimi ve sıcak, izleyiciyle sohbet eder gibi",
     "Peki sizin favoriniz hangisi? Sizce hangi dizi bir sonraki final kurbanı olacak? Tahminlerinizi yorumlara yazın, en komik yorumu bir sonraki videoda okuyacağım.", 0.5),
    ("outro", "Profesyonel televizyon sunucusu, enerjik ve sıcak, programı kapatır gibi",
     "Abone olmayı ve bildirimleri açmayı unutmayın. Kumandayı bırakmayın, görüşmek üzere!", 0.0),
]
