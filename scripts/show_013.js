const fs = require('fs');
const content = fs.readFileSync('神社仏閣・絶景・花図鑑/js/data-japan-dex.js', 'utf8');
const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('"dexNo": "013"'));
console.log(lines.slice(start - 2, start + 75).join('\n'));
