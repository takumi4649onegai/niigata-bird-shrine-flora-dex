const fs = require('fs');
let c = fs.readFileSync('神社仏閣・絶景・花図鑑/index.html', 'utf8');

c = c.replace(
  /function selectFeature\(val\) \{[\s\S]*?document\.getElementById\("flt-feature"\)\?\.scrollIntoView[\s\S]*?\}/,
  `function selectFeature(val) {
        setCategory('all');
        const sel = document.getElementById("flt-feature");
        if (sel) {
          sel.value = val;
          renderGrid();
          setTimeout(() => {
            document.getElementById("japan-dex-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 50);
        }
      }`
);

fs.writeFileSync('神社仏閣・絶景・花図鑑/index.html', c, 'utf8');
console.log('Updated selectFeature successfully!');
