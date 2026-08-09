import type { Model, NewsPost } from "./types";

import m1 from "@/assets/model-01.jpg";
import m2 from "@/assets/model-02.jpg";
import m3 from "@/assets/model-03.jpg";
import m4 from "@/assets/model-04.jpg";
import m5 from "@/assets/model-05.jpg";
import m6 from "@/assets/model-06.jpg";
import m7 from "@/assets/model-07.jpg";
import m8 from "@/assets/model-08.jpg";
import m9 from "@/assets/model-09.jpg";
import hero from "@/assets/hero.jpg";

export const heroImage = hero;

export const seedModels: Model[] = [
  {
    slug: "lin-yu-chen",
    name: "Lin Yu-Chen",
    nameZh: "林昱蓁",
    board: "women",
    featured: true,
    city: "Taipei",
    cityZh: "台北",
    bioEn:
      "Taipei-born, Lin moved into fashion after three seasons of studio work and now splits her year between Taipei and Tokyo. Editorial, campaign and runway.",
    bioZh:
      "生於台北，在攝影棚工作三季後正式踏入時尚圈，目前往返台北與東京兩地。專長為雜誌、廣告與伸展台。",
    stats: {
      height: "178 cm",
      bust: "82 cm",
      waist: "60 cm",
      hips: "88 cm",
      shoes: "EU 39",
      hair: "Dark brown",
      hairZh: "深棕",
      eyes: "Brown",
      eyesZh: "棕色",
    },
    portrait: m1,
    gallery: [m1, m7, m3],
    digitals: [m1, m7],
  },
  {
    slug: "aoi-nakamura",
    name: "Aoi Nakamura",
    nameZh: "中村葵",
    board: "women",
    featured: true,
    city: "Tokyo",
    cityZh: "東京",
    bioEn:
      "A short-cropped silhouette that has become a signature on Tokyo runways. Aoi works closely with independent designers and small-run labels.",
    bioZh:
      "俐落短髮的輪廓已成為東京伸展台上的標誌。葵長期與獨立設計師及小量品牌合作。",
    stats: {
      height: "175 cm",
      bust: "80 cm",
      waist: "58 cm",
      hips: "86 cm",
      shoes: "EU 38",
      hair: "Black",
      hairZh: "黑色",
      eyes: "Dark brown",
      eyesZh: "深棕",
    },
    portrait: m2,
    gallery: [m2, m5, m1],
    digitals: [m2, m5],
  },
  {
    slug: "siti-rahayu",
    name: "Siti Rahayu",
    nameZh: "西蒂・拉哈尤",
    board: "women",
    featured: false,
    city: "Singapore",
    cityZh: "新加坡",
    bioEn:
      "Singapore-based with a long, quiet line that reads beautifully in motion. Regular face for regional beauty and swim campaigns.",
    bioZh:
      "以新加坡為據點，身形修長沉靜，動態表現尤其出色。經常出現於區域美妝與泳裝廣告。",
    stats: {
      height: "177 cm",
      bust: "81 cm",
      waist: "59 cm",
      hips: "87 cm",
      shoes: "EU 39",
      hair: "Black",
      hairZh: "黑色",
      eyes: "Brown",
      eyesZh: "棕色",
    },
    portrait: m3,
    gallery: [m3, m1, m2],
    digitals: [m3],
  },
  {
    slug: "chen-wei-ting",
    name: "Chen Wei-Ting",
    nameZh: "陳威廷",
    board: "men",
    featured: true,
    city: "Taipei",
    cityZh: "台北",
    bioEn:
      "Tailoring specialist with a still, unhurried presence in front of the camera. Six seasons of menswear across Taipei and Shanghai.",
    bioZh:
      "擅長西服類型，鏡頭前沉穩不躁。已累積台北與上海共六季男裝經驗。",
    stats: {
      height: "186 cm",
      waist: "78 cm",
      shoes: "EU 43",
      hair: "Black",
      hairZh: "黑色",
      eyes: "Dark brown",
      eyesZh: "深棕",
    },
    portrait: m4,
    gallery: [m4, m6],
    digitals: [m4],
  },
  {
    slug: "kim-do-hyun",
    name: "Kim Do-Hyun",
    nameZh: "金度賢",
    board: "men",
    featured: false,
    city: "Seoul",
    cityZh: "首爾",
    bioEn:
      "Seoul-based, with a softer, longer-haired register that suits contemporary and streetwear casting.",
    bioZh:
      "以首爾為據點，中長髮的柔和氣質適合當代服飾與街頭風格選角。",
    stats: {
      height: "184 cm",
      waist: "76 cm",
      shoes: "EU 42",
      hair: "Black",
      hairZh: "黑色",
      eyes: "Brown",
      eyesZh: "棕色",
    },
    portrait: m6,
    gallery: [m6, m4],
    digitals: [m6],
  },
  {
    slug: "hana-oshiro",
    name: "Hana Oshiro",
    nameZh: "大城花",
    board: "new-faces",
    featured: true,
    city: "Okinawa",
    cityZh: "沖繩",
    bioEn:
      "Signed this season. Freckled, bare-faced and completely new to the industry — first tests shot in March.",
    bioZh:
      "本季新簽約。雀斑素顏、初入業界，三月完成首次試拍。",
    stats: {
      height: "174 cm",
      bust: "79 cm",
      waist: "58 cm",
      hips: "85 cm",
      shoes: "EU 38",
      hair: "Dark brown",
      hairZh: "深棕",
      eyes: "Brown",
      eyesZh: "棕色",
    },
    portrait: m5,
    gallery: [m5, m2],
    digitals: [m5],
  },
  {
    slug: "yang-shu-fen",
    name: "Yang Shu-Fen",
    nameZh: "楊淑芬",
    board: "talent",
    featured: false,
    city: "Taipei",
    cityZh: "台北",
    bioEn:
      "Actor and presenter represented for commercial, film and brand ambassadorship work across Traditional Chinese speaking markets.",
    bioZh:
      "演員與主持人，代理商業廣告、影視及繁體中文市場的品牌代言合作。",
    stats: {
      height: "170 cm",
      bust: "84 cm",
      waist: "63 cm",
      hips: "90 cm",
      shoes: "EU 38",
      hair: "Black",
      hairZh: "黑色",
      eyes: "Dark brown",
      eyesZh: "深棕",
    },
    portrait: m7,
    gallery: [m7, m1],
    digitals: [m7],
  },
  {
    slug: "ryu-hae-sung",
    name: "Ryu Hae-Sung",
    nameZh: "柳海成",
    board: "new-faces",
    featured: false,
    city: "Busan",
    cityZh: "釜山",
    bioEn:
      "Scouted in Busan at eighteen and signed in April. Clean, unworked features and a natural ease in tailoring — first tests already circulating with Seoul casting.",
    bioZh:
      "十八歲於釜山被發掘，四月簽約。五官乾淨未經雕琢，穿著西服自然從容，首次試拍已在首爾選角圈流傳。",
    stats: {
      height: "183 cm",
      waist: "74 cm",
      shoes: "EU 42",
      hair: "Black",
      hairZh: "黑色",
      eyes: "Dark brown",
      eyesZh: "深棕",
    },
    portrait: m8,
    gallery: [m8, m4],
    digitals: [m8],
  },
  {
    slug: "ravi-tanaka",
    name: "Ravi Tanaka",
    nameZh: "田中拉維",
    board: "talent",
    featured: false,
    city: "Kuala Lumpur",
    cityZh: "吉隆坡",
    bioEn:
      "Actor and television presenter working across Malaysia, Singapore and Japan. Represented for drama, commercial and hosting work, in English, Malay and Japanese.",
    bioZh:
      "演員與電視主持人，工作橫跨馬來西亞、新加坡與日本。代理戲劇、商業廣告及主持工作，能以英語、馬來語與日語進行。",
    stats: {
      height: "181 cm",
      waist: "80 cm",
      shoes: "EU 43",
      hair: "Black",
      hairZh: "黑色",
      eyes: "Dark brown",
      eyesZh: "深棕",
    },
    portrait: m9,
    gallery: [m9, m6],
    digitals: [m9],
  },
];


export const seedNews: NewsPost[] = [
  {
    slug: "spring-board-update",
    date: "2026-07-14",
    titleEn: "Spring board update",
    titleZh: "春季分類更新",
    excerptEn:
      "Four new signings join the Women and New Faces boards ahead of the Taipei season.",
    excerptZh: "台北時裝季前夕，四位新簽約模特兒加入女模與新面孔分類。",
    bodyEn: [
      "Ahead of the Taipei season we have added four new faces across the Women and New Faces boards, each scouted in the last six months across Taiwan, Japan and Singapore.",
      "Digitals and full portfolios are available on request. Booking enquiries should be directed to the Taipei desk.",
    ],
    bodyZh: [
      "在台北時裝季開始之前，我們於女模與新面孔分類新增四位面孔，皆為近半年間於台灣、日本與新加坡發掘。",
      "生活照與完整作品集可另行索取，工作邀約請聯繫台北辦公室。",
    ],
    cover: m5,
  },
  {
    slug: "tokyo-showroom",
    date: "2026-06-02",
    titleEn: "Tokyo showroom, June",
    titleZh: "六月東京展間",
    excerptEn:
      "A three-day showroom in Shibuya for casting directors and stylists working the autumn calendar.",
    excerptZh: "於澀谷舉辦為期三天的展間，面向秋季檔期的選角與造型團隊。",
    bodyEn: [
      "We hosted a three-day showroom in Shibuya for casting directors and stylists preparing the autumn calendar, with fourteen models present across two boards.",
      "Thank you to everyone who came through. The next showroom will be announced in September.",
    ],
    bodyZh: [
      "我們於澀谷舉辦三天展間，接待籌備秋季檔期的選角與造型團隊，共十四位模特兒到場，橫跨兩個分類。",
      "感謝所有到訪的夥伴，下一場展間將於九月公布。",
    ],
    cover: m2,
  },
  {
    slug: "on-scouting-in-asia",
    date: "2026-04-21",
    titleEn: "On scouting in Asia",
    titleZh: "關於亞洲的星探工作",
    excerptEn:
      "Why we look outside the capitals, and what we actually want to see in an application.",
    excerptZh: "為什麼我們走出首都城市，以及一份申請中我們真正想看到的東西。",
    bodyEn: [
      "Most of our recent signings did not come from Taipei, Tokyo or Seoul. They came from Tainan, Okinawa and Johor — places where nobody is looking.",
      "What we want in an application is simple: daylight, no retouching, no filter, and a plain background. Face, full body, profile. That is enough.",
    ],
    bodyZh: [
      "我們近期簽下的模特兒多數並非來自台北、東京或首爾，而是台南、沖繩與柔佛——那些沒有人在尋找的地方。",
      "我們希望在申請中看到的很簡單：日光、不修圖、不加濾鏡、素色背景。臉部、全身、側面，這樣就足夠了。",
    ],
    cover: m3,
  },
];
