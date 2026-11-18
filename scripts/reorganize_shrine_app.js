const fs = require('fs');

const filePath = '神社仏閣・絶景・花図鑑/index.html';
let html = fs.readFileSync(filePath, 'utf8');

// 1. Add missing scripts in <head> if not present
if (!html.includes('data-insects.js')) {
  html = html.replace(
    '<script src="../四季の花・草木図鑑/js/data-flora-dex.js"></script>',
    `<script src="../四季の花・草木図鑑/js/data-flora-dex.js"></script>
  <script src="../js/data-insects.js"></script>
  <script src="../日本の絶景・風景図鑑/js/data-scenery-dex.js"></script>`
  );
  console.log('1. Added data-insects.js and data-scenery-dex.js to <head>');
}

// 2. Add styles for Purpose buttons and subfilters
const customStyles = `
    /* --- 今日の目的＆深掘りナビ専用スタイル --- */
    .purpose-btn {
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .purpose-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(0,0,0,0.1);
    }
    .purpose-btn.active.btn-buddha {
      background: linear-gradient(135deg, #7c3aed, #6d28d9) !important;
      color: #fff !important;
      border-color: #6d28d9 !important;
      box-shadow: 0 4px 12px rgba(109,40,217,0.35);
    }
    .purpose-btn.active.btn-goshuin {
      background: linear-gradient(135deg, #e11d48, #be123c) !important;
      color: #fff !important;
      border-color: #be123c !important;
      box-shadow: 0 4px 12px rgba(190,18,60,0.35);
    }
    .purpose-btn.active.btn-nearby {
      background: linear-gradient(135deg, #0284c7, #0369a1) !important;
      color: #fff !important;
      border-color: #0369a1 !important;
      box-shadow: 0 4px 12px rgba(2,132,199,0.35);
    }
    .purpose-btn.active.btn-all {
      background: #0f172a !important;
      color: #fff !important;
      border-color: #0f172a !important;
      box-shadow: 0 4px 10px rgba(15,23,42,0.25);
    }
    .subfilter-btn {
      font-size: 0.72rem;
      padding: 3px 8px;
      border-radius: 99px;
      border: 1px solid #cbd5e1;
      background: #fff;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .subfilter-btn.active {
      background: #7c3aed;
      color: #fff;
      border-color: #6d28d9;
      font-weight: 800;
    }
    .db-tab-btn {
      transition: all 0.15s ease;
    }
    .db-tab-btn:hover {
      transform: translateY(-1px);
    }
    .db-tab-btn.active {
      box-shadow: 0 0 0 2px #0f172a;
    }
`;

if (!html.includes('purpose-btn')) {
  html = html.replace('</style>', `${customStyles}\n  </style>`);
  console.log('2. Added custom CSS for purpose buttons');
}

// 3. Replace the old cat-nav bar with the new Purpose Navigation Control Center
const oldNavRegex = /<!-- カテゴリ＆機能切り替えナビ[\s\S]*?<\/nav>/;
const newNavHtml = `<!-- 今日の目的＆深掘りナビ（ユーザーの目的に合わせて一発切り替え） -->
  <nav class="purpose-nav-container" style="background:#fff; border-bottom:1.5px solid #e2e8f0; padding:12px 16px; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
    <div style="max-width:1400px; margin:0 auto; display:flex; flex-direction:column; gap:10px;">
      
      <!-- 第1段：今日の行き先を決める（3大目的 ＋ 全社寺） -->
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <span style="font-size:0.75rem; font-weight:900; color:#475569; background:#f1f5f9; padding:5px 9px; border-radius:6px; letter-spacing:0.03em;">
            🎯 行く目的で選ぶ:
          </span>
          
          <!-- ① 仏像・見どころ拝観 (第1の目的) -->
          <button class="purpose-btn btn-buddha active" id="btn-mode-buddha" onclick="JapanApp.selectIntentMode('buddha')" style="font-weight:800; font-size:0.84rem; padding:6px 14px; border-radius:8px; border:2px solid #7c3aed; background:#f5f3ff; color:#6d28d9; cursor:pointer; display:flex; align-items:center; gap:6px;">
            <span>👑</span>
            <span>仏像・見どころ拝観</span>
            <span style="font-size:0.7rem; background:#7c3aed; color:#fff; padding:1px 6px; border-radius:99px;">23名刹</span>
          </button>

          <!-- ② 御朱印めぐり (第2の目的) -->
          <button class="purpose-btn btn-goshuin" id="btn-mode-goshuin" onclick="JapanApp.selectIntentMode('goshuin')" style="font-weight:800; font-size:0.84rem; padding:6px 14px; border-radius:8px; border:2px solid #e11d48; background:#fff1f2; color:#be123c; cursor:pointer; display:flex; align-items:center; gap:6px;">
            <span>🏮</span>
            <span>御朱印めぐり</span>
            <span style="font-size:0.7rem; background:#e11d48; color:#fff; padding:1px 6px; border-radius:99px;">48社寺</span>
          </button>

          <!-- ③ 近く・帰り道 (第3の目的) -->
          <button class="purpose-btn btn-nearby" id="btn-mode-nearby" onclick="JapanApp.selectIntentMode('nearby')" style="font-weight:800; font-size:0.84rem; padding:6px 14px; border-radius:8px; border:2px solid #0284c7; background:#f0f9ff; color:#0369a1; cursor:pointer; display:flex; align-items:center; gap:6px;">
            <span>📍</span>
            <span>近く・帰り道ナビ</span>
            <span style="font-size:0.7rem; background:#0284c7; color:#fff; padding:1px 6px; border-radius:99px;">距離順</span>
          </button>

          <!-- 全社寺表示 -->
          <button class="purpose-btn btn-all" id="btn-mode-all" onclick="JapanApp.selectIntentMode('all')" style="font-weight:700; font-size:0.8rem; padding:6px 12px; border-radius:8px; border:1px solid #cbd5e1; background:#fff; color:#475569; cursor:pointer;">
            ⛩️ 新潟県全88社寺
          </button>
        </div>

        <!-- 第2段（右側）：深掘りデータベース -->
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <span style="font-size:0.72rem; font-weight:800; color:#64748b;">📚 深掘り図鑑:</span>
          <button class="db-tab-btn" id="tab-btn-lineage" onclick="JapanApp.setCategory('lineage')" style="font-size:0.74rem; font-weight:700; padding:5px 11px; border-radius:6px; border:1px solid #d97706; background:#fffbeb; color:#92400e; cursor:pointer;">
            ⛩️ 神社・親子相関図
          </button>
          <button class="db-tab-btn" id="tab-btn-buddha-rank" onclick="JapanApp.setCategory('buddha_rank')" style="font-size:0.74rem; font-weight:700; padding:5px 11px; border-radius:6px; border:1px solid #8b5cf6; background:#faf5ff; color:#6d28d9; cursor:pointer;">
            👑 仏像4大階級ガイド
          </button>
          <button class="db-tab-btn" id="tab-btn-goshuin-book" onclick="JapanApp.setCategory('goshuin_book')" style="font-size:0.74rem; font-weight:700; padding:5px 11px; border-radius:6px; border:1px solid #cbd5e1; background:#fff; color:#334155; cursor:pointer;">
            📖 マイ御朱印帳記録
          </button>
        </div>
      </div>

      <!-- 👑 仏像モード時に出現する「仏像系統・階級別サブフィルターバー」 -->
      <div id="subbar-buddha" style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; padding:8px 12px; background:#faf5ff; border:1px solid #e9d5ff; border-radius:8px; font-size:0.75rem;">
        <strong style="color:#6d28d9; margin-right:4px;">👑 仏像の系統から選ぶ:</strong>
        <button class="subfilter-btn active" id="sbtn-buddha-all" onclick="JapanApp.filterBuddhaSub('all')">すべて (23)</button>
        <button class="subfilter-btn" id="sbtn-buddha-nyorai" onclick="JapanApp.filterBuddhaSub('nyorai')">🌟 如来（五智国分寺・出湯薬師堂）</button>
        <button class="subfilter-btn" id="sbtn-buddha-bosatsu" onclick="JapanApp.filterBuddhaSub('bosatsu')">💖 菩薩・大観音（胎内大観音・観音寺）</button>
        <button class="subfilter-btn" id="sbtn-buddha-myoo" onclick="JapanApp.filterBuddhaSub('myoo')">🔥 不動明王（菅谷不動尊）</button>
        <button class="subfilter-btn" id="sbtn-buddha-tenbu" onclick="JapanApp.filterBuddhaSub('tenbu')">⚔️ 天部・仁王像（国上寺・種月寺・浦佐）</button>
        <button class="subfilter-btn" id="sbtn-buddha-rakan" onclick="JapanApp.filterBuddhaSub('rakan')">🗿 五百羅漢・石仏群（慈光寺・長谷寺）</button>
      </div>

      <!-- 🏮 御朱印モード時に出現する「御朱印案内バー」 -->
      <div id="subbar-goshuin" style="display:none; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; padding:8px 12px; background:#fff1f2; border:1px solid #fecdd3; border-radius:8px; font-size:0.75rem;">
        <div style="color:#be123c;">
          <strong>🏮 御朱印めぐりモード中:</strong> 御朱印がいただける48社寺を表示中（各カードに受付時間・初穂料・オリジナル御朱印帳情報を表示）
        </div>
        <button class="btn btn-sm btn-vermilion" onclick="JapanApp.setCategory('goshuin_book')" style="font-size:0.72rem; padding:3px 9px;">
          📖 マイ御朱印帳を開く ➔
        </button>
      </div>
    </div>
  </nav>`;

if (oldNavRegex.test(html)) {
  html = html.replace(oldNavRegex, newNavHtml);
  console.log('3. Replaced navigation bar with Purpose Control Center');
} else {
  console.log('3. Could not match oldNavRegex');
}

fs.writeFileSync(filePath, html, 'utf8');
