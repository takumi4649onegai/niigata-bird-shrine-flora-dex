const fs = require('fs');

const path = 'js/niigata-geo-engine.js';
let content = fs.readFileSync(path, 'utf8');

// Replace the NiigataGeoEngine implementation with user-customizable home location support
const newEngineCode = `// ============================================================================
// 新潟ネイチャー＆カメラ ジオロケーション・「帰り道（自宅・目的地へ近づく）作戦」計算エンジン
// ============================================================================

window.NiigataGeoEngine = (function () {
  const STORAGE_KEY_HOME = "niigata_user_custom_home";

  // デフォルトの自宅・ホーム拠点（新潟市北区・豊栄／福島潟エリア）
  const DEFAULT_HOME = {
    name: "新潟市北区（豊栄・福島潟周辺）",
    lat: 37.9150,
    lng: 139.2450,
    isDefault: true
  };

  // 登録済み代表エリア・クイックプリセット
  const PRESET_LOCATIONS = [
    { id: "home_kita", name: "🏠 新潟市北区（豊栄・福島潟周辺）", lat: 37.9150, lng: 139.2450 },
    { id: "center_chuo", name: "🏢 新潟市中央区（新潟駅・万代・古町）", lat: 37.9160, lng: 139.0430 },
    { id: "west_kounan", name: "🌾 新潟市西区・江南区（内野・亀田）", lat: 37.8650, lng: 138.9800 },
    { id: "shibata_seiro", name: "🏯 下越北東部：新発田・聖籠・胎内", lat: 37.9500, lng: 139.3300 },
    { id: "murakami_north", name: "🌊 下越最北部：村上・笹川流れ", lat: 38.2255, lng: 139.4795 },
    { id: "agano_east", name: "🦆 下越東部：阿賀野（瓢湖）・阿賀町", lat: 37.8347, lng: 139.2272 },
    { id: "akiha_niitsu", name: "🍁 秋葉区・五泉（新津駅・秋葉公園・慈光寺）", lat: 37.7800, lng: 139.1500 },
    { id: "yahiko_tsubame", name: "⛰️ 西蒲・弥彦・燕（弥彦神社・角田山麓・大河津）", lat: 37.7050, lng: 138.8250 },
    { id: "nagaoka_center", name: "🎆 中越中心部：長岡駅・信濃川周辺", lat: 37.4460, lng: 138.8520 },
    { id: "sanjo_kamo", name: "🔨 県央部：三条・加茂・田上", lat: 37.6360, lng: 138.9600 },
    { id: "uonuma_tokamachi", name: "🌾 魚沼・十日町（南魚沼・越後湯沢・美人林）", lat: 37.1065, lng: 138.6186 },
    { id: "joetsu_myoko", name: "🏔️ 上越・妙高（春日山・高田城址・いもり池）", lat: 37.1480, lng: 138.2360 },
    { id: "itoigawa_west", name: "💎 上越西端：糸魚川・親不知・翡翠海岸", lat: 37.0420, lng: 137.8630 },
    { id: "sado_island", name: "⛴️ 佐渡島（両津港・相川・トキの森）", lat: 38.0180, lng: 138.3680 }
  ];

  // オフライン・高速ジオコーディング用の市町村・駅名辞書（新潟県内＋主要地）
  const NIIGATA_PLACE_DICT = [
    { keywords: ["北区", "豊栄", "福島潟", "葛塚", "松浜", "島見", "太郎代", "早通"], name: "新潟市北区", lat: 37.9150, lng: 139.2450 },
    { keywords: ["中央区", "新潟駅", "万代", "古町", "白山", "関屋", "鳥屋野", "女池"], name: "新潟市中央区", lat: 37.9160, lng: 139.0430 },
    { keywords: ["東区", "新潟空港", "山木戸", "大形", "河渡"], name: "新潟市東区", lat: 37.9250, lng: 139.1000 },
    { keywords: ["江南区", "亀田", "横越", "沢海", "酒屋"], name: "新潟市江南区", lat: 37.8700, lng: 139.1100 },
    { keywords: ["秋葉区", "新津", "小須戸", "荻川", "古津", "矢代田"], name: "新潟市秋葉区", lat: 37.8000, lng: 139.1200 },
    { keywords: ["南区", "白根", "味方", "月潟"], name: "新潟市南区", lat: 37.7600, lng: 139.0100 },
    { keywords: ["西区", "内野", "小針", "寺尾", "青山", "黒埼", "赤塚", "越後赤塚"], name: "新潟市西区", lat: 37.8700, lng: 138.9700 },
    { keywords: ["西蒲区", "巻", "岩室", "角田", "間瀬", "漆山", "越後曽根"], name: "新潟市西蒲区", lat: 37.7600, lng: 138.8900 },
    { keywords: ["新発田", "五十公野", "月岡", "豊町"], name: "新発田市", lat: 37.9470, lng: 139.3280 },
    { keywords: ["村上", "瀬波", "荒川", "坂町", "神林", "朝日", "山北", "府屋"], name: "村上市", lat: 38.2255, lng: 139.4795 },
    { keywords: ["燕", "吉田", "分水", "燕三条"], name: "燕市", lat: 37.6680, lng: 138.9250 },
    { keywords: ["五泉", "村松"], name: "五泉市", lat: 37.7340, lng: 139.1820 },
    { keywords: ["阿賀野", "水原", "安田", "保田", "京ヶ瀬", "笹神", "瓢湖"], name: "阿賀野市", lat: 37.8347, lng: 139.2272 },
    { keywords: ["胎内", "中条", "黒川"], name: "胎内市", lat: 38.0580, lng: 139.3620 },
    { keywords: ["聖籠"], name: "北蒲原郡聖籠町", lat: 37.9620, lng: 139.2780 },
    { keywords: ["弥彦"], name: "西蒲原郡弥彦村", lat: 37.7050, lng: 138.8250 },
    { keywords: ["田上"], name: "南蒲原郡田上町", lat: 37.7030, lng: 139.0600 },
    { keywords: ["阿賀町", "津川", "鹿瀬", "三川", "上川"], name: "東蒲原郡阿賀町", lat: 37.6840, lng: 139.4380 },
    { keywords: ["関川"], name: "岩船郡関川村", lat: 38.0890, lng: 139.5480 },
    { keywords: ["粟島"], name: "岩船郡粟島浦村", lat: 38.4680, lng: 139.2480 },
    { keywords: ["長岡", "栃尾", "寺泊", "山古志", "川口", "越路", "三島", "与板", "小国", "宮内"], name: "長岡市", lat: 37.4460, lng: 138.8520 },
    { keywords: ["三条", "下田", "栄", "東三条"], name: "三条市", lat: 37.6360, lng: 138.9600 },
    { keywords: ["柏崎", "高柳", "西山"], name: "柏崎市", lat: 37.3680, lng: 138.5580 },
    { keywords: ["小千谷"], name: "小千谷市", lat: 37.3150, lng: 138.7960 },
    { keywords: ["加茂"], name: "加茂市", lat: 37.6660, lng: 139.0430 },
    { keywords: ["十日町", "松代", "松之山", "中里", "川西"], name: "十日町市", lat: 37.1320, lng: 138.7560 },
    { keywords: ["見附"], name: "見附市", lat: 37.5310, lng: 138.9100 },
    { keywords: ["魚沼", "小出", "堀之内", "湯之谷", "広神"], name: "魚沼市", lat: 37.2340, lng: 138.9560 },
    { keywords: ["南魚沼", "六日町", "塩沢", "大和", "浦佐"], name: "南魚沼市", lat: 37.0670, lng: 138.8760 },
    { keywords: ["出雲崎"], name: "三島郡出雲崎町", lat: 37.5210, lng: 138.6940 },
    { keywords: ["湯沢", "越後湯沢"], name: "南魚沼郡湯沢町", lat: 36.9350, lng: 138.8180 },
    { keywords: ["津南"], name: "中魚沼郡津南町", lat: 37.0140, lng: 138.6530 },
    { keywords: ["刈羽"], name: "刈羽郡刈羽村", lat: 37.4320, lng: 138.6180 },
    { keywords: ["上越", "高田", "直江津", "柿崎", "大潟", "頚城", "安塚", "浦川原", "春日山"], name: "上越市", lat: 37.1480, lng: 138.2360 },
    { keywords: ["糸魚川", "能生", "青海", "親不知"], name: "糸魚川市", lat: 37.0420, lng: 137.8630 },
    { keywords: ["妙高", "新井", "妙高高原", "赤倉"], name: "妙高市", lat: 37.0250, lng: 138.2560 },
    { keywords: ["佐渡", "両津", "相川", "佐和田", "真野", "羽茂", "小木", "赤泊", "金井", "新穂"], name: "佐渡市", lat: 38.0180, lng: 138.3680 },
    { keywords: ["東京", "新宿", "渋谷"], name: "東京都", lat: 35.6895, lng: 139.6917 },
    { keywords: ["埼玉", "大宮"], name: "埼玉県", lat: 35.8617, lng: 139.6455 },
    { keywords: ["高崎", "前橋", "群馬"], name: "群馬県", lat: 36.3911, lng: 139.0608 },
    { keywords: ["富山"], name: "富山県", lat: 36.6953, lng: 137.2113 },
    { keywords: ["長野"], name: "長野県", lat: 36.6513, lng: 138.1810 },
    { keywords: ["会津", "福島"], name: "福島県", lat: 37.7500, lng: 140.4678 },
    { keywords: ["山形", "米沢", "鶴岡", "酒田"], name: "山形県", lat: 38.2404, lng: 140.3633 }
  ];

  // ユーザーのカスタム自宅拠点を取得（ブラウザローカル保存）
  function getUserHome() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HOME);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.lat === "number" && typeof parsed.lng === "number") {
          return {
            name: parsed.name || "登録されたマイ自宅",
            lat: parsed.lat,
            lng: parsed.lng,
            isDefault: false
          };
        }
      }
    } catch (_) {}
    return { ...DEFAULT_HOME };
  }

  // ユーザーのカスタム自宅拠点を保存
  function setUserHome(name, lat, lng) {
    if (typeof lat !== "number" || typeof lng !== "number") return false;
    try {
      const data = {
        name: (name || "マイ自宅").trim(),
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_HOME, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Failed to save custom home to localStorage:", e);
      return false;
    }
  }

  // ユーザーのカスタム自宅拠点をリセット（デフォルトに戻す）
  function resetUserHome() {
    try {
      localStorage.removeItem(STORAGE_KEY_HOME);
      return true;
    } catch (_) {
      return false;
    }
  }

  // 市町村名・地名テキストから緯度経度を検索
  async function searchLocationCoordinates(queryText) {
    if (!queryText || !queryText.trim()) return null;
    const clean = queryText.trim().replace(/[都道府県市町村区]/g, "");

    // 1. まず内蔵の高速辞書で完全・部分一致検索（通信不要・オフライン即答）
    for (const item of NIIGATA_PLACE_DICT) {
      for (const kw of item.keywords) {
        if (queryText.includes(kw) || kw.includes(clean)) {
          return { name: item.name, lat: item.lat, lng: item.lng };
        }
      }
    }

    // 2. 辞書にない場合は国土地理院の無料ジオコーディングAPIで検索
    try {
      const url = \`https://msearch.gsi.go.jp/address-search/AddressSearch?q=\${encodeURIComponent(queryText)}\`;
      const res = await fetch(url).then(r => r.json());
      if (Array.isArray(res) && res.length > 0 && res[0].geometry && res[0].geometry.coordinates) {
        const [lng, lat] = res[0].geometry.coordinates;
        return {
          name: res[0].properties ? res[0].properties.title : queryText,
          lat: Number(lat),
          lng: Number(lng)
        };
      }
    } catch (_) {}

    return null;
  }

  // 2地点間の大圏距離（km）をヒュベニの公式で計算
  function calcDistanceKm(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const R = 6371;
    return Math.round(R * c * 10) / 10;
  }

  // 方角（16方位）の計算
  function calcCompassBearing(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return { text: "不明", icon: "📍" };
    const rad = Math.PI / 180;
    const y = Math.sin((lon2 - lon1) * rad) * Math.cos(lat2 * rad);
    const x = Math.cos(lat1 * rad) * Math.sin(lat2 * rad) -
              Math.sin(lat1 * rad) * Math.cos(lat2 * rad) * Math.cos((lon2 - lon1) * rad);
    let deg = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;

    const dirs = [
      { text: "北", icon: "⬆️" },
      { text: "北北東", icon: "↗️" },
      { text: "北東", icon: "↗️" },
      { text: "東北東", icon: "↗️" },
      { text: "東", icon: "➡️" },
      { text: "東南東", icon: "↘️" },
      { text: "南東", icon: "↘️" },
      { text: "南南東", icon: "↘️" },
      { text: "南", icon: "⬇️" },
      { text: "南南西", icon: "↙️" },
      { text: "南西", icon: "↙️" },
      { text: "西南西", icon: "↙️" },
      { text: "西", icon: "⬅️" },
      { text: "西北西", icon: "↖️" },
      { text: "北西", icon: "↖️" },
      { text: "北北西", icon: "↖️" }
    ];
    const idx = Math.round(deg / 22.5) % 16;
    return dirs[idx];
  }

  // 一般道での想定ドライブ所要時間
  function estimateDriveTime(distKm) {
    if (distKm == null) return "計算中";
    if (distKm <= 1.5) return "約5分";
    const minTime = Math.round((distKm / 35) * 60);
    if (minTime < 60) return \`約\${minTime}分\`;
    const h = Math.floor(minTime / 60);
    const m = minTime % 60;
    return m > 0 ? \`約\${h}時間\${m}分\` : \`約\${h}時間\`;
  }

  // 「帰り道（自宅・目的地へ近づく）作戦」の判定評価
  function evaluateHomeApproach(currentLat, currentLng, spotLat, spotLng, homeLat = null, homeLng = null) {
    if (currentLat == null || currentLng == null || spotLat == null || spotLng == null) return null;

    // 自宅座標が指定されていない場合はユーザー登録の自宅を自動取得
    if (homeLat == null || homeLng == null) {
      const home = getUserHome();
      homeLat = home.lat;
      homeLng = home.lng;
    }

    const currentToHome = calcDistanceKm(currentLat, currentLng, homeLat, homeLng);
    const currentToSpot = calcDistanceKm(currentLat, currentLng, spotLat, spotLng);
    const spotToHome = calcDistanceKm(spotLat, spotLng, homeLat, homeLng);

    if (currentToHome == null || currentToSpot == null || spotToHome == null) return null;

    // 現在地から直接家へ帰るより、どれだけ家に近づくか（マイナスなら家から遠ざかる逆走）
    const closerDistance = Math.round((currentToHome - spotToHome) * 10) / 10;
    const isCloserToHome = closerDistance > 0.5; // 500m以上家に近づく

    // 寄り道による追加走行距離: (現在地→スポット) + (スポット→自宅) - (現在地→自宅直行)
    const extraDetourKm = Math.max(0, Math.round((currentToSpot + spotToHome - currentToHome) * 10) / 10);

    // 帰り道寄り道として自然なルートか（迂回率1.35倍以内、かつ家に近づく）
    const detourRatio = (currentToSpot + spotToHome) / Math.max(1, currentToHome);
    const isNaturalWayHome = isCloserToHome && detourRatio <= 1.35;

    return {
      currentToHome,
      currentToSpot,
      spotToHome,
      closerDistance,
      isCloserToHome,
      extraDetourKm,
      isNaturalWayHome
    };
  }

  return {
    DEFAULT_HOME,
    PRESET_LOCATIONS,
    getUserHome,
    setUserHome,
    resetUserHome,
    searchLocationCoordinates,
    calcDistanceKm,
    calcCompassBearing,
    estimateDriveTime,
    evaluateHomeApproach
  };
})();
`;

fs.writeFileSync(path, newEngineCode, 'utf8');
console.log('Successfully updated js/niigata-geo-engine.js!');
