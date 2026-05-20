// Nihongo Hub - Japanese Alphabet Database
// Contains standard Hiragana and Katakana grouped by rows and types, with pronunciation guides and example vocabularies.

export const KANA_ROWS = {
  VOWELS: 'Nguyên âm (Vowels)',
  K_ROW: 'Hàng K (Ka/Ki/Ku...)',
  S_ROW: 'Hàng S (Sa/Shi/Su...)',
  T_ROW: 'Hàng T (Ta/Chi/Tsu...)',
  N_ROW: 'Hàng N (Na/Ni/Nu...)',
  H_ROW: 'Hàng H (Ha/Hi/Fu...)',
  M_ROW: 'Hàng M (Ma/Mi/Mu...)',
  Y_ROW: 'Hàng Y (Ya/Yu/Yo...)',
  R_ROW: 'Hàng R (Ra/Ri/Ru...)',
  W_ROW: 'Hàng W (Wa/Wo/N...)',
  DAKUON: 'Âm đục (Dakuon - Ga/Za/Da...)',
  HANDAKUON: 'Âm bán đục (Handakuon - Pa/Pi...)',
  YOON: 'Âm ghép (Yōon - Kya/Sha...)'
};

export const hiraganaData = [
  // --- BASIC (Gojūon) ---
  // Vowels
  { kana: 'あ', romaji: 'a', row: 'VOWELS', type: 'basic', example: 'あめ (ame)', meaning: 'Mưa / Rain', strokes: 3 },
  { kana: 'い', romaji: 'i', row: 'VOWELS', type: 'basic', example: 'いぬ (inu)', meaning: 'Chó / Dog', strokes: 2 },
  { kana: 'う', romaji: 'u', row: 'VOWELS', type: 'basic', example: 'うみ (umi)', meaning: 'Biển / Sea', strokes: 2 },
  { kana: 'え', romaji: 'e', row: 'VOWELS', type: 'basic', example: 'えん (en)', meaning: 'Yên Nhật / Yen', strokes: 2 },
  { kana: 'お', romaji: 'o', row: 'VOWELS', type: 'basic', example: 'お茶 (ocha)', meaning: 'Trà / Tea', strokes: 3 },

  // K-row
  { kana: 'か', romaji: 'ka', row: 'K_ROW', type: 'basic', example: 'かさ (kasa)', meaning: 'Ô, Dù / Umbrella', strokes: 3 },
  { kana: 'き', romaji: 'ki', row: 'K_ROW', type: 'basic', example: 'きつね (kitsune)', meaning: 'Cáo / Fox', strokes: 4 },
  { kana: 'く', romaji: 'ku', row: 'K_ROW', type: 'basic', example: 'くるま (kuruma)', meaning: 'Xe hơi / Car', strokes: 1 },
  { kana: 'け', romaji: 'ke', row: 'K_ROW', type: 'basic', example: 'けむり (kemuri)', meaning: 'Khói / Smoke', strokes: 3 },
  { kana: 'こ', romaji: 'ko', row: 'K_ROW', type: 'basic', example: 'こころ (kokoro)', meaning: 'Tim, Lòng / Heart', strokes: 2 },

  // S-row
  { kana: 'さ', romaji: 'sa', row: 'S_ROW', type: 'basic', example: 'さかな (sakana)', meaning: 'Cá / Fish', strokes: 3 },
  { kana: 'し', romaji: 'shi', row: 'S_ROW', type: 'basic', example: 'しお (shio)', meaning: 'Muối / Salt', strokes: 1 },
  { kana: 'す', romaji: 'su', row: 'S_ROW', type: 'basic', example: 'すし (sushi)', meaning: 'Sushi', strokes: 2 },
  { kana: 'せ', romaji: 'se', row: 'S_ROW', type: 'basic', example: 'せんせい (sensei)', meaning: 'Giáo viên / Teacher', strokes: 3 },
  { kana: 'そ', romaji: 'so', row: 'S_ROW', type: 'basic', example: 'そら (sora)', meaning: 'Bầu trời / Sky', strokes: 1 },

  // T-row
  { kana: 'た', romaji: 'ta', row: 'T_ROW', type: 'basic', example: 'たまご (tamago)', meaning: 'Trứng / Egg', strokes: 4 },
  { kana: 'ち', romaji: 'chi', row: 'T_ROW', type: 'basic', example: 'ちず (chizu)', meaning: 'Bản đồ / Map', strokes: 2 },
  { kana: 'つ', romaji: 'tsu', row: 'T_ROW', type: 'basic', example: 'つくえ (tsukue)', meaning: 'Bàn / Desk', strokes: 1 },
  { kana: 'て', romaji: 'te', row: 'T_ROW', type: 'basic', example: 'てがみ (tegami)', meaning: 'Thư / Letter', strokes: 1 },
  { kana: 'と', romaji: 'to', row: 'T_ROW', type: 'basic', example: 'ともだち (tomodachi)', meaning: 'Bạn bè / Friend', strokes: 2 },

  // N-row
  { kana: 'な', romaji: 'na', row: 'N_ROW', type: 'basic', example: 'なつ (natsu)', meaning: 'Mùa hè / Summer', strokes: 4 },
  { kana: 'に', romaji: 'ni', row: 'N_ROW', type: 'basic', example: 'にく (niku)', meaning: 'Thịt / Meat', strokes: 3 },
  { kana: 'ぬ', romaji: 'nu', row: 'N_ROW', type: 'basic', example: 'ぬま (numa)', meaning: 'Đầm lầy / Swamp', strokes: 2 },
  { kana: 'ね', romaji: 'ne', row: 'N_ROW', type: 'basic', example: 'ねこ (neko)', meaning: 'Mèo / Cat', strokes: 2 },
  { kana: 'の', romaji: 'no', row: 'N_ROW', type: 'basic', example: 'のり (nori)', meaning: 'Rong biển / Seaweed', strokes: 1 },

  // H-row
  { kana: 'は', romaji: 'ha', row: 'H_ROW', type: 'basic', example: 'はな (hana)', meaning: 'Hoa / Flower', strokes: 3 },
  { kana: 'ひ', romaji: 'hi', row: 'H_ROW', type: 'basic', example: 'ひかり (hikari)', meaning: 'Ánh sáng / Light', strokes: 1 },
  { kana: 'ふ', romaji: 'fu', row: 'H_ROW', type: 'basic', example: 'ふじさん (fujisan)', meaning: 'Núi Phú Sĩ / Mt. Fuji', strokes: 4 },
  { kana: 'へ', romaji: 'he', row: 'H_ROW', type: 'basic', example: 'へや (heya)', meaning: 'Phòng / Room', strokes: 1 },
  { kana: 'ほ', romaji: 'ho', row: 'H_ROW', type: 'basic', example: 'ほん (hon)', meaning: 'Sách / Book', strokes: 4 },

  // M-row
  { kana: 'ま', romaji: 'ma', row: 'M_ROW', type: 'basic', example: 'まち (machi)', meaning: 'Thị trấn / Town', strokes: 3 },
  { kana: 'み', romaji: 'mi', row: 'M_ROW', type: 'basic', example: 'みず (mizu)', meaning: 'Nước / Water', strokes: 2 },
  { kana: 'む', romaji: 'mu', row: 'M_ROW', type: 'basic', example: 'むし (mushi)', meaning: 'Côn trùng / Bug', strokes: 3 },
  { kana: 'め', romaji: 'me', row: 'M_ROW', type: 'basic', example: 'めがね (megane)', meaning: 'Kính mắt / Glasses', strokes: 2 },
  { kana: 'も', romaji: 'mo', row: 'M_ROW', type: 'basic', example: 'もり (mori)', meaning: 'Rừng / Forest', strokes: 3 },

  // Y-row
  { kana: 'や', romaji: 'ya', row: 'Y_ROW', type: 'basic', example: 'やま (yama)', meaning: 'Núi / Mountain', strokes: 3 },
  { kana: 'ゆ', romaji: 'yu', row: 'Y_ROW', type: 'basic', example: 'ゆき (yuki)', meaning: 'Tuyết / Snow', strokes: 2 },
  { kana: 'よ', romaji: 'yo', row: 'Y_ROW', type: 'basic', example: 'よる (yoru)', meaning: 'Đêm / Night', strokes: 2 },

  // R-row
  { kana: 'ら', romaji: 'ra', row: 'R_ROW', type: 'basic', example: 'らいおん (raion)', meaning: 'Sư tử / Lion', strokes: 2 },
  { kana: 'り', romaji: 'ri', row: 'R_ROW', type: 'basic', example: 'りんご (ringo)', meaning: 'Táo / Apple', strokes: 2 },
  { kana: 'る', romaji: 'ru', row: 'R_ROW', type: 'basic', example: 'るす (rusu)', meaning: 'Vắng nhà / Away', strokes: 1 },
  { kana: 'れ', romaji: 're', row: 'R_ROW', type: 'basic', example: 'れいぞうこ (reizouko)', meaning: 'Tủ lạnh / Fridge', strokes: 2 },
  { kana: 'ろ', romaji: 'ro', row: 'R_ROW', type: 'basic', example: 'ろぼっと (robotto)', meaning: 'Robot', strokes: 1 },

  // W-row
  { kana: 'わ', romaji: 'wa', row: 'W_ROW', type: 'basic', example: 'わた (wata)', meaning: 'Bông / Cotton', strokes: 2 },
  { kana: 'を', romaji: 'wo', row: 'W_ROW', type: 'basic', example: 'ほんをよむ (hon wo yomu)', meaning: 'Đọc sách (trợ từ) / Read book', strokes: 3 },
  { kana: 'ん', romaji: 'n', row: 'W_ROW', type: 'basic', example: 'ほん (hon)', meaning: 'Sách (phụ âm cuối) / Book', strokes: 1 },

  // --- DAKUON (Voiced) ---
  { kana: 'が', romaji: 'ga', row: 'DAKUON', type: 'dakuon', example: 'がっこう (gakkou)', meaning: 'Trường học / School', strokes: 5 },
  { kana: 'ぎ', romaji: 'gi', row: 'DAKUON', type: 'dakuon', example: 'ぎんこう (ginkou)', meaning: 'Ngân hàng / Bank', strokes: 6 },
  { kana: 'ぐ', romaji: 'gu', row: 'DAKUON', type: 'dakuon', example: 'ぐんじん (gunjin)', meaning: 'Quân nhân / Soldier', strokes: 3 },
  { kana: 'げ', romaji: 'ge', row: 'DAKUON', type: 'dakuon', example: 'げんき (genki)', meaning: 'Khỏe mạnh / Healthy', strokes: 5 },
  { kana: 'ご', romaji: 'go', row: 'DAKUON', type: 'dakuon', example: 'ごはん (gohan)', meaning: 'Cơm / Rice', strokes: 4 },

  { kana: 'ざ', romaji: 'za', row: 'DAKUON', type: 'dakuon', example: 'ざっし (zasshi)', meaning: 'Tạp chí / Magazine', strokes: 5 },
  { kana: 'じ', romaji: 'ji', row: 'DAKUON', type: 'dakuon', example: 'じしょ (jisho)', meaning: 'Từ điển / Dictionary', strokes: 3 },
  { kana: 'ず', romaji: 'zu', row: 'DAKUON', type: 'dakuon', example: 'ずぼん (zubon)', meaning: 'Quần dài / Trousers', strokes: 4 },
  { kana: 'ぜ', romaji: 'ze', row: 'DAKUON', type: 'dakuon', example: 'ぜんぶ (zenbu)', meaning: 'Tất cả / All', strokes: 5 },
  { kana: 'ぞ', romaji: 'zo', row: 'DAKUON', type: 'dakuon', example: 'ぞう (zou)', meaning: 'Con voi / Elephant', strokes: 3 },

  { kana: 'だ', romaji: 'da', row: 'DAKUON', type: 'dakuon', example: 'だいがく (daigaku)', meaning: 'Đại học / University', strokes: 6 },
  { kana: 'ぢ', romaji: 'ji', row: 'DAKUON', type: 'dakuon', example: 'はなぢ (hanaji)', meaning: 'Chảy máu cam / Nosebleed', strokes: 4 },
  { kana: 'づ', romaji: 'zu', row: 'DAKUON', type: 'dakuon', example: 'つづく (tsuzuku)', meaning: 'Tiếp tục / Continue', strokes: 3 },
  { kana: 'で', romaji: 'de', row: 'DAKUON', type: 'dakuon', example: 'でんしゃ (densha)', meaning: 'Tàu điện / Train', strokes: 3 },
  { kana: 'ど', romaji: 'do', row: 'DAKUON', type: 'dakuon', example: 'どうぶつ (doubutsu)', meaning: 'Động vật / Animal', strokes: 4 },

  { kana: 'ば', romaji: 'ba', row: 'DAKUON', type: 'dakuon', example: 'ばんごう (bangou)', meaning: 'Số điện thoại / Number', strokes: 5 },
  { kana: 'び', romaji: 'bi', row: 'DAKUON', type: 'dakuon', example: 'びじゅつかん (bijutsukan)', meaning: 'Bảo tàng nghệ thuật / Museum', strokes: 3 },
  { kana: 'ぶ', romaji: 'bu', row: 'DAKUON', type: 'dakuon', example: 'ぶた (buta)', meaning: 'Con heo / Pig', strokes: 6 },
  { kana: 'べ', romaji: 'be', row: 'DAKUON', type: 'dakuon', example: 'べんきょう (benkyou)', meaning: 'Học tập / Study', strokes: 3 },
  { kana: 'ぼ', romaji: 'bo', row: 'DAKUON', type: 'dakuon', example: 'ぼうし (boushi)', meaning: 'Mũ, Nón / Hat', strokes: 6 },

  // --- HANDAKUON (Plosive) ---
  { kana: 'ぱ', romaji: 'pa', row: 'HANDAKUON', type: 'handakuon', example: 'ぱん (pan)', meaning: 'Bánh mì / Bread', strokes: 4 },
  { kana: 'ぴ', romaji: 'pi', row: 'HANDAKUON', type: 'handakuon', example: 'ぴあの (piano)', meaning: 'Piano', strokes: 2 },
  { kana: 'ぷ', romaji: 'pu', row: 'HANDAKUON', type: 'handakuon', example: 'ぷーる (puuru)', meaning: 'Hồ bơi / Pool', strokes: 5 },
  { kana: 'ぺ', romaji: 'pe', row: 'HANDAKUON', type: 'handakuon', example: 'ぺん (pen)', meaning: 'Bút / Pen', strokes: 2 },
  { kana: 'ぽ', romaji: 'po', row: 'HANDAKUON', type: 'handakuon', example: 'ぽすと (posuto)', meaning: 'Hộp thư / Postbox', strokes: 5 },

  // --- YOON (Contraction) ---
  { kana: 'きゃ', romaji: 'kya', row: 'YOON', type: 'yoon', example: 'きゃべつ (kyabetsu)', meaning: 'Bắp cải / Cabbage', strokes: 7 },
  { kana: 'きゅ', romaji: 'kyu', row: 'YOON', type: 'yoon', example: 'きゅうり (kyuuri)', meaning: 'Dưa leo / Cucumber', strokes: 6 },
  { kana: 'きょ', romaji: 'kyo', row: 'YOON', type: 'yoon', example: 'きょねん (kyonen)', meaning: 'Năm ngoái / Last year', strokes: 6 },
  { kana: 'しゃ', romaji: 'sha', row: 'YOON', type: 'yoon', example: 'しゃしん (shashin)', meaning: 'Bức ảnh / Photo', strokes: 4 },
  { kana: 'しゅ', romaji: 'shu', row: 'YOON', type: 'yoon', example: 'しゅくだい (shukudai)', meaning: 'Bài tập về nhà / Homework', strokes: 3 },
  { kana: 'しょ', romaji: 'sho', row: 'YOON', type: 'yoon', example: 'しょくどう (shokudou)', meaning: 'Nhà ăn / Cafeteria', strokes: 3 },
  { kana: 'ちゃ', romaji: 'cha', row: 'YOON', type: 'yoon', example: 'お茶 (ocha)', meaning: 'Trà / Tea', strokes: 5 },
  { kana: 'ちゅ', romaji: 'chu', row: 'YOON', type: 'yoon', example: 'ちゅうしゃじょう (chuushajou)', meaning: 'Bãi đỗ xe / Parking', strokes: 3 },
  { kana: 'ちょ', romaji: 'cho', row: 'YOON', type: 'yoon', example: 'ちょこ (choko)', meaning: 'Socola / Chocolate', strokes: 3 },
  { kana: 'にゃ', romaji: 'nya', row: 'YOON', type: 'yoon', example: 'にゃー (nyaa)', meaning: 'Tiếng mèo kêu / Meow', strokes: 6 },
  { kana: 'にゅ', romaji: 'nyu', row: 'YOON', type: 'yoon', example: 'ぎゅうにゅう (gyuunyuu)', meaning: 'Sữa bò / Milk', strokes: 5 },
  { kana: 'にょ', romaji: 'nyo', row: 'YOON', type: 'yoon', example: 'にょきにょき (nyokinyoki)', meaning: 'Mọc nhanh / Sprouting rapidly', strokes: 5 },
  { kana: 'ひゃ', romaji: 'hya', row: 'YOON', type: 'yoon', example: 'ひゃく (hyaku)', meaning: 'Một trăm / One hundred', strokes: 6 },
  { kana: 'ひゅ', romaji: 'hyu', row: 'YOON', type: 'yoon', example: 'ひゅうひゅう (hyuuhyuu)', meaning: 'Gió rít / Whistling wind', strokes: 5 },
  { kana: 'ひょ', romaji: 'hyo', row: 'YOON', type: 'yoon', example: 'ひょう (hyou)', meaning: 'Bảng biểu / Table', strokes: 5 },
  { kana: 'みゃ', romaji: 'mya', row: 'YOON', type: 'yoon', example: 'みゃく (myaku)', meaning: 'Mạch đập / Pulse', strokes: 5 },
  { kana: 'みゅ', romaji: 'myu', row: 'YOON', type: 'yoon', example: 'みゅーじかる (myuujikaru)', meaning: 'Nhạc kịch / Musical', strokes: 4 },
  { kana: 'みょ', romaji: 'myo', row: 'YOON', type: 'yoon', example: 'みょうが (myouga)', meaning: 'Củ gừng Nhật / Myoga', strokes: 4 },
  { kana: 'りゃ', romaji: 'rya', row: 'YOON', type: 'yoon', example: 'りゃくする (ryakusuru)', meaning: 'Viết tắt / Abbreviate', strokes: 5 },
  { kana: 'りゅ', romaji: 'ryu', row: 'YOON', type: 'yoon', example: 'りゅう (ryuu)', meaning: 'Con rồng / Dragon', strokes: 4 },
  { kana: 'りょ', romaji: 'ryo', row: 'YOON', type: 'yoon', example: 'りょこう (ryokou)', meaning: 'Du lịch / Travel', strokes: 4 }
];

export const katakanaData = [
  // --- BASIC (Gojūon) ---
  // Vowels
  { kana: 'ア', romaji: 'a', row: 'VOWELS', type: 'basic', example: 'アイス (aisu)', meaning: 'Kem / Ice cream', strokes: 2 },
  { kana: 'イ', romaji: 'i', row: 'VOWELS', type: 'basic', example: 'インク (inku)', meaning: 'Mực / Ink', strokes: 2 },
  { kana: 'ウ', romaji: 'u', row: 'VOWELS', type: 'basic', example: 'ウサギ (usagi)', meaning: 'Thỏ / Rabbit', strokes: 3 },
  { kana: 'エ', romaji: 'e', row: 'VOWELS', type: 'basic', example: 'エアコン (eakon)', meaning: 'Máy lạnh / Air-con', strokes: 3 },
  { kana: 'オ', romaji: 'o', row: 'VOWELS', type: 'basic', example: 'オレンジ (orenji)', meaning: 'Quả cam / Orange', strokes: 3 },

  // K-row
  { kana: 'カ', romaji: 'ka', row: 'K_ROW', type: 'basic', example: 'カメラ (kamera)', meaning: 'Máy ảnh / Camera', strokes: 2 },
  { kana: 'キ', romaji: 'ki', row: 'K_ROW', type: 'basic', example: 'ギター (gitaa)', meaning: 'Đàn ghi-ta / Guitar', strokes: 3 },
  { kana: 'ク', romaji: 'ku', row: 'K_ROW', type: 'basic', example: 'クラス (kurasu)', meaning: 'Lớp học / Class', strokes: 2 },
  { kana: 'ケ', romaji: 'ke', row: 'K_ROW', type: 'basic', example: 'ケーキ (keeki)', meaning: 'Bánh ngọt / Cake', strokes: 3 },
  { kana: 'コ', romaji: 'ko', row: 'K_ROW', type: 'basic', example: 'コーヒー (koohii)', meaning: 'Cà phê / Coffee', strokes: 2 },

  // S-row
  { kana: 'サ', romaji: 'sa', row: 'S_ROW', type: 'basic', example: 'サラダ (sarada)', meaning: 'Salad', strokes: 3 },
  { kana: 'シ', romaji: 'shi', row: 'S_ROW', type: 'basic', example: 'シャツ (shatsu)', meaning: 'Áo sơ mi / Shirt', strokes: 3 },
  { kana: 'ス', romaji: 'su', row: 'S_ROW', type: 'basic', example: 'スポーツ (supootsu)', meaning: 'Thể thao / Sports', strokes: 2 },
  { kana: 'セ', romaji: 'se', row: 'S_ROW', type: 'basic', example: 'セーター (seetaa)', meaning: 'Áo len / Sweater', strokes: 2 },
  { kana: 'ソ', romaji: 'so', row: 'S_ROW', type: 'basic', example: 'ソファー (sofaa)', meaning: 'Ghế sofa', strokes: 2 },

  // T-row
  { kana: 'タ', romaji: 'ta', row: 'T_ROW', type: 'basic', example: 'タクシー (takushii)', meaning: 'Taxi', strokes: 3 },
  { kana: 'チ', romaji: 'chi', row: 'T_ROW', type: 'basic', example: 'チーズ (chiizu)', meaning: 'Phô mai / Cheese', strokes: 3 },
  { kana: 'ツ', romaji: 'tsu', row: 'T_ROW', type: 'basic', example: 'ツアー (tsuaa)', meaning: 'Tour du lịch / Tour', strokes: 3 },
  { kana: 'テ', romaji: 'te', row: 'T_ROW', type: 'basic', example: 'テレビ (terebi)', meaning: 'Tivi / TV', strokes: 3 },
  { kana: 'ト', romaji: 'to', row: 'T_ROW', type: 'basic', example: 'トイレ (toire)', meaning: 'Nhà vệ sinh / Toilet', strokes: 2 },

  // N-row
  { kana: 'ナ', romaji: 'na', row: 'N_ROW', type: 'basic', example: 'ナイフ (naifu)', meaning: 'Dao / Knife', strokes: 2 },
  { kana: 'ニ', romaji: 'ni', row: 'N_ROW', type: 'basic', example: 'ニュース (nyuusu)', meaning: 'Tin tức / News', strokes: 2 },
  { kana: 'ヌ', romaji: 'nu', row: 'N_ROW', type: 'basic', example: 'ヌードル (nuudoru)', meaning: 'Mì sợi / Noodle', strokes: 2 },
  { kana: 'ネ', romaji: 'ne', row: 'N_ROW', type: 'basic', example: 'ネクタイ (nekutai)', meaning: 'Cà vạt / Necktie', strokes: 4 },
  { kana: 'ノ', romaji: 'no', row: 'N_ROW', type: 'basic', example: 'ノート (nooto)', meaning: 'Vở ghi chép / Notebook', strokes: 1 },

  // H-row
  { kana: 'ハ', romaji: 'ha', row: 'H_ROW', type: 'basic', example: 'ハム (hamu)', meaning: 'Thịt nguội / Ham', strokes: 2 },
  { kana: 'ヒ', romaji: 'hi', row: 'H_ROW', type: 'basic', example: 'ヒーロー (hiiroo)', meaning: 'Anh hùng / Hero', strokes: 2 },
  { kana: 'フ', romaji: 'fu', row: 'H_ROW', type: 'basic', example: 'フィルム (firumu)', meaning: 'Cuộn phim / Film', strokes: 1 },
  { kana: 'ヘ', romaji: 'he', row: 'H_ROW', type: 'basic', example: 'ヘリコプター (herikoputaa)', meaning: 'Trực thăng / Helicopter', strokes: 1 },
  { kana: 'ホ', romaji: 'ho', row: 'H_ROW', type: 'basic', example: 'ホテル (hoteru)', meaning: 'Khách sạn / Hotel', strokes: 4 },

  // M-row
  { kana: 'マ', romaji: 'ma', row: 'M_ROW', type: 'basic', example: 'マフラー (mafuraa)', meaning: 'Khăn quàng cổ / Scarf', strokes: 2 },
  { kana: 'ミ', romaji: 'mi', row: 'M_ROW', type: 'basic', example: 'ミルク (miruku)', meaning: 'Sữa / Milk', strokes: 3 },
  { kana: 'ム', romaji: 'mu', row: 'M_ROW', type: 'basic', example: 'ムービー (muubii)', meaning: 'Phim điện ảnh / Movie', strokes: 2 },
  { kana: 'メ', romaji: 'me', row: 'M_ROW', type: 'basic', example: 'メール (meeru)', meaning: 'Thư điện tử / Email', strokes: 2 },
  { kana: 'モ', romaji: 'mo', row: 'M_ROW', type: 'basic', example: 'モデル (moderub)', meaning: 'Người mẫu / Model', strokes: 3 },

  // Y-row
  { kana: 'ヤ', romaji: 'ya', row: 'Y_ROW', type: 'basic', example: 'ヤマハ (yamaha)', meaning: 'Yamaha', strokes: 2 },
  { kana: 'ユ', romaji: 'yu', row: 'Y_ROW', type: 'basic', example: 'ユニフォーム (yunifoomu)', meaning: 'Đồng phục / Uniform', strokes: 2 },
  { kana: 'ヨ', romaji: 'yo', row: 'Y_ROW', type: 'basic', example: 'ヨット (yotto)', meaning: 'Du thuyền / Yacht', strokes: 3 },

  // R-row
  { kana: 'ラ', romaji: 'ra', row: 'R_ROW', type: 'basic', example: 'ラジオ (rajio)', meaning: 'Đài phát thanh / Radio', strokes: 2 },
  { kana: 'リ', romaji: 'ri', row: 'R_ROW', type: 'basic', example: 'リボン (ribon)', meaning: 'Ruy băng / Ribbon', strokes: 2 },
  { kana: 'ル', romaji: 'ru', row: 'R_ROW', type: 'basic', example: 'ルール (ruuru)', meaning: 'Luật lệ / Rule', strokes: 2 },
  { kana: 'レ', romaji: 're', row: 'R_ROW', type: 'basic', example: 'レポート (repooto)', meaning: 'Báo cáo / Report', strokes: 1 },
  { kana: 'ロ', romaji: 'ro', row: 'R_ROW', type: 'basic', example: 'ロボット (robotto)', meaning: 'Rô-bốt / Robot', strokes: 3 },

  // W-row
  { kana: 'ワ', romaji: 'wa', row: 'W_ROW', type: 'basic', example: 'ワイン (wain)', meaning: 'Rượu vang / Wine', strokes: 2 },
  { kana: 'ヲ', romaji: 'wo', row: 'W_ROW', type: 'basic', example: 'ヲタク (wotaku)', meaning: 'Otaku / Geek', strokes: 3 },
  { kana: 'ン', romaji: 'n', row: 'W_ROW', type: 'basic', example: 'パン (pan)', meaning: 'Bánh mì / Bread', strokes: 2 },

  // --- DAKUON (Voiced) ---
  { kana: 'ガ', romaji: 'ga', row: 'DAKUON', type: 'dakuon', example: 'ガス (gasu)', meaning: 'Khí gas', strokes: 4 },
  { kana: 'ギ', romaji: 'gi', row: 'DAKUON', type: 'dakuon', example: 'ギフト (gifuto)', meaning: 'Món quà / Gift', strokes: 5 },
  { kana: 'グ', romaji: 'gu', row: 'DAKUON', type: 'dakuon', example: 'グラス (gurasu)', meaning: 'Cái ly / Glass', strokes: 4 },
  { kana: 'ゲ', romaji: 'ge', row: 'DAKUON', type: 'dakuon', example: 'ゲーム (geemu)', meaning: 'Trò chơi / Game', strokes: 5 },
  { kana: 'ゴ', romaji: 'go', row: 'DAKUON', type: 'dakuon', example: 'ゴルフ (gorufu)', meaning: 'Gôn / Golf', strokes: 4 },

  { kana: 'ザ', romaji: 'za', row: 'DAKUON', type: 'dakuon', example: 'デザイン (dezain)', meaning: 'Thiết kế / Design', strokes: 5 },
  { kana: 'ジ', romaji: 'ji', row: 'DAKUON', type: 'dakuon', example: 'ビジネス (bijinesu)', meaning: 'Kinh doanh / Business', strokes: 5 },
  { kana: 'ズ', romaji: 'zu', row: 'DAKUON', type: 'dakuon', example: 'サイズ (saizu)', meaning: 'Kích cỡ / Size', strokes: 4 },
  { kana: 'ぜ', romaji: 'ze', row: 'DAKUON', type: 'dakuon', example: 'ゼロ (zero)', meaning: 'Số không / Zero', strokes: 4 },
  { kana: 'ゾ', romaji: 'zo', row: 'DAKUON', type: 'dakuon', example: 'ゾーン (zoon)', meaning: 'Khu vực / Zone', strokes: 4 },

  { kana: 'ダ', romaji: 'da', row: 'DAKUON', type: 'dakuon', example: 'ダンス (dansu)', meaning: 'Nhảy múa / Dance', strokes: 5 },
  { kana: 'ヂ', romaji: 'ji', row: 'DAKUON', type: 'dakuon', example: 'ヂレンマ (jirenma)', meaning: 'Tiến thoái lưỡng nan / Dilemma', strokes: 5 },
  { kana: 'ヅ', romaji: 'zu', row: 'DAKUON', type: 'dakuon', example: 'カンヅメ (kanzume)', meaning: 'Đồ hộp / Canned food', strokes: 5 },
  { kana: 'デ', romaji: 'de', row: 'DAKUON', type: 'dakuon', example: 'デート (deeto)', meaning: 'Hẹn hò / Date', strokes: 5 },
  { kana: 'ド', romaji: 'do', row: 'DAKUON', type: 'dakuon', example: 'ドア (doa)', meaning: 'Cánh cửa / Door', strokes: 4 },

  { kana: 'バ', romaji: 'ba', row: 'DAKUON', type: 'dakuon', example: 'バッグ (baggu)', meaning: 'Cái túi / Bag', strokes: 4 },
  { kana: 'ビ', romaji: 'bi', row: 'DAKUON', type: 'dakuon', example: 'ビール (biiru)', meaning: 'Bia / Beer', strokes: 4 },
  { kana: 'ブ', romaji: 'bu', row: 'DAKUON', type: 'dakuon', example: 'ブログ (burogu)', meaning: 'Blog', strokes: 4 },
  { kana: 'ベ', romaji: 'be', row: 'DAKUON', type: 'dakuon', example: 'ベッド (beddo)', meaning: 'Giường ngủ / Bed', strokes: 3 },
  { kana: 'ボ', romaji: 'bo', row: 'DAKUON', type: 'dakuon', example: 'ボタン (botan)', meaning: 'Nút bấm / Button', strokes: 6 },

  // --- HANDAKUON (Plosive) ---
  { kana: 'パ', romaji: 'pa', row: 'HANDAKUON', type: 'handakuon', example: 'パスポート (pasupooto)', meaning: 'Hộ chiếu / Passport', strokes: 4 },
  { kana: 'ピ', romaji: 'pi', row: 'HANDAKUON', type: 'handakuon', example: 'ピンク (pinku)', meaning: 'Màu hồng / Pink', strokes: 4 },
  { kana: 'プ', romaji: 'pu', row: 'HANDAKUON', type: 'handakuon', example: 'プレゼント (purezento)', meaning: 'Quà tặng / Present', strokes: 4 },
  { kana: 'ペ', romaji: 'pe', row: 'HANDAKUON', type: 'handakuon', example: 'ペン (pen)', meaning: 'Bút / Pen', strokes: 3 },
  { kana: 'ポ', romaji: 'po', row: 'HANDAKUON', type: 'handakuon', example: 'ポスト (posuto)', meaning: 'Hộp thư / Postbox', strokes: 6 },

  // --- YOON (Contraction) ---
  { kana: 'キャ', romaji: 'kya', row: 'YOON', type: 'yoon', example: 'キャベツ (kyabetsu)', meaning: 'Bắp cải / Cabbage', strokes: 5 },
  { kana: 'キュ', romaji: 'kyu', row: 'YOON', type: 'yoon', example: 'キューピッド (kyuupiddo)', meaning: 'Thần tình yêu / Cupid', strokes: 5 },
  { kana: 'キョ', romaji: 'kyo', row: 'YOON', type: 'yoon', example: 'キョロキョロ (kyorokyoro)', meaning: 'Nhìn quanh / Look around', strokes: 5 },
  { kana: 'シャ', romaji: 'sha', row: 'YOON', type: 'yoon', example: 'シャンプー (shanpuu)', meaning: 'Dầu gội / Shampoo', strokes: 5 },
  { kana: 'シュ', romaji: 'shu', row: 'YOON', type: 'yoon', example: 'シューズ (shuuzu)', meaning: 'Giày dép / Shoes', strokes: 4 },
  { kana: 'ショ', romaji: 'sho', row: 'YOON', type: 'yoon', example: 'ショップ (shoppu)', meaning: 'Cửa hàng / Shop', strokes: 4 },
  { kana: 'チャ', romaji: 'cha', row: 'YOON', type: 'yoon', example: 'チャイム (chaimu)', meaning: 'Tiếng chuông / Chime', strokes: 5 },
  { kana: 'チュ', romaji: 'chu', row: 'YOON', type: 'yoon', example: 'チューリップ (chuurippu)', meaning: 'Hoa tulip', strokes: 4 },
  { kana: 'チョ', romaji: 'cho', row: 'YOON', type: 'yoon', example: 'チョコ (choko)', meaning: 'Sô-cô-la / Chocolate', strokes: 4 },
  { kana: 'ニャ', romaji: 'nya', row: 'YOON', type: 'yoon', example: 'ニャー (nyaa)', meaning: 'Tiếng mèo kêu / Meow', strokes: 4 },
  { kana: 'ニュ', romaji: 'nyu', row: 'YOON', type: 'yoon', example: 'ニュース (nyuusu)', meaning: 'Tin tức / News', strokes: 4 },
  { kana: 'ニョ', romaji: 'nyo', row: 'YOON', type: 'yoon', example: 'ニョキニョキ (nyokinyoki)', meaning: 'Mọc nhanh / Sprouting rapidly', strokes: 4 }
];
