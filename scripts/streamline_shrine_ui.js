const fs = require('fs');

const path = '神社仏閣・絶景・花図鑑/index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Update Navigation Tabs: add "仏像4大階級ガイド" tab
const oldCatNav = `<button class="cat-tab active" data-cat="all" onclick="JapanApp.setCategory('all')">✨ すべて表示 (88)</button>
      <button class="cat-tab" data-cat="shrine_only" onclick="JapanApp.setCategory('shrine_only')">⛩️ 神社のみ (65)</button>
      <button class="cat-tab" data-cat="temple_only" onclick="JapanApp.setCategory('temple_only')">🗿 お寺・仏像 (23)</button>
      <button class="cat-tab" data-cat="goshuin_spot" onclick="JapanApp.setCategory('goshuin_spot')">🏮 御朱印あり (48)</button>
      <button class="cat-tab" data-cat="lineage" onclick="JapanApp.setCategory('lineage')">⛩️ 神社・親子相関図</button>
      <button class="cat-tab" data-cat="goshuin_book" onclick="JapanApp.setCategory('goshuin_book')">📖 マイ御朱印帳記録</button>`;

const newCatNav = `<button class="cat-tab active" data-cat="all" onclick="JapanApp.setCategory('all')">✨ すべて表示 (88)</button>
      <button class="cat-tab" data-cat="shrine_only" onclick="JapanApp.setCategory('shrine_only')">⛩️ 神社のみ (65)</button>
      <button class="cat-tab" data-cat="temple_only" onclick="JapanApp.setCategory('temple_only')">🛕 お寺・仏像 (23)</button>
      <button class="cat-tab" data-cat="goshuin_spot" onclick="JapanApp.setCategory('goshuin_spot')">🏮 御朱印あり (48)</button>
      <button class="cat-tab" data-cat="buddha_rank" onclick="JapanApp.setCategory('buddha_rank')">👑 仏像4大階級</button>
      <button class="cat-tab" data-cat="lineage" onclick="JapanApp.setCategory('lineage')">⛩️ 神社・親子相関図</button>
      <button class="cat-tab" data-cat="goshuin_book" onclick="JapanApp.setCategory('goshuin_book')">📖 マイ御朱印帳記録</button>`;

if (html.includes(oldCatNav)) {
  html = html.replace(oldCatNav, newCatNav);
  console.log('1. Updated navigation tabs with buddha_rank tab');
} else {
  console.log('1. Could not match oldCatNav');
}

// 2. Extract Buddha Rank Guide panel from sec-dex-main and convert into standalone section sec-buddha-rank
const panelRegex = /<!-- 💡 仏像の4大階級と見分け方ガイド[\s\S]*?<\/div>\s*<\/details>/;
const panelMatch = html.match(panelRegex);

if (panelMatch) {
  const panelHtml = panelMatch[0];
  // Remove from inside sec-dex-main
  html = html.replace(panelRegex, '');

  // Wrap in standalone section with back button and clean layout
  const standaloneBuddhaSection = `
    <!-- 👑 仏像4大階級ガイド（独立タブセクション） -->
    <section id="sec-buddha-rank" style="display:none; margin-bottom:24px;">
      <div style="background:#fff; border:2px solid #f59e0b; border-radius:12px; padding:18px 20px; box-shadow:0 4px 14px rgba(245,158,11,0.12);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid #fed7aa;">
          <div>
            <span style="font-size:0.75rem; background:#b45309; color:#fff; padding:2px 8px; border-radius:99px; font-weight:700;">💡 1分でわかる！</span>
            <strong style="font-size:1.05rem; color:#92400e; margin-left:6px;">仏像の4大階級（如来・菩薩・明王・天部）と見分け方ガイド</strong>
          </div>
          <button class="btn btn-outline btn-sm" onclick="JapanApp.setCategory('all')" style="border-color:#d97706; color:#92400e; background:#fff;">← 図鑑カード一覧に戻る</button>
        </div>
        ${panelHtml.replace('<details id="buddha-rank-guide-panel"', '<div id="buddha-rank-guide-panel"').replace('<summary', '<div style="display:none;"').replace('</summary>', '</div>').replace('</details>', '</div>')}
      </div>
    </section>
  `;

  // Insert before sec-lineage-guide
  html = html.replace('<!-- ⛩️ 神社の親子相関図', standaloneBuddhaSection + '\n    <!-- ⛩️ 神社の親子相関図');
  console.log('2. Created standalone sec-buddha-rank section');
}

// 3. Clean up the cluttered top banners in sec-dex-main:
// Remove bulky photography guide accordion & duplicate region-filter-bar
const bulkyTopRegex = /<!-- 撮影マナー＆豆知識[\s\S]*?<!-- 地域クイック絞り込みバー -->[\s\S]*?<\/div>/;
if (bulkyTopRegex.test(html)) {
  html = html.replace(bulkyTopRegex, '');
  console.log('3. Removed bulky photography guide accordion and redundant region buttons');
}

// Make the GPS distance nav accordion clean and compact (collapsed by default, subtle toggle)
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
  console.log('4. Streamlined GPS distance nav into clean compact panel');
}

// 4. Update setCategory implementation with robust mutual exclusivity
const oldSetCatRegex = /function setCategory\(cat\) \{[\s\S]*?renderGrid\(\);\s*\}/;

const newSetCat = `function setCategory(cat) {
        currentCat = cat;

        // タブのactive状態切り替え
        document.querySelectorAll(".cat-tab").forEach(b => {
          b.classList.toggle("active", b.dataset.cat === cat);
        });

        const secDex = document.getElementById("sec-dex-main");
        const secBuddha = document.getElementById("sec-buddha-rank");
        const secLineage = document.getElementById("sec-lineage-guide");
        const secComp = document.getElementById("sec-composition-guide");
        const secPb = document.getElementById("sec-photobook");
        const secSuite = document.getElementById("sec-enjoy-suite");
        const secMission = document.getElementById("sec-snap-missions");

        // 全主要セクションを確実に一度すべて非表示にする（排他制御・バグ根絶）
        if (secDex) secDex.style.display = "none";
        if (secBuddha) secBuddha.style.display = "none";
        if (secLineage) secLineage.style.display = "none";
        if (secComp) secComp.style.display = "none";
        if (secPb) secPb.style.display = "none";
        if (secSuite) secSuite.style.display = "none";
        if (secMission) secMission.style.display = "none";

        // 選択されたタブのみを表示
        if (cat === "buddha_rank") {
          if (secBuddha) secBuddha.style.display = "block";
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (cat === "lineage") {
          if (secLineage) {
            secLineage.style.display = "block";
            renderLineageTree();
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (cat === "goshuin_book" || cat === "suite") {
          if (secSuite) {
            secSuite.style.display = "block";
            if (window.CameraEnjoySuite) {
              window.CameraEnjoySuite.renderSuiteMain("goshuin");
            }
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (cat === "composition") {
          if (secComp) secComp.style.display = "block";
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (cat === "photobook") {
          if (secPb) {
            secPb.style.display = "block";
            renderPhotoBook();
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          // 図鑑カード一覧表示（all, shrine_only, temple_only, goshuin_spot など）
          if (secDex) secDex.style.display = "block";
          renderGrid();
        }
      }`;

if (oldSetCatRegex.test(html)) {
  html = html.replace(oldSetCatRegex, newSetCat);
  console.log('5. Replaced setCategory with robust mutual exclusivity');
} else {
  console.log('5. Could not match oldSetCatRegex');
}

fs.writeFileSync(path, html, 'utf8');
console.log('Successfully updated shrine index.html!');
