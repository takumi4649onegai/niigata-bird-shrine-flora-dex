// ============================================================================
// 新潟ネイチャー＆カメラ ジオロケーション・「帰り道（自宅・目的地へ近づく）作戦」計算エンジン
// ============================================================================

window.NiigataGeoEngine = (function () {
  // デフォルトの自宅・ホーム拠点（新潟市北区・豊栄／福島潟エリア）
  const DEFAULT_HOME = {
    name: "新潟市北区（豊栄・福島潟周辺）",
    lat: 37.9150,
    lng: 139.2450
  };

  // 登録済み代表エリア・クイックプリセット
  const PRESET_LOCATIONS = [
    { id: "home_kita", name: "🏠 新潟市北区（豊栄・福島潟周辺）", lat: 37.9150, lng: 139.2450 },
    { id: "center_chuo", name: "🏢 新潟市中央区（新潟駅・万代・古町）", lat: 37.9160, lng: 139.0430 },
    { id: "west_kounan", name: "🌾 新潟市西区・江南区（内野・亀田）", lat: 37.8650, lng: 138.9800 },
    { id: "shibata_seiro", name: "🏯 下越北東部：新発田・聖籠・胎内", lat: 37.9500, lng: 139.3300 },
    { id: "murakami_north", name: "🌊 下越最北部：村上・笹川流れ", lat: 38.2255, lng: 139.4795 },
    { id: "agano_east", name: "🦆 下越東部：阿賀野（瓢湖）・阿賀町", lat: 37.8347, lng: 139.2272 },
    { id: "akiha_niitsu", name: "🍁 秋葉区・五泉（新津駅・秋葉公園・慈光寺）", lat: 37.7892, lng: 139.1175 },
    { id: "yahiko_shrine", name: "⛩️ 弥彦・角田山（西蒲区・弥彦村）", lat: 37.7027, lng: 138.8268 },
    { id: "sanjo_kamo", name: "🛠️ 県央：三条・加茂・燕（燕三条駅周辺）", lat: 37.6480, lng: 138.9300 },
    { id: "nagaoka_st", name: "🎆 中越：長岡・見附（長岡駅周辺）", lat: 37.4475, lng: 138.8524 },
    { id: "kashiwazaki_sea", name: "🌊 中越沿岸：柏崎・出雲崎", lat: 37.3650, lng: 138.5600 },
    { id: "uonuma_tokamachi", name: "🌾 魚沼・十日町（南魚沼・越後湯沢）", lat: 37.1300, lng: 138.7560 },
    { id: "joetsu_takada", name: "🏔️ 上越：高田城址・直江津駅", lat: 37.1120, lng: 138.2430 },
    { id: "itoigawa_west", name: "💎 上越西端：糸魚川・親不知", lat: 37.0300, lng: 137.8600 },
    { id: "sado_island", name: "⛴️ 佐渡島（両津港・相川）", lat: 38.0500, lng: 138.3800 }
  ];

  // 2地点間の直線距離（km）を計算
  function calcDistanceKm(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371.008; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  // 8方位の方角計算（純粋なコンパス方位）
  function calcCompassBearing(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return { deg: 0, text: "不明", icon: "📍" };
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    let deg = Math.atan2(y, x) * 180 / Math.PI;
    deg = (deg + 360) % 360;

    if (deg >= 337.5 || deg < 22.5) return { deg, text: "北", icon: "⬆️" };
    if (deg >= 22.5 && deg < 67.5) return { deg, text: "北東", icon: "↗️" };
    if (deg >= 67.5 && deg < 112.5) return { deg, text: "東", icon: "➡️" };
    if (deg >= 112.5 && deg < 157.5) return { deg, text: "南東", icon: "↘️" };
    if (deg >= 157.5 && deg < 202.5) return { deg, text: "南", icon: "⬇️" };
    if (deg >= 202.5 && deg < 247.5) return { deg, text: "南西", icon: "↙️" };
    if (deg >= 247.5 && deg < 292.5) return { deg, text: "西", icon: "⬅️" };
    return { deg, text: "北西", icon: "↖️" };
  }

  // 車での移動時間の目安（一般道 平均35km/h）
  function estimateDriveTime(km) {
    if (!km || km <= 0) return "すぐ";
    const minutes = Math.round(km / 35 * 60);
    if (minutes < 5) return "約3分";
    if (minutes < 60) return `約${minutes}分`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `約${h}時間${m > 0 ? m + '分' : ''}`;
  }

  // ★「出先から自宅（北区）へ近づくかどうか」の判定
  // 1. homeProgress: 現在地から自宅までの距離と、スポットから自宅までの距離を比較
  //    - スポットから自宅への距離 < 現在地から自宅への距離 なら「確実に家へ近づく」
  // 2. detourKm: 寄り道したときの余分な追加走行距離（km）
  function evaluateHomeApproach(currentLat, currentLng, spotLat, spotLng, homeLat = DEFAULT_HOME.lat, homeLng = DEFAULT_HOME.lng) {
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
    calcDistanceKm,
    calcCompassBearing,
    estimateDriveTime,
    evaluateHomeApproach
  };
})();
