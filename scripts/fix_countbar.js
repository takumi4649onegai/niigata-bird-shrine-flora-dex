const fs = require('fs');

['神社仏閣・絶景・花図鑑/index.html', '日本の絶景・風景図鑑/index.html'].forEach(filePath => {
  let html = fs.readFileSync(filePath, 'utf8');

  // Find the countBar lines
  const countBarRegex = /const countBar = document\.getElementById\("grid-count-bar"\);[\s\S]*?countBar\.textContent = `[^`]+`;/;
  if (countBarRegex.test(html)) {
    html = html.replace(countBarRegex, '// countBar calculation deferred');
    console.log('Deferred countBar calculation in', filePath);
  }

  // Place countBar calculation right before gridEl.innerHTML
  const gridElTarget = 'const gridEl = document.getElementById("japan-dex-grid");';
  const newCountBarCode = `const countBar = document.getElementById("grid-count-bar");
        if (countBar) {
          const gotCount = filtered.filter(it => (state.captures[it.id] || []).length > 0).length;
          const visitedFiltered = filtered.filter(it => !!(state.visited && state.visited[it.id])).length;
          countBar.textContent = \`表示中: \${filtered.length}件 （👣 訪問済: \${visitedFiltered}件 / 🏆 写真GET: \${gotCount}件）\`;
        }
        const gridEl = document.getElementById("japan-dex-grid");`;

  if (!html.includes('// countBar calculation deferred')) {
    console.log('countBar already moved or not found');
  } else {
    html = html.replace(gridElTarget, newCountBarCode);
    console.log('Placed updated countBar calculation in', filePath);
  }

  fs.writeFileSync(filePath, html, 'utf8');
});
