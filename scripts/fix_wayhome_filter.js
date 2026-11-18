const fs = require('fs');

['神社仏閣・絶景・花図鑑/index.html', '日本の絶景・風景図鑑/index.html'].forEach(filePath => {
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Change 'const filtered = window.JAPAN_BEAUTY_DEX.filter' to 'let filtered = window.JAPAN_BEAUTY_DEX.filter'
  html = html.replace('const filtered = window.JAPAN_BEAUTY_DEX.filter', 'let filtered = window.JAPAN_BEAUTY_DEX.filter');

  // 2. Fix toggleWayHomeOnly to synchronize isWayHomeMode and isWayHomeOnly
  const oldToggleRegex = /function toggleWayHomeOnly\(\) \{[\s\S]*?renderGrid\(\);\s*\}/;
  const newToggle = `function toggleWayHomeOnly() {
        isWayHomeMode = !isWayHomeMode;
        isWayHomeOnly = isWayHomeMode;
        const btn = document.getElementById("btn-wayhome-filter");
        const badge = document.getElementById("badge-wayhome-active");
        if (btn) {
          btn.style.background = isWayHomeMode ? "#059669" : "#ecfdf5";
          btn.style.color = isWayHomeMode ? "#fff" : "#065f46";
        }
        if (badge) badge.style.display = isWayHomeMode ? "inline-block" : "none";
        if (isWayHomeMode) {
          isSortByDistance = true;
          const btnDist = document.getElementById("btn-sort-dist");
          const btnRegion = document.getElementById("btn-sort-region");
          if (btnDist) btnDist.classList.add("active");
          if (btnRegion) btnRegion.classList.remove("active");
          showToast("🚗【帰り道ナビON】自宅へ近づくスポットのみ表示しています");
        } else {
          showToast("🚗 帰り道絞り込みを解除しました（全件表示）");
        }
        renderGrid();
      }`;
  if (oldToggleRegex.test(html)) {
    html = html.replace(oldToggleRegex, newToggle);
    console.log('Fixed toggleWayHomeOnly in', filePath);
  }

  // 3. Ensure the filter block in renderGrid handles sorting by detour km when isWayHomeMode
  const oldFilterWayHome = `if (isWayHomeMode) {
            filtered = filtered.filter(it => it._geo && it._geo.homeApproach && it._geo.homeApproach.isCloserToHome);
          }`;
  const newFilterWayHome = `if (isWayHomeMode) {
            filtered = filtered.filter(it => it._geo && it._geo.homeApproach && it._geo.homeApproach.isCloserToHome);
            filtered.sort((a, b) => {
              const extraA = (a._geo && a._geo.homeApproach) ? a._geo.homeApproach.extraDetourKm : 9999;
              const extraB = (b._geo && b._geo.homeApproach) ? b._geo.homeApproach.extraDetourKm : 9999;
              return extraA - extraB;
            });
          }`;
  if (html.includes(oldFilterWayHome)) {
    html = html.replace(oldFilterWayHome, newFilterWayHome);
    console.log('Updated isWayHomeMode filter/sort block in', filePath);
  }

  fs.writeFileSync(filePath, html, 'utf8');
});
