const fs = require('fs');

const filePath = '神社仏閣・絶景・花図鑑/index.html';
let html = fs.readFileSync(filePath, 'utf8');

// 1. Fix badge counts in HTML
html = html.replace(/23名刹/g, '24名刹');
html = html.replace(/48社寺/g, '51社寺');
html = html.replace('すべて (23)', 'すべて (24)');

// 2. Fix flower folder link path if needed
html = html.replace(/\.\.\/四季の花・草木図鑑\//g, '../四季の花・山野草・花木図鑑/');

// 3. In init(), ensure selectIntentMode("buddha") is called right before completion
const oldInitEnd = `        } catch (_) {}
        renderGrid();
      }`;

const newInitEnd = `        } catch (_) {}
        selectIntentMode("buddha");
      }`;

if (html.includes(oldInitEnd)) {
  html = html.replace(oldInitEnd, newInitEnd);
  console.log('3. Replaced renderGrid() with selectIntentMode("buddha") in init()');
} else {
  console.log('3. Could not match oldInitEnd');
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('Done finalizing fixes.');
