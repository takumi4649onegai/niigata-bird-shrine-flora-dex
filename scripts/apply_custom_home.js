const fs = require('fs');

function updateFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Update the GPS distance nav HTML to include My Home registration
  const oldGpsRegex = /<!-- 📍 GPS距離ナビ設定バー[\s\S]*?<\/details>/;
  const newGpsHtml = `<!-- 📍 GPS距離＆マイ自宅・帰り道寄り道ナビ設定バー -->
      <details id="gps-distance-nav-panel" style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; margin-bottom:12px; font-size:0.78rem;">
        <summary style="padding:9px 12px; cursor:pointer; color:#0369a1; font-weight:700; display:flex; justify-content:space-between; align-items:center; user-select:none;">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span>📍 <strong>リアル距離＆帰り道ナビ：</strong> 現在地からの距離や、マイ自宅への帰り道で並び替え</span>
            <span id="badge-wayhome-active" style="display:none; font-size:0.68rem; background:#10b981; color:#fff; padding:1px 6px; border-radius:4px; font-weight:800;">🚗 帰り道優先中</span>
          </div>
          <span style="font-size:0.72rem; color:#64748b;">▼ 設定・マイ自宅登録</span>
        </summary>
        <div style="padding:12px 14px; border-top:1px solid #e2e8f0; background:#fff;">
          <!-- 1段目：現在地基準 ＆ 並び順コントロール -->
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
            <strong>📍 現在地基準:</strong>
            <select id="geo-custom-origin" class="filter-select" style="font-size:0.75rem; padding:4px 6px;" onchange="JapanApp.onGeoOriginChange(this.value)">
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
            <span style="margin-left:auto; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <strong>並び順:</strong>
              <button class="btn btn-sm btn-outline active" id="btn-sort-dist" onclick="JapanApp.toggleSortByDistance(true)">📍 近い順</button>
              <button class="btn btn-sm btn-outline" id="btn-sort-region" onclick="JapanApp.toggleSortByDistance(false)">🗾 番号順</button>
              <button class="btn btn-sm btn-outline" id="btn-wayhome-filter" onclick="JapanApp.toggleWayHomeOnly()" style="background:#ecfdf5; color:#065f46; border-color:#86efac; font-weight:800;" title="いまの場所から自宅へ帰る方向にあるスポットだけを絞り込み">
                🚗 帰り道寄り道のみ
              </button>
            </span>
          </div>

          <!-- 2段目：マイ自宅の登録・住所設定バー -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px 12px; border-radius:6px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <span style="font-size:0.75rem; font-weight:800; color:#0f172a;">🏠 マイ自宅:</span>
              <span id="label-user-home" style="font-size:0.75rem; font-weight:700; color:#0369a1; background:#e0f2fe; padding:2px 8px; border-radius:4px; border:1px solid #bae6fd;">
                新潟市北区（豊栄・福島潟周辺）
              </span>
              <span id="label-user-home-status" style="font-size:0.7rem; color:#64748b;">(初期設定)</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <button class="btn btn-sm" onclick="JapanApp.saveCurrentLocationAsHome()" style="background:#0284c7; color:#fff; font-size:0.72rem; padding:4px 9px; border-radius:4px; font-weight:700;" title="自宅にいる時に押すと現在地座標が自宅に登録されます">
                📍 いまの場所を自宅に登録
              </button>
              <input type="text" id="input-home-address" placeholder="市町村・駅名（例: 西区、長岡駅、三条）" style="font-size:0.72rem; padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px; width:180px;" onkeydown="if(event.key==='Enter') JapanApp.saveCustomHomeByText()" />
              <button class="btn btn-sm" onclick="JapanApp.saveCustomHomeByText()" style="background:#0f172a; color:#fff; font-size:0.72rem; padding:4px 9px; border-radius:4px; font-weight:700;">
                地名で登録
              </button>
              <button class="btn btn-sm btn-outline" id="btn-reset-home" onclick="JapanApp.resetHomeToDefault()" style="font-size:0.7rem; padding:3px 6px; display:none;" title="初期設定（北区）に戻す">
                リセット
              </button>
            </div>
          </div>
        </div>
      </details>`;

  if (oldGpsRegex.test(html)) {
    html = html.replace(oldGpsRegex, newGpsHtml);
    console.log(`1. Updated GPS nav panel in ${filePath}`);
  } else {
    console.log(`1. Could not match oldGpsRegex in ${filePath}`);
  }

  // 2. Add JavaScript logic for My Home registration and WayHome filtering
  const homeLogicJs = `
      // --- マイ自宅・帰り道寄り道ナビ管理 ---
      let isWayHomeOnly = false;

      function updateHomeLabelUI() {
        if (!window.NiigataGeoEngine) return;
        const home = window.NiigataGeoEngine.getUserHome();
        const lbl = document.getElementById("label-user-home");
        const status = document.getElementById("label-user-home-status");
        const resetBtn = document.getElementById("btn-reset-home");
        if (lbl) lbl.textContent = home.name;
        if (status) status.textContent = home.isDefault ? "(初期設定)" : "(登録済み)";
        if (resetBtn) resetBtn.style.display = home.isDefault ? "none" : "inline-block";
      }

      async function saveCurrentLocationAsHome() {
        if (!window.NiigataGeoEngine) return;
        if (!navigator.geolocation) {
          alert("お使いの端末はGPS位置情報に対応していません。地名入力をご利用ください。");
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            window.NiigataGeoEngine.setUserHome("マイ自宅（GPS登録）", lat, lng);
            updateHomeLabelUI();
            showToast("🏠 いまの現在地を「マイ自宅」として登録しました！");
            renderGrid();
          },
          (err) => {
            alert("位置情報の取得に失敗しました。ブラウザの位置情報アクセスを許可するか、地名入力をご利用ください。");
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }

      async function saveCustomHomeByText() {
        if (!window.NiigataGeoEngine) return;
        const input = document.getElementById("input-home-address");
        if (!input) return;
        const query = input.value.trim();
        if (!query) {
          alert("自宅の市町村名や駅名を入力してください（例：新潟市西区、長岡駅、三条市、燕市吉田など）");
          return;
        }
        const res = await window.NiigataGeoEngine.searchLocationCoordinates(query);
        if (res) {
          window.NiigataGeoEngine.setUserHome(res.name, res.lat, res.lng);
          input.value = "";
          updateHomeLabelUI();
          showToast(\`🏠 自宅を「\${res.name}」として登録しました！\`);
          renderGrid();
        } else {
          alert(\`「\${query}」の位置が見つかりませんでした。市町村名や主要駅名（例: 西区、長岡、三条など）でお試しください。\`);
        }
      }

      function resetHomeToDefault() {
        if (!window.NiigataGeoEngine) return;
        window.NiigataGeoEngine.resetUserHome();
        updateHomeLabelUI();
        showToast("🏠 自宅設定を初期値（新潟市北区）に戻しました");
        renderGrid();
      }

      function toggleWayHomeOnly() {
        isWayHomeOnly = !isWayHomeOnly;
        const btn = document.getElementById("btn-wayhome-filter");
        const badge = document.getElementById("badge-wayhome-active");
        if (btn) {
          btn.style.background = isWayHomeOnly ? "#059669" : "#ecfdf5";
          btn.style.color = isWayHomeOnly ? "#fff" : "#065f46";
        }
        if (badge) badge.style.display = isWayHomeOnly ? "inline-block" : "none";
        if (isWayHomeOnly) {
          sortByDistance = true;
          const btnDist = document.getElementById("btn-sort-dist");
          const btnRegion = document.getElementById("btn-sort-region");
          if (btnDist) btnDist.classList.add("active");
          if (btnRegion) btnRegion.classList.remove("active");
          showToast("🚗【帰り道ナビON】自宅へ近づくスポットのみ表示しています");
        } else {
          showToast("🚗 帰り道絞り込みを解除しました（全件表示）");
        }
        renderGrid();
      }
  `;

  // Insert logic before renderGrid or init
  if (!html.includes('function saveCurrentLocationAsHome')) {
    html = html.replace('function renderGrid() {', homeLogicJs + '\n      function renderGrid() {');
    console.log(`2. Added Home logic in ${filePath}`);
  }

  // Update renderGrid to support isWayHomeOnly filter
  const oldWayHomeFilterCode = `if (isWayHomeOnly) {
          filtered = filtered.filter(it => it._geo && it._geo.homeApproach && it._geo.homeApproach.isCloserToHome);
          filtered.sort((a, b) => {
            const extraA = (a._geo && a._geo.homeApproach) ? a._geo.homeApproach.extraDetourKm : 9999;
            const extraB = (b._geo && b._geo.homeApproach) ? b._geo.homeApproach.extraDetourKm : 9999;
            return extraA - extraB;
          });
        }`;

  if (!html.includes('extraDetourKm')) {
    html = html.replace(
      '// 距離順ソート',
      `${oldWayHomeFilterCode}\n\n        // 距離順ソート`
    );
    console.log(`3. Added WayHome filtering inside renderGrid in ${filePath}`);
  }

  // Update init to call updateHomeLabelUI
  if (!html.includes('updateHomeLabelUI();')) {
    html = html.replace('await loadState();', 'await loadState();\n        updateHomeLabelUI();');
    console.log(`4. Added updateHomeLabelUI in init for ${filePath}`);
  }

  // Expose methods in return object
  const methodsToExpose = `saveCurrentLocationAsHome,
        saveCustomHomeByText,
        resetHomeToDefault,
        toggleWayHomeOnly,`;

  if (!html.includes('saveCurrentLocationAsHome,')) {
    html = html.replace('selectFeature,', `${methodsToExpose}\n        selectFeature,`);
    console.log(`5. Exposed Home methods in ${filePath}`);
  }

  fs.writeFileSync(filePath, html, 'utf8');
}

updateFile('神社仏閣・絶景・花図鑑/index.html');
updateFile('日本の絶景・風景図鑑/index.html');
