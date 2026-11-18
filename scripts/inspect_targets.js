const fs = require('fs');
const content = fs.readFileSync('神社仏閣・絶景・花図鑑/js/data-japan-dex.js', 'utf8');
const lines = content.split('\n');

function showItem(dexNo) {
  const start = lines.findIndex(l => l.includes('"dexNo": "' + dexNo + '"'));
  if (start === -1) return;
  console.log('=== ' + dexNo + ' ===');
  console.log(lines.slice(start - 2, start + 75).join('\n'));
}

showItem('011');
showItem('012');
showItem('013');
showItem('019');
