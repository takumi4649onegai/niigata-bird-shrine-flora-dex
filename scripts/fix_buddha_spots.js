const fs = require('fs');
const vm = require('vm');

// 1. Update data-japan-dex.js via VM
const dataFilePath = '神社仏閣・絶景・花図鑑/js/data-japan-dex.js';
const dataContent = fs.readFileSync(dataFilePath, 'utf8');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataContent, sandbox);

const dex = sandbox.window.JAPAN_BEAUTY_DEX;

const genuineBuddhaMap = {
  'echigo_tainai_kannon': {
    buddhaTypes: ['kannon', 'bosatsu'],
    hasBuddha: true,
    hasNio: false,
    buddhaHighlight: '全高26m青銅大観音菩薩（青空にそびえる日本海側最大の露天大仏・屋外拝観＆撮影OK）'
  },
  'kokujoji_gogoan': {
    buddhaTypes: ['kannon', 'bosatsu', 'nio', 'tenbu'],
    hasBuddha: true,
    hasNio: true,
    buddhaHighlight: '山門の巨大金剛力士立像（阿形・吽形仁王像）と千手観音・閻魔大王像'
  },
  'suganoya_fudo': {
    buddhaTypes: ['fudo', 'myoo', 'nio', 'tenbu'],
    hasBuddha: true,
    hasNio: true,
    buddhaHighlight: '日本三大不動尊・源頼朝公ゆかりの不動明王立像と山門の仁王像'
  },
  'gochi_kokubunji': {
    buddhaTypes: ['nyorai', 'nio', 'tenbu'],
    hasBuddha: true,
    hasNio: true,
    buddhaHighlight: '奈良時代創建・堂々たる木造五智如来坐像（大日・阿弥陀等）と山門仁王像'
  },
  'akiba_fudanji_temple': {
    buddhaTypes: ['kannon', 'bosatsu', 'nio', 'tenbu'],
    hasBuddha: true,
    hasNio: true,
    buddhaHighlight: '聖徳太子伝承の朝日観音像と仁王門の股くぐり金剛力士像（仁王様）'
  },
  'nagaoka_kannyakuji_temple': {
    buddhaTypes: ['yakushi', 'nyorai', 'nio', 'tenbu'],
    hasBuddha: true,
    hasNio: true,
    buddhaHighlight: '南北朝時代の逆谷仁王様（股くぐり像）と薬師十二神将・バサラ大将'
  },
  'minamiuonuma_urasa_bishamon': {
    buddhaTypes: ['tenbu', 'nio'],
    hasBuddha: true,
    hasNio: true,
    buddhaHighlight: '坂上田村麻呂開基・越後随一の毘沙門天立像（天部）と豪壮な山門仁王門'
  },
  'oppouji_pagoda': {
    buddhaTypes: ['kannon', 'bosatsu', 'nio', 'tenbu', 'nyorai'],
    hasBuddha: true,
    hasNio: true,
    buddhaHighlight: '山門に鎮座する巨大金剛力士立像（仁王像）と木造三重塔・秘仏大日如来'
  },
  'sado_seisuiji_haniya': {
    buddhaTypes: ['kannon', 'bosatsu', 'nio', 'tenbu', 'rakan'],
    hasBuddha: true,
    hasNio: true,
    buddhaHighlight: '長谷寺の苔むす五百羅漢石仏群・十一面観音と、清水寺の山門仁王像'
  },
  'kita_otematsu_yakushi': {
    buddhaTypes: ['yakushi', 'nyorai', 'rakan'],
    hasBuddha: true,
    hasNio: false,
    buddhaHighlight: '静寂の社叢に佇む薬師如来石仏と苔むした境内の古石仏群'
  },
  'deyu_yakushido_ubason': {
    buddhaTypes: ['yakushi', 'nyorai', 'rakan'],
    hasBuddha: true,
    hasNio: false,
    buddhaHighlight: '開湯1200年の霊泉を見守る薬師如来坐像と優しい表情の姥尊石仏群'
  },
  'seiro_houshakuin': {
    buddhaTypes: ['kannon', 'bosatsu'],
    hasBuddha: true,
    hasNio: false,
    buddhaHighlight: '越後三十三観音霊場・秘仏如意輪観音菩薩と心安らぐ池泉名園'
  },
  'uonuma_saifukuji_kaisando': {
    buddhaTypes: ['nyorai'],
    hasBuddha: true,
    hasNio: false,
    buddhaHighlight: '石川雲蝶の極彩色天上彫刻が守る本尊・阿弥陀如来坐像と道元禅師像'
  }
};

dex.forEach(item => {
  if (genuineBuddhaMap[item.id]) {
    const info = genuineBuddhaMap[item.id];
    item.hasBuddha = true;
    item.buddhaTypes = info.buddhaTypes;
    item.hasNio = info.hasNio;
    item.buddhaHighlight = info.buddhaHighlight;
    console.log(`[GENUINE BUDDHA] ${item.dexNo} ${item.name}`);
  } else {
    // Non-buddha spots (including Jikoji, Gokoku Shrine, etc.)
    if (item.hasBuddha) {
      console.log(`[REMOVED BUDDHA FLAG] ${item.dexNo} ${item.name}`);
    }
    item.hasBuddha = false;
    item.buddhaTypes = [];
    delete item.buddhaHighlight;
  }
});

const newJsCode = `// 新潟カメラ図鑑シリーズ - 神社仏閣・仏像・絶景データベース（全88選）\nwindow.JAPAN_BEAUTY_DEX = ${JSON.stringify(dex, null, 2)};\n`;
fs.writeFileSync(dataFilePath, newJsCode, 'utf8');
console.log('Updated data-japan-dex.js successfully!');

// 2. Update index.html
let html = fs.readFileSync('神社仏閣・絶景・花図鑑/index.html', 'utf8');

// Update button labels
html = html.replace(/24名刹/g, '13名刹');
html = html.replace('すべて (24)', 'すべて (13)');

// Ensure renderGrid uses buddhaHighlight
html = html.replace(
  /\${it\.catchphrase \|\| '歴史ある仏像・境内見どころ'}/g,
  "${it.buddhaHighlight || it.catchphrase}"
);

fs.writeFileSync('神社仏閣・絶景・花図鑑/index.html', html, 'utf8');
console.log('Updated index.html successfully!');
