const fs = require('fs');

let code = fs.readFileSync('神社仏閣・絶景・花図鑑/js/data-japan-dex.js', 'utf8');

// 1. Update shibata_suwa to include yokoi_suwa_shrine
code = code.replace(
  /"kamiyachi_suwa", "dexNo": "118", "name": "神谷内諏訪神社（北区神谷内）", "note": "新井郷川沿い水郷新田の鎮守" \}\s*\]/,
  `"kamiyachi_suwa", "dexNo": "118", "name": "神谷内諏訪神社（北区神谷内）", "note": "新井郷川沿い水郷新田の鎮守" },\n      { "id": "yokoi_suwa_shrine", "dexNo": "125", "name": "横井諏訪神社（北区横井）", "note": "福島潟南東・新田水防鎮守" }\n    ]`
);

// 2. Add lineage to niigata_hakusan (No.006)
const hakusanLineage = `,\n    "lineage": {
      "group": "hakusan",
      "groupName": "🐉 白山・大河と日本海の守護系譜",
      "groupDesc": "水の神様・白山比咩大神を祀り、信濃川・阿賀野川の大河水防と人々の安寧を祈って各地へ勧請されたネットワーク。",
      "role": "parent",
      "roleLabel": "👑 親神社（越後・新潟総鎮守）",
      "children": [
        { "id": "nagaba_hakusan_shrine", "dexNo": "126", "name": "長場白山神社（北区長場）", "note": "里飯野隣接・阿賀野川水防鎮守" },
        { "id": "teradomari_hakusan", "dexNo": "064", "name": "寺泊・白山媛神社（長岡市寺泊）", "note": "日本海航路安全鎮守" }
      ],
      "desc": "新潟総鎮守。信濃川・阿賀野川の河口と平野部を守護する白山信仰の大拠点。"
    }`;

code = code.replace(/(\{\s*"id":\s*"niigata_hakusan"[\s\S]*?)(,\s*"lineage":\s*\{[\s\S]*?\n    \}|)(\n  \},)/, function(m, p1, p2, p3) {
  return p1 + hakusanLineage + p3;
});

// 3. New spots 122 to 126
const newSpots = `  {
    "id": "kaikata_shrine_niihana",
    "dexNo": "122",
    "name": "開潟神社（福島潟干拓の先駆者を祀る守り神・新潟市北区新鼻）",
    "englishTitle": "Kaikata Shrine: Guardian of Fukushimagata Reclamation Pioneers",
    "category": "仏像・石仏・小さなお宮",
    "subTags": [
      "新潟市北区",
      "福島潟",
      "新鼻",
      "小さなお宮",
      "開拓の神"
    ],
    "spotId": "fukushimagata",
    "spotName": "開潟神社（新潟市北区新鼻甲391・ビュー福島潟から車で3分）",
    "area": "新潟市北区新鼻",
    "region": "kaetsu",
    "hasGoshuin": false,
    "hasGoshuincho": false,
    "goshuinInfo": "🗿【無人・地域の歴史古社】明治9年、過酷な福島潟の干拓・新田開発に命を捧げた先人たち（山本丈右衛門や斉藤七郎治ら）を神として祀った、福島潟の歴史そのものを伝えるお宮。",
    "months": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "rarity": 3,
    "compositionType": "額縁構図（潟の葦と素朴な鳥居）＋ 静謐な木漏れ日スナップ",
    "photoPermission": "【境内・外観：撮影OK】静かな農村集落のため住民のプライバシーに配慮",
    "parkingInfo": "🅿️ 参拝者スペースあり（境内脇に駐車可）／ビュー福島潟駐車場からも車ですぐ",
    "bestTimeWeather": "通年、朝〜午後の斜光、菜の花（春）やオニバス・稲穂（秋）の時期",
    "recommendedSpec": {
      "focalLength": "28mm〜50mm標準スナップ",
      "shutterSpeed": "1/250秒",
      "fStop": "F4〜F5.6"
    },
    "shotRecipes": [
      "①【福島潟の風を伝える素朴な木造社殿】集落の奥、潟の水辺近くに佇む小さなお社。周囲の木々と青空を広角で自然な露出で捉えます。",
      "②【新田開拓の歴史を刻む境内石碑】江戸時代の福島潟干拓に尽力した先人たちの功績を伝える石碑を、F2.8のボケ味で厳かに切り取ります。"
    ],
    "wikiTitle": "",
    "searchQuery": "開潟神社 新潟市北区",
    "spotMapQuery": "開潟神社 新潟市北区新鼻甲391",
    "parkingMapQuery": "開潟神社 新潟市北区新鼻甲391",
    "colorPalette": ["#15803D", "#78350F", "#0284C7"],
    "catchphrase": "福島潟を干拓した先人たちが神様になったお宮！潟の歴史と魂をいまに伝える静かな鎮守",
    "inboundAppeal": "A unique historic shrine dedicated to local pioneers who reclaimed Lake Fukushimagata in the Edo period.",
    "mannerNote": "地域の集落が誇りとして守るお宮です。静かに参拝してから撮影しましょう。",
    "linkedBirds": ["チュウヒ", "オオヒシクイ", "スズメ", "ツバメ"],
    "lat": 37.9085,
    "lng": 139.2562,
    "lineage": {
      "group": "reclamation",
      "groupName": "🌾 潟開拓・先人崇敬の系譜",
      "groupDesc": "過酷な潟の干拓新田開発に命を捧げた先駆者たちを郷土の守り神として祀る北区独自の信仰。",
      "role": "child",
      "roleLabel": "👶 子神社（潟開拓の守り神）",
      "parentId": "fukushimagata_mist",
      "parentDexNo": "012",
      "parentName": "福島潟（新潟市北区）",
      "desc": "江戸時代、福島潟周辺の干拓新田開発に尽力した山本丈右衛門や斉藤七郎治らを祭神として建立されたお宮。"
    }
  },
  {
    "id": "kirioyama_shrine_kizaki",
    "dexNo": "123",
    "name": "切尾山神社（和銅年間創建伝承の丘の超古社・新潟市北区木崎）",
    "englishTitle": "Kirioyama Shrine: Ancient Hilltop Sanctuary Founded in Wado Era",
    "category": "仏像・石仏・小さなお宮",
    "subTags": [
      "新潟市北区",
      "木崎",
      "丘の上の神社",
      "小さなお宮",
      "和銅年間古社"
    ],
    "spotId": "fukushimagata",
    "spotName": "切尾山神社（新潟市北区木崎3612・道の駅豊栄の南側果樹園丘陵）",
    "area": "新潟市北区木崎",
    "region": "kaetsu",
    "hasGoshuin": false,
    "hasGoshuincho": false,
    "goshuinInfo": "🗿【無人・丘陵の超古社】和銅年間（奈良時代・708〜715年）創建と伝わる北区屈指の歴史を誇る古社。木崎の果樹園丘陵の頂上に鎮座。",
    "months": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "rarity": 4,
    "compositionType": "俯瞰パノラマ構図（丘の上からの平野望遠）＋ 木立の額縁構図",
    "photoPermission": "【境内・外観：撮影OK】",
    "parkingInfo": "🅿️ 参拝者スペースあり（丘のふもと〜境内脇）／道の駅豊栄から車で約4分",
    "bestTimeWeather": "晴れた日の午前〜夕景（丘の上からの眺望が絶景）",
    "recommendedSpec": {
      "focalLength": "35mm〜85mm標準〜中望遠",
      "shutterSpeed": "1/250秒",
      "fStop": "F5.6〜F8"
    },
    "shotRecipes": [
      "①【果樹園の丘の頂上に佇む古社】木崎のフルーツロードから小高い丘を登り、木立に囲まれた静寂の社殿を端正に切り取ります。",
      "②【境内から見下ろす越後平野のパノラマ】社殿前からの見晴らしを活かし、広がる田園地帯と遠くの山並みを広角でワイドに捉えます。"
    ],
    "wikiTitle": "",
    "searchQuery": "切尾山神社 新潟市北区",
    "spotMapQuery": "切尾山神社 新潟市北区木崎3612",
    "parkingMapQuery": "切尾山神社 新潟市北区木崎3612",
    "colorPalette": ["#15803D", "#78350F", "#D97706"],
    "catchphrase": "道の駅豊栄のすぐ南！和銅年間創建の伝承をもつ果樹園の丘に佇む静寂の超古社",
    "inboundAppeal": "Ancient hilltop shrine said to be founded in the Wado era (708-715), offering panoramic views of rural Niigata.",
    "mannerNote": "果樹園の農道を通る際は農作業の方の通行を妨げないようご配慮ください。",
    "linkedBirds": ["ホオジロ", "モズ", "ヤマガラ", "シジュウカラ"],
    "lat": 37.9358,
    "lng": 139.2012,
    "lineage": {
      "group": "ancient_hill",
      "groupName": "⛰️ 古代丘陵・古津〜木崎の系譜",
      "groupDesc": "古代の越後平野を見渡す砂丘・丘陵の頂に祀られた古い信仰の系譜。",
      "role": "child",
      "roleLabel": "👶 子神社（古代丘陵の古社）",
      "parentId": "horide_furutsu_akiha",
      "parentDexNo": "027",
      "parentName": "秋葉区・古津八幡山遺跡",
      "desc": "奈良時代（和銅年間）からの歴史があると伝わる、北区木崎の小高い丘に鎮座する古社。"
    }
  },
  {
    "id": "kuzutsuka_isurugi_shrine",
    "dexNo": "124",
    "name": "葛塚石動神社（正尺の神楽が伝わる名社・能登石動山ゆかり・新潟市北区白新町）",
    "englishTitle": "Kuzutsuka Isurugi Shrine: Sacred Guardian of Shinto Music and Dance",
    "category": "仏像・石仏・小さなお宮",
    "subTags": [
      "新潟市北区",
      "葛塚",
      "石動山信仰",
      "葛塚まつり",
      "市指定無形民俗文化財"
    ],
    "spotId": "fukushimagata",
    "spotName": "葛塚石動神社（新潟市北区白新町3-8-1・JR豊栄駅南口から徒歩4分）",
    "area": "新潟市北区白新町",
    "region": "kaetsu",
    "hasGoshuin": false,
    "hasGoshuincho": false,
    "goshuinInfo": "🗿【地域の中心古社】能登半島の古霊場・石動山から御神霊を迎えた古社。葛塚まつりでは葛塚稲荷神社と二大巨頭を務め、市指定無形民俗文化財の神楽が伝わる。",
    "months": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "rarity": 3,
    "compositionType": "正面シンメトリー構図（社殿と注連縄）＋ 街中スナップ",
    "photoPermission": "【境内・外観：撮影OK】",
    "parkingInfo": "🅿️ 参拝者駐車場あり／JR豊栄駅前市営駐車場からも徒歩すぐ",
    "bestTimeWeather": "通年、葛塚まつり（9月6〜8日）、秋の例祭",
    "recommendedSpec": {
      "focalLength": "28mm〜50mmスナップ",
      "shutterSpeed": "1/200秒",
      "fStop": "F4〜F5.6"
    },
    "shotRecipes": [
      "①【歴史ある木造社殿と注連縄ショット】豊栄駅近くの町中に鎮座する堂々たる社殿を、正面から整然と切り取ります。",
      "②【葛塚の伝統を刻む神楽殿と石灯籠】市指定無形民俗文化財「正尺の神楽」が奉納される境内を、落ち着いた露出でスナップ。"
    ],
    "wikiTitle": "",
    "searchQuery": "石動神社 新潟市北区白新町",
    "spotMapQuery": "石動神社 新潟市北区白新町3-8-1",
    "parkingMapQuery": "石動神社 新潟市北区白新町3-8-1",
    "colorPalette": ["#991B1B", "#78350F", "#1E3A8A"],
    "catchphrase": "葛塚稲荷と並ぶ葛塚まつりの主役！能登の霊山・石動山から勧請された歴史ある街鎮守",
    "inboundAppeal": "Historic town shrine co-hosting the famous Kuzutsuka Festival, dedicated from sacred Mt. Isurugi in Noto.",
    "mannerNote": "駅前住宅街のお宮ですので、静かに参拝してからスナップを楽しみましょう。",
    "linkedBirds": ["スズメ", "ツバメ", "キジバト"],
    "lat": 37.9152,
    "lng": 139.2178,
    "lineage": {
      "group": "isurugi",
      "groupName": "🏔️ 石動・北陸修験霊峰の系譜",
      "groupDesc": "能登半島の古霊山・石動山（伊須流岐比古神社）を親山とし、越後各地に広まった山岳修験信仰の分霊社。",
      "role": "child",
      "roleLabel": "👶 子神社（石動山分霊社）",
      "parentId": "yahiko_shrine",
      "parentDexNo": "001",
      "parentName": "越後一宮・彌彦神社（越後山岳信仰総鎮守）",
      "desc": "能登の古修験霊場・石動山から御神霊を迎えた古社。葛塚まつりでは葛塚稲荷神社と二大巨頭を務める。"
    }
  },
  {
    "id": "yokoi_suwa_shrine",
    "dexNo": "125",
    "name": "横井諏訪神社（福島潟南東・水防と豊作を祈る集落鎮守・新潟市北区横井）",
    "englishTitle": "Yokoi Suwa Shrine: Rural Guardian of Rice Paddies near Fukushimagata",
    "category": "仏像・石仏・小さなお宮",
    "subTags": [
      "新潟市北区",
      "横井",
      "福島潟周辺",
      "小さなお宮",
      "諏訪信仰"
    ],
    "spotId": "fukushimagata",
    "spotName": "横井諏訪神社（新潟市北区横井230・福島潟雁晴れ舎から車で5分）",
    "area": "新潟市北区横井",
    "region": "kaetsu",
    "hasGoshuin": false,
    "hasGoshuincho": false,
    "goshuinInfo": "🗿【無人・水郷農村鎮守】新発田藩の開拓期、阿賀野川水系の水防と豊作を祈り新発田諏訪神社から勧請された農村鎮守。",
    "months": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "rarity": 3,
    "compositionType": "放射線構図（参道と木立ち）＋ 田園風景",
    "photoPermission": "【境内・外観：撮影OK】静かな農村集落のため配慮",
    "parkingInfo": "🅿️ 参拝者スペースあり（境内脇に駐車可）／福島潟から車ですぐ",
    "bestTimeWeather": "朝の斜光、新緑や黄金の稲穂が揺れる初秋",
    "recommendedSpec": {
      "focalLength": "35mm〜70mm標準ズーム",
      "shutterSpeed": "1/250秒",
      "fStop": "F4〜F8"
    },
    "shotRecipes": [
      "①【石鳥居と社叢の緑のコントラスト】福島潟の南東に広がる田園風景の中、ぽつりと佇む緑の木立とお社を広角で優しく捉えます。",
      "②【新田水防の祈りを伝える木造社殿】新発田諏訪神社から勧請された由緒を胸に、素朴な社殿の彫刻や木肌をF3.5でしっとりスナップ。"
    ],
    "wikiTitle": "",
    "searchQuery": "横井諏訪神社 新潟市北区",
    "spotMapQuery": "諏訪神社 新潟市北区横井",
    "parkingMapQuery": "諏訪神社 新潟市北区横井",
    "colorPalette": ["#15803D", "#78350F", "#0369A1"],
    "catchphrase": "福島潟探鳥のすぐ近く！新田開拓の水防と豊作を祈って新発田諏訪神社から勧請された素朴な名社",
    "inboundAppeal": "Quiet countryside shrine dedicated from Shibata Suwa Shrine to guard reclamation paddies around Fukushimagata.",
    "mannerNote": "地域の農村集落が大切に守るお宮です。静かに参拝してから撮影しましょう。",
    "linkedBirds": ["ヒバリ", "オオヨシキリ", "キジ", "セッカ"],
    "lat": 37.8998,
    "lng": 139.2555,
    "lineage": {
      "group": "suwa",
      "groupName": "🌊 諏訪・水郷水防と開拓の系譜",
      "role": "child",
      "roleLabel": "👶 子神社（新田分霊社）",
      "parentId": "shibata_suwa",
      "parentDexNo": "032",
      "parentName": "新発田総鎮守・諏訪神社",
      "desc": "新発田藩の開拓期、阿賀野川水系の水防と五穀豊穣を祈り新発田諏訪神社から勧請された農村鎮守。"
    }
  },
  {
    "id": "nagaba_hakusan_shrine",
    "dexNo": "126",
    "name": "長場白山神社（里飯野隣接・大河阿賀野川の水を司る古社・新潟市北区長場）",
    "englishTitle": "Nagaba Hakusan Shrine: Guardian of Sacred Waters Neighboring Satoiino",
    "category": "仏像・石仏・小さなお宮",
    "subTags": [
      "新潟市北区",
      "長場",
      "里飯野近郊",
      "小さなお宮",
      "白山信仰"
    ],
    "spotId": "fukushimagata",
    "spotName": "長場白山神社（新潟市北区長場・里飯野神社から車で3分）",
    "area": "新潟市北区長場",
    "region": "kaetsu",
    "hasGoshuin": false,
    "hasGoshuincho": false,
    "goshuinInfo": "🗿【無人・里飯野隣接の古社】里飯野のすぐ隣、阿賀野川の水を司り農耕を守護するために新潟白山神社から勧請された古社。",
    "months": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "rarity": 3,
    "compositionType": "正面シンメトリー構図（石鳥居と社殿）＋ 木漏れ日",
    "photoPermission": "【境内・外観：撮影OK】",
    "parkingInfo": "🅿️ 参拝者スペースあり（境内脇に駐車可）／里飯野からすぐ",
    "bestTimeWeather": "通年、午前中の光、木漏れ日の時間帯",
    "recommendedSpec": {
      "focalLength": "28mm〜50mm標準スナップ",
      "shutterSpeed": "1/200秒",
      "fStop": "F4〜F5.6"
    },
    "shotRecipes": [
      "①【里飯野のすぐ隣！静かな農村に佇む白山さま】里飯野神社を参拝した足でそのまま巡れる距離。静かな杉木立と石鳥居の厳かな佇まいを捉えます。",
      "②【水神の恵みを讃える境内の石造物】阿賀野川水系の水を治め、豊かな実りを祈り続けてきた社殿を標準レンズで落ち着いてスナップ。"
    ],
    "wikiTitle": "",
    "searchQuery": "白山神社 新潟市北区長場",
    "spotMapQuery": "白山神社 新潟市北区長場",
    "parkingMapQuery": "白山神社 新潟市北区長場",
    "colorPalette": ["#15803D", "#78350F", "#475569"],
    "catchphrase": "里飯野のすぐお隣！阿賀野川水系の水防と実りを祈り白山神社から勧請された静かな鎮守",
    "inboundAppeal": "A serene rural sanctuary neighboring Satoiino Shrine, dedicated from Niigata Hakusan Shrine to guard river waters.",
    "mannerNote": "地域の集落が大切に守るお宮です。静かに参拝してから撮影しましょう。",
    "linkedBirds": ["スズメ", "ツバメ", "モズ", "ハクセキレイ"],
    "lat": 37.8812,
    "lng": 139.2385,
    "lineage": {
      "group": "hakusan",
      "groupName": "🐉 白山・大河と日本海の守護系譜",
      "groupDesc": "水の神様・白山比咩大神を祀り、大河川の水防と人々の安寧を祈って勧請されたネットワーク。",
      "role": "child",
      "roleLabel": "👶 子神社（水防分霊社）",
      "parentId": "niigata_hakusan",
      "parentDexNo": "006",
      "parentName": "新潟総鎮守・白山神社",
      "desc": "里飯野のすぐ隣、阿賀野川の水を司り農耕を守護するために新潟白山神社から勧請された古社。"
    }
  }`;

// Insert before the last `];`
const lastBracketIdx = code.lastIndexOf('];');
if (lastBracketIdx !== -1) {
  const before = code.slice(0, lastBracketIdx).trim();
  let separator = before.endsWith(',') ? '\n' : ',\n';
  code = before + separator + newSpots + '\n];\n';
}

fs.writeFileSync('神社仏閣・絶景・花図鑑/js/data-japan-dex.js', code, 'utf8');
console.log("Successfully added spots 122-126 to data-japan-dex.js!");

// 4. Update index.html total counts (from 121 to 126)
let html = fs.readFileSync('神社仏閣・絶景・花図鑑/index.html', 'utf8');
html = html.replace(/<span id="hdr-total-count">121<\/span>/g, '<span id="hdr-total-count">126</span>');
html = html.replace(/<span id="hdr-visited-total">121<\/span>/g, '<span id="hdr-visited-total">126</span>');
html = html.replace(/すべて表示 \(120\)/g, 'すべて表示 (126)');

fs.writeFileSync('神社仏閣・絶景・花図鑑/index.html', html, 'utf8');
console.log("Successfully updated index.html total counts to 126!");
