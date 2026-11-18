const fs = require('fs');

const path = '神社仏閣・絶景・花図鑑/js/data-japan-dex.js';
let content = fs.readFileSync(path, 'utf8');

// Parse window.JAPAN_BEAUTY_DEX
const vm = require('vm');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(content, sandbox);
const dex = sandbox.window.JAPAN_BEAUTY_DEX;

// Update No.011 (Gokoku Shrine)
const item011 = dex.find(x => x.dexNo === '011');
if (item011) {
  item011.id = 'niigata_gokoku_shrine';
  item011.name = '新潟県護国神社（日本海を望む白砂青松の杜と壮麗な社殿・新潟市中央区）';
  item011.englishTitle = 'Niigata Gokoku Shrine: Grand Torii & Pine Woods by the Japan Sea';
  item011.category = '神社仏閣';
  item011.subTags = ['神社', '大社・総鎮守', '海辺の杜', '新潟市中央区'];
  item011.spotId = 'niigatacity';
  item011.spotName = '新潟市中央区西船見町（日本海海岸・西海岸公園近郊）';
  item011.area = '新潟市中央区';
  item011.photoUrl = 'https://upload.wikimedia.org/wikipedia/commons/2/29/Niigata_Gokoku_Shrine_20070815.png';
  item011.wikiTitle = '新潟縣護國神社';
  item011.searchQuery = '新潟県護国神社 新潟市中央区';
  item011.catchphrase = '日本海を望む白砂青松の杜に鎮座する大社！壮大な社殿と緑豊かな参道スナップ';
  item011.hasGoshuin = true;
  item011.hasGoshuincho = true;
  item011.goshuinInfo = '⛩️【御朱印あり・社務所にて授与】白砂青松の杜にふさわしい清々しい墨書きの御朱印をいただけます。季節限定の美しい絵柄の御朱印も大人気です。';
  item011.parkingInfo = '🅿️ 無料大駐車場完備（境内参拝者用駐車場）／🚻 境内に清潔なトイレ完備';
  item011.shotRecipes = [
    '①【青松の杜に映える壮麗な社殿の真正面シンメトリー構図】参道中央から社殿の重厚な屋根の反りをバランスよく収めます。',
    '②【海風に揺れるクロマツ並木と木漏れ日参道】夕暮れの斜光が松林に差し込む時間帯に中望遠レンズで情緒豊かに切り取ります。',
    '③【堂々たる大鳥居と青空のハイアングル・パノラマ】海岸通りの空に向かってそびえる鳥居の雄大さを捉えます。'
  ];
  item011.mannerNote = '県民に親しまれるお社です。心を込めて参拝してから撮影しましょう。';
  item011.lat = 37.9308;
  item011.lng = 139.0345;
}

// Update No.012 (Shugetsuji Temple)
const item012 = dex.find(x => x.dexNo === '012');
if (item012) {
  item012.id = 'shugetsuji_temple';
  item012.name = '曹洞宗名刹 種月寺（国重文本堂と静寂の銀杏・庭園・新潟市江南区沢海）';
  item012.englishTitle = 'Shugetsuji Temple: National Important Cultural Property Hall & Zen Garden';
  item012.category = '神社仏閣';
  item012.subTags = ['お寺・古堂', '曹洞宗名刹', '国重要文化財', '江南区・沢海'];
  item012.spotId = 'konan';
  item012.spotName = '新潟市江南区沢海（北方文化博物館から徒歩数分！）';
  item012.area = '新潟市江南区';
  item012.photoUrl = 'https://upload.wikimedia.org/wikipedia/commons/5/58/Shugetsuji_Temple_%282%29%2C_Niigata%2C_Niigata%2C_Japan%2C_August_2022.jpg';
  item012.wikiTitle = '種月寺';
  item012.searchQuery = '種月寺 新潟市 江南区 沢海';
  item012.catchphrase = '越後曹洞宗の歴史を刻む国重要文化財の本堂！北方文化博物館すぐ隣の静寂なる禅刹';
  item012.hasGoshuin = true;
  item012.hasGoshuincho = false;
  item012.goshuinInfo = '📿【御朱印あり・庫裡にて授与】曹洞宗名刹ならではの端正で力強い墨書き御朱印を授与いただけます。';
  item012.parkingInfo = '🅿️ 無料駐車場あり（種月寺境内参拝者駐車場、または北方文化博物館駐車場利用可）';
  item012.shotRecipes = [
    '①【茅葺き屋根の風格を残す国重文本堂の全景ショット】静寂の境内から中望遠〜標準レンズで重厚な木造建築美を切り取ります。',
    '②【山門の額縁構図から覗く緑の境内】古い山門の柱を額縁に見立てて、奥に続く手入れされた禅庭園を収めます。',
    '③【秋の黄金色の大銀杏と石畳参道】晩秋に黄色い絨毯となる境内のイチョウの落ち葉をローアングルで捉えます。'
  ];
  item012.mannerNote = '修行の場である静寂な禅寺です。大声を出さず静かに参拝・撮影しましょう。';
  item012.lat = 37.8596;
  item012.lng = 139.1585;
}

// Update No.013 (Myokoji Temple)
const item013 = dex.find(x => x.dexNo === '013');
if (item013) {
  item013.id = 'myokoji_temple';
  item013.name = '角田山 妙光寺（日蓮宗本山・開創700年の巨木古刹と安田瓦の大本堂・西蒲区角田浜）';
  item013.englishTitle = 'Myokoji Temple: Ancient Cedar Sanctuary & Yasuda Tile Hall at Mt. Kakuda';
  item013.category = '神社仏閣';
  item013.subTags = ['お寺・古堂', '日蓮宗本山', '巨木・古刹', '西蒲・角田'];
  item013.spotId = 'nishikan';
  item013.spotName = '新潟市西蒲区角田浜（角田岬灯台・カーブドッチワイナリー近郊）';
  item013.area = '新潟市西蒲区';
  item013.photoUrl = 'https://upload.wikimedia.org/wikipedia/commons/e/ef/My%C5%8Dk%C5%8Dji_Temple_%282%29%2C_Niigata%2C_Niigata%2C_Japan%2C_August_2022.jpg';
  item013.wikiTitle = '妙光寺 (新潟市)';
  item013.searchQuery = '妙光寺 新潟市 西蒲区 角田浜';
  item013.catchphrase = '角田山麓の海風と深い緑に抱かれた日蓮宗本山！威風堂々たる安田瓦の大本堂と県指定天然記念物の巨樹';
  item013.hasGoshuin = true;
  item013.hasGoshuincho = true;
  item013.goshuinInfo = '📿【御朱印あり・寺務所受付】日蓮宗本山ならではの力強いお題目「南無妙法蓮華経」の髭文字の墨書き御朱印を授与いただけます。';
  item013.parkingInfo = '🅿️ 無料駐車場完備（妙光寺参拝者用駐車場・角田浜駐車場）／🚻 境内にトイレあり';
  item013.shotRecipes = [
    '①【堂々たる安田瓦葺き大本堂と静寂の参道ショット】山門から石畳の参道、重厚な安田瓦が重なる大本堂を広角〜標準で堂々と捉えます。',
    '②【県指定天然記念物・カヤと杉の巨木並木スナップ】樹齢数百年の巨木が立ち並ぶ荘厳な境内。木漏れ日を中望遠でしっとり切り取ります。',
    '③【角田岬と日本海を望む山麓寺院の佇まい】角田浜の波音を背に受ける寺院ならではの旅情あふれるカットを狙います。'
  ];
  item013.mannerNote = '由緒正しい名刹寺院です。参拝を済ませてからマナーを守って撮影しましょう。';
  item013.lat = 37.7885;
  item013.lng = 138.8415;
}

// Bulk fill verified real photo URLs
const photoMap = {
  '001': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Iyahiko-jinja_1.JPG',
  '002': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Jik%C5%8Dji_Temple_%282%29%2C_Gosen%2C_Niigata%2C_Japan%2C_July_2022.jpg',
  '003': 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Northern_Culture_Museum_002.jpg',
  '004': 'img/scenery/asaiino_shrine_real.jpg',
  '006': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Hakusan_Shrine_%28Niigata_City%29_Haiden.jpg',
  '008': 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Untoan1.jpg',
  '009': 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Houtoku_Inari2.jpg',
  '010': 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Myousenji_temple_%E9%98%BF%E4%BB%8F%E5%9D%8A%E5%A6%99%E5%AE%A3%E5%AF%BA_%283658494016%29.jpg',
  '014': 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Kokujouji_Temple%2C_Tsubame%2C_Niigata%2C_Japan%2C_May_2021.jpg',
  '020': 'https://upload.wikimedia.org/wikipedia/commons/d/d8/%E4%BD%90%E6%B8%A1%E3%83%BB%E6%B8%85%E6%B0%B4%E5%AF%BA_02.jpg',
  '022': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Shibata_SuwaShrine_March2020.jpg',
  '023': 'https://upload.wikimedia.org/wikipedia/commons/3/30/Entrance%2C_Kankoku-ji_Temple%2C_Shibata%2C_Niigata%2C_Japan%2C_April_2024.jpg',
  '024': 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Sanj%C5%8D_Hachimangu_Shrine%2C_Sanj%C5%8D%2C_Niigata%2C_Japan%2C_July_2022.jpg',
  '025': 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Kota-jinja_%28Joetsu%29_shaden.JPG',
  '026': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Linsenji_1.jpg',
  '027': 'https://upload.wikimedia.org/wikipedia/commons/2/26/Kasugayama_jinjya_1.jpg',
  '038': 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Gochi-kokubunji_hondou.JPG'
};

for (const no in photoMap) {
  const item = dex.find(x => x.dexNo === no);
  if (item) {
    item.photoUrl = photoMap[no];
  }
}

// Write back formatted JS
const outputJs = '// にいがた神社仏閣・仏像＆御朱印図鑑 データベース（全88社寺）\nwindow.JAPAN_BEAUTY_DEX = ' + JSON.stringify(dex, null, 2) + ';\n';
fs.writeFileSync(path, outputJs, 'utf8');
console.log('Successfully updated data-japan-dex.js!');
