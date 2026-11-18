// にいがた野鳥図鑑 メインアプリケーションコントローラー (Part 1)
window.App = (function() {
  let currentTab = "dashboard";
  let selectedMonth = new Date().getMonth() + 1; // 現在の月（1〜12）
  let mapInstance = null;
  let mapMarkers = [];
  let selectedSpotId = "fukushimagata";
  let addSpotMode = false;
  let pendingCaptureData = null; // アップロード中の画像・EXIF・目利きデータ

  const KITA_SPOT_IDS = ["fukushimagata", "kaibenomori", "aganogawa", "junsaiike", "tarodai", "akiha", "yahiko"];

  async function init() {
    await window.BirdStorage.init();
    window.App.populateReverseBirdSelect();
    renderMonthButtons();
    updateHeaderStats();
    renderDashboard();
    renderPokedex();
    window.App.renderGallery();
    window.App.renderManners();
    updateSilhouetteButtonText();

    // 姉妹アプリ（神社仏閣・絶景・花図鑑）から ?spot=yahiko 等で連動ジャンプしてきた場合は該当スポットを即表示！
    try {
      const params = new URLSearchParams(window.location.search);
      const jumpSpot = params.get("spot");
      if (jumpSpot) {
        selectedSpotId = jumpSpot;
        switchTab("map");
        setTimeout(() => {
          window.App.selectSpot(jumpSpot, true);
        }, 180);
      }
    } catch (_) {}
  }

  // タブ切り替え
  function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll(".nav-tab").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
    });
    document.querySelectorAll(".view-section").forEach(sec => {
      sec.classList.toggle("active", sec.id === "view-" + tabName);
    });

    if (tabName === "map") {
      setTimeout(() => {
        window.App.initMapIfNeeded();
        if (mapInstance) mapInstance.invalidateSize();
        window.App.renderMapAndSpots();
      }, 60);
    } else if (tabName === "gallery") {
      window.App.renderGallery();
    } else if (tabName === "pokedex") {
      renderPokedex();
    } else if (tabName === "dashboard") {
      renderDashboard();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ヘッダーとダッシュボードの統計更新
  function updateHeaderStats() {
    const birds = window.BirdStorage.getAllBirds();
    const total = birds.length;
    let getCount = 0;
    let totalPhotos = 0;
    let kitaGetCount = 0;

    birds.forEach(b => {
      const caps = window.BirdStorage.getBirdCaptures(b.id);
      if (caps.length > 0) {
        getCount++;
        totalPhotos += caps.length;
        if (b.spots && b.spots.some(s => KITA_SPOT_IDS.includes(s))) {
          kitaGetCount++;
        }
      }
    });

    const pct = total > 0 ? Math.round((getCount / total) * 100) : 0;
    document.getElementById("header-get-count").textContent = getCount;
    document.getElementById("header-total-count").textContent = total;
    document.getElementById("header-get-pct").textContent = pct;
    document.getElementById("header-progress-fill").style.width = pct + "%";

    const elCap = document.getElementById("stat-captured-species");
    const elPhotos = document.getElementById("stat-total-photos");
    const elKita = document.getElementById("stat-kita-species");
    const elRank = document.getElementById("dashboard-rank-badge");

    if (elCap) elCap.textContent = `${getCount} / ${total}`;
    if (elPhotos) elPhotos.textContent = totalPhotos;
    if (elKita) elKita.textContent = kitaGetCount;

    if (elRank) {
      let rank = "🌱 ビギナー観察者";
      if (getCount >= 30) rank = "👑 新潟野鳥マスター";
      else if (getCount >= 20) rank = "🦅 福島潟ベテラン写真家";
      else if (getCount >= 10) rank = "📸 中級バードハンター";
      else if (getCount >= 3) rank = "🔭 北区バードレンジャー";
      elRank.textContent = rank;
    }
  }

  // 月選択ボタンの描画
  function renderMonthButtons() {
    const wrap = document.getElementById("dashboard-month-buttons");
    if (!wrap) return;
    let html = "";
    for (let m = 1; m <= 12; m++) {
      const active = m === selectedMonth ? "active" : "";
      html += `<button class="month-btn ${active}" onclick="App.selectMonth(${m})">${m}月</button>`;
    }
    wrap.innerHTML = html;
  }

  function selectMonth(m) {
    selectedMonth = m;
    renderMonthButtons();
    renderDashboard();
  }

  // ダッシュボード描画
  function renderDashboard() {
    updateHeaderStats();
    const birds = window.BirdStorage.getAllBirds();

    const seasonNames = {
      1: "厳冬期（冬鳥の最盛期！福島潟のオオヒシクイ・オジロワシ・ミコアイサに注目）",
      2: "晩冬（冬鳥ラストスパート＆春への助走！海辺の森で小鳥やイスカも）",
      3: "早春（北帰行の季節！夏羽に変わるカモ類と留鳥のさえずり開始）",
      4: "春（福島潟の菜の花×ノゴマ！海辺の森にオオルリなど春の渡り鳥が到着）",
      5: "新緑（夏鳥シーズン到来！松之山のアカショウビンや弥彦山のオオルリ）",
      6: "初夏（福島潟に響くオオヨシキリの大合唱とセッカの空中曲芸）",
      7: "盛夏（水辺のサギ類・カワセミの幼鳥デビューの季節）",
      8: "晩夏（秋の渡りの先発隊が動き出す季節・早朝の涼しい時間帯が勝負）",
      9: "初秋（コガモなど冬のカモ第一陣が到着・モズの高鳴き）",
      10: "秋（福島潟にオオヒシクイとコハクチョウ飛来！ノゴマ・ジョウビタキも到着）",
      11: "初冬（冬鳥が一斉に集結！福島潟・瓢湖・じゅんさい池が最も賑わう好季節）",
      12: "冬（パンダガモ「ミコアイサ」やベニマシコ・オジロワシも揃う冬のオールスター）"
    };

    document.getElementById("dashboard-season-title").textContent =
      `📅 ${selectedMonth}月の新潟・北区ガイド：${seasonNames[selectedMonth]}`;
    document.getElementById("dashboard-month-label").textContent = `${selectedMonth}月`;

    // ステップアップ鳥（オナガ、カワセミ、ジョウビタキ、エナガ、オオヒシクイ、ミコアイサ、ベニマシコ、ルリビタキ等）
    const stepUpIds = ["onaga", "kawasemi", "joubitaki", "oohishikui", "enaga", "mikoaisa", "benimashiko", "ruribitaki"];
    const stepUpBirds = birds.filter(b => stepUpIds.includes(b.id));
    renderBirdCardList(stepUpBirds, document.getElementById("dashboard-stepup-grid"));

    // 選択した月に新潟市北区で見られる野鳥
    const kitaBirds = birds.filter(b =>
      b.months.includes(selectedMonth) &&
      b.spots &&
      b.spots.some(s => KITA_SPOT_IDS.includes(s))
    );
    renderBirdCardList(kitaBirds, document.getElementById("dashboard-kita-birds-grid"));
  }

  // タイプ別バッジクラス判定
  function getTypeClass(type) {
    if (type === "水辺") return "type-water";
    if (type === "森林") return "type-forest";
    if (type === "草原") return "type-grass";
    if (type === "猛禽") return "type-raptor";
    if (type === "身近") return "type-common";
    if (type === "天然記念物") return "type-special";
    return "";
  }

  // レア度の分かりやすい表記（★＋ランク名）
  function getRarityBadgeHtml(rarity) {
    const r = rarity || 1;
    const rankNames = {
      1: "C: 身近",
      2: "U: 普通",
      3: "R: レア",
      4: "SR: 超レア",
      5: "UR: 伝説級"
    };
    const stars = "★".repeat(r) + "☆".repeat(Math.max(0, 5 - r));
    return `<span class="rarity-pill r-${r}" title="出現レア度（★1:身近 〜 ★5:伝説級）">レア度 ${stars} (${rankNames[r]})</span>`;
  }

  // カード上の「♂オス / ♀メス」ワンタップ写真切り替え
  function switchCardSex(event, birdId, sex, btnEl) {
    event.stopPropagation();
    const bird = window.BirdStorage.getAllBirds().find(b => b.id === birdId);
    if (!bird) return;
    const card = btnEl.closest(".bird-card");
    if (!card) return;
    const imgEl = card.querySelector("img[data-wiki-bird]");
    if (imgEl) {
      const maleUrl = bird.userMalePhotoUrl || bird.malePhotoUrl;
      const femaleUrl = bird.userFemalePhotoUrl || bird.femalePhotoUrl;
      const targetUrl = sex === "female" ? femaleUrl : maleUrl;
      if (targetUrl) imgEl.src = targetUrl;
    }
    const bar = btnEl.closest(".sex-switch-bar");
    if (bar) {
      bar.querySelectorAll(".sex-btn").forEach(b => {
        b.classList.remove("active-male", "active-female");
      });
    }
    btnEl.classList.add(sex === "female" ? "active-female" : "active-male");
  }

  // モーダル内のメインお手本写真を「♂オス / ♀メス」切り替え
  function switchModalRefSex(birdId, sex) {
    const bird = window.BirdStorage.getAllBirds().find(b => b.id === birdId);
    if (!bird) return;
    const refImg = document.getElementById("modal-ref-img");
    const labelEl = document.getElementById("modal-ref-sex-label");
    const slotSelect = document.getElementById("ref-photo-slot-select");
    const maleUrl = bird.userMalePhotoUrl || bird.malePhotoUrl;
    const femaleUrl = bird.userFemalePhotoUrl || bird.femalePhotoUrl;
    if (sex === "female" && femaleUrl) {
      if (refImg) refImg.src = femaleUrl;
      if (labelEl) labelEl.textContent = "♀ メス（雌）のお手本写真";
      if (slotSelect) slotSelect.value = "female";
    } else if (sex === "male" && maleUrl) {
      if (refImg) refImg.src = maleUrl;
      if (labelEl) labelEl.textContent = "♂ オス（雄）のお手本写真";
      if (slotSelect) slotSelect.value = "male";
    }
  }

  // 野鳥カードリスト描画（未GETでもお手本写真表示／GET済みならお手本と自分のベストショットを並べて表示！）
  function renderBirdCardList(birdList, containerEl) {
    if (!containerEl) return;
    if (birdList.length === 0) {
      containerEl.innerHTML = `<div style="grid-column:1/-1; background:#fff; padding:28px; border-radius:12px; text-align:center; color:var(--text-muted);">条件に一致する野鳥が見つかりませんでした。フィルターを変更してみてください。</div>`;
      return;
    }

    const settings = window.BirdStorage.getSettings();
    const spotsMap = {};
    window.BirdStorage.getAllSpots().forEach(s => { spotsMap[s.id] = s.name; });

    let html = "";
    birdList.forEach(bird => {
      const captured = window.BirdStorage.isBirdCaptured(bird.id);
      const bestCap = window.BirdStorage.getBestCapture(bird.id);
      const allCaps = window.BirdStorage.getBirdCaptures(bird.id);
      const useSilhouette = !captured && settings.silhouetteMode;
      const fallbackSvg = window.BirdStorage.getFallbackBirdSvgDataUrl(bird, useSilhouette);
      const rarityHtml = getRarityBadgeHtml(bird.rarity);

      const mainSpotNames = (bird.spots || [])
        .slice(0, 2)
        .map(sid => (spotsMap[sid] || sid).replace(/（.*?）|水の駅「|」/g, ""))
        .join("・");

      // オス・メスで見た目が違う鳥にはカード写真右下に「♂オス / ♀メス」ワンタップ切替ボタンを表示！
      const sexToggleHtml = bird.hasDimorphism ? `
        <div class="sex-switch-bar" onclick="event.stopPropagation();" title="オスとメスのお手本写真を切り替え">
          <button type="button" class="sex-btn active-male" onclick="App.switchCardSex(event, '${bird.id}', 'male', this)">♂オス</button>
          <button type="button" class="sex-btn" onclick="App.switchCardSex(event, '${bird.id}', 'female', this)">♀メス</button>
        </div>
      ` : "";

      let topMediaHtml = "";
      if (captured && bestCap) {
        // GET済みの場合はカード上でも「お手本写真」と「自分のベストショット」が並んで見比べられる！
        topMediaHtml = `
          <div class="card-img-split">
            <div class="card-img-split-pane">
              <img id="card-ref-img-${bird.id}-${Math.random().toString(36).slice(2,6)}" data-wiki-bird="${bird.id}" src="${fallbackSvg}" alt="${bird.name} お手本" />
              <span class="split-pane-label">お手本</span>
            </div>
            <div class="card-img-split-pane">
              <img src="${bestCap.dataUrl}" alt="${bird.name} 自分の撮影" />
              <span class="split-pane-label my-shot">MY SHOT (${bestCap.totalScore || 80}点)</span>
            </div>
          </div>
          ${sexToggleHtml}
        `;
      } else {
        // 未GETの場合もお手本写真を表示（シルエットモードONのときのみシルエット化）
        topMediaHtml = `
          <img class="card-img-single ${useSilhouette ? 'silhouette-filter' : ''}" data-wiki-bird="${bird.id}" src="${fallbackSvg}" alt="${bird.name}" />
          ${sexToggleHtml}
        `;
      }

      const typeBadges = (bird.types || [])
        .map(t => `<span class="type-chip ${getTypeClass(t)}">${t}</span>`)
        .join("");

      html += `
        <article class="bird-card ${captured ? 'captured' : ''}" onclick="App.openBirdModal('${bird.id}')">
          <div class="bird-card-top">
            <span class="dex-no-badge">No.${bird.dexNo}</span>
            <span class="get-status-badge ${captured ? 'is-get' : 'not-get'}">
              ${captured ? `🏆 GET済 (${allCaps.length}枚)` : '未GET・お手本'}
            </span>
            ${topMediaHtml}
          </div>
          <div class="bird-card-body">
            <div class="bird-title-row">
              <h3 class="bird-name">${bird.name}</h3>
              ${rarityHtml}
            </div>
            <div class="bird-catchphrase">${bird.catchphrase || ''}</div>
            <div class="tag-row">
              ${typeBadges}
              ${bird.hasDimorphism ? `<span class="type-chip" style="background:#fce7f3; color:#9d174d; border:1px solid #f9a8d4;">♂♀ オスメス違いあり</span>` : `<span class="type-chip">♂♀ 同色</span>`}
              <span class="type-chip">全長 ${bird.sizeCm}cm</span>
            </div>
            <p style="font-size:0.8rem; color:#475569; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-bottom:8px;">
              ${bird.identification || bird.appearance}
            </p>
            <div class="bird-card-meta">
              <span>📍 ${mainSpotNames || '新潟県内'}</span>
              <span>🔊 ${bird.callText ? bird.callText.slice(0, 10) : '鳴き声あり'}</span>
            </div>
            <div class="bird-card-actions" onclick="event.stopPropagation();">
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="App.openBirdModal('${bird.id}')">📖 図鑑詳細</button>
              <button class="btn btn-outline btn-sm" title="本物の鳴き声を再生（約4秒）" onclick="App.playModalBirdCall('${bird.id}')">🔊 鳴き声</button>
              <button class="btn ${captured ? 'btn-primary' : 'btn-gold'} btn-sm" style="flex:1;" onclick="App.openCaptureModal('${bird.id}')">
                📷 ${captured ? '追加' : 'GET登録'}
              </button>
            </div>
          </div>
        </article>
      `;
    });

    containerEl.innerHTML = html;

    // Wikipedia（またはオスメス鮮明写真・ユーザー差し替え写真）から実物のお手本写真を非同期で読み込んで差し替え
    containerEl.querySelectorAll("img[data-wiki-bird]").forEach(imgEl => {
      const bid = imgEl.getAttribute("data-wiki-bird");
      const birdObj = birdList.find(b => b.id === bid);
      if (birdObj) {
        if (birdObj.userMainPhotoUrl) {
          imgEl.src = birdObj.userMainPhotoUrl;
        } else if (birdObj.hasDimorphism && (birdObj.userMalePhotoUrl || birdObj.malePhotoUrl)) {
          imgEl.src = birdObj.userMalePhotoUrl || birdObj.malePhotoUrl;
        } else {
          window.BirdStorage.fetchWikiPhoto(birdObj, url => {
            if (url) imgEl.src = url;
          });
        }
      }
    });
  }

  // 図鑑一覧タブの描画とフィルタリング
  function renderPokedex() {
    const birds = window.BirdStorage.getAllBirds();
    const q = (document.getElementById("dex-search")?.value || "").trim().toLowerCase();
    const statusFilter = document.getElementById("dex-filter-status")?.value || "all";
    const spotFilter = document.getElementById("dex-filter-spot")?.value || "all";
    const monthFilter = document.getElementById("dex-filter-month")?.value || "all";
    const typeFilter = document.getElementById("dex-filter-type")?.value || "all";
    const rarityFilter = document.getElementById("dex-filter-rarity")?.value || "all";

    const filtered = birds.filter(b => {
      const isCap = window.BirdStorage.isBirdCaptured(b.id);
      if (statusFilter === "captured" && !isCap) return false;
      if (statusFilter === "uncaptured" && isCap) return false;

      if (spotFilter === "kita_all") {
        if (!b.spots || !b.spots.some(s => KITA_SPOT_IDS.includes(s))) return false;
      } else if (spotFilter !== "all") {
        if (!b.spots || !b.spots.includes(spotFilter)) return false;
      }

      if (monthFilter === "season_winter") {
        if (!b.months.some(m => [11, 12, 1, 2].includes(m))) return false;
      } else if (monthFilter === "season_spring") {
        if (!b.months.some(m => [3, 4, 5].includes(m))) return false;
      } else if (monthFilter === "season_summer") {
        if (!b.months.some(m => [6, 7, 8].includes(m))) return false;
      } else if (monthFilter === "season_autumn") {
        if (!b.months.some(m => [9, 10].includes(m))) return false;
      } else if (monthFilter !== "all") {
        if (!b.months.includes(Number(monthFilter))) return false;
      }

      if (typeFilter !== "all") {
        if (!b.types || !b.types.includes(typeFilter)) return false;
      }

      if (rarityFilter === "dimorphic") {
        if (!b.hasDimorphism) return false;
      } else if (rarityFilter !== "all") {
        if (Number(b.rarity) !== Number(rarityFilter)) return false;
      }

      if (q) {
        const hay = `${b.name} ${b.kana} ${b.catchphrase} ${b.appearance} ${b.identification} ${b.niigataNote} ${b.callText} ${b.maleDesc || ''} ${b.femaleDesc || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    const countBar = document.getElementById("pokedex-count-bar");
    if (countBar) {
      const capInFiltered = filtered.filter(b => window.BirdStorage.isBirdCaptured(b.id)).length;
      countBar.textContent = `表示中: ${filtered.length}種 （うちGET済み: ${capInFiltered}種 / 未GET: ${filtered.length - capInFiltered}種）`;
    }

    renderBirdCardList(filtered, document.getElementById("pokedex-grid"));
  }

  function updateSilhouetteButtonText() {
    const btn = document.getElementById("btn-toggle-silhouette");
    if (!btn) return;
    const on = window.BirdStorage.getSettings().silhouetteMode;
    btn.textContent = `👁️ 未GETをシルエット表示にする: ${on ? "ON" : "OFF"}`;
  }

  async function toggleSilhouetteMode() {
    const cur = window.BirdStorage.getSettings().silhouetteMode;
    await window.BirdStorage.updateSettings({ silhouetteMode: !cur });
    updateSilhouetteButtonText();
    renderPokedex();
    renderDashboard();
  }

  // 野鳥詳細モーダル（お手本×自分の写真の比較・鳴き声再生・見分け方・撮影のコツ・個別マナー）
  function openBirdModal(birdId) {
    const bird = window.BirdStorage.getAllBirds().find(b => b.id === birdId);
    if (!bird) return;

    document.getElementById("modal-bird-dexno").textContent = `No.${bird.dexNo}`;
    document.getElementById("modal-bird-name").textContent = bird.name;
    document.getElementById("modal-bird-family").textContent = `${bird.family || ""} / ${bird.englishName || ""}`;

    const captures = window.BirdStorage.getBirdCaptures(bird.id);
    const bestCap = window.BirdStorage.getBestCapture(bird.id);
    const fallbackSvg = window.BirdStorage.getFallbackBirdSvgDataUrl(bird, false);

    // 出現月バー生成
    let monthBarHtml = `<div class="month-calendar-bar">`;
    for (let m = 1; m <= 12; m++) {
      const present = (bird.months || []).includes(m);
      monthBarHtml += `<div class="month-cell ${present ? 'present' : ''}">${m}月</div>`;
    }
    monthBarHtml += `</div>`;

    // 出現スポットボタン生成
    const allSpots = window.BirdStorage.getAllSpots();
    const spotButtonsHtml = (bird.spots || []).map(sid => {
      const sp = allSpots.find(s => s.id === sid);
      if (!sp) return "";
      return `<button class="btn btn-outline btn-sm" onclick="App.jumpToSpotFromBird('${sp.id}')">📍 ${sp.name}</button>`;
    }).join(" ");

    // スズメ基準（15cm）との大きさ比較バー
    const sizeRatio = Math.min(100, Math.max(12, Math.round((bird.sizeCm / 140) * 100)));

    // 自分の撮影コレクション一覧（複数枚ある場合ベストショット切替可能）
    let myShotsGalleryHtml = "";
    if (captures.length > 0) {
      myShotsGalleryHtml = `
        <div style="margin-top:20px; background:#fffbeb; border:1px solid #fde68a; border-radius:12px; padding:16px;">
          <h4 style="font-size:0.98rem; color:#92400e; margin-bottom:10px;">
            📸 あなたが撮影した「${bird.name}」のコレクション（${captures.length}枚）
          </h4>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(210px, 1fr)); gap:12px;">
            ${captures.map(c => `
              <div style="background:#fff; border:2px solid ${c.isBest ? '#f59e0b' : '#e2e8f0'}; border-radius:10px; overflow:hidden; padding:8px;">
                <img src="${c.dataUrl}" style="width:100%; height:135px; object-fit:contain; background:#0f172a; border-radius:6px;" />
                <div style="font-size:0.76rem; margin-top:6px; font-weight:700; display:flex; justify-content:space-between;">
                  <span>📅 ${c.date || '日付未設定'} ${c.sex === 'male' ? '（♂オス）' : c.sex === 'female' ? '（♀メス）' : ''}</span>
                  <span style="color:#d97706;">★目利き ${c.totalScore || 80}点</span>
                </div>
                <div style="font-size:0.72rem; color:#64748b;">
                  📍 ${c.spotName || '新潟県内'}<br/>
                  📷 ${c.camera || ''} ${c.focalLength || ''} ${c.shutterSpeed || ''}
                </div>
                ${c.memo ? `<div style="font-size:0.74rem; color:#0f172a; margin-top:4px; background:#f8fafc; padding:4px 6px; border-radius:4px;">${c.memo}</div>` : ''}
                <div style="display:flex; gap:6px; margin-top:8px;">
                  ${c.isBest
                    ? `<span style="font-size:0.72rem; background:#f59e0b; color:#fff; padding:3px 8px; border-radius:6px; font-weight:800;">🌟 代表ベストショット</span>`
                    : `<button class="btn btn-outline btn-sm" style="font-size:0.7rem; padding:3px 8px;" onclick="App.makeBestShot('${bird.id}', '${c.id}')">代表写真にする</button>`
                  }
                  <button class="btn btn-outline btn-sm" style="font-size:0.7rem; padding:3px 8px; color:#dc2626; margin-left:auto;" onclick="App.removeShot('${bird.id}', '${c.id}')">削除</button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    // オス・メスで特徴が違う鳥の「♂オス × ♀メス 徹底比較ボックス」
    const activeMaleUrl = bird.userMalePhotoUrl || bird.malePhotoUrl;
    const activeFemaleUrl = bird.userFemalePhotoUrl || bird.femalePhotoUrl;
    const activeMainUrl = bird.userMainPhotoUrl || activeMaleUrl;
    const hasCustomRef = window.BirdStorage.hasCustomRefPhoto(bird.id);
    const hasCustomAudio = window.BirdStorage.hasCustomBirdAudio(bird.id);

    let dimorphismSectionHtml = "";
    if (bird.hasDimorphism) {
      dimorphismSectionHtml = `
        <div style="background:linear-gradient(135deg, #eff6ff 0%, #fdf2f8 100%); border:2px solid #93c5fd; border-radius:14px; padding:16px; margin-bottom:18px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
            <h4 style="font-size:1rem; font-weight:800; color:#1e293b;">
              🚻 「${bird.name}」のオス（♂）とメス（♀）お手本写真＆見分け方比較
            </h4>
            <span style="font-size:0.76rem; background:#fff; padding:3px 10px; border-radius:99px; font-weight:700; color:#475569; border:1px solid #cbd5e1;">
              写真をクリックすると上のメイン比較画面にも反映されます
            </span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:14px;">
            <div style="background:#ffffff; border:2px solid #0284c7; border-radius:10px; overflow:hidden; cursor:pointer;" onclick="App.switchModalRefSex('${bird.id}', 'male')">
              <div style="background:#0284c7; color:#fff; padding:6px 12px; font-size:0.82rem; font-weight:800; display:flex; justify-content:space-between;">
                <span>♂ オス（雄）の特徴</span>
                <span>クリックでメイン表示</span>
              </div>
              <div style="height:190px; background:#0b1320; display:flex; align-items:center; justify-content:center;">
                <img id="modal-dimorph-male-img" src="${activeMaleUrl || fallbackSvg}" alt="${bird.name} オス" style="width:100%; height:100%; object-fit:contain;" />
              </div>
              <p style="padding:10px 12px; font-size:0.83rem; color:#1e293b;">${bird.maleDesc || ''}</p>
            </div>

            <div style="background:#ffffff; border:2px solid #e11d48; border-radius:10px; overflow:hidden; cursor:pointer;" onclick="App.switchModalRefSex('${bird.id}', 'female')">
              <div style="background:#e11d48; color:#fff; padding:6px 12px; font-size:0.82rem; font-weight:800; display:flex; justify-content:space-between;">
                <span>♀ メス（雌）の特徴</span>
                <span>クリックでメイン表示</span>
              </div>
              <div style="height:190px; background:#0b1320; display:flex; align-items:center; justify-content:center;">
                <img id="modal-dimorph-female-img" src="${activeFemaleUrl || fallbackSvg}" alt="${bird.name} メス" style="width:100%; height:100%; object-fit:contain;" />
              </div>
              <p style="padding:10px 12px; font-size:0.83rem; color:#1e293b;">${bird.femaleDesc || ''}</p>
            </div>
          </div>
        </div>
      `;
    }

    const xenoUrl = `https://xeno-canto.org/explore?query=${encodeURIComponent(bird.englishName || bird.name)}`;
    const googleImgUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(bird.name + ' 野鳥 アップ 鮮明')}`;
    const suntorySearchUrl = `https://www.google.com/search?q=${encodeURIComponent('サントリー 日本の鳥百科 ' + bird.name)}`;
    const commonsSearchUrl = `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(bird.englishName || bird.name)}&title=Special:MediaSearch&type=image`;
    const wikiPageUrl = `https://ja.wikipedia.org/wiki/${encodeURIComponent(bird.wikiTitle || bird.name)}`;

    const bodyEl = document.getElementById("modal-bird-body");
    bodyEl.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-bottom:12px;">
        ${getRarityBadgeHtml(bird.rarity)}
        <span class="type-chip">難易度：${bird.difficulty || '初級'}</span>
        <span class="type-chip">${bird.seasonType}</span>
        <span class="type-chip">全長 ${bird.sizeCm}cm</span>
        ${bird.hasDimorphism ? `<span class="type-chip" style="background:#fce7f3; color:#9d174d; border:1px solid #f9a8d4;">🚻 オス・メスで特徴が大きく異なる鳥</span>` : `<span class="type-chip">🚻 オス・メスほぼ同色</span>`}
      </div>

      <!-- お手本写真 × 自分のベストショット 横並び比較アリーナ -->
      <div class="comparison-arena">
        <div class="compare-box">
          <div class="compare-box-header">
            <span id="modal-ref-sex-label">📘 図鑑お手本写真${bird.hasDimorphism ? '（♂ オス）' : ''}${hasCustomRef ? ' ✨カスタム設定中' : ''}</span>
            ${bird.hasDimorphism ? `
              <div style="display:flex; gap:4px;">
                <button type="button" class="sex-btn active-male" onclick="App.switchModalRefSex('${bird.id}', 'male')">♂オス</button>
                <button type="button" class="sex-btn active-female" onclick="App.switchModalRefSex('${bird.id}', 'female')">♀メス</button>
              </div>
            ` : `<span style="font-size:0.72rem; color:#94a3b8;">写真クリックで他候補表示</span>`}
          </div>
          <div class="compare-img-wrap" style="position:relative; cursor:pointer;" title="クリックすると見やすい別カット候補（最大12枚）を表示します" onclick="App.loadCandidateRefPhotos('${bird.id}')">
            <img id="modal-ref-img" src="${activeMainUrl || fallbackSvg}" alt="${bird.name} お手本" />
            <span style="position:absolute; bottom:8px; left:10px; background:rgba(15,23,42,0.82); color:#38bdf8; font-size:0.72rem; font-weight:700; padding:3px 9px; border-radius:6px; border:1px solid rgba(56,189,248,0.4); pointer-events:none;">
              🔍 写真クリックで他の見やすい写真候補を表示・切替
            </span>
          </div>
        </div>

        <div class="compare-box my-best-box">
          <div class="compare-box-header" style="background:rgba(245, 158, 11, 0.22);">
            <span>🏆 あなたのベストショット</span>
            ${bestCap ? `<span style="color:#fbbf24;">GET済！ 目利きスコア ${bestCap.totalScore || 80}点</span>` : `<span style="color:#cbd5e1;">未登録（撮影してGETしよう！）</span>`}
          </div>
          <div class="compare-img-wrap">
            ${bestCap
              ? `<img src="${bestCap.dataUrl}" alt="${bird.name} マイベストショット" />`
              : `<div style="text-align:center; padding:24px; color:#cbd5e1;">
                  <div style="font-size:2.4rem; margin-bottom:8px;">📷</div>
                  <p style="font-size:0.88rem; margin-bottom:12px;">まだ「${bird.name}」のあなたの写真が登録されていません。<br/>撮影できたらここに並べて図鑑を完成させましょう！</p>
                  <button class="btn btn-gold" onclick="App.openCaptureModal('${bird.id}')">📷 撮影した写真を登録してGET！</button>
                </div>`
            }
          </div>
        </div>
      </div>

      <!-- 🖼️ お手本写真の切り替え・別カット検索・他図鑑リンクツールバー -->
      <div style="background:#f8fafc; border:2px solid #cbd5e1; border-radius:12px; padding:12px 14px; margin-bottom:18px;">
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px;">
          <div style="font-size:0.86rem; font-weight:800; color:#0f172a;">
            🖼️ お手本写真が遠い・見にくい時は？ ⇒ 別カット候補から選ぶ・外部図鑑で探して差し替え
          </div>
          <div style="display:flex; align-items:center; gap:6px; font-size:0.78rem;">
            <label for="ref-photo-slot-select" style="font-weight:700; color:#334155;">切替対象：</label>
            <select id="ref-photo-slot-select" style="padding:3px 8px; border-radius:6px; border:1px solid #94a3b8; font-size:0.78rem; font-weight:700; background:#fff;">
              ${bird.hasDimorphism ? `
                <option value="male">♂オス（メイン）のお手本</option>
                <option value="female">♀メスのお手本</option>
                <option value="main">カード一覧共通のお手本</option>
              ` : `
                <option value="main">メインのお手本写真</option>
              `}
            </select>
          </div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
          <button type="button" class="btn btn-primary btn-sm" onclick="App.loadCandidateRefPhotos('${bird.id}')">
            🔍 アプリ内で他の見やすい写真候補（12枚）から選ぶ
          </button>
          <a href="${googleImgUrl}" target="_blank" rel="noopener" class="btn btn-outline btn-sm" title="Google画像検索でアップの写真を探す">
            🔎 Google画像検索で見る ↗
          </a>
          <a href="${suntorySearchUrl}" target="_blank" rel="noopener" class="btn btn-outline btn-sm" title="サントリー日本の鳥百科など外部図鑑を検索">
            📘 他の野鳥図鑑で検索 ↗
          </a>
          <a href="${commonsSearchUrl}" target="_blank" rel="noopener" class="btn btn-outline btn-sm" title="Wikimedia Commonsの高解像度写真集">
            🌐 Wikimedia写真集 ↗
          </a>
          <a href="${wikiPageUrl}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
            📖 Wikipedia ↗
          </a>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-top:8px; padding-top:8px; border-top:1px dashed #cbd5e1;">
          <span style="font-size:0.76rem; color:#475569; font-weight:700;">気に入った写真が見つかったら：</span>
          <label class="btn btn-outline btn-sm" style="cursor:pointer; margin:0;">
            📁 PCに保存した画像とお手本を入れ替え
            <input type="file" accept="image/*" style="display:none;" onchange="App.onUploadCustomRefPhoto('${bird.id}', event)" />
          </label>
          <button type="button" class="btn btn-outline btn-sm" onclick="App.promptCustomRefPhotoUrl('${bird.id}')">
            🔗 画像アドレス（URL）を貼り付けて入れ替え
          </button>
          ${hasCustomRef ? `
            <button type="button" class="btn btn-outline btn-sm" style="color:#dc2626; border-color:#fca5a5;" onclick="App.resetBirdRefPhoto('${bird.id}')">
              ↺ 初期のお手本写真に戻す
            </button>
          ` : ''}
        </div>

        <!-- アプリ内・別カット候補12枚ドロワー -->
        <div id="modal-candidate-photos-drawer" style="display:none; margin-top:12px; background:#0f172a; color:#f8fafc; padding:12px; border-radius:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:0.82rem; font-weight:800; color:#38bdf8;">✨ クリックした写真をすぐにお手本写真としてセットできます</span>
            <button type="button" class="btn btn-ghost-light" style="font-size:0.72rem; padding:2px 8px;" onclick="document.getElementById('modal-candidate-photos-drawer').style.display='none'">✕ 閉じる</button>
          </div>
          <div id="modal-candidate-photos-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(135px, 1fr)); gap:10px;"></div>
        </div>
      </div>

      ${dimorphismSectionHtml}

      <!-- 鳴き声プレイヤー＆音響波形＋自分の音声ファイル差し替え機能 -->
      <div class="audio-player-card">
        <div class="audio-controls-row">
          <div>
            <div style="font-size:0.76rem; color:#34d399; font-weight:800;">
              🔊 本物の野鳥の鳴き声（Xeno-canto Aランク生録音・鳴き声ピーク抽出済）${hasCustomAudio ? ' <span style="background:#f59e0b; color:#fff; padding:1px 7px; border-radius:99px; font-size:0.7rem;">✨カスタム音声設定中</span>' : ''}
            </div>
            <div style="font-size:1.05rem; font-weight:800; margin:2px 0;">「${bird.callText || 'チュン、チュン'}」</div>
            <div style="font-size:0.82rem; color:#cbd5e1;">${bird.callDesc || ''}</div>
          </div>
          <canvas id="modal-wave-canvas" class="waveform-canvas" width="260" height="52"></canvas>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <button class="btn btn-primary btn-sm" id="btn-play-call" onclick="App.playModalBirdCall('${bird.id}')">
              ▶️ 本物の鳴き声を再生（約4秒）
            </button>
            <a href="${xenoUrl}" target="_blank" rel="noopener" class="btn btn-ghost-light" style="font-size:0.72rem; padding:4px 8px;">
              🌍 Xeno-cantoで他個体を探してDL ↗
            </a>
          </div>
        </div>
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px; margin-top:10px; border-top:1px solid #1e293b; padding-top:8px;">
          <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
            <label class="btn btn-ghost-light" style="font-size:0.74rem; padding:4px 10px; cursor:pointer; margin:0; border:1px solid #38bdf8; color:#38bdf8;">
              🎵 Xeno-canto等でDLした音声ファイル（MP3/WAV）に差し替える
              <input type="file" accept="audio/*" style="display:none;" onchange="App.onUploadCustomBirdAudio('${bird.id}', event)" />
            </label>
            ${hasCustomAudio ? `
              <button type="button" class="btn btn-ghost-light" style="font-size:0.72rem; padding:4px 8px; color:#fca5a5; border-color:#f87171;" onclick="App.resetBirdAudio('${bird.id}')">
                ↺ 初期の鳴き声に戻す
              </button>
            ` : ''}
          </div>
          <span style="font-size:0.7rem; color:#fde68a;">
            ⚠️ 現地で野鳥を誘引する大音量再生（プレイバック）は控え、予習やイヤホン確認にご利用ください。
          </span>
        </div>
      </div>

      <!-- 図鑑詳細データグリッド -->
      <div class="dex-info-grid">
        <div class="dex-detail-card">
          <h4>🎨 羽の色・外見の特徴</h4>
          <p>${bird.appearance || ''}</p>
        </div>
        <div class="dex-detail-card">
          <h4>🔍 見分け方の決定打（識別ポイント）</h4>
          <p>${bird.identification || ''}</p>
        </div>
        <div class="dex-detail-card" style="background:#f0fdfa; border-color:#99f6e4;">
          <h4>📸 カメラマン向け・撮影のコツ</h4>
          <p>${bird.photoTips || ''}</p>
          ${bird.recommendedSpec ? `
            <div style="margin-top:8px; font-size:0.78rem; background:#fff; padding:6px 10px; border-radius:6px; border:1px solid #cbd5e1;">
              <strong>推奨設定目安：</strong> 焦点距離 ${bird.recommendedSpec.focalLength} ／ SS ${bird.recommendedSpec.shutterSpeed} ／ 絞り ${bird.recommendedSpec.fStop}
            </div>
          ` : ''}
        </div>
        <div class="dex-detail-card">
          <h4>🌾 新潟市北区・新潟県内での出現傾向</h4>
          <p>${bird.niigataNote || ''}</p>
          <div style="margin-top:8px; font-size:0.8rem;">
            <strong>📏 大きさ：</strong> 全長 約${bird.sizeCm}cm（${bird.sizeCompare || ''}）
            <div style="background:#e2e8f0; height:8px; border-radius:99px; margin-top:4px; overflow:hidden;">
              <div style="background:var(--primary); height:100%; width:${sizeRatio}%;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 新潟での出現月カレンダー＆主な出現スポット -->
      <div class="dex-detail-card" style="margin-bottom:16px;">
        <h4>📅 新潟県での出現シーズン（${bird.seasonType}）＆主な撮影スポット</h4>
        ${monthBarHtml}
        <div style="margin-top:12px; display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
          <span style="font-size:0.8rem; font-weight:700;">マップで確認：</span>
          ${spotButtonsHtml || '<span style="font-size:0.8rem; color:#64748b;">新潟県内各地</span>'}
        </div>
        ${(() => {
          const linkedSpots = (bird.spots || []).map(sid => allSpots.find(s => s.id === sid)).filter(s => s && s.crossLinks);
          if (linkedSpots.length === 0) return "";
          const topSp = linkedSpots[0];
          return `
            <div style="margin-top:12px; background:linear-gradient(135deg, #fffbeb 0%, #fef2f2 100%); border:1px solid #fcd34d; border-radius:10px; padding:10px 12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:6px;">
                <span style="font-size:0.82rem; font-weight:800; color:#991b1b;">
                  ⛩️🌸🏔️ 「${topSp.name.split('（')[0]}」へこの鳥を撮りに行ったら一緒に狙える神社・絶景・花！
                </span>
                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                  <a href="神社仏閣・絶景・花図鑑/index.html?spot=${topSp.id}" class="btn btn-sm" style="background:#991b1b; color:#fff; font-size:0.74rem; padding:3px 10px; text-decoration:none; font-weight:800;">
                    ⛩️🏔️ 神社・絶景図鑑を開く →
                  </a>
                  <a href="四季の花・草木図鑑/index.html?spot=${topSp.id}" class="btn btn-sm" style="background:#db2777; color:#fff; font-size:0.74rem; padding:3px 10px; text-decoration:none; font-weight:800;">
                    🌸 花・草木図鑑を開く →
                  </a>
                </div>
              </div>
              <div style="font-size:0.78rem; color:#451a03; line-height:1.5;">
                <div><strong>⛩️ 神社仏閣：</strong>${topSp.crossLinks.shrines}</div>
                <div><strong>🏔️ 絶景風景：</strong>${topSp.crossLinks.scenery}</div>
                <div><strong>🌸 花・草木：</strong>${topSp.crossLinks.flora}</div>
              </div>
            </div>
          `;
        })()}
      </div>

      <!-- この野鳥を撮るときの個別マナー・注意事項 -->
      <div style="background:#fef2f2; border-left:5px solid #dc2626; padding:12px 16px; border-radius:8px;">
        <h4 style="font-size:0.88rem; color:#991b1b; margin-bottom:4px;">🛡️ 「${bird.name}」を観察・撮影するときのマナーと注意点</h4>
        <p style="font-size:0.84rem; color:#7f1d1d;">${bird.mannerNote || '十分な距離を保ち、野鳥を驚かせないよう静かに観察・撮影しましょう。'}</p>
      </div>

      ${myShotsGalleryHtml}

      <div style="margin-top:18px; display:flex; justify-content:flex-end; gap:10px;">
        <button class="btn btn-gold" onclick="App.openCaptureModal('${bird.id}')">📷 この野鳥の写真を登録する</button>
      </div>
    `;

    // Wikipediaお手本画像の反映（オスメス別画像・ユーザー指定画像がない種のみ）
    if (!bird.userMainPhotoUrl && (!bird.hasDimorphism || !(bird.userMalePhotoUrl || bird.malePhotoUrl))) {
      const refImg = document.getElementById("modal-ref-img");
      window.BirdStorage.fetchWikiPhoto(bird, url => {
        if (url && refImg) refImg.src = url;
      });
    }

    document.getElementById("modal-bird-detail").classList.add("open");
  }

  // アプリ内で「他の見やすいお手本写真候補（最大12枚）」を検索してドロワー表示
  async function loadCandidateRefPhotos(birdId) {
    const bird = window.BirdStorage.getAllBirds().find(b => b.id === birdId);
    if (!bird) return;
    const drawer = document.getElementById("modal-candidate-photos-drawer");
    const grid = document.getElementById("modal-candidate-photos-grid");
    if (!drawer || !grid) return;

    drawer.style.display = "block";
    grid.innerHTML = `<div style="grid-column:1/-1; padding:14px; text-align:center; color:#cbd5e1; font-size:0.84rem;">🔍 「${bird.name}」の鮮明な別カット写真を検索しています...</div>`;

    const candidates = await window.BirdStorage.fetchCandidatePhotos(bird);
    if (!candidates || candidates.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1; padding:14px; text-align:center; color:#fca5a5; font-size:0.84rem;">候補写真の取得に失敗しました。上の「🔎 Google画像検索で見る」から探してURLまたはファイルで差し替えることができます。</div>`;
      return;
    }

    grid.innerHTML = candidates.map((c, idx) => `
      <div style="background:#1e293b; border:2px solid #334155; border-radius:8px; overflow:hidden; cursor:pointer; transition:transform 0.15s, border-color 0.15s;"
           onmouseover="this.style.borderColor='#38bdf8'; this.style.transform='translateY(-2px)'"
           onmouseout="this.style.borderColor='#334155'; this.style.transform='none'"
           onclick="App.selectCandidateRefPhoto('${bird.id}', '${c.url.replace(/'/g, "\\'")}')">
        <div style="height:105px; background:#0b1320; display:flex; align-items:center; justify-content:center;">
          <img src="${c.url}" alt="候補 ${idx + 1}" style="width:100%; height:100%; object-fit:contain;" loading="lazy" />
        </div>
        <div style="padding:4px 6px; font-size:0.7rem; text-align:center; color:#e2e8f0; font-weight:700;">
          👆 ${c.label || `候補 #${idx + 1}`} に切替
        </div>
      </div>
    `).join("");
  }

  // 候補サムネイルをクリックしてお手本写真を即座に切り替え
  async function selectCandidateRefPhoto(birdId, photoUrl) {
    const slotSelect = document.getElementById("ref-photo-slot-select");
    const slot = slotSelect ? slotSelect.value : "main";
    await window.BirdStorage.setCustomRefPhoto(birdId, slot, photoUrl);
    // もし「male」スロットを選んだ場合はカード一覧のメイン表示にも反映されるよう main にも同時セット
    if (slot === "male") {
      await window.BirdStorage.setCustomRefPhoto(birdId, "main", photoUrl);
    }
    openBirdModal(birdId);
    renderPokedex();
    renderDashboard();
  }

  // PCに保存した画像ファイルでお手本写真を差し替え（自動で適切なサイズに圧縮して保存）
  function onUploadCustomRefPhoto(birdId, event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const slotSelect = document.getElementById("ref-photo-slot-select");
    const slot = slotSelect ? slotSelect.value : "main";

    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = async function() {
        const maxDim = 900;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round(h * (maxDim / w)); w = maxDim; }
          else { w = Math.round(w * (maxDim / h)); h = maxDim; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.86);

        await window.BirdStorage.setCustomRefPhoto(birdId, slot, compressedDataUrl);
        if (slot === "male") {
          await window.BirdStorage.setCustomRefPhoto(birdId, "main", compressedDataUrl);
        }
        openBirdModal(birdId);
        renderPokedex();
        renderDashboard();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // 画像アドレス（URL）を直接貼り付けてお手本写真を差し替え
  async function promptCustomRefPhotoUrl(birdId) {
    const slotSelect = document.getElementById("ref-photo-slot-select");
    const slot = slotSelect ? slotSelect.value : "main";
    const slotLabel = slot === "female" ? "♀メス用" : slot === "male" ? "♂オス（メイン）用" : "メイン用";
    const url = prompt(`🔗 差し替えたい「${slotLabel}」のお手本画像のアドレス（URL）を貼り付けてください：\n（※Google画像検索やWikimedia等で右クリック「画像アドレスをコピー」したURLが使えます）`);
    if (!url || !url.trim()) return;
    const cleanUrl = url.trim();
    await window.BirdStorage.setCustomRefPhoto(birdId, slot, cleanUrl);
    if (slot === "male") {
      await window.BirdStorage.setCustomRefPhoto(birdId, "main", cleanUrl);
    }
    openBirdModal(birdId);
    renderPokedex();
    renderDashboard();
  }

  // お手本写真を初期状態にリセット
  async function resetBirdRefPhoto(birdId) {
    if (!confirm("この野鳥のお手本写真を初期設定の写真に戻しますか？")) return;
    await window.BirdStorage.resetCustomRefPhoto(birdId);
    openBirdModal(birdId);
    renderPokedex();
    renderDashboard();
  }

  // ユーザーがXeno-canto等からダウンロードした音声ファイル（MP3/WAV等）に鳴き声を差し替え
  function onUploadCustomBirdAudio(birdId, event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert("音声ファイルが大きすぎます（15MB以下のMP3/WAVファイルを選択してください）。");
      return;
    }
    const reader = new FileReader();
    reader.onload = async function(e) {
      const audioDataUrl = e.target.result;
      await window.BirdStorage.setCustomBirdAudio(birdId, audioDataUrl);
      openBirdModal(birdId);
      // 差し替えた音声をさっそくテスト再生！
      setTimeout(() => {
        playModalBirdCall(birdId);
      }, 150);
    };
    reader.readAsDataURL(file);
  }

  // 鳴き声ファイルを初期設定にリセット
  async function resetBirdAudio(birdId) {
    if (!confirm("この野鳥の鳴き声を初期設定の音声に戻しますか？")) return;
    window.BirdAudioEngine.stopAll();
    await window.BirdStorage.resetCustomBirdAudio(birdId);
    openBirdModal(birdId);
  }

  function closeBirdModal() {
    window.BirdAudioEngine.stopAll();
    document.getElementById("modal-bird-detail").classList.remove("open");
  }

  function playModalBirdCall(birdId) {
    const bird = window.BirdStorage.getAllBirds().find(b => b.id === birdId);
    if (!bird) return;
    const canvas = document.getElementById("modal-wave-canvas");
    const btn = document.getElementById("btn-play-call");
    if (btn) btn.textContent = "⏹️ 再生中（クリックで停止）";
    window.BirdAudioEngine.playBirdCall(bird, canvas, () => {
      if (btn) btn.textContent = "▶️ 本物の鳴き声を再生（約4秒）";
    });
  }

  function jumpToSpotFromBird(spotId) {
    closeBirdModal();
    selectedSpotId = spotId;
    switchTab("map");
    setTimeout(() => {
      window.App.selectSpot(spotId, true);
    }, 150);
  }

  async function makeBestShot(birdId, captureId) {
    await window.BirdStorage.setBestCapture(birdId, captureId);
    openBirdModal(birdId);
    renderPokedex();
    renderDashboard();
    window.App.renderGallery();
  }

  async function removeShot(birdId, captureId) {
    if (!confirm("この撮影記録を削除しますか？")) return;
    await window.BirdStorage.deleteCapture(birdId, captureId);
    updateHeaderStats();
    openBirdModal(birdId);
    renderPokedex();
    renderDashboard();
    window.App.renderGallery();
  }

  return {
    init,
    switchTab,
    selectMonth,
    renderDashboard,
    renderPokedex,
    toggleSilhouetteMode,
    switchCardSex,
    switchModalRefSex,
    openBirdModal,
    loadCandidateRefPhotos,
    selectCandidateRefPhoto,
    onUploadCustomRefPhoto,
    promptCustomRefPhotoUrl,
    resetBirdRefPhoto,
    onUploadCustomBirdAudio,
    resetBirdAudio,
    closeBirdModal,
    playModalBirdCall,
    jumpToSpotFromBird,
    makeBestShot,
    removeShot,
    _getInternalState: () => ({
      get selectedSpotId() { return selectedSpotId; },
      setSelectedSpotId: (id) => { selectedSpotId = id; },
      get mapInstance() { return mapInstance; },
      setMapInstance: (m) => { mapInstance = m; },
      get mapMarkers() { return mapMarkers; },
      setMapMarkers: (ms) => { mapMarkers = ms; },
      get addSpotMode() { return addSpotMode; },
      setAddSpotMode: (v) => { addSpotMode = v; },
      get pendingCaptureData() { return pendingCaptureData; },
      setPendingCaptureData: (d) => { pendingCaptureData = d; },
      updateHeaderStats
    })
  };
})();

// にいがた野鳥図鑑 メインアプリケーションコントローラー (Part 2: マップ・写真目利き登録・ギャラリー・マナー・バックアップ)
(function(App) {
  const st = App._getInternalState();

  // マップの野鳥逆引きセレクトボックス初期化
  App.populateReverseBirdSelect = function() {
    const sel = document.getElementById("map-filter-bird");
    if (!sel) return;
    const birds = window.BirdStorage.getAllBirds();
    sel.innerHTML = `<option value="all">すべての野鳥（逆引きなし）</option>` +
      birds.map(b => `<option value="${b.name}">No.${b.dexNo} ${b.name}</option>`).join("");
  };

  // Leafletマップ初期化（新潟市北区・福島潟周辺を初期中心に設定）
  App.initMapIfNeeded = function() {
    if (st.mapInstance) return;
    const mapEl = document.getElementById("niigata-map");
    if (!mapEl) return;

    if (typeof window.L === "undefined") {
      mapEl.innerHTML = `<div style="padding:30px; text-align:center; color:#475569;">オフライン環境のため地図タイルは非表示ですが、右側のスポット一覧からすべての詳細・出現野鳥・注意事項をご確認いただけます。</div>`;
      return;
    }

    // 初期表示は新潟市北区〜新潟市周辺がしっかり見えるズーム
    // ※ file:// 直開きでも 403 エラーにならない国土地理院タイル＆Cartoタイルを採用（航空写真切替付き！）
    const paleLayer = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", {
      attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院（淡色地図）</a>',
      maxZoom: 18
    });
    const stdLayer = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
      attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院（標準地形図）</a>',
      maxZoom: 18
    });
    const photoLayer = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg", {
      attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院（航空写真）</a>',
      maxZoom: 18
    });
    const cartoLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19
    });

    const map = L.map("niigata-map", {
      center: [37.915, 139.185],
      zoom: 11,
      layers: [paleLayer]
    });

    const baseMaps = {
      "🗺️ 見やすい地図（国土地理院・淡色）": paleLayer,
      "🗾 詳細地形・農道マップ（国土地理院・標準）": stdLayer,
      "🛰️ 航空写真（ヨシ原・森・駐車場を確認）": photoLayer,
      "🌐 ロードマップ（CARTO）": cartoLayer
    };
    L.control.layers(baseMaps, null, { position: "topright", collapsed: false }).addTo(map);

    // マップクリックでマイ撮影ポイントを追加
    map.on("click", async function(e) {
      if (!st.addSpotMode) return;
      const name = prompt("📌 この場所のスポット名を入力してください（例：福島潟・北側農道のマイポイント）:");
      if (!name) return;
      const desc = prompt("📝 ここで撮影した鳥や特徴メモを入力してください（例：早朝にオオヒシクイとノスリがよく来る場所）:") || "";
      const birdsStr = prompt("🐦 ここで見かけた野鳥の名前（カンマ区切り、例：オオヒシクイ, コハクチョウ, カワセミ）:") || "";
      const bList = birdsStr.split(/[,、\s]+/).map(s => s.trim()).filter(Boolean);

      const newSpot = {
        id: "custom_spot_" + Date.now(),
        name: name,
        area: "マイポイント",
        subArea: "ユーザー登録地点",
        isHomeArea: true,
        isCustom: true,
        lat: Number(e.latlng.lat.toFixed(5)),
        lng: Number(e.latlng.lng.toFixed(5)),
        accessFromKita: `緯度 ${e.latlng.lat.toFixed(4)}, 経度 ${e.latlng.lng.toFixed(4)}`,
        parking: "周辺の駐車ルールを確認",
        toilet: "周辺施設を確認",
        bestSeasons: ["春", "夏", "秋", "冬"],
        rating: 5,
        tagline: "あなたが登録したオリジナル撮影ポイント",
        description: desc || "マイ撮影ポイントとして登録した場所です。",
        shootingPoints: [desc || "現地での観察記録"],
        mannerRules: ["農道や私有地への駐車に注意し、野鳥を驚かせない距離から撮影しましょう。"],
        seasonalBirds: {
          spring: bList,
          summer: bList,
          autumn: bList,
          winter: bList
        }
      };

      await window.BirdStorage.addCustomSpot(newSpot);
      App.toggleAddSpotMode(false);
      st.setSelectedSpotId(newSpot.id);
      App.renderMapAndSpots();
      App.selectSpot(newSpot.id, true);
    });

    st.setMapInstance(map);
  };

  App.focusKitaArea = function() {
    if (st.mapInstance) {
      st.mapInstance.setView([37.942, 139.188], 12);
    }
  };

  App.focusAllNiigata = function() {
    if (st.mapInstance) {
      st.mapInstance.setView([37.65, 138.95], 8);
    }
  };

  App.toggleAddSpotMode = function(forceVal) {
    const next = typeof forceVal === "boolean" ? forceVal : !st.addSpotMode;
    st.setAddSpotMode(next);
    const banner = document.getElementById("add-spot-banner");
    const btn = document.getElementById("btn-add-spot-mode");
    if (banner) banner.style.display = next ? "block" : "none";
    if (btn) {
      btn.textContent = next ? "❌ ピン追加モードを終了" : "📍 地図をクリックしてマイ撮影ポイントを追加";
      btn.className = next ? "btn btn-gold btn-sm" : "btn btn-primary btn-sm";
    }
  };

  // マップのピンとスポット一覧の描画
  App.renderMapAndSpots = function() {
    const spots = window.BirdStorage.getAllSpots();
    const areaFilter = document.getElementById("map-filter-area")?.value || "all";
    const seasonFilter = document.getElementById("map-filter-season")?.value || "all";
    const birdFilter = document.getElementById("map-filter-bird")?.value || "all";

    const filtered = spots.filter(sp => {
      if (areaFilter !== "all" && sp.area !== areaFilter) return false;
      if (birdFilter !== "all") {
        const sb = sp.seasonalBirds || {};
        const allSpotBirds = [...(sb.spring || []), ...(sb.summer || []), ...(sb.autumn || []), ...(sb.winter || [])];
        if (!allSpotBirds.some(name => name.includes(birdFilter))) return false;
      }
      if (seasonFilter !== "all") {
        const sb = sp.seasonalBirds || {};
        const list = sb[seasonFilter] || [];
        if (list.length === 0) return false;
      }
      return true;
    });

    // 既存マーカークリア
    if (st.mapInstance && typeof window.L !== "undefined") {
      st.mapMarkers.forEach(m => st.mapInstance.removeLayer(m));
      const newMarkers = [];

      filtered.forEach(sp => {
        const isSelected = sp.id === st.selectedSpotId;
        const color = sp.isCustom ? "#dc2626" : sp.area === "新潟市北区" ? "#f59e0b" : "#0f766e";
        const size = isSelected ? 36 : 28;
        const iconHtml = `
          <div style="
            width:${size}px;
            height:${size}px;
            background:${color};
            color:#fff;
            border:${isSelected ? '3.5px solid #fef08a' : '2.5px solid #fff'};
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:${isSelected ? '16px' : '13px'};
            font-weight:800;
            box-shadow:${isSelected ? '0 0 0 4px rgba(245,158,11,0.45), 0 4px 12px rgba(0,0,0,0.4)' : '0 3px 8px rgba(0,0,0,0.32)'};
            transition:transform 0.15s;
          ">
            ${sp.isCustom ? '📌' : sp.area === '新潟市北区' ? '★' : '🐦'}
          </div>
        `;
        const divIcon = L.divIcon({
          html: iconHtml,
          className: "custom-spot-pin",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2]
        });

        const marker = L.marker([sp.lat, sp.lng], {
          icon: divIcon,
          zIndexOffset: isSelected ? 1000 : (sp.area === "新潟市北区" ? 500 : 0)
        }).addTo(st.mapInstance);

        marker.bindTooltip(`<strong>${sp.name}</strong><br/><span style="font-size:11px;color:#475569;">${sp.area}</span>`, {
          direction: "top",
          offset: [0, -14],
          permanent: isSelected
        });

        marker.on("click", () => {
          App.selectSpot(sp.id, false);
        });
        newMarkers.push(marker);
      });

      st.setMapMarkers(newMarkers);
    }

    // 右側リスト描画
    const listEl = document.getElementById("spot-list-container");
    if (listEl) {
      if (filtered.length === 0) {
        listEl.innerHTML = `<div style="background:#fff; padding:20px; border-radius:12px; text-align:center; color:#64748b;">該当するスポットがありません。フィルターを戻してみてください。</div>`;
      } else {
        listEl.innerHTML = filtered.map(sp => {
          const isSelected = sp.id === st.selectedSpotId;
          const isKita = sp.area === "新潟市北区";
          const sb = sp.seasonalBirds || {};
          const previewBirds = Array.from(new Set([...(sb.winter || []), ...(sb.spring || []), ...(sb.summer || []), ...(sb.autumn || [])])).slice(0, 6);

          return `
            <div class="spot-card ${isSelected ? 'active' : ''} ${isKita ? 'home-spot' : ''}" onclick="App.selectSpot('${sp.id}', true)">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span class="spot-area-badge ${isKita ? 'kita' : ''}">${isKita ? '★ホーム：新潟市北区' : sp.area + ' / ' + (sp.subArea || '')}</span>
                <span style="font-size:0.75rem; color:#f59e0b; font-weight:800;">${"★".repeat(sp.rating || 4)}</span>
              </div>
              <h4 style="font-size:1rem; font-weight:800; color:#0f172a; margin-bottom:4px;">${sp.name}</h4>
              <p style="font-size:0.78rem; color:var(--primary); font-weight:700; margin-bottom:6px;">${sp.tagline || ''}</p>
              <div style="font-size:0.74rem; color:#64748b; margin-bottom:6px;">🚗 北区からの目安: ${sp.accessFromKita || ''}</div>
              <div style="display:flex; flex-wrap:wrap; gap:4px;">
                ${previewBirds.map(bn => `<span class="type-chip" style="font-size:0.68rem;">🐦 ${bn}</span>`).join("")}
              </div>
            </div>
          `;
        }).join("");
      }
    }

    // 詳細パネル描画
    const targetId = filtered.some(s => s.id === st.selectedSpotId)
      ? st.selectedSpotId
      : (filtered[0] ? filtered[0].id : st.selectedSpotId);
    if (targetId) {
      App.renderSelectedSpotDetail(targetId);
    }
  };

  App.selectSpot = function(spotId, panToMap) {
    st.setSelectedSpotId(spotId);
    const sp = window.BirdStorage.getAllSpots().find(s => s.id === spotId);
    if (sp && panToMap && st.mapInstance) {
      st.mapInstance.setView([sp.lat, sp.lng], 13, { animate: true });
    }
    App.renderMapAndSpots();
  };

  App.renderSelectedSpotDetail = function(spotId) {
    const sp = window.BirdStorage.getAllSpots().find(s => s.id === spotId);
    const detailEl = document.getElementById("selected-spot-detail");
    if (!sp || !detailEl) return;

    const allBirds = window.BirdStorage.getAllBirds();
    const renderBirdLinks = (names) => {
      return (names || []).map(name => {
        const cleanName = name.replace(/（.*?）/g, "");
        const matched = allBirds.find(b => b.name === cleanName);
        if (matched) {
          const isGet = window.BirdStorage.isBirdCaptured(matched.id);
          return `<button class="btn ${isGet ? 'btn-gold' : 'btn-outline'} btn-sm" style="padding:3px 9px; font-size:0.76rem;" onclick="App.openBirdModal('${matched.id}')">${isGet ? '🏆' : '🐦'} ${name}</button>`;
        }
        return `<span class="type-chip">${name}</span>`;
      }).join(" ");
    };

    const sb = sp.seasonalBirds || {};
    detailEl.innerHTML = `
      <div style="background:#ffffff; border:2px solid var(--primary); border-radius:var(--radius-lg); padding:20px; box-shadow:var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
          <div>
            <span class="spot-area-badge ${sp.area === '新潟市北区' ? 'kita' : ''}">${sp.area}（${sp.subArea || ''}）</span>
            <h3 style="font-size:1.25rem; font-weight:800; margin-top:4px;">📍 ${sp.name}</h3>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-gold btn-sm" onclick="App.openCaptureModal(null, '${sp.id}')">📷 このスポットで撮った写真を登録</button>
            ${sp.isCustom ? `<button class="btn btn-outline btn-sm" style="color:#dc2626;" onclick="App.removeCustomSpot('${sp.id}')">削除</button>` : ''}
          </div>
        </div>

        <p style="font-size:0.9rem; color:#334155; margin-bottom:14px;">${sp.description || ''}</p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px; background:#f8fafc; padding:12px; border-radius:10px; font-size:0.82rem; margin-bottom:14px;">
          <div><strong>🚗 北区からのアクセス：</strong><br/>${sp.accessFromKita || '-'}</div>
          <div><strong>🅿️ 駐車場：</strong><br/>${sp.parking || '-'}</div>
          <div><strong>🚻 トイレ・設備：</strong><br/>${sp.toilet || '-'}</div>
        </div>

        <div style="margin-bottom:14px;">
          <h4 style="font-size:0.92rem; color:var(--primary-dark); margin-bottom:6px;">🎯 おすすめ撮影ポイント・狙い方</h4>
          <ul style="padding-left:20px; font-size:0.85rem; color:#334155;">
            ${(sp.shootingPoints || []).map(pt => `<li style="margin-bottom:4px;">${pt}</li>`).join("")}
          </ul>
        </div>

        <div style="margin-bottom:14px;">
          <h4 style="font-size:0.92rem; color:var(--primary-dark); margin-bottom:8px;">📅 季節別・このスポットで出会える野鳥（クリックで図鑑＆鳴き声へ）</h4>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px;">
            <div style="background:#f0fdf4; padding:10px; border-radius:8px;">
              <div style="font-size:0.78rem; font-weight:800; color:#15803d; margin-bottom:6px;">🌸 春（3〜5月）</div>
              <div style="display:flex; flex-wrap:wrap; gap:5px;">${renderBirdLinks(sb.spring)}</div>
            </div>
            <div style="background:#ecfeff; padding:10px; border-radius:8px;">
              <div style="font-size:0.78rem; font-weight:800; color:#0369a1; margin-bottom:6px;">🌿 夏（6〜8月）</div>
              <div style="display:flex; flex-wrap:wrap; gap:5px;">${renderBirdLinks(sb.summer)}</div>
            </div>
            <div style="background:#fffbeb; padding:10px; border-radius:8px;">
              <div style="font-size:0.78rem; font-weight:800; color:#b45309; margin-bottom:6px;">🍁 秋（9〜10月）</div>
              <div style="display:flex; flex-wrap:wrap; gap:5px;">${renderBirdLinks(sb.autumn)}</div>
            </div>
            <div style="background:#eff6ff; padding:10px; border-radius:8px;">
              <div style="font-size:0.78rem; font-weight:800; color:#1d4ed8; margin-bottom:6px;">⛄ 冬（11〜2月）</div>
              <div style="display:flex; flex-wrap:wrap; gap:5px;">${renderBirdLinks(sb.winter)}</div>
            </div>
          </div>
        </div>

        <!-- 姉妹アプリ連動：このスポット周辺で一緒に撮れる神社仏閣・絶景・花や草木ガイド -->
        ${sp.crossLinks ? `
          <div style="background:linear-gradient(135deg, #fffbeb 0%, #fef2f2 100%); border:2px solid #f59e0b; border-radius:12px; padding:16px; margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
              <div>
                <span style="font-size:0.72rem; background:#991b1b; color:#fef08a; padding:2px 8px; border-radius:99px; font-weight:800;">3部作アプリ連動ナビ</span>
                <h4 style="font-size:1rem; font-weight:800; color:#78350f; margin-top:3px;">
                  ⛩️🌸🏔️ 「${sp.name.split('（')[0]}」周辺で野鳥と一緒に撮れる神社仏閣・絶景・珍しい花草木
                </h4>
              </div>
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <a href="神社仏閣・絶景・花図鑑/index.html?spot=${sp.id}" class="btn btn-sm" style="background:linear-gradient(135deg, #991b1b 0%, #b45309 100%); color:#fff; border:1px solid #fcd34d; font-weight:800; text-decoration:none; padding:6px 12px;">
                  ⛩️🏔️ この場所の神社・絶景図鑑 →
                </a>
                <a href="四季の花・草木図鑑/index.html?spot=${sp.id}" class="btn btn-sm" style="background:linear-gradient(135deg, #db2777 0%, #15803d 100%); color:#fff; border:1px solid #fbcfe8; font-weight:800; text-decoration:none; padding:6px 12px;">
                  🌸 この場所の花・草木図鑑 →
                </a>
              </div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:10px; font-size:0.83rem;">
              <div style="background:#fff; padding:10px 12px; border-radius:8px; border-left:4px solid #dc2626;">
                <div style="font-weight:800; color:#991b1b; margin-bottom:4px;">⛩️ 周辺の神社仏閣・歴史建築</div>
                <div style="color:#1e293b;">${sp.crossLinks.shrines}</div>
              </div>
              <div style="background:#fff; padding:10px 12px; border-radius:8px; border-left:4px solid #0284c7;">
                <div style="font-weight:800; color:#0369a1; margin-bottom:4px;">🏔️ ここからの絶景・日本の原風景</div>
                <div style="color:#1e293b;">${sp.crossLinks.scenery}</div>
              </div>
              <div style="background:#fff; padding:10px 12px; border-radius:8px; border-left:4px solid #16a34a;">
                <div style="font-weight:800; color:#15803d; margin-bottom:4px;">🌸 珍しい花・草木・季節の植物</div>
                <div style="color:#1e293b;">${sp.crossLinks.flora}</div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- スポット固有のマナー・注意事項 -->
        <div style="background:#fef2f2; border-left:5px solid #dc2626; padding:12px 16px; border-radius:8px;">
          <h4 style="font-size:0.88rem; color:#991b1b; margin-bottom:6px;">🛡️ 「${sp.name}」での撮影マナー・注意事項（必読）</h4>
          <ul style="padding-left:20px; font-size:0.83rem; color:#7f1d1d;">
            ${(sp.mannerRules || []).map(r => `<li style="margin-bottom:3px;">${r}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;
  };

  App.removeCustomSpot = async function(spotId) {
    if (!confirm("このマイ撮影ポイントを削除しますか？")) return;
    await window.BirdStorage.deleteCustomSpot(spotId);
    st.setSelectedSpotId("fukushimagata");
    App.renderMapAndSpots();
  };

  // ==================== 写真登録＆「写真目利き」モーダル処理 ====================
  App.openCaptureModal = function(preselectBirdId, preselectSpotId) {
    const birds = window.BirdStorage.getAllBirds();
    const spots = window.BirdStorage.getAllSpots();

    const birdSel = document.getElementById("cap-bird-id");
    birdSel.innerHTML = birds.map(b =>
      `<option value="${b.id}" ${b.id === preselectBirdId ? 'selected' : ''}>No.${b.dexNo} ${b.name}（${b.seasonType}）</option>`
    ).join("");

    const spotSel = document.getElementById("cap-spot-id");
    spotSel.innerHTML = spots.map(s =>
      `<option value="${s.id}" ${s.id === preselectSpotId ? 'selected' : ''}>[${s.area}] ${s.name}</option>`
    ).join("") + `<option value="other">その他（新潟県内・自宅周辺など）</option>`;

    document.getElementById("cap-date").value = new Date().toISOString().slice(0, 10);
    document.getElementById("cap-file-input").value = "";
    document.getElementById("cap-preview-wrap").style.display = "none";
    document.getElementById("cap-connoisseur-report").style.display = "none";
    document.getElementById("cap-memo").value = "";
    st.setPendingCaptureData(null);

    App.updateCaptureTotalScore();
    document.getElementById("modal-capture").classList.add("open");
  };

  App.closeCaptureModal = function() {
    document.getElementById("modal-capture").classList.remove("open");
  };

  App.onCaptureBirdChange = function() {
    const fileInput = document.getElementById("cap-file-input");
    if (fileInput && fileInput.files && fileInput.files[0]) {
      App.onPhotoFileSelected({ target: fileInput });
    }
  };

  App.onPhotoFileSelected = async function(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const birdId = document.getElementById("cap-bird-id").value;
    const bird = window.BirdStorage.getAllBirds().find(b => b.id === birdId);

    try {
      const result = await window.ExifAndPhotoAnalyzer.processAndAnalyzeImage(file, bird);
      st.setPendingCaptureData(result);

      // プレビュー表示
      const prevWrap = document.getElementById("cap-preview-wrap");
      const prevImg = document.getElementById("cap-preview-img");
      prevImg.src = result.dataUrl;
      prevWrap.style.display = "block";

      // EXIF自動入力
      const ex = result.exif || {};
      if (ex.date) document.getElementById("cap-date").value = ex.date;
      if (ex.camera) document.getElementById("cap-camera").value = ex.camera;
      if (ex.focalLength || ex.lens) {
        document.getElementById("cap-focal").value = [ex.lens, ex.focalLength].filter(Boolean).join(" / ");
      }
      if (ex.shutterSpeed) document.getElementById("cap-shutter").value = ex.shutterSpeed;
      if (ex.fStop || ex.iso) {
        document.getElementById("cap-fstop-iso").value = [ex.fStop, ex.iso ? `ISO${ex.iso}` : ""].filter(Boolean).join(" / ");
      }

      // 推奨セルフスコア反映
      if (result.analysis && result.analysis.suggestedScores) {
        const sc = result.analysis.suggestedScores;
        document.getElementById("score-focus").value = sc.focus;
        document.getElementById("score-comp").value = sc.composition;
        document.getElementById("score-moment").value = sc.moment;
        document.getElementById("score-light").value = sc.light;
        document.getElementById("score-manner").value = sc.manner;
        App.updateCaptureTotalScore();
      }

      // 写真目利き自動解析レポート表示
      const repEl = document.getElementById("cap-connoisseur-report");
      const an = result.analysis;
      repEl.style.display = "block";
      repEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; margin-bottom:8px;">
          <strong style="color:#0f766e; font-size:0.92rem;">🔍 写真目利きエンジン・自動解析レポート</strong>
          <span style="font-size:0.76rem; color:#475569;">
            平均輝度: ${an.avgLum}/255 ｜ コントラスト: ${an.contrast} ｜ 中央解像指数: ${an.sharpnessIndex}
          </span>
        </div>
        ${(an.tips || []).map(t => `
          <div class="tip-alert ${t.type}">
            <strong>${t.label}：</strong> ${t.text}
          </div>
        `).join("")}
      `;
    } catch (err) {
      alert("画像の読み込みに失敗しました。別の画像ファイルでお試しください。");
    }
  };

  App.updateCaptureTotalScore = function() {
    const s1 = Number(document.getElementById("score-focus")?.value || 4);
    const s2 = Number(document.getElementById("score-comp")?.value || 4);
    const s3 = Number(document.getElementById("score-moment")?.value || 4);
    const s4 = Number(document.getElementById("score-light")?.value || 4);
    const s5 = Number(document.getElementById("score-manner")?.value || 5);
    const total = (s1 + s2 + s3 + s4 + s5) * 4; // 100点満点
    const badge = document.getElementById("cap-total-score-badge");
    if (badge) badge.textContent = `総合 ${total}点 / 100点`;
    return { s1, s2, s3, s4, s5, total };
  };

  App.submitCaptureForm = async function(event) {
    event.preventDefault();
    const birdId = document.getElementById("cap-bird-id").value;
    const spotId = document.getElementById("cap-spot-id").value;
    const bird = window.BirdStorage.getAllBirds().find(b => b.id === birdId);
    const spot = window.BirdStorage.getAllSpots().find(s => s.id === spotId);

    const pending = st.pendingCaptureData;
    if (!pending || !pending.dataUrl) {
      alert("📁 先に撮影した野鳥の写真ファイルを選択してください！");
      return;
    }

    const scoreObj = App.updateCaptureTotalScore();
    const captureRecord = {
      id: "cap_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      birdId: birdId,
      sex: document.getElementById("cap-sex")?.value || "unspecified",
      dataUrl: pending.dataUrl,
      date: document.getElementById("cap-date").value,
      spotId: spotId,
      spotName: spot ? spot.name : "新潟県内",
      camera: document.getElementById("cap-camera").value.trim(),
      focalLength: document.getElementById("cap-focal").value.trim(),
      shutterSpeed: document.getElementById("cap-shutter").value.trim(),
      fStopIso: document.getElementById("cap-fstop-iso").value.trim(),
      memo: document.getElementById("cap-memo").value.trim(),
      scores: {
        focus: scoreObj.s1,
        composition: scoreObj.s2,
        moment: scoreObj.s3,
        light: scoreObj.s4,
        manner: scoreObj.s5
      },
      totalScore: scoreObj.total,
      isBest: document.getElementById("cap-is-best").checked,
      analysis: pending.analysis || null,
      createdAt: new Date().toISOString()
    };

    await window.BirdStorage.addCapture(birdId, captureRecord);
    App.closeCaptureModal();
    st.updateHeaderStats();
    App.renderDashboard();
    App.renderPokedex();
    App.renderGallery();

    // 「〇〇をゲットだぜ！」トースト演出＆詳細モーダルオープン
    App.showGetToast(bird ? bird.name : "野鳥", scoreObj.total);
    if (bird) {
      setTimeout(() => {
        App.openBirdModal(bird.id);
      }, 350);
    }
  };

  App.showGetToast = function(birdName, score) {
    const toast = document.getElementById("get-toast");
    document.getElementById("get-toast-title").textContent = `「${birdName}」をゲットだぜ！`;
    document.getElementById("get-toast-sub").textContent = `図鑑にお手本と並べて登録されました！（目利きスコア: ${score}点）`;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 4500);
  };

  // ==================== 写真目利き＆マイギャラリータブ ====================
  App.renderGallery = function() {
    const birds = window.BirdStorage.getAllBirds();
    const allShots = [];
    birds.forEach(b => {
      const caps = window.BirdStorage.getBirdCaptures(b.id);
      caps.forEach(c => {
        allShots.push({ bird: b, cap: c });
      });
    });

    allShots.sort((a, b) => (b.cap.date || "").localeCompare(a.cap.date || ""));

    const statsBar = document.getElementById("gallery-stats-bar");
    const container = document.getElementById("gallery-container");
    if (!container) return;

    if (allShots.length === 0) {
      if (statsBar) statsBar.innerHTML = `<span>まだ登録された写真がありません。「📷 新しい写真を登録する」から最初の1枚（スズメやハクチョウ、カモでもOK！）を登録してみましょう！</span>`;
      container.innerHTML = `
        <div style="background:#ffffff; border-radius:16px; padding:40px; text-align:center; border:2px dashed #cbd5e1;">
          <div style="font-size:3rem; margin-bottom:10px;">📸</div>
          <h3 style="margin-bottom:8px;">あなたの野鳥フォトコレクションを始めましょう！</h3>
          <p style="font-size:0.9rem; color:#64748b; margin-bottom:18px;">
            これまでに撮ったスズメ・ツバメ・ハクチョウ・カモの写真があれば、今すぐ登録して最初の図鑑ページを「GET!」にできます！
          </p>
          <button class="btn btn-gold" onclick="App.openCaptureModal()">📷 最初の写真を登録してGETする</button>
        </div>
      `;
      return;
    }

    const avgScore = Math.round(allShots.reduce((acc, x) => acc + (x.cap.totalScore || 80), 0) / allShots.length);
    if (statsBar) {
      statsBar.innerHTML = `
        <div><strong>📸 総登録枚数：</strong> ${allShots.length}枚</div>
        <div><strong>🏆 GET達成種数：</strong> ${birds.filter(b => window.BirdStorage.isBirdCaptured(b.id)).length}種</div>
        <div><strong>👑 平均目利きスコア：</strong> <span style="color:#d97706; font-weight:800;">${avgScore}点 / 100点</span></div>
      `;
    }

    container.innerHTML = `
      <div class="bird-grid">
        ${allShots.map(({ bird, cap }) => `
          <div class="bird-card ${cap.isBest ? 'captured' : ''}" onclick="App.openBirdModal('${bird.id}')">
            <div class="bird-card-top">
              <span class="dex-no-badge">No.${bird.dexNo} ${bird.name}</span>
              <span class="get-status-badge ${cap.isBest ? 'is-get' : 'not-get'}">
                ${cap.isBest ? '🌟 代表ベストショット' : 'コレクション'} (${cap.totalScore || 80}点)
              </span>
              <img class="card-img-single" src="${cap.dataUrl}" alt="${bird.name}" />
            </div>
            <div class="bird-card-body">
              <div style="font-size:0.8rem; font-weight:700; color:#0f766e; margin-bottom:4px;">
                📍 ${cap.spotName || '新潟県内'} （📅 ${cap.date || '-'}）
              </div>
              <div style="font-size:0.76rem; color:#475569; margin-bottom:6px;">
                📷 ${[cap.camera, cap.focalLength, cap.shutterSpeed, cap.fStopIso].filter(Boolean).join(" / ") || "EXIF記録なし"}
              </div>
              ${cap.memo ? `<p style="font-size:0.8rem; background:#f8fafc; padding:6px 8px; border-radius:6px; color:#1e293b;">${cap.memo}</p>` : ''}
            </div>
          </div>
        `).join("")}
      </div>
    `;
  };

  // ==================== マナー＆ルール道場タブ ====================
  App.renderManners = function() {
    const data = window.NIIGATA_MANNERS;
    if (!data) return;

    // チェックリスト描画
    const chkState = window.BirdStorage.getChecklist();
    const chkWrap = document.getElementById("manner-checklist-container");
    if (chkWrap) {
      let checkedCount = 0;
      chkWrap.innerHTML = data.checklist.map(item => {
        const isChecked = !!chkState[item.id];
        if (isChecked) checkedCount++;
        return `
          <label style="background:rgba(255,255,255,0.12); border:1px solid ${isChecked ? '#fbbf24' : 'rgba(255,255,255,0.25)'}; padding:10px 14px; border-radius:10px; display:flex; align-items:flex-start; gap:10px; cursor:pointer; font-size:0.85rem;">
            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="App.onToggleChecklist('${item.id}', this.checked)" style="margin-top:4px; transform:scale(1.2);" />
            <span>${item.text}</span>
          </label>
        `;
      }).join("");

      const prog = document.getElementById("manner-check-progress");
      if (prog) {
        prog.textContent = checkedCount === data.checklist.length
          ? `👑 ${checkedCount} / ${data.checklist.length} 完璧！出撃準備OK！`
          : `${checkedCount} / ${data.checklist.length} 達成`;
      }
    }

    // 章別ガイド描画
    const chapWrap = document.getElementById("manner-chapters-container");
    if (chapWrap) {
      chapWrap.innerHTML = data.chapters.map(ch => `
        <div class="manner-chapter-card">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
            <span style="font-size:1.6rem;">${ch.icon}</span>
            <div>
              <span style="font-size:0.74rem; background:#e6f4ea; color:#0f766e; padding:2px 8px; border-radius:99px; font-weight:800;">${ch.badge}</span>
              <h3 style="font-size:1.15rem; font-weight:800; color:#0f172a;">${ch.title}</h3>
            </div>
          </div>
          <p style="font-size:0.88rem; color:#475569;">${ch.summary}</p>
          <div class="manner-point-grid">
            ${ch.points.map(pt => `
              <div class="manner-point-item">
                <h4 style="font-size:0.9rem; color:#0f766e; margin-bottom:6px;">✔ ${pt.heading}</h4>
                <p style="font-size:0.83rem; color:#334155;">${pt.body}</p>
              </div>
            `).join("")}
          </div>
        </div>
      `).join("");
    }

    // ケーススタディ描画
    const scenWrap = document.getElementById("manner-scenarios-container");
    if (scenWrap) {
      scenWrap.innerHTML = data.scenarios.map(sc => `
        <div style="background:#ffffff; border-radius:14px; padding:18px; margin-bottom:14px; box-shadow:var(--shadow-sm); border:1px solid #e2e8f0;">
          <h4 style="font-size:0.96rem; font-weight:800; margin-bottom:10px; color:#0f172a;">💬 ${sc.q}</h4>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px;">
            <div style="background:#f0fdf4; border-left:4px solid #22c55e; padding:10px 12px; border-radius:8px; font-size:0.84rem;">
              <strong style="color:#15803d;">⭕ 一流カメラマンの行動：</strong><br/>${sc.good}
            </div>
            <div style="background:#fef2f2; border-left:4px solid #ef4444; padding:10px 12px; border-radius:8px; font-size:0.84rem;">
              <strong style="color:#b91c1c;">❌ やってはいけないNG行動：</strong><br/>${sc.bad}
            </div>
          </div>
        </div>
      `).join("");
    }
  };

  App.onToggleChecklist = async function(chkId, checked) {
    await window.BirdStorage.toggleChecklist(chkId, checked);
    App.renderManners();
  };

  // ==================== カスタム野鳥追加＆バックアップ処理 ====================
  App.openAddBirdModal = function() {
    document.getElementById("modal-add-bird").classList.add("open");
  };

  App.closeAddBirdModal = function() {
    document.getElementById("modal-add-bird").classList.remove("open");
  };

  App.submitAddBird = async function(event) {
    event.preventDefault();
    const birds = window.BirdStorage.getAllBirds();
    const nextNo = String(birds.length + 1).padStart(3, "0");
    const name = document.getElementById("new-bird-name").value.trim();
    const kana = document.getElementById("new-bird-kana").value.trim();
    const season = document.getElementById("new-bird-season").value;
    const type = document.getElementById("new-bird-type").value;
    const catchphrase = document.getElementById("new-bird-catch").value.trim() || "新潟で出会った特別な野鳥";
    const desc = document.getElementById("new-bird-desc").value.trim() || "自分で図鑑に追加した野鳥です。";

    const monthsMap = {
      "留鳥": [1,2,3,4,5,6,7,8,9,10,11,12],
      "冬鳥": [10,11,12,1,2,3],
      "夏鳥": [4,5,6,7,8,9],
      "旅鳥": [4,5,9,10]
    };

    const newBird = {
      id: "custom_bird_" + Date.now(),
      dexNo: nextNo,
      name,
      kana,
      englishName: name,
      family: "ユーザー追加種",
      catchphrase,
      types: [type, season],
      seasonType: season,
      months: monthsMap[season] || [1,2,3,4,5,6,7,8,9,10,11,12],
      rarity: 3,
      difficulty: "中級",
      sizeCm: 16,
      sizeCompare: "スズメ〜ハトサイズ",
      wikiTitle: name,
      habitat: "新潟県内フィールド",
      spots: ["fukushimagata", "kaibenomori"],
      niigataNote: desc,
      appearance: desc,
      identification: desc,
      photoTips: "野鳥の警戒サインに注意しながら、目にピントを合わせて撮影しましょう。",
      recommendedSpec: { focalLength: "300mm〜600mm", shutterSpeed: "1/800秒以上", fStop: "F5.6〜F8", minShutterSec: 0.00125 },
      mannerNote: "野鳥との距離を十分に保ち、周囲の環境に配慮して撮影しましょう。",
      callText: "固有の鳴き声",
      callDesc: "WikipediaやXeno-cantoでも鳴き声を確認できます。",
      synthType: "chirp_short",
      synthFreq: [3200, 4000],
      isCustom: true
    };

    await window.BirdStorage.addCustomBird(newBird);
    App.closeAddBirdModal();
    App.populateReverseBirdSelect();
    st.updateHeaderStats();
    App.renderPokedex();
    App.renderDashboard();
  };

  App.openBackupModal = function() {
    document.getElementById("modal-backup").classList.add("open");
  };

  App.closeBackupModal = function() {
    document.getElementById("modal-backup").classList.remove("open");
  };

  App.downloadBackup = function() {
    const json = window.BirdStorage.exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `niigata-bird-dex-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  App.uploadBackup = function(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        await window.BirdStorage.importAllData(e.target.result);
        alert("🎉 図鑑データの読み込み（復元）が完了しました！");
        App.closeBackupModal();
        st.updateHeaderStats();
        App.renderDashboard();
        App.renderPokedex();
        App.renderGallery();
        App.renderManners();
      } catch (err) {
        alert("バックアップファイルの形式が正しくありません。");
      }
    };
    reader.readAsText(file);
  };

})(window.App);

// DOMContentLoaded でアプリ起動
window.addEventListener("DOMContentLoaded", () => {
  window.App.init();
});
