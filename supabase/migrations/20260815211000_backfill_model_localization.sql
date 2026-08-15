-- Keep the existing roster usable from the Admin form and Traditional Chinese
-- public pages. These are the reviewed fictional seed records already present
-- in the linked project; future edits belong in the Admin model form.

update public.models set
  name_zh = '陳昱心', city_zh = '台北',
  bio = 'Taipei-born, Chen moved into fashion after three seasons of studio work and now splits her year between Taipei and Tokyo. Editorial, campaign and runway.',
  bio_en = 'Taipei-born, Chen moved into fashion after three seasons of studio work and now splits her year between Taipei and Tokyo. Editorial, campaign and runway.',
  bio_zh = '生於台北，在攝影棚工作三季後正式踏入時尚圈，目前往返台北與東京兩地。專長為雜誌、廣告與伸展台。'
where slug = 'chen-yu-xin';

update public.models set
  name_zh = '高橋葵', city_zh = '東京',
  bio = 'A short-cropped silhouette that has become a signature on Tokyo runways. Aoi works closely with independent designers and small-run labels.',
  bio_en = 'A short-cropped silhouette that has become a signature on Tokyo runways. Aoi works closely with independent designers and small-run labels.',
  bio_zh = '俐落短髮的輪廓已成為東京伸展台上的標誌。葵長期與獨立設計師及小量品牌合作。'
where slug = 'aoi-takahashi';

update public.models set
  name_zh = '林丹雅', city_zh = '新加坡',
  bio = 'Singapore-based with a long, quiet line that reads beautifully in motion. Regular face for regional beauty and swim campaigns.',
  bio_en = 'Singapore-based with a long, quiet line that reads beautifully in motion. Regular face for regional beauty and swim campaigns.',
  bio_zh = '以新加坡為據點，身形修長沉靜，動態表現尤其出色。經常出現於區域美妝與泳裝廣告。'
where slug = 'tanya-lim';

update public.models set
  name_zh = '林威傑', city_zh = '台北',
  bio = 'Tailoring specialist with a still, unhurried presence in front of the camera. Six seasons of menswear across Taipei and Shanghai.',
  bio_en = 'Tailoring specialist with a still, unhurried presence in front of the camera. Six seasons of menswear across Taipei and Shanghai.',
  bio_zh = '擅長西服類型，鏡頭前沉穩不躁。已累積台北與上海共六季男裝經驗。'
where slug = 'lin-wei-jie';

update public.models set
  name_zh = '韓敏宰', city_zh = '首爾',
  bio = 'Seoul-based, with a softer, longer-haired register that suits contemporary and streetwear casting.',
  bio_en = 'Seoul-based, with a softer, longer-haired register that suits contemporary and streetwear casting.',
  bio_zh = '以首爾為據點，中長髮的柔和氣質適合當代服飾與街頭風格選角。'
where slug = 'han-min-jae';

update public.models set
  name_zh = '知念陽菜', city_zh = '沖繩',
  bio = 'Signed this season. Freckled, bare-faced and completely new to the industry — first tests shot in March.',
  bio_en = 'Signed this season. Freckled, bare-faced and completely new to the industry — first tests shot in March.',
  bio_zh = '本季新簽約。雀斑素顏、初入業界，三月完成首次試拍。'
where slug = 'hina-chinen';

update public.models set
  name_zh = '楊淑芬', city_zh = '台北',
  bio = 'Actor and presenter represented for commercial, film and brand ambassadorship work across Traditional Chinese speaking markets.',
  bio_en = 'Actor and presenter represented for commercial, film and brand ambassadorship work across Traditional Chinese speaking markets.',
  bio_zh = '演員與主持人，代理商業廣告、影視及繁體中文市場的品牌代言合作。'
where slug = 'yang-shu-fen';

update public.models set
  name_zh = '金度允', city_zh = '釜山',
  bio = 'Scouted in Busan at eighteen and signed in April. Clean, unworked features and a natural ease in tailoring — first tests already circulating with Seoul casting.',
  bio_en = 'Scouted in Busan at eighteen and signed in April. Clean, unworked features and a natural ease in tailoring — first tests already circulating with Seoul casting.',
  bio_zh = '十八歲於釜山被發掘，四月簽約。五官乾淨未經雕琢，穿著西服自然從容，首次試拍已在首爾選角圈流傳。'
where slug = 'kim-do-yun';

update public.models set
  name_zh = '拉維・伊斯坎達爾', city_zh = '吉隆坡',
  bio = 'Actor and television presenter working across Malaysia, Singapore and Japan. Represented for drama, commercial and hosting work, in English, Malay and Japanese.',
  bio_en = 'Actor and television presenter working across Malaysia, Singapore and Japan. Represented for drama, commercial and hosting work, in English, Malay and Japanese.',
  bio_zh = '演員與電視主持人，工作橫跨馬來西亞、新加坡與日本。代理戲劇、商業廣告及主持工作，能以英語、馬來語與日語進行。'
where slug = 'ravi-iskandar';

update public.models set
  name_zh = '阿瑪拉・奧孔科沃', city_zh = '拉哥斯／台北',
  bio = 'Lagos-born and now based in Taipei, Amara moves between West African and East Asian markets. Runway, beauty and campaign, with a strong motion reel.',
  bio_en = 'Lagos-born and now based in Taipei, Amara moves between West African and East Asian markets. Runway, beauty and campaign, with a strong motion reel.',
  bio_zh = '生於拉哥斯，現居台北，工作橫跨西非與東亞市場。專長伸展台、美妝與廣告，動態表現尤佳。'
where slug = 'amara-okonkwo';

update public.models set
  name_zh = '普里雅・拉古納坦', city_zh = '孟買／新加坡',
  bio = 'Working across South and Southeast Asia, Priya is a regular face for jewellery, couture and hair campaigns in Mumbai, Singapore and Dubai.',
  bio_en = 'Working across South and Southeast Asia, Priya is a regular face for jewellery, couture and hair campaigns in Mumbai, Singapore and Dubai.',
  bio_zh = '工作範圍涵蓋南亞與東南亞，經常出現於孟買、新加坡與杜拜的珠寶、高級訂製服與髮妝廣告。'
where slug = 'priya-raghunathan';

update public.models set
  name_zh = '諾亞・卡斯特拉諾斯', city_zh = '馬尼拉／東京',
  bio = 'Filipino-Spanish, raised in Manila and now shooting mostly out of Tokyo. Tailoring, sportswear and commercial film.',
  bio_en = 'Filipino-Spanish, raised in Manila and now shooting mostly out of Tokyo. Tailoring, sportswear and commercial film.',
  bio_zh = '菲律賓與西班牙混血，於馬尼拉成長，目前主要以東京為工作據點。專長西服、運動服飾與商業影片。'
where slug = 'noah-castellanos';

update public.models set
  name_zh = '瑪吉特・林德奎斯特', city_zh = '斯德哥爾摩／台北',
  bio = 'Sixty-four and still working. Margit represents our classic division — luxury, skincare and lifestyle campaigns that want a real face and a real history.',
  bio_en = 'Sixty-four and still working. Margit represents our classic division — luxury, skincare and lifestyle campaigns that want a real face and a real history.',
  bio_zh = '六十四歲，仍在線上。瑪吉特代表我們的經典分類，適合追求真實面孔與歲月質地的精品、保養與生活風格廣告。'
where slug = 'margit-lindqvist';
