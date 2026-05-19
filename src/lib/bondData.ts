// 絆レベル累計EXPテーブル
export const BOND_EXP_TABLE: Record<number, number> = {
  1: 0, 2: 15, 3: 45, 4: 75, 5: 110,
  6: 145, 7: 180, 8: 220, 9: 260, 10: 300,
  11: 360, 12: 450, 13: 555, 14: 675, 15: 815,
  16: 975, 17: 1155, 18: 1360, 19: 1590, 20: 1845,
  21: 2130, 22: 2445, 23: 2790, 24: 3165, 25: 3575,
  26: 4020, 27: 4500, 28: 5020, 29: 5580, 30: 6180,
  31: 6825, 32: 7515, 33: 8250, 34: 9030, 35: 9860,
  36: 10740, 37: 11670, 38: 12655, 39: 13695, 40: 14790,
  41: 15945, 42: 17160, 43: 18435, 44: 19770, 45: 21170,
  46: 22635, 47: 24165, 48: 25765, 49: 27435, 50: 29175,
  51: 30990, 52: 32880, 53: 34845, 54: 36885, 55: 39005,
  56: 41205, 57: 43485, 58: 45850, 59: 48300, 60: 50835,
  61: 53460, 62: 56175, 63: 58980, 64: 61875, 65: 64865,
  66: 67950, 67: 71130, 68: 74410, 69: 77790, 70: 81270,
  71: 84855, 72: 88545, 73: 92340, 74: 96240, 75: 100250,
  76: 104370, 77: 108600, 78: 112945, 79: 117405, 80: 121980,
  81: 126675, 82: 131490, 83: 136425, 84: 141480, 85: 146660,
  86: 151965, 87: 157395, 88: 162955, 89: 168645, 90: 174465,
  91: 180420, 92: 186510, 93: 192735, 94: 199095, 95: 205595,
  96: 212235, 97: 219015, 98: 225940, 99: 233010, 100: 240225
};

export const SPRITE_CONFIG = {
  cols: 5,       // 1行あたりのコマ数
  width: 142,     // 1コマの横幅
  height: 112,    // 1コマの高さ
};

export const GIFT_EXP = {
  nb: 1.0,   // 通常 効果中
  na: 1.5,   // 通常 効果大
  ns: 2.0,   // 通常 効果特大
  sa: 1.5,   // 高級 効果大
  ss: 2.0,   // 高級 効果特大
} as const;

export const GIFT_LIST = [
  { name: 'レースの枕', category:'煌めき', baseExp: 120, spriteIdx: 0 },
  { name: 'ストリートオブヤンキー1巻', category:'煌めき', baseExp: 120, spriteIdx: 1 },
  { name: 'サミュエラ「ザ・ビヨンド」', category:'煌めき', baseExp: 120, spriteIdx: 2 },
  { name: 'レトロな卵の工芸品', category:'煌めき', baseExp: 120, spriteIdx: 3 },
  { name: 'ミルフィーユの正統派パフェ', category:'煌めき', baseExp: 120, spriteIdx: 4 },
  { name: 'エイ～ブックレア', category:'煌めき', baseExp: 120, spriteIdx: 5 },
  { name: 'おしゃれなくし', category:'煌めき', baseExp: 120, spriteIdx: 6 },
  { name: '栄養満載の総合ビタミンゼリー', category:'煌めき', baseExp: 120, spriteIdx: 7 },
  { name: '最高級の楓の盆栽', category:'煌めき', baseExp: 120, spriteIdx: 8 },
  { name: '裁縫キット', category:'煌めき', baseExp: 120, spriteIdx: 9 },
  { name: '音楽演奏会入場券', category:'煌めき', baseExp: 120, spriteIdx: 10 },
  { name: '1日3回ダンベルセット', category:'煌めき', baseExp: 120, spriteIdx: 11 },
  { name: 'ボードゲーム「ザ・人生」', category:'煌めき',baseExp: 120, spriteIdx: 12 },

  { name: 'ウェーブキャットの枕', category:'牡丹', baseExp: 40, spriteIdx: 20 },
  { name: 'ペロロの腹筋ローラー', category:'アサガオ', baseExp: 40, spriteIdx: 21 },
  { name: 'エーポッドプロ', category:'薔薇', baseExp: 40, spriteIdx: 22 },
  { name: '禁断の愛～許されないからこそ美しく～', category:'チューリップ', baseExp: 40, spriteIdx: 23 },
  { name: 'ゲームマガジン「ヒットガールズ」', category:'チューリップ', baseExp: 40, spriteIdx: 24 },
  { name: 'チェリーローズカラーのグロス', category:'桜', baseExp: 40, spriteIdx: 25 },
  { name: 'お肌を透明にするBBクリーム', category:'桜', baseExp: 40, spriteIdx: 26 },
  { name: 'ミリタリー用カモフラージュクリーム3種セット', category:'桜', baseExp: 40, spriteIdx: 27 },
  { name: '高級なクッキーセット', category:'スイセン', baseExp: 40, spriteIdx: 28 },
  { name: '『銃 可愛い 青春』', category:'チューリップ', baseExp: 40, spriteIdx: 29 },
  { name: '天体望遠鏡', category:'百日紅', baseExp: 40, spriteIdx: 30 },
  { name: 'ゲームガールカラー復刻版', category:'薔薇', baseExp: 40, spriteIdx: 31 },
  { name: 'MX-レーションC型デザート風味', category:'スイセン', baseExp: 40, spriteIdx: 32 },
  { name: '抹茶味の瓶ラムネ', category:'スイセン', baseExp: 40, spriteIdx: 33 },
  { name: 'ゼリーズの枕', category:'牡丹', baseExp: 40, spriteIdx: 34 },
  { name: '跳躍探偵ウサギ〜霧に包まれた温泉での滑落〜', category:'チューリップ', baseExp: 40, spriteIdx: 35 },
  { name: 'O-フィット', category:'アサガオ', baseExp: 40, spriteIdx: 36 },
  { name: '埋蔵金の地図', category:'タンポポ', baseExp: 40, spriteIdx: 37 },
  { name: 'コスプレ用ぐるぐるメガネ', category:'百日紅', baseExp: 40, spriteIdx: 38 },
  { name: '世界で最も無駄な絡繰りボックス', category:'タンポポ', baseExp: 40, spriteIdx: 39 },
  { name: 'リボンのついた熊のぬいぐるみ', category:'百日紅', baseExp: 40, spriteIdx: 40 },
  { name: '映画の前売りペアチケット', category:'ユリ', baseExp: 40, spriteIdx: 41 },
  { name: '30色の絵の具セット', category:'百日紅', baseExp: 40, spriteIdx: 42 },
  { name: '古典の詩集', category:'チューリップ', baseExp: 40, spriteIdx: 43 },
  { name: '可愛い食器セット', category:'キンセンカ', baseExp: 40, spriteIdx: 44 },
  { name: '頭脳開発キューブパズル', category:'百日紅', baseExp: 40, spriteIdx: 45 },
  { name: '大きなホールケーキ', category:'スイセン', baseExp: 40, spriteIdx: 46 },
  { name: 'ハイクラスビュッフェ招待券', category:'ユリ', baseExp: 40, spriteIdx: 47 },
  { name: '食虫植物の植木鉢', category:'桔梗', baseExp: 40, spriteIdx: 48 },
  { name: '高級そうな欲望のつぼ', category:'タンポポ', baseExp: 40, spriteIdx: 49 },
  { name: 'ぜんまい式オルゴール', category:'タンポポ', baseExp: 40, spriteIdx: 50 },
  { name: '刺繍付きのハンカチ', category:'モクレン', baseExp: 40, spriteIdx: 51 },
  { name: '百科事典', category:'チューリップ', baseExp: 40, spriteIdx: 52 },
  { name: 'ザ・サプリメント', category:'ツツジ', baseExp: 40, spriteIdx: 53 },
  { name: '夏模様の浮き輪', category:'翡翠花', baseExp: 40, spriteIdx: 54 }
] as const;

export const CHARACTER_LIST = [
  { 
    id: 'niko', 
    name: 'ニコ', 
    giftRatings: {
      '裁縫キット': 'ss',
      'ミルフィーユの正統派パフェ': 'sa',
      'MX-レーションC型デザート風味': 'na',
      'ミリタリー用カモフラージュクリーム3種セット': 'nb',
      '高級なクッキーセット': 'nb',
      '抹茶味の瓶ラムネ': 'nb',
      '可愛い食器セット': 'nb',
      '大きなホールケーキ': 'nb',
    } as Record<string, keyof typeof GIFT_EXP>
  },
  { 
    id: 'mio', 
    name: 'ミヤミヤ教授（マジカル）', 
    giftRatings: {
      'レースの枕': 'ss',
      'サミュエラ「ザ・ビヨンド」': 'sa',
      'チェリーローズカラーのグロス': 'na',
      'お肌を透明にするBBクリーム': 'nb',
      'ミリタリー用カモフラージュクリーム3種セット': 'nb',
      '高級なクッキーセット': 'nb',
      '抹茶味の瓶ラムネ': 'nb',
      '可愛い食器セット': 'nb',
    } as Record<string, keyof typeof GIFT_EXP>
  }
] as const;

export type CharacterId = typeof CHARACTER_LIST[number]['id'];
