const fs = require('fs');

const initCode = `
      async function init() {
        await loadState();
        updateHeader();
        try {
          const params = new URLSearchParams(window.location.search);
          const spotParam = params.get("spot");
          const viewParam = params.get("view");
          if (spotParam) {
            const sel = document.getElementById("flt-spot");
            if (sel && [...sel.options].some(o => o.value === spotParam)) {
              sel.value = spotParam;
            }
            updateLinkedSpotBanner(spotParam);
          }
          if (viewParam === "photobook") {
            setCategory("photobook");
            return;
          }
          if (viewParam === "composition") {
            setCategory("composition");
            return;
          }
          if (viewParam === "suite") {
            setCategory("suite");
            const sub = params.get("sub");
            if (sub && ["birds", "shrines", "flora", "insects", "outfit"].includes(sub)) {
              setTimeout(() => switchSuiteTab(sub), 50);
            }
            return;
          }
        } catch (_) {}
        renderGrid();
      }
`;

['神社仏閣・絶景・花図鑑/index.html', '日本の絶景・風景図鑑/index.html'].forEach(p => {
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/\}\s*catch\s*\(_\)\s*\{\}\s*renderGrid\(\);\s*\}/, '}\n' + initCode);
  fs.writeFileSync(p, c, 'utf8');
  console.log('Restored init in:', p);
});
