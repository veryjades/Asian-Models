-- Seed the reviewed fictional roster into the current Supabase project.
-- The public mock repository remains a fallback, but the Admin workspace and
-- public data path must have the same model rows available in Supabase.

alter table public.models
  add column if not exists slug text,
  add column if not exists name_zh text,
  add column if not exists board text not null default 'women',
  add column if not exists city text,
  add column if not exists city_zh text,
  add column if not exists bio_en text,
  add column if not exists bio_zh text,
  add column if not exists featured boolean not null default false,
  add column if not exists stats jsonb not null default '{}'::jsonb,
  add column if not exists tags text[] not null default '{}'::text[];

update public.models
set slug = coalesce(slug, lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')))
where slug is null;

alter table public.models alter column slug set not null;
create unique index if not exists models_slug_uidx on public.models (slug);
create index if not exists models_board_status_idx on public.models (board, status, display_name);

with seed as (
  select *
  from jsonb_to_recordset($models$
[
  {"slug":"chen-yu-xin","name":"Chen Yu-Xin","nameZh":"陳昱心","board":"women","gender":"women","city":"Taipei","cityZh":"台北","bioEn":"Taipei-born, Chen moved into fashion after three seasons of studio work and now splits her year between Taipei and Tokyo. Editorial, campaign and runway.","bioZh":"生於台北，在攝影棚工作三季後正式踏入時尚圈，目前往返台北與東京兩地。專長為雜誌、廣告與伸展台。","languages":["Mandarin","Japanese","English"],"featured":true,"stats":{"height":"178 cm","weight":"52 kg","bust":"82 cm","waist":"60 cm","hips":"88 cm","shoes":"EU 39","hair":"Dark brown","hairZh":"深棕","eyes":"Brown","eyesZh":"棕色"},"tags":["women","taipei","tokyo","editorial-model","fashion-model","commercial-model","print-model","advertising-model","runway"]},
  {"slug":"aoi-takahashi","name":"Aoi Takahashi","nameZh":"高橋葵","board":"women","gender":"women","city":"Tokyo","cityZh":"東京","bioEn":"A short-cropped silhouette that has become a signature on Tokyo runways. Aoi works closely with independent designers and small-run labels.","bioZh":"俐落短髮的輪廓已成為東京伸展台上的標誌。葵長期與獨立設計師及小量品牌合作。","languages":["Japanese","English"],"featured":true,"stats":{"height":"175 cm","weight":"50 kg","bust":"80 cm","waist":"58 cm","hips":"86 cm","shoes":"EU 38","hair":"Black","hairZh":"黑色","eyes":"Dark brown","eyesZh":"深棕"},"tags":["women","tokyo","beauty","editorial-model","fashion-model","commercial-model","print-model","advertising-model","runway"]},
  {"slug":"tanya-lim","name":"Tanya Lim","nameZh":"林丹雅","board":"women","gender":"women","city":"Singapore","cityZh":"新加坡","bioEn":"Singapore-based with a long, quiet line that reads beautifully in motion. Regular face for regional beauty and swim campaigns.","bioZh":"以新加坡為據點，身形修長沉靜，動態表現尤其出色。經常出現於區域美妝與泳裝廣告。","languages":["English","Mandarin","Malay"],"featured":false,"stats":{"height":"177 cm","weight":"51 kg","bust":"81 cm","waist":"59 cm","hips":"87 cm","shoes":"EU 39","hair":"Black","hairZh":"黑色","eyes":"Brown","eyesZh":"棕色"},"tags":["women","asia","beauty","fashion-model","commercial-model","print-model","advertising-model","runway"]},
  {"slug":"lin-wei-jie","name":"Lin Wei-Jie","nameZh":"林威傑","board":"men","gender":"men","city":"Taipei","cityZh":"台北","bioEn":"Tailoring specialist with a still, unhurried presence in front of the camera. Six seasons of menswear across Taipei and Shanghai.","bioZh":"擅長西服類型，鏡頭前沉穩不躁。已累積台北與上海共六季男裝經驗。","languages":["Mandarin","English"],"featured":true,"stats":{"height":"186 cm","weight":"73 kg","waist":"78 cm","shoes":"EU 43","hair":"Black","hairZh":"黑色","eyes":"Dark brown","eyesZh":"深棕"},"tags":["men","taipei","commercial-model","fashion-model","print-model","advertising-model","runway"]},
  {"slug":"han-min-jae","name":"Han Min-jae","nameZh":"韓敏宰","board":"men","gender":"men","city":"Seoul","cityZh":"首爾","bioEn":"Seoul-based, with a softer, longer-haired register that suits contemporary and streetwear casting.","bioZh":"以首爾為據點，中長髮的柔和氣質適合當代服飾與街頭風格選角。","languages":["Korean","English"],"featured":false,"stats":{"height":"184 cm","weight":"70 kg","waist":"76 cm","shoes":"EU 42","hair":"Black","hairZh":"黑色","eyes":"Brown","eyesZh":"棕色"},"tags":["men","seoul","asia","commercial-model","fashion-model","print-model","advertising-model","runway"]},
  {"slug":"hina-chinen","name":"Hina Chinen","nameZh":"知念陽菜","board":"new-faces","gender":"women","city":"Okinawa","cityZh":"沖繩","bioEn":"Signed this season. Freckled, bare-faced and completely new to the industry — first tests shot in March.","bioZh":"本季新簽約。雀斑素顏、初入業界，三月完成首次試拍。","languages":["Japanese","English"],"featured":true,"stats":{"height":"174 cm","weight":"49 kg","bust":"79 cm","waist":"58 cm","hips":"85 cm","shoes":"EU 38","hair":"Dark brown","hairZh":"深棕","eyes":"Brown","eyesZh":"棕色"},"tags":["new-faces","natural-test","scouting","asia","print-model","beauty"]},
  {"slug":"yang-shu-fen","name":"Yang Shu-Fen","nameZh":"楊淑芬","board":"talent","gender":"women","city":"Taipei","cityZh":"台北","bioEn":"Actor and presenter represented for commercial, film and brand ambassadorship work across Traditional Chinese speaking markets.","bioZh":"演員與主持人，代理商業廣告、影視及繁體中文市場的品牌代言合作。","languages":["Mandarin","English"],"featured":false,"stats":{"height":"170 cm","weight":"53 kg","bust":"84 cm","waist":"63 cm","hips":"90 cm","shoes":"EU 38","hair":"Black","hairZh":"黑色","eyes":"Dark brown","eyesZh":"深棕"},"tags":["actor","host","show-girl","influencer","kol","taipei","commercial-model","advertising-model"]},
  {"slug":"kim-do-yun","name":"Kim Do-yun","nameZh":"金度允","board":"new-faces","gender":"men","city":"Busan","cityZh":"釜山","bioEn":"Scouted in Busan at eighteen and signed in April. Clean, unworked features and a natural ease in tailoring — first tests already circulating with Seoul casting.","bioZh":"十八歲於釜山被發掘，四月簽約。五官乾淨未經雕琢，穿著西服自然從容，首次試拍已在首爾選角圈流傳。","languages":["Korean","English"],"featured":false,"stats":{"height":"183 cm","weight":"68 kg","waist":"74 cm","shoes":"EU 42","hair":"Black","hairZh":"黑色","eyes":"Dark brown","eyesZh":"深棕"},"tags":["new-faces","natural-test","scouting","seoul","asia","men","print-model"]},
  {"slug":"ravi-iskandar","name":"Ravi Iskandar","nameZh":"拉維・伊斯坎達爾","board":"talent","gender":"men","city":"Kuala Lumpur","cityZh":"吉隆坡","bioEn":"Actor and television presenter working across Malaysia, Singapore and Japan. Represented for drama, commercial and hosting work, in English, Malay and Japanese.","bioZh":"演員與電視主持人，工作橫跨馬來西亞、新加坡與日本。代理戲劇、商業廣告及主持工作，能以英語、馬來語與日語進行。","languages":["English","Malay","Japanese"],"featured":false,"stats":{"height":"181 cm","weight":"71 kg","waist":"80 cm","shoes":"EU 43","hair":"Black","hairZh":"黑色","eyes":"Dark brown","eyesZh":"深棕"},"tags":["actor","host","show-girl","influencer","kol","asia","commercial-model","advertising-model"]},
  {"slug":"amara-okonkwo","name":"Amara Okonkwo","nameZh":"阿瑪拉・奧孔科沃","board":"women","gender":"women","city":"Lagos / Taipei","cityZh":"拉哥斯／台北","bioEn":"Lagos-born and now based in Taipei, Amara moves between West African and East Asian markets. Runway, beauty and campaign, with a strong motion reel.","bioZh":"生於拉哥斯，現居台北，工作橫跨西非與東亞市場。專長伸展台、美妝與廣告，動態表現尤佳。","languages":["English","Mandarin"],"featured":true,"stats":{"height":"179 cm","weight":"57 kg","bust":"83 cm","waist":"61 cm","hips":"89 cm","shoes":"EU 40","hair":"Black, natural","hairZh":"黑色自然捲","eyes":"Dark brown","eyesZh":"深棕"},"tags":["women","taipei","beauty","fashion-model","commercial-model","print-model","advertising-model","runway"]},
  {"slug":"priya-raghunathan","name":"Priya Raghunathan","nameZh":"普里雅・拉古納坦","board":"women","gender":"women","city":"Mumbai / Singapore","cityZh":"孟買／新加坡","bioEn":"Working across South and Southeast Asia, Priya is a regular face for jewellery, couture and hair campaigns in Mumbai, Singapore and Dubai.","bioZh":"工作範圍涵蓋南亞與東南亞，經常出現於孟買、新加坡與杜拜的珠寶、高級訂製服與髮妝廣告。","languages":["English","Hindi","Tamil"],"featured":false,"stats":{"height":"176 cm","weight":"54 kg","bust":"82 cm","waist":"60 cm","hips":"88 cm","shoes":"EU 39","hair":"Black","hairZh":"黑色","eyes":"Dark brown","eyesZh":"深棕"},"tags":["women","asia","beauty","fashion-model","commercial-model","print-model","advertising-model","runway"]},
  {"slug":"noah-castellanos","name":"Noah Castellanos","nameZh":"諾亞・卡斯特拉諾斯","board":"men","gender":"men","city":"Manila / Tokyo","cityZh":"馬尼拉／東京","bioEn":"Filipino-Spanish, raised in Manila and now shooting mostly out of Tokyo. Tailoring, sportswear and commercial film.","bioZh":"菲律賓與西班牙混血，於馬尼拉成長，目前主要以東京為工作據點。專長西服、運動服飾與商業影片。","languages":["English","Filipino","Spanish","Japanese"],"featured":true,"stats":{"height":"185 cm","weight":"72 kg","waist":"77 cm","shoes":"EU 43","hair":"Dark brown, curly","hairZh":"深棕捲髮","eyes":"Green","eyesZh":"綠色"},"tags":["men","tokyo","asia","commercial-model","fashion-model","print-model","advertising-model","runway"]},
  {"slug":"margit-lindqvist","name":"Margit Lindqvist","nameZh":"瑪吉特・林德奎斯特","board":"talent","gender":"women","city":"Stockholm / Taipei","cityZh":"斯德哥爾摩／台北","bioEn":"Sixty-four and still working. Margit represents our classic division — luxury, skincare and lifestyle campaigns that want a real face and a real history.","bioZh":"六十四歲，仍在線上。瑪吉特代表我們的經典分類，適合追求真實面孔與歲月質地的精品、保養與生活風格廣告。","languages":["Swedish","English","Mandarin"],"featured":true,"stats":{"height":"172 cm","weight":"59 kg","bust":"88 cm","waist":"68 cm","hips":"94 cm","shoes":"EU 39","hair":"Silver","hairZh":"銀白","eyes":"Blue","eyesZh":"藍色"},"tags":["actor","host","beauty","commercial-model","advertising-model","influencer","kol","asia"]}
]
  $models$::jsonb) as row(
    slug text, name text, name_zh text, board text, gender text,
    city text, city_zh text, bio_en text, bio_zh text, languages jsonb,
    featured boolean, stats jsonb, tags jsonb
  )
)
insert into public.models (
  slug, name, display_name, name_zh, board, gender, city, city_zh,
  bio, bio_en, bio_zh, languages, featured, stats, tags, category, status
)
select
  slug, name, name, name_zh, board, gender, city, city_zh,
  bio_en, bio_en, bio_zh,
  array(select jsonb_array_elements_text(languages)), featured, stats,
  array(select jsonb_array_elements_text(tags)),
  case when board = 'talent' then 'talent' else board end,
  'active'
from seed
on conflict (slug) do update set
  name = excluded.name,
  display_name = excluded.display_name,
  name_zh = excluded.name_zh,
  board = excluded.board,
  gender = excluded.gender,
  city = excluded.city,
  city_zh = excluded.city_zh,
  bio = excluded.bio,
  bio_en = excluded.bio_en,
  bio_zh = excluded.bio_zh,
  languages = excluded.languages,
  featured = excluded.featured,
  stats = excluded.stats,
  tags = excluded.tags,
  category = excluded.category,
  status = excluded.status,
  updated_at = timezone('utc', now());
