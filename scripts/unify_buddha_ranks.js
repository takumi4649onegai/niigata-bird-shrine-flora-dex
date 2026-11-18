const fs = require('fs');

const path = '神社仏閣・絶景・花図鑑/index.html';
let html = fs.readFileSync(path, 'utf8');

const targetPanelRegex = /<!-- 💡 仏像の4大階級と見分け方ガイド[\s\S]*?<\/div>\s*<\/details>/;

const unifiedPanel = `<!-- 💡 仏像の4大階級と見分け方ガイド（統一フォーマット・全国展開対応） -->
      <details id="buddha-rank-guide-panel" style="background:#fffbeb; border:2px solid #f59e0b; border-radius:12px; margin-bottom:14px; overflow:hidden; box-shadow:0 4px 12px rgba(245,158,11,0.1);">
        <summary style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding:12px 16px; cursor:pointer; font-size:0.88rem; font-weight:900; color:#92400e; background:#fef3c7; user-select:none;">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span style="font-size:0.78rem; background:#b45309; color:#fff; padding:3px 9px; border-radius:99px;">💡 1分でわかる！</span>
            <span>仏像の4大階級（如来・菩薩・明王・天部）と見分け方ガイド</span>
          </div>
          <span style="font-size:0.78rem; color:#b45309; font-weight:800;">▼ タップして階級表と解説を見る</span>
        </summary>
        <div style="padding:16px 18px; font-size:0.83rem; color:#1e293b; line-height:1.7;">
          <p style="margin:0 0 14px 0; color:#78350f; font-weight:700;">
            仏像は上から<strong>「如来 ➔ 菩薩 ➔ 明王 ➔ 天部」</strong>という明確な4大階級（ランク）に分かれています。各階級の特徴と見分け方、代表的なスポットを直接選んで図鑑を絞り込めます。
          </p>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px; margin-bottom:14px;">
            <!-- 第1位：如来 -->
            <div style="background:#fff; border-left:4px solid #b45309; padding:14px 16px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.06); display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <strong style="color:#b45309; font-size:0.95rem;">👑 第1位：如来（にょらい）</strong>
                  <span style="font-size:0.7rem; background:#fef3c7; color:#92400e; padding:1px 6px; border-radius:4px; font-weight:800;">仏教の最高位</span>
                </div>
                <div style="font-size:0.76rem; color:#64748b; margin-bottom:8px;">【役割】悟りを開いた絶対的存在（最高位・仏教の創始者）</div>
                <p style="font-size:0.78rem; margin:0 0 8px 0; line-height:1.5;">
                  物欲を断ち切っているため装飾品はゼロ。薄い布1枚をまとい、頭はパンチパーマ状の螺髪（らほつ）。<br/>
                  📍 <em>釈迦如来、阿弥陀如来、薬師如来、大日如来（五智如来）</em>
                </p>
              </div>
              <div style="margin-top:10px;">
                <button class="btn btn-sm" onclick="JapanApp.selectFeature('rank_nyorai')" style="background:#b45309; color:#fff; font-size:0.76rem; font-weight:800; padding:6px 12px; border:none; border-radius:6px; cursor:pointer; width:100%; display:flex; justify-content:space-between; align-items:center;">
                  <span>👑 如来スポット一覧を見る</span>
                  <span>➔</span>
                </button>
                <div style="font-size:0.71rem; color:#64748b; margin-top:5px; display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
                  <span style="font-weight:700; color:#b45309;">主な見どころ：</span>
                  <span>五智如来坐像（五智国分寺）、薬師堂など</span>
                </div>
              </div>
            </div>

            <!-- 第2位：菩薩 -->
            <div style="background:#fff; border-left:4px solid #d97706; padding:14px 16px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.06); display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <strong style="color:#d97706; font-size:0.95rem;">💎 第2位：菩薩（ぼさつ）</strong>
                  <span style="font-size:0.7rem; background:#fef3c7; color:#92400e; padding:1px 6px; border-radius:4px; font-weight:800;">慈悲の実践者</span>
                </div>
                <div style="font-size:0.76rem; color:#64748b; margin-bottom:8px;">【役割】人々を救うため人間界で修行する慈悲の仏様</div>
                <p style="font-size:0.78rem; margin:0 0 8px 0; line-height:1.5;">
                  悟れる境地に達しながら人々を救うため残る。出家前の王子の姿（宝冠や首飾りなどきらびやかな装飾）。<br/>
                  📍 <em>観音菩薩（聖観音・十一面・千手など六観音）、文殊菩薩、普賢菩薩、地蔵菩薩</em>
                </p>
              </div>
              <div style="margin-top:10px;">
                <button class="btn btn-sm" onclick="JapanApp.selectFeature('rank_bosatsu')" style="background:#d97706; color:#fff; font-size:0.76rem; font-weight:800; padding:6px 12px; border:none; border-radius:6px; cursor:pointer; width:100%; display:flex; justify-content:space-between; align-items:center;">
                  <span>💎 菩薩スポット一覧を見る</span>
                  <span>➔</span>
                </button>
                <div style="font-size:0.71rem; color:#64748b; margin-top:5px; display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
                  <span style="font-weight:700; color:#d97706;">主な見どころ：</span>
                  <span>越後胎内観音（全高26m青銅露天）、宝積院、普談寺など</span>
                </div>
              </div>
            </div>

            <!-- 第3位：明王 -->
            <div style="background:#fff; border-left:4px solid #dc2626; padding:14px 16px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.06); display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <strong style="color:#dc2626; font-size:0.95rem;">🔥 第3位：明王（みょうおう）</strong>
                  <span style="font-size:0.7rem; background:#fee2e2; color:#991b1b; padding:1px 6px; border-radius:4px; font-weight:800;">如来の戦闘化身</span>
                </div>
                <div style="font-size:0.76rem; color:#64748b; margin-bottom:8px;">【役割】言うことを聞かない悪人を力づくでも教化する如来の化身</div>
                <p style="font-size:0.78rem; margin:0 0 8px 0; line-height:1.5;">
                  背中に火炎光背（炎）を背負い、激しい怒りの形相。右手に魔を断つ利剣、左手に悪人を縛る羂索（縄）を持つ。<br/>
                  📍 <em>不動明王（五大明王の筆頭）、降三世明王、愛染明王、孔雀明王</em>
                </p>
              </div>
              <div style="margin-top:10px;">
                <button class="btn btn-sm" onclick="JapanApp.selectFeature('rank_myoo')" style="background:#dc2626; color:#fff; font-size:0.76rem; font-weight:800; padding:6px 12px; border:none; border-radius:6px; cursor:pointer; width:100%; display:flex; justify-content:space-between; align-items:center;">
                  <span>🔥 明王スポット一覧を見る</span>
                  <span>➔</span>
                </button>
                <div style="font-size:0.71rem; color:#64748b; margin-top:5px; display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
                  <span style="font-weight:700; color:#dc2626;">主な見どころ：</span>
                  <span>日本三不動・新発田「菅谷不動尊」など</span>
                </div>
              </div>
            </div>

            <!-- 第4位：天部 -->
            <div style="background:#fff; border-left:4px solid #0284c7; padding:14px 16px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.06); display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <strong style="color:#0284c7; font-size:0.95rem;">⚔️ 第4位：天部（てんぶ）</strong>
                  <span style="font-size:0.7rem; background:#e0f2fe; color:#0369a1; padding:1px 6px; border-radius:4px; font-weight:800;">武神守護神団</span>
                </div>
                <div style="font-size:0.76rem; color:#64748b; margin-bottom:8px;">【役割】寺院と仏法を外敵から守る武闘派守護神軍団（警備隊長）</div>
                <p style="font-size:0.78rem; margin:0 0 8px 0; line-height:1.5;">
                  古代インドの神々が仏教に帰依した姿。甲冑（よろい）や武器を身にまとい仏敵を踏みつける。<br/>
                  📍 <em>金剛力士（仁王）、毘沙門天、四天王、弁財天、大黒天、吉祥天</em>
                </p>
              </div>
              <div style="margin-top:10px;">
                <button class="btn btn-sm" onclick="JapanApp.selectFeature('rank_tenbu')" style="background:#0284c7; color:#fff; font-size:0.76rem; font-weight:800; padding:6px 12px; border:none; border-radius:6px; cursor:pointer; width:100%; display:flex; justify-content:space-between; align-items:center;">
                  <span>⚔️ 天部スポット一覧を見る</span>
                  <span>➔</span>
                </button>
                <div style="font-size:0.71rem; color:#64748b; margin-top:5px; display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
                  <span style="font-weight:700; color:#0284c7;">主な見どころ：</span>
                  <span>山門の仁王像（9社寺）、越後浦佐・毘沙門堂など</span>
                </div>
              </div>
            </div>

            <!-- 番外：羅漢・石仏 -->
            <div style="background:#fff; border-left:4px solid #475569; padding:14px 16px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.06); display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <strong style="color:#475569; font-size:0.95rem;">🪨 番外：羅漢・石仏（らかん）</strong>
                  <span style="font-size:0.7rem; background:#f1f5f9; color:#475569; padding:1px 6px; border-radius:4px; font-weight:800;">生身の修行者</span>
                </div>
                <div style="font-size:0.76rem; color:#64748b; margin-bottom:8px;">【役割】お釈迦様の生身の弟子たち＆辻を守る身近な野仏様</div>
                <p style="font-size:0.78rem; margin:0 0 8px 0; line-height:1.5;">
                  神仏ではなく「人間」なので泣いたり笑ったり喜怒哀楽が豊か。苔むした境内に並ぶ石仏は最高の被写体。<br/>
                  📍 <em>五百羅漢（弟子500人）、六地蔵、道祖神、庚申塔</em>
                </p>
              </div>
              <div style="margin-top:10px;">
                <button class="btn btn-sm" onclick="JapanApp.selectFeature('rank_rakan')" style="background:#475569; color:#fff; font-size:0.76rem; font-weight:800; padding:6px 12px; border:none; border-radius:6px; cursor:pointer; width:100%; display:flex; justify-content:space-between; align-items:center;">
                  <span>🪨 羅漢・石仏スポット一覧を見る</span>
                  <span>➔</span>
                </button>
                <div style="font-size:0.71rem; color:#64748b; margin-top:5px; display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
                  <span style="font-weight:700; color:#475569;">主な見どころ：</span>
                  <span>五百羅漢（慈光寺・佐渡長谷寺）、里山の石仏群など</span>
                </div>
              </div>
            </div>
          </div>

          <div style="background:#fff; padding:10px 14px; border-radius:8px; border:1px solid #fed7aa;">
            <strong style="color:#92400e;">💡 名前の末尾で見分けるルール</strong><br/>
            <span style="font-size:0.78rem; color:#475569;">
              ・末尾が「〜如来」「〜薬師」「〜阿弥陀」➔ 👑 <strong>如来</strong><br/>
              ・末尾が「〜観音」「〜菩薩」「〜地蔵」➔ 💎 <strong>菩薩</strong>（「観世音菩薩」を略して観音と呼ぶため観音は100%菩薩！）<br/>
              ・末尾が「〜明王」「〜不動」➔ 🔥 <strong>明王</strong><br/>
              ・末尾が「〜天」「〜神」「〜力士」➔ ⚔️ <strong>天部</strong>（仁王像、毘沙門天、四天王、阿修羅、弁財天など）<br/>
              ・末尾が「〜羅漢」➔ 🪨 <strong>羅漢</strong>（お釈迦様の生身の弟子500人）
            </span>
          </div>
        </div>
      </details>`;

if (targetPanelRegex.test(html)) {
  html = html.replace(targetPanelRegex, unifiedPanel);
  fs.writeFileSync(path, html, 'utf8');
  console.log('Successfully unified Buddha rank cards in shrine index.html!');
} else {
  console.error('Could not match targetPanelRegex in index.html');
}
