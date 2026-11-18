const fs = require('fs');
let html = fs.readFileSync('神社仏閣・絶景・花図鑑/index.html', 'utf8');

const oldCss = `.purpose-btn {
      transition: all 0.2s ease;
      font-family: inherit;
    }`;

const newCss = `.purpose-btn {
      transition: all 0.2s ease;
      font-family: inherit;
      cursor: pointer;
    }
    .purpose-btn.btn-buddha {
      background: #f5f3ff;
      color: #6d28d9;
      border: 1.5px solid #c4b5fd;
    }
    .purpose-btn.btn-goshuin {
      background: #fff1f2;
      color: #be123c;
      border: 1.5px solid #fecdd3;
    }
    .purpose-btn.btn-nearby {
      background: #f0f9ff;
      color: #0369a1;
      border: 1.5px solid #bae6fd;
    }
    .purpose-btn.btn-all {
      background: #fff;
      color: #475569;
      border: 1.5px solid #cbd5e1;
    }`;

if (html.includes(oldCss)) {
  html = html.replace(oldCss, newCss);
  console.log('Replaced oldCss with newCss');
}

// Clean up inline styles
html = html.replace(
  'id="btn-mode-buddha" onclick="JapanApp.selectIntentMode(\'buddha\')" style="font-weight:800; font-size:0.84rem; padding:6px 14px; border-radius:8px; border:2px solid #7c3aed; background:#f5f3ff; color:#6d28d9; cursor:pointer; display:flex; align-items:center; gap:6px;"',
  'id="btn-mode-buddha" onclick="JapanApp.selectIntentMode(\'buddha\')" style="font-weight:800; font-size:0.84rem; padding:6px 14px; border-radius:8px; display:flex; align-items:center; gap:6px;"'
);

html = html.replace(
  'id="btn-mode-goshuin" onclick="JapanApp.selectIntentMode(\'goshuin\')" style="font-weight:800; font-size:0.84rem; padding:6px 14px; border-radius:8px; border:2px solid #e11d48; background:#fff1f2; color:#be123c; cursor:pointer; display:flex; align-items:center; gap:6px;"',
  'id="btn-mode-goshuin" onclick="JapanApp.selectIntentMode(\'goshuin\')" style="font-weight:800; font-size:0.84rem; padding:6px 14px; border-radius:8px; display:flex; align-items:center; gap:6px;"'
);

html = html.replace(
  'id="btn-mode-nearby" onclick="JapanApp.selectIntentMode(\'nearby\')" style="font-weight:800; font-size:0.84rem; padding:6px 14px; border-radius:8px; border:2px solid #0284c7; background:#f0f9ff; color:#0369a1; cursor:pointer; display:flex; align-items:center; gap:6px;"',
  'id="btn-mode-nearby" onclick="JapanApp.selectIntentMode(\'nearby\')" style="font-weight:800; font-size:0.84rem; padding:6px 14px; border-radius:8px; display:flex; align-items:center; gap:6px;"'
);

html = html.replace(
  'id="btn-mode-all" onclick="JapanApp.selectIntentMode(\'all\')" style="font-weight:700; font-size:0.8rem; padding:6px 12px; border-radius:8px; border:1px solid #cbd5e1; background:#fff; color:#475569; cursor:pointer;"',
  'id="btn-mode-all" onclick="JapanApp.selectIntentMode(\'all\')" style="font-weight:700; font-size:0.8rem; padding:6px 12px; border-radius:8px;"'
);

fs.writeFileSync('神社仏閣・絶景・花図鑑/index.html', html, 'utf8');
console.log('Done fix_button_styles.');
