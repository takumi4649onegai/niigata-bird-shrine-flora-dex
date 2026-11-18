const fs = require('fs');
const content = fs.readFileSync('神社仏閣・絶景・花図鑑/index.html', 'utf8');
const s = content.match(/<script>([\s\S]*?)<\/script>/i)[1];

const lines = s.split('\n');
// Let's test incrementally to find the failing line
for (let i = 10; i < lines.length; i += 10) {
  try {
    new Function(lines.slice(0, i).join('\n') + '\n}');
  } catch(e) {
    if (e.message.includes("Unexpected token ')'")) {
      console.log('Error around line', i);
      console.log(lines.slice(Math.max(0, i - 15), i + 5).join('\n'));
      break;
    }
  }
}
