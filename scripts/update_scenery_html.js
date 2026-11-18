const fs = require('fs');

const path = '日本の絶景・風景図鑑/index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Remove composition badge from surface card
const targetBadge = `<span style="font-size:0.68rem; background:#f8fafc; color:#475569; border:1px solid #e2e8f0; padding:2px 6px; border-radius:4px; font-weight:700;">📐 \${(it.compositionType || '三分割・額縁構図').split('＋')[0]}</span>`;
if (html.includes(targetBadge)) {
  html = html.replace(targetBadge, '');
  console.log('1. Removed composition badge from surface card');
} else {
  console.log('1. Could not find exact composition badge string');
}

// 2. Add CSS for secret SNS mode
const secretCss = `
    /* 秘密のクリエイター・海外SNS発信モード用スタイル */
    .secret-sns-section {
      display: none;
    }
    body.secret-sns-active .secret-sns-section {
      display: block !important;
      animation: fadeInSecret 0.3s ease-in-out;
    }
    @keyframes fadeInSecret {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .secret-toggle-btn {
      cursor: pointer;
      opacity: 0.2;
      transition: opacity 0.2s, transform 0.2s;
      user-select: none;
      font-size: 0.85rem;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .secret-toggle-btn:hover {
      opacity: 0.8;
      background: rgba(255,255,255,0.15);
    }
    body.secret-sns-active .secret-toggle-btn {
      opacity: 1;
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid #f59e0b;
    }
`;

if (!html.includes('secret-sns-section')) {
  html = html.replace('</style>', secretCss + '\n  </style>');
  console.log('2. Added secret CSS styles');
}

// 3. Update Modal Header with triple-click and secret indicator
const oldModalHeader = `<strong id="mdl-title" style="font-size:1.15rem;"></strong>
          <div id="mdl-en-title" style="font-size:0.76rem; color:#fde68a;"></div>`;

const newModalHeader = `<strong id="mdl-title" style="font-size:1.15rem; cursor:pointer;" onclick="JapanApp.handleTitleTripleClick()" title="タイトルを素早く3回タップすると秘密モード切替"></strong>
          <div id="mdl-en-title" class="secret-sns-section" style="font-size:0.76rem; color:#fde68a;"></div>`;

if (html.includes(oldModalHeader)) {
  html = html.replace(oldModalHeader, newModalHeader);
  console.log('3. Updated modal header with triple click trigger');
}

const oldCloseBtn = `<button class="btn btn-outline btn-sm" onclick="JapanApp.closeDetailModal()">✕ 閉じる</button>`;
const newCloseBtn = `<div style="display:flex; align-items:center; gap:8px;">
          <span class="secret-toggle-btn" onclick="JapanApp.toggleSecretSnsMode()" title="秘密の発信モード切替（あなた専用）">🔒</span>
          <button class="btn btn-outline btn-sm" onclick="JapanApp.closeDetailModal()">✕ 閉じる</button>
        </div>`;

if (html.includes(oldCloseBtn)) {
  html = html.replace(oldCloseBtn, newCloseBtn);
  console.log('4. Added discreet lock toggle to modal header');
}

// 4. Wrap inbound appeal and english tags in .secret-sns-section
const oldInboundCard = `<div class="info-card" style="background:#fffbeb; border-color:#fde68a;">
              <h4>🌍 なぜ外国人がこの写真を見て「日本に行きたい！」と感動するのか？</h4>
              <p>\${item.inboundAppeal}</p>
            </div>`;

const newInboundCard = `<div class="info-card secret-sns-section" style="background:#fffbeb; border-color:#fde68a;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <h4 style="margin:0;">🌍 なぜ外国人がこの写真を見て「日本に行きたい！」と感動するのか？</h4>
                <span style="font-size:0.68rem; background:#fef3c7; color:#b45309; padding:1px 6px; border-radius:4px; font-weight:700;">㊙️ 自分専用・発信ヒント</span>
              </div>
              <p>\${item.inboundAppeal}</p>
            </div>`;

if (html.includes(oldInboundCard)) {
  html = html.replace(oldInboundCard, newInboundCard);
  console.log('5. Wrapped inbound card in secret-sns-section');
}

const oldTagsCard = `<div class="info-card">
              <h4>🏷️ 海外発信・SNS用 英語キャプション＆ハッシュタグ</h4>
              <p style="font-family:monospace; background:#fff; padding:8px; border-radius:6px; border:1px solid #cbd5e1; margin-bottom:8px;">\${item.englishTags}</p>
              <button class="btn btn-outline btn-sm" onclick="navigator.clipboard.writeText('\${item.englishTags.replace(/'/g, \"\\\\'\")}'); alert('英語キャプション＆タグをコピーしました！');">📋 英語タグをコピー</button>
            </div>`;

const newTagsCard = `<div class="info-card secret-sns-section">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <h4 style="margin:0;">🏷️ 海外発信・SNS用 英語キャプション＆ハッシュタグ</h4>
                <span style="font-size:0.68rem; background:#e0e7ff; color:#3730a3; padding:1px 6px; border-radius:4px; font-weight:700;">㊙️ 自分専用・コピペ用</span>
              </div>
              <p style="font-family:monospace; background:#fff; padding:8px; border-radius:6px; border:1px solid #cbd5e1; margin-bottom:8px;">\${item.englishTags}</p>
              <button class="btn btn-outline btn-sm" onclick="navigator.clipboard.writeText('\${item.englishTags.replace(/'/g, \"\\\\'\")}'); alert('英語キャプション＆タグをコピーしました！');">📋 英語タグをコピー</button>
            </div>`;

if (html.includes(oldTagsCard)) {
  html = html.replace(oldTagsCard, newTagsCard);
  console.log('6. Wrapped tags card in secret-sns-section');
}

// 5. Wrap AI prompt button
html = html.replace(
  `<button class="btn btn-outline btn-sm" style="font-size:0.75rem; padding:3px 8px; border-color:#d97706; color:#92400e; background:#fff;" onclick="JapanApp.openAiPromptModal('\${item.id}', \${idx})">🤖 AIプロンプト</button>`,
  `<button class="btn btn-outline btn-sm secret-sns-section" style="font-size:0.75rem; padding:3px 8px; border-color:#d97706; color:#92400e; background:#fff; margin-left:auto;" onclick="JapanApp.openAiPromptModal('\${item.id}', \${idx})">🤖 AIプロンプト</button>`
);

// 6. Add JavaScript functions for secret mode
const secretJs = `
      // --- 秘密のクリエイター・海外SNS発信モード ---
      let secretTapCount = 0;
      let secretTapTimer = null;

      function initSecretMode() {
        const isSecret = localStorage.getItem('niigata_secret_sns_mode') === 'true';
        if (isSecret) {
          document.body.classList.add('secret-sns-active');
        } else {
          document.body.classList.remove('secret-sns-active');
        }
        updateSecretIcons();
      }

      function updateSecretIcons() {
        const isActive = document.body.classList.contains('secret-sns-active');
        document.querySelectorAll('.secret-toggle-btn').forEach(el => {
          el.textContent = isActive ? '🔓' : '🔒';
          el.title = isActive ? '【秘密モード中】タップで通常モード（非表示）に戻す' : '通常モード（タップまたはタイトル3回タップで秘密モードON）';
        });
      }

      function toggleSecretSnsMode(explicitState) {
        const current = document.body.classList.contains('secret-sns-active');
        const next = explicitState !== undefined ? explicitState : !current;
        if (next) {
          document.body.classList.add('secret-sns-active');
          localStorage.setItem('niigata_secret_sns_mode', 'true');
          showToast('🔓【秘密モードON】海外SNS発信・インバウンド分析を表示しました');
        } else {
          document.body.classList.remove('secret-sns-active');
          localStorage.setItem('niigata_secret_sns_mode', 'false');
          showToast('🔒【通常モード】海外SNS発信・分析を非表示にしました');
        }
        updateSecretIcons();
      }

      function handleTitleTripleClick() {
        secretTapCount++;
        clearTimeout(secretTapTimer);
        if (secretTapCount >= 3) {
          secretTapCount = 0;
          toggleSecretSnsMode();
        } else {
          secretTapTimer = setTimeout(() => {
            secretTapCount = 0;
          }, 500);
        }
      }

      function showToast(msg) {
        let toast = document.getElementById('secret-toast');
        if (!toast) {
          toast = document.createElement('div');
          toast.id = 'secret-toast';
          toast.style.cssText = 'position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:#0f172a; color:#f8fafc; padding:10px 18px; border-radius:99px; font-size:0.85rem; font-weight:700; z-index:99999; box-shadow:0 10px 25px rgba(0,0,0,0.3); pointer-events:none; transition:opacity 0.3s, transform 0.3s; opacity:0;';
          document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
          toast.style.opacity = '0';
          toast.style.transform = 'translateX(-50%) translateY(10px)';
        }, 2500);
      }
`;

// Insert into script
html = html.replace('function init() {', secretJs + '\n      function init() {\n        initSecretMode();');

// Also expose to JapanApp
html = html.replace('openDetailModal,', 'openDetailModal,\n        toggleSecretSnsMode,\n        handleTitleTripleClick,');

fs.writeFileSync(path, html, 'utf8');
console.log('Successfully updated scenery index.html!');
