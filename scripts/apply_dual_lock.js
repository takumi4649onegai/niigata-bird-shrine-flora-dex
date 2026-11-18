const fs = require('fs');

function updateFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Update CSS
  const oldCssRegex = /\/\* 秘密のクリエイター・海外SNS発信モード用スタイル \*\/[\s\S]*?body\.secret-sns-active \.secret-toggle-btn \{[\s\S]*?\}/;
  const newCss = `/* 秘密のクリエイター・海外SNS発信モード用スタイル（二重ロック安全仕様） */
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
    /* 通常時は鍵アイコン自体を完全非表示（押し間違いゼロ） */
    .secret-toggle-btn {
      display: none !important;
    }
    /* タイトルをトリプルタップした時だけ半透明で静かに出現 */
    body.secret-key-revealed .secret-toggle-btn {
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0.45;
      font-size: 0.9rem;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px dashed rgba(255, 255, 255, 0.35);
      user-select: none;
      transition: opacity 0.2s, background 0.2s, transform 0.15s;
    }
    body.secret-key-revealed .secret-toggle-btn:hover {
      opacity: 0.9;
      background: rgba(255, 255, 255, 0.22);
      transform: scale(1.05);
    }
    /* 解放時はゴールドに点灯 */
    body.secret-sns-active .secret-toggle-btn {
      opacity: 1 !important;
      background: rgba(245, 158, 11, 0.25) !important;
      border: 1px solid #f59e0b !important;
    }`;

  if (oldCssRegex.test(html)) {
    html = html.replace(oldCssRegex, newCss);
    console.log(`Updated CSS in ${filePath}`);
  } else {
    console.log(`Could not match old CSS in ${filePath}`);
  }

  // 2. Update JS Logic
  const oldJsRegex = /\/\/ --- 秘密のクリエイター・海外SNS発信モード ---[\s\S]*?function showToast\(msg\) \{[\s\S]*?\}\s*\}/;
  const newJs = `// --- 秘密のクリエイター・海外SNS発信モード（二重ロック安全仕様） ---
      let secretTapCount = 0;
      let secretTapTimer = null;

      function updateSecretIcons() {
        const isActive = document.body.classList.contains('secret-sns-active');
        document.querySelectorAll('.secret-toggle-btn').forEach(el => {
          el.textContent = isActive ? '🔓' : '🔒';
          el.title = isActive ? '【解放中】タップすると施錠して非表示に戻します' : '【半透明キー】タップすると秘密の発信モードを解放します';
        });
      }

      // ステップ1: タイトルを素早く3回連続タップで「半透明の鍵」を静かに出現（または完全施錠）
      function handleTitleTripleClick() {
        secretTapCount++;
        clearTimeout(secretTapTimer);
        if (secretTapCount >= 3) {
          secretTapCount = 0;
          const isRevealed = document.body.classList.contains('secret-key-revealed');
          if (!isRevealed) {
            // 半透明の鍵マークを静かに出現（目立つ通知は出さない安全設計）
            document.body.classList.add('secret-key-revealed');
            updateSecretIcons();
          } else {
            // もう一度トリプルタップすると完全施錠して鍵も消滅
            lockAndHideSecretKey();
          }
        } else {
          secretTapTimer = setTimeout(() => {
            secretTapCount = 0;
          }, 500);
        }
      }

      // ステップ2: 半透明の鍵を押して本解放（または施錠）
      function toggleSecretSnsMode() {
        const isActive = document.body.classList.contains('secret-sns-active');
        if (!isActive) {
          document.body.classList.add('secret-sns-active');
          showToast('🔓【秘密モード解放】海外発信・SNSタグを表示しました');
        } else {
          document.body.classList.remove('secret-sns-active');
          showToast('🔒 海外発信・SNSタグを施錠（非表示）にしました');
        }
        updateSecretIcons();
      }

      // 完全施錠（鍵アイコンも完全に消す）
      function lockAndHideSecretKey() {
        document.body.classList.remove('secret-key-revealed', 'secret-sns-active');
        updateSecretIcons();
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
      }`;

  if (oldJsRegex.test(html)) {
    html = html.replace(oldJsRegex, newJs);
    console.log(`Updated JS in ${filePath}`);
  } else {
    console.log(`Could not match old JS in ${filePath}`);
  }

  // 3. Make sure closeDetailModal automatically resets secret key and locks
  if (html.includes('function closeDetailModal() {')) {
    html = html.replace(
      'function closeDetailModal() {',
      'function closeDetailModal() {\n        lockAndHideSecretKey();'
    );
    console.log(`Added auto-lock to closeDetailModal in ${filePath}`);
  }

  // 4. Expose lockAndHideSecretKey to JapanApp
  if (html.includes('handleTitleTripleClick,') && !html.includes('lockAndHideSecretKey,')) {
    html = html.replace('handleTitleTripleClick,', 'handleTitleTripleClick,\n        lockAndHideSecretKey,');
    console.log(`Exposed lockAndHideSecretKey in ${filePath}`);
  }

  fs.writeFileSync(filePath, html, 'utf8');
}

updateFile('神社仏閣・絶景・花図鑑/index.html');
updateFile('日本の絶景・風景図鑑/index.html');
