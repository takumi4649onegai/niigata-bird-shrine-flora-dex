const fs = require('fs');

const filePath = '神社仏閣・絶景・花図鑑/index.html';
let html = fs.readFileSync(filePath, 'utf8');

// 1. Add intent state and methods before setCategory
const intentLogic = `
      // --- 今日の3大目的ナビ管理 ---
      let currentIntentMode = "buddha"; // "buddha" | "goshuin" | "nearby" | "all"
      let currentBuddhaSub = "all";

      function selectIntentMode(mode) {
        currentIntentMode = mode;
        currentBuddhaSub = "all";

        // ボタンのアクティブ切り替え
        const btnBuddha = document.getElementById("btn-mode-buddha");
        const btnGoshuin = document.getElementById("btn-mode-goshuin");
        const btnNearby = document.getElementById("btn-mode-nearby");
        const btnAll = document.getElementById("btn-mode-all");
        if (btnBuddha) btnBuddha.classList.toggle("active", mode === "buddha");
        if (btnGoshuin) btnGoshuin.classList.toggle("active", mode === "goshuin");
        if (btnNearby) btnNearby.classList.toggle("active", mode === "nearby");
        if (btnAll) btnAll.classList.toggle("active", mode === "all");

        // 深掘りタブのアクティブ解除
        document.querySelectorAll(".db-tab-btn").forEach(b => b.classList.remove("active"));

        // サブバーの表示・非表示
        const subBuddha = document.getElementById("subbar-buddha");
        const subGoshuin = document.getElementById("subbar-goshuin");
        if (subBuddha) subBuddha.style.display = mode === "buddha" ? "flex" : "none";
        if (subGoshuin) subGoshuin.style.display = mode === "goshuin" ? "flex" : "none";

        // 仏像サブボタンリセット
        document.querySelectorAll(".subfilter-btn").forEach(b => {
          b.classList.toggle("active", b.id === "sbtn-buddha-all");
        });

        const gpsPanel = document.getElementById("gps-distance-nav-panel");
        if (mode === "buddha") {
          setCategory("temple_only");
        } else if (mode === "goshuin") {
          setCategory("goshuin_spot");
        } else if (mode === "nearby") {
          setCategory("all");
          if (gpsPanel) gpsPanel.open = true;
          isSortByDistance = true;
          const btnDist = document.getElementById("btn-sort-dist");
          const btnRegion = document.getElementById("btn-sort-region");
          if (btnDist) btnDist.classList.add("active");
          if (btnRegion) btnRegion.classList.remove("active");
          showToast("📍【近く・帰り道モード】現在地・マイ自宅からの距離順で整列しました");
        } else if (mode === "all") {
          setCategory("all");
        }

        renderGrid();
      }

      function filterBuddhaSub(sub) {
        currentBuddhaSub = sub;
        document.querySelectorAll(".subfilter-btn").forEach(b => {
          b.classList.toggle("active", b.id === \`sbtn-buddha-\${sub}\`);
        });
        renderGrid();
      }
`;

if (!html.includes('function selectIntentMode')) {
  html = html.replace('function setCategory(cat) {', `${intentLogic}\n      function setCategory(cat) {`);
  console.log('1. Added selectIntentMode and filterBuddhaSub');
}

// 2. Update setCategory to handle .db-tab-btn active state cleanly
const oldSetCatHeader = `function setCategory(cat) {
        currentCat = cat;

        // タブのactive状態切り替え
        document.querySelectorAll(".cat-tab").forEach(b => {
          b.classList.toggle("active", b.dataset.cat === cat);
        });`;

const newSetCatHeader = `function setCategory(cat) {
        currentCat = cat;

        // 深掘りデータベースタブのactive状態切り替え
        document.querySelectorAll(".db-tab-btn").forEach(b => {
          b.classList.toggle("active", 
            (cat === "lineage" && b.id === "tab-btn-lineage") ||
            (cat === "buddha_rank" && b.id === "tab-btn-buddha-rank") ||
            (cat === "goshuin_book" && b.id === "tab-btn-goshuin-book")
          );
        });
        if (cat === "lineage" || cat === "buddha_rank" || cat === "goshuin_book") {
          document.querySelectorAll(".purpose-btn").forEach(b => b.classList.remove("active"));
          const subBuddha = document.getElementById("subbar-buddha");
          const subGoshuin = document.getElementById("subbar-goshuin");
          if (subBuddha) subBuddha.style.display = "none";
          if (subGoshuin) subGoshuin.style.display = "none";
        }`;

if (html.includes(oldSetCatHeader)) {
  html = html.replace(oldSetCatHeader, newSetCatHeader);
  console.log('2. Updated setCategory with db-tab-btn synchronization');
}

// 3. Update renderGrid to filter by currentBuddhaSub and emphasize intent-specific hero info in cards
const oldBuddhaFilterTarget = 'if (featureFilter === "cedar" && !isCedar) return false;';
const newBuddhaFilterCode = `if (featureFilter === "cedar" && !isCedar) return false;

          // 👑 仏像サブ系統フィルター（如来・菩薩・明王・天部・羅漢）
          if (currentIntentMode === "buddha" && currentBuddhaSub !== "all") {
            if (currentBuddhaSub === "nyorai" && !isNyorai) return false;
            if (currentBuddhaSub === "bosatsu" && !isBosatsu) return false;
            if (currentBuddhaSub === "myoo" && !isMyoo) return false;
            if (currentBuddhaSub === "tenbu" && !isTenbu) return false;
            if (currentBuddhaSub === "rakan" && !isRakanAll) return false;
          }`;

if (html.includes(oldBuddhaFilterTarget) && !html.includes('currentBuddhaSub !== "all"')) {
  html = html.replace(oldBuddhaFilterTarget, `${oldBuddhaFilterTarget}\n\n          ${newBuddhaFilterCode}`);
  console.log('3. Added currentBuddhaSub filtering in renderGrid');
}

// 4. Update card rendering inside renderGrid to highlight intent hero info
const oldCatchphraseBlock = `<div style="font-size:0.75rem; color:#991b1b; font-weight:700; margin-bottom:6px;">\${it.catchphrase}</div>`;
const newHeroCardBlock = `<div style="font-size:0.75rem; color:#991b1b; font-weight:700; margin-bottom:6px;">\${it.catchphrase}</div>

                <!-- 🎯 選択された目的に合わせた最優先ヒーロー情報枠 -->
                \${currentIntentMode === 'buddha' ? \`
                  <div style=\"background:#faf5ff; border:1.5px solid #c084fc; border-radius:6px; padding:6px 9px; font-size:0.75rem; color:#581c87; margin-bottom:6px;\">
                    <strong style=\"color:#7c3aed;\">👑 本尊・拝観見どころ：</strong>\${it.catchphrase || '歴史ある仏像・境内見どころ'}
                    \${it.hasNio ? '<span style=\"font-size:0.68rem; background:#dc2626; color:#fff; padding:1px 5px; border-radius:4px; font-weight:800; margin-left:4px;\">💪 山門仁王像</span>' : ''}
                    \${it.id === 'echigo_tainai_kannon' ? '<span style=\"font-size:0.68rem; background:#059669; color:#fff; padding:1px 5px; border-radius:4px; font-weight:800; margin-left:4px;\">全高26m露天大観音</span>' : ''}
                  </div>
                \` : (currentIntentMode === 'goshuin' ? \`
                  <div style=\"background:#fffbeb; border:1.5px solid #f59e0b; border-radius:6px; padding:6px 9px; font-size:0.75rem; color:#92400e; margin-bottom:6px;\">
                    <strong style=\"color:#b45309;\">🏮 御朱印情報：</strong>\${it.goshuinInfo ? it.goshuinInfo.replace('🏮【御朱印あり】', '').slice(0, 65) + '...' : '社務所にて授与受付中'}
                  </div>
                \` : (currentIntentMode === 'nearby' && it._geo ? \`
                  <div style=\"background:#f0fdf4; border:1.5px solid #86efac; border-radius:6px; padding:6px 9px; font-size:0.75rem; color:#166534; margin-bottom:6px;\">
                    <strong style=\"color:#15803d;\">📍 リアル現在地：</strong>距離 \${it._geo.dist}km（\${it._geo.drive}）\${it._geo.bearing.icon}\${it._geo.bearing.text}
                    \${it._geo.homeApproach && it._geo.homeApproach.isCloserToHome ? \`<span style=\"background:#15803d; color:#fff; padding:1px 6px; border-radius:4px; font-weight:800; margin-left:4px;\">➔ 🏠自宅へ\${it._geo.homeApproach.closerDistance}km接近！</span>\` : ''}
                  </div>
                \` : ''))}`;

if (html.includes(oldCatchphraseBlock) && !html.includes('currentIntentMode === \'buddha\'')) {
  html = html.replace(oldCatchphraseBlock, newHeroCardBlock);
  console.log('4. Added intent-specific hero info inside cards');
}

// 5. Update openDetailModal to include the comprehensive nature & surrounding scenery crosslink card
const oldInterAppRegex = /<!-- 野鳥観察アプリ＆花図鑑との相互連動カード[\s\S]*?<\/div>\s*<\/div>/;
const newNatureCrosslinkHtml = `<!-- 🌿 境内で見られる自然（鳥・花・虫）＆そばの景色・絶景連動ブロック -->
          <div class="nature-crosslink-card" style="background:linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%); border:2px solid #0d9488; border-radius:12px; padding:16px; margin-bottom:16px; box-shadow:0 3px 10px rgba(13,148,136,0.08);">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:1.4rem;">🌿</span>
                <div>
                  <strong style="font-size:0.98rem; color:#0f766e;">この神社・境内で出会える自然（野鳥・花・虫）＆そばの絶景</strong>
                  <div style="font-size:0.75rem; color:#475569;">お参りや撮影と一緒に探せる周辺の動植物と、車で立ち寄れる風景スポット</div>
                </div>
              </div>
              <span style="font-size:0.7rem; background:#0d9488; color:#fff; padding:2px 8px; border-radius:99px; font-weight:800;">4大図鑑相互リンク</span>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px;">
              <!-- 🐦 境内の野鳥 -->
              <div style="background:#fff; border:1px solid #ccfbf1; border-radius:8px; padding:10px 12px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="font-size:0.76rem; font-weight:800; color:#0f766e; margin-bottom:4px; display:flex; align-items:center; gap:4px;">
                    <span>🐦</span><span>境内の野鳥</span>
                  </div>
                  <div style="font-size:0.8rem; color:#1e293b; font-weight:700; line-height:1.45;">
                    \${(item.linkedBirds && item.linkedBirds.length > 0) ? item.linkedBirds.slice(0, 4).join(" ・ ") : 'シメ・カワラヒワ・ヤマガラ'} など
                  </div>
                </div>
                <a href="../index.html?spot=\${item.spotId}" class="btn btn-sm btn-outline" style="margin-top:8px; font-size:0.72rem; padding:4px 8px; border-color:#0d9488; color:#0f766e; text-align:center; text-decoration:none; font-weight:700;">
                  🐦 野鳥図鑑で探す ➔
                </a>
              </div>

              <!-- 🌸 境内の花・草木 -->
              <div style="background:#fff; border:1px solid #fce7f3; border-radius:8px; padding:10px 12px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="font-size:0.76rem; font-weight:800; color:#be185d; margin-bottom:4px; display:flex; align-items:center; gap:4px;">
                    <span>🌸</span><span>境内の花・草木</span>
                  </div>
                  <div style="font-size:0.8rem; color:#1e293b; font-weight:700; line-height:1.45;">
                    \${(() => {
                      const flora = (window.NIIGATA_FLORA_DEX || []).filter(f => f.spotId === item.spotId || (f.area && (item.area||'').includes(f.area)));
                      return (flora.length > 0 ? flora.map(f => f.name.split('（')[0]).slice(0, 3).join(' ・ ') : '雪割草・カタクリ・杉古木') + ' など';
                    })()}
                  </div>
                </div>
                <a href="../四季の花・草木図鑑/index.html?spot=\${item.spotId}" class="btn btn-sm btn-outline" style="margin-top:8px; font-size:0.72rem; padding:4px 8px; border-color:#db2777; color:#be185d; text-align:center; text-decoration:none; font-weight:700;">
                  🌸 四季の花図鑑で見る ➔
                </a>
              </div>

              <!-- 🦗 境内の昆虫 -->
              <div style="background:#fff; border:1px solid #dcfce7; border-radius:8px; padding:10px 12px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="font-size:0.76rem; font-weight:800; color:#15803d; margin-bottom:4px; display:flex; align-items:center; gap:4px;">
                    <span>🦗</span><span>境内の昆虫</span>
                  </div>
                  <div style="font-size:0.8rem; color:#1e293b; font-weight:700; line-height:1.45;">
                    \${(() => {
                      const insects = (window.NIIGATA_INSECTS || []).filter(i => (i.spots || []).some(s => s.includes(item.spotId) || s.includes(item.area || '')));
                      return (insects.length > 0 ? insects.map(i => i.name).slice(0, 3).join(' ・ ') : 'オオムラサキ・ミヤマクワガタ・赤とんぼ') + ' など';
                    })()}
                  </div>
                </div>
                <a href="../昆虫図鑑/index.html?spot=\${item.spotId}" class="btn btn-sm btn-outline" style="margin-top:8px; font-size:0.72rem; padding:4px 8px; border-color:#16a34a; color:#15803d; text-align:center; text-decoration:none; font-weight:700;">
                  🦗 昆虫図鑑で見る ➔
                </a>
              </div>

              <!-- 🌄 そばの絶景・風景 -->
              <div style="background:#fff; border:1px solid #e0e7ff; border-radius:8px; padding:10px 12px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="font-size:0.76rem; font-weight:800; color:#4338ca; margin-bottom:4px; display:flex; align-items:center; gap:4px;">
                    <span>🌄</span><span>そばの景色・絶景</span>
                  </div>
                  <div style="font-size:0.8rem; color:#1e293b; font-weight:700; line-height:1.45;">
                    \${(() => {
                      const sceneries = (window.SCENERY_DEX_DATABASE || []).filter(s => s.spotId === item.spotId || (s.area && (item.area||'').includes(s.area)));
                      return (sceneries.length > 0 ? sceneries[0].name.split('（')[0] : (item.area || '周辺') + 'の夕日・里山風景');
                    })()}
                  </div>
                </div>
                <a href="../日本の絶景・風景図鑑/index.html?spot=\${item.spotId}" class="btn btn-sm btn-outline" style="margin-top:8px; font-size:0.72rem; padding:4px 8px; border-color:#6366f1; color:#4338ca; text-align:center; text-decoration:none; font-weight:700;">
                  🌄 絶景図鑑で見る ➔
                </a>
              </div>
            </div>
          </div>`;

if (oldInterAppRegex.test(html)) {
  html = html.replace(oldInterAppRegex, newNatureCrosslinkHtml);
  console.log('5. Replaced inter-app card with 4-domain Nature & Scenery cross-links');
} else {
  console.log('5. Could not match oldInterAppRegex');
}

// 6. Expose selectIntentMode and filterBuddhaSub in return object
if (!html.includes('selectIntentMode,')) {
  html = html.replace('saveCurrentLocationAsHome,', `selectIntentMode,\n        filterBuddhaSub,\n        saveCurrentLocationAsHome,`);
  console.log('6. Exposed selectIntentMode and filterBuddhaSub in JapanApp');
}

// 7. In init(), call selectIntentMode('buddha') so the #1 priority (Buddha) opens first!
if (html.includes('updateHomeLabelUI();') && !html.includes('selectIntentMode("buddha");')) {
  html = html.replace('updateHomeLabelUI();', 'updateHomeLabelUI();\n        selectIntentMode("buddha");');
  console.log('7. Initialized with Buddha mode');
}

fs.writeFileSync(filePath, html, 'utf8');
