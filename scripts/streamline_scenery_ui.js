const fs = require('fs');

const path = '日本の絶景・風景図鑑/index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Remove bulky photography guide accordion and redundant region buttons
const bulkyTopRegex = /<!-- 撮影マナー＆豆知識[\s\S]*?<!-- 地域クイック絞り込みバー -->[\s\S]*?<\/div>/;
if (bulkyTopRegex.test(html)) {
  html = html.replace(bulkyTopRegex, '');
  console.log('1. Removed bulky photography guide and redundant region buttons in scenery');
}

// 2. Streamline GPS distance nav into clean compact panel
const oldGpsNavRegex = /<!-- 📍 GPS現在地 ＆ 「自宅・北区へ近づく寄り道ナビ」コントロールバー -->[\s\S]*?<\/details>/;
const compactGpsNav = `<!-- 📍 GPS距離ナビ設定バー（コンパクト・1行展開） -->
      <details id="gps-distance-nav-panel" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:12px; font-size:0.78rem;">
        <summary style="padding:8px 12px; cursor:pointer; color:#0369a1; font-weight:700; display:flex; justify-content:space-between; align-items:center;">
          <span>📍 <strong>リアル距離＆帰り道ナビ：</strong> 現在地からの距離や方角で並び替え</span>
          <span style="font-size:0.72rem; color:#64748b;">▼ 設定を開く</span>
        </summary>
        <div style="padding:10px 14px; border-top:1px solid #e2e8f0; background:#fff; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <strong>現在地基準:</strong>
          <select id="geo-custom-origin" class="filter-select" style="font-size:0.75rem; padding:3px 6px;" onchange="JapanApp.onGeoOriginChange(this.value)">
            <option value="current">📍 GPS現在地を取得（スマホ・PCの現在位置）</option>
            <option value="kitaku_toyosaka" selected>★ 北区：豊栄駅・福島潟周辺（ホーム）</option>
            <option value="niigata_station">★ 中央区：新潟駅万代口・萬代橋周辺</option>
            <option value="niizaki">★ 北区：新崎・阿賀野川河口周辺</option>
            <option value="akiha_niitsu">★ 秋葉区：新津駅・新津丘陵周辺</option>
            <option value="yahiko">★ 西蒲・弥彦：弥彦神社・角田山麓</option>
            <option value="shibata">★ 下越：新発田駅・五十公野周辺</option>
            <option value="nagaoka_center">★ 中越：長岡駅・信濃川周辺</option>
            <option value="sanjo_tsubame">★ 県央：燕三条駅・弥彦山麓</option>
            <option value="uonuma_tokamachi">★ 魚沼・十日町（南魚沼・越後湯沢）</option>
            <option value="joetsu_takada">★ 上越：高田城址・直江津駅</option>
            <option value="itoigawa_west">★ 上越西端：糸魚川・親不知</option>
            <option value="sado_island">★ 佐渡島（両津港・相川）</option>
          </select>
          <span style="margin-left:auto; display:flex; align-items:center; gap:6px;">
            <strong>並び順:</strong>
            <button class="btn btn-sm btn-outline active" id="btn-sort-dist" onclick="JapanApp.toggleSortByDistance(true)">📍 近い順</button>
            <button class="btn btn-sm btn-outline" id="btn-sort-region" onclick="JapanApp.toggleSortByDistance(false)">🗾 番号順</button>
          </span>
        </div>
      </details>`;

if (oldGpsNavRegex.test(html)) {
  html = html.replace(oldGpsNavRegex, compactGpsNav);
  console.log('2. Streamlined GPS distance nav in scenery');
}

// 3. Make sure setCategory in scenery also properly cleans up all sections
const oldSetCatRegex = /function setCategory\(cat\) \{[\s\S]*?renderGrid\(\);\s*\}/;

const newSetCat = `function setCategory(cat) {
        currentCat = cat;

        document.querySelectorAll(".cat-tab").forEach(b => {
          b.classList.toggle("active", b.dataset.cat === cat);
        });

        const secDex = document.getElementById("sec-dex-main");
        const secComp = document.getElementById("sec-composition-guide");
        const secPb = document.getElementById("sec-photobook");
        const secSuite = document.getElementById("sec-enjoy-suite");
        const secMission = document.getElementById("sec-snap-missions");

        if (secDex) secDex.style.display = "none";
        if (secComp) secComp.style.display = "none";
        if (secPb) secPb.style.display = "none";
        if (secSuite) secSuite.style.display = "none";
        if (secMission) secMission.style.display = "none";

        if (cat === "composition") {
          if (secComp) secComp.style.display = "block";
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (cat === "missions") {
          if (secMission) {
            secMission.style.display = "block";
            renderSnapMissions();
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (cat === "photobook") {
          if (secPb) {
            secPb.style.display = "block";
            renderPhotoBook();
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          if (secDex) secDex.style.display = "block";
          renderGrid();
        }
      }`;

if (oldSetCatRegex.test(html)) {
  html = html.replace(oldSetCatRegex, newSetCat);
  console.log('3. Updated setCategory in scenery with full section exclusivity');
}

fs.writeFileSync(path, html, 'utf8');
console.log('Successfully updated scenery index.html!');
