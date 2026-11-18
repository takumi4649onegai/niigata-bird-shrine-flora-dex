// IndexedDB ストレージ管理＆バックアップ出力/読込＆お手本写真・鳴き声のカスタム差し替え・候補検索
window.BirdStorage = (function() {
  const DB_NAME = "NiigataBirdDexDB";
  const DB_VERSION = 1;
  let dbInstance = null;

  // メモリキャッシュ
  let state = {
    captures: {},         // { [birdId]: [ { id, birdId, dataUrl, ... } ] }
    customSpots: [],      // [ { id, name, ... } ]
    customBirds: [],      // [ { id, dexNo, name, ... } ]
    checklist: {},        // { chk1: true, ... }
    wikiPhotos: {},       // { [wikiTitle]: imageUrl }
    customRefPhotos: {},  // { [birdId]: { main: url, male: url, female: url } } ユーザーが差し替えたお手本写真
    customAudio: {},      // { [birdId]: dataUrl } ユーザーが差し替えた鳴き声音声
    settings: {
      silhouetteMode: false
    }
  };

  function openDB() {
    if (dbInstance) return Promise.resolve(dbInstance);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function(e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("kv")) {
          db.createObjectStore("kv");
        }
      };
      req.onsuccess = function(e) {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };
      req.onerror = function(e) {
        reject(e.target.error);
      };
    });
  }

  async function dbGet(key) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction("kv", "readonly");
        const store = tx.objectStore("kv");
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      const raw = localStorage.getItem("nbd_" + key);
      return raw ? JSON.parse(raw) : undefined;
    }
  }

  async function dbSet(key, val) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction("kv", "readwrite");
        const store = tx.objectStore("kv");
        const req = store.put(val, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      try {
        localStorage.setItem("nbd_" + key, JSON.stringify(val));
      } catch (_) {}
    }
  }

  async function init() {
    const savedCaptures = await dbGet("captures");
    const savedSpots = await dbGet("customSpots");
    const savedBirds = await dbGet("customBirds");
    const savedChecklist = await dbGet("checklist");
    const savedWiki = await dbGet("wikiPhotos");
    const savedCustomRef = await dbGet("customRefPhotos");
    const savedCustomAudio = await dbGet("customAudio");
    const savedSettings = await dbGet("settings");

    if (savedCaptures) state.captures = savedCaptures;
    if (savedSpots) state.customSpots = savedSpots;
    if (savedBirds) state.customBirds = savedBirds;
    if (savedChecklist) state.checklist = savedChecklist;
    if (savedWiki) state.wikiPhotos = savedWiki;
    if (savedCustomRef) state.customRefPhotos = savedCustomRef;
    if (savedCustomAudio) state.customAudio = savedCustomAudio;
    if (savedSettings) state.settings = { ...state.settings, ...savedSettings };

    return state;
  }

  // 全野鳥リスト（標準＋ユーザー追加）にユーザーのカスタムお手本写真・音声を反映して返す
  function getAllBirds() {
    const all = [...window.NIIGATA_BIRDS, ...state.customBirds];
    all.forEach(b => {
      const cr = state.customRefPhotos[b.id];
      if (cr) {
        if (cr.main) b.userMainPhotoUrl = cr.main;
        if (cr.male) b.userMalePhotoUrl = cr.male;
        if (cr.female) b.userFemalePhotoUrl = cr.female;
      } else {
        delete b.userMainPhotoUrl;
        delete b.userMalePhotoUrl;
        delete b.userFemalePhotoUrl;
      }
      if (state.customAudio[b.id]) {
        b.customAudioUrl = state.customAudio[b.id];
      } else {
        delete b.customAudioUrl;
      }
    });
    return all;
  }

  function getAllSpots() {
    return [...window.NIIGATA_SPOTS, ...state.customSpots];
  }

  function getBirdCaptures(birdId) {
    return state.captures[birdId] || [];
  }

  function isBirdCaptured(birdId) {
    const list = state.captures[birdId];
    return Array.isArray(list) && list.length > 0;
  }

  function getBestCapture(birdId) {
    const list = state.captures[birdId];
    if (!list || list.length === 0) return null;
    return list.find(c => c.isBest) || list[0];
  }

  async function addCapture(birdId, captureObj) {
    if (!state.captures[birdId]) {
      state.captures[birdId] = [];
    }
    const list = state.captures[birdId];
    if (list.length === 0 || captureObj.isBest) {
      list.forEach(c => { c.isBest = false; });
      captureObj.isBest = true;
    }
    list.unshift(captureObj);
    await dbSet("captures", state.captures);
    return captureObj;
  }

  async function setBestCapture(birdId, captureId) {
    const list = state.captures[birdId];
    if (!list) return;
    list.forEach(c => {
      c.isBest = (c.id === captureId);
    });
    await dbSet("captures", state.captures);
  }

  async function deleteCapture(birdId, captureId) {
    const list = state.captures[birdId];
    if (!list) return;
    const idx = list.findIndex(c => c.id === captureId);
    if (idx !== -1) {
      const wasBest = list[idx].isBest;
      list.splice(idx, 1);
      if (wasBest && list.length > 0) {
        list[0].isBest = true;
      }
      await dbSet("captures", state.captures);
    }
  }

  // お手本写真のカスタム差し替え（slot: 'main' | 'male' | 'female'）
  async function setCustomRefPhoto(birdId, slot, urlOrDataUrl) {
    if (!state.customRefPhotos[birdId]) {
      state.customRefPhotos[birdId] = {};
    }
    state.customRefPhotos[birdId][slot] = urlOrDataUrl;
    if (slot === "male" || slot === "main") {
      state.customRefPhotos[birdId].main = urlOrDataUrl;
    }
    await dbSet("customRefPhotos", state.customRefPhotos);
  }

  async function resetCustomRefPhoto(birdId) {
    delete state.customRefPhotos[birdId];
    await dbSet("customRefPhotos", state.customRefPhotos);
  }

  function hasCustomRefPhoto(birdId) {
    return !!state.customRefPhotos[birdId];
  }

  // 鳴き声音声のカスタム差し替え
  async function setCustomBirdAudio(birdId, audioDataUrl) {
    state.customAudio[birdId] = audioDataUrl;
    await dbSet("customAudio", state.customAudio);
  }

  async function resetCustomBirdAudio(birdId) {
    delete state.customAudio[birdId];
    await dbSet("customAudio", state.customAudio);
  }

  function hasCustomBirdAudio(birdId) {
    return !!state.customAudio[birdId];
  }

  async function addCustomSpot(spot) {
    state.customSpots.push(spot);
    await dbSet("customSpots", state.customSpots);
    return spot;
  }

  async function deleteCustomSpot(spotId) {
    state.customSpots = state.customSpots.filter(s => s.id !== spotId);
    await dbSet("customSpots", state.customSpots);
  }

  async function addCustomBird(bird) {
    state.customBirds.push(bird);
    await dbSet("customBirds", state.customBirds);
    return bird;
  }

  async function toggleChecklist(chkId, checked) {
    state.checklist[chkId] = checked;
    await dbSet("checklist", state.checklist);
  }

  function getChecklist() {
    return state.checklist;
  }

  async function updateSettings(partial) {
    state.settings = { ...state.settings, ...partial };
    await dbSet("settings", state.settings);
    return state.settings;
  }

  function getSettings() {
    return state.settings;
  }

  function exportAllData() {
    return JSON.stringify({
      version: 2,
      exportedAt: new Date().toISOString(),
      captures: state.captures,
      customSpots: state.customSpots,
      customBirds: state.customBirds,
      customRefPhotos: state.customRefPhotos,
      customAudio: state.customAudio,
      checklist: state.checklist,
      settings: state.settings
    });
  }

  async function importAllData(jsonString) {
    const parsed = JSON.parse(jsonString);
    if (parsed.captures) {
      state.captures = parsed.captures;
      await dbSet("captures", state.captures);
    }
    if (parsed.customSpots) {
      state.customSpots = parsed.customSpots;
      await dbSet("customSpots", state.customSpots);
    }
    if (parsed.customBirds) {
      state.customBirds = parsed.customBirds;
      await dbSet("customBirds", state.customBirds);
    }
    if (parsed.customRefPhotos) {
      state.customRefPhotos = parsed.customRefPhotos;
      await dbSet("customRefPhotos", state.customRefPhotos);
    }
    if (parsed.customAudio) {
      state.customAudio = parsed.customAudio;
      await dbSet("customAudio", state.customAudio);
    }
    if (parsed.checklist) {
      state.checklist = parsed.checklist;
      await dbSet("checklist", state.checklist);
    }
    if (parsed.settings) {
      state.settings = { ...state.settings, ...parsed.settings };
      await dbSet("settings", state.settings);
    }
  }

  // お手本写真の取得（ユーザー差し替え画像 ＞ オスメス画像 ＞ Wikipedia画像）
  async function fetchWikiPhoto(bird, onLoaded) {
    if (bird.userMainPhotoUrl) {
      if (onLoaded) onLoaded(bird.userMainPhotoUrl);
      return bird.userMainPhotoUrl;
    }
    if (bird.customRefPhoto) {
      if (onLoaded) onLoaded(bird.customRefPhoto);
      return bird.customRefPhoto;
    }
    const title = bird.wikiTitle || bird.name;
    if (state.wikiPhotos[title]) {
      if (onLoaded) onLoaded(state.wikiPhotos[title]);
      return state.wikiPhotos[title];
    }
    try {
      const url = `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const imgUrl = (data.originalimage && data.originalimage.source) || (data.thumbnail && data.thumbnail.source);
        const thumbUrl = (data.thumbnail && data.thumbnail.source) || imgUrl;
        if (thumbUrl) {
          state.wikiPhotos[title] = thumbUrl;
          dbSet("wikiPhotos", state.wikiPhotos);
          if (onLoaded) onLoaded(thumbUrl);
          return thumbUrl;
        }
      }
    } catch (_) {}
    return null;
  }

  // アプリ内で「もっと見やすい別の写真候補（最大12枚）」をワンクリック検索して取得！
  async function fetchCandidatePhotos(bird) {
    const candidates = [];
    const seen = new Set();
    const addCandidate = (url, label) => {
      if (url && !seen.has(url)) {
        seen.add(url);
        candidates.push({ url, label });
      }
    };

    // 1. iNaturalist の図鑑厳選ポートレート（taxon_photos）および高評価写真を取得
    try {
      const qName = bird.englishName || bird.name;
      const tRes = await fetch(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(qName)}&per_page=1`);
      if (tRes.ok) {
        const tData = await tRes.json();
        const tid = tData.results && tData.results[0] && tData.results[0].id;
        if (tid) {
          const tdRes = await fetch(`https://api.inaturalist.org/v1/taxa/${tid}`);
          if (tdRes.ok) {
            const tdData = await tdRes.json();
            const tPhotos = (tdData.results && tdData.results[0] && tdData.results[0].taxon_photos) || [];
            tPhotos.slice(0, 8).forEach((tp, idx) => {
              if (tp.photo && tp.photo.medium_url) {
                addCandidate(tp.photo.medium_url, `図鑑厳選 #${idx + 1}`);
              }
            });
          }
        }
      }
      const inatUrl = `https://api.inaturalist.org/v1/observations?q=${encodeURIComponent(qName)}&photos=true&quality_grade=research&order_by=votes&per_page=8`;
      const res = await fetch(inatUrl);
      if (res.ok) {
        const data = await res.json();
        (data.results || []).forEach((obs, idx) => {
          (obs.photos || []).slice(0, 1).forEach(p => {
            if (p.url) {
              addCandidate(p.url.replace("square", "medium"), `人気写真 #${idx + 1}`);
            }
          });
        });
      }
    } catch (_) {}

    // 2. Wikimedia Commons からも高解像度写真を取得
    try {
      const cQuery = `${bird.englishName || bird.name} bird jpg`;
      const cUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(cQuery)}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json&origin=*`;
      const cRes = await fetch(cUrl);
      if (cRes.ok) {
        const cData = await cRes.json();
        if (cData.query && cData.query.pages) {
          Object.values(cData.query.pages).forEach((pg, idx) => {
            const ii = pg.imageinfo && pg.imageinfo[0];
            if (ii && (ii.thumburl || ii.url)) {
              addCandidate(ii.thumburl || ii.url, `Wikimedia #${idx + 1}`);
            }
          });
        }
      }
    } catch (_) {}

    return candidates.slice(0, 12);
  }

  function getFallbackBirdSvgDataUrl(bird, isSilhouette = false) {
    const colors = bird.colorPalette || ["#0f766e", "#f59e0b", "#1e293b"];
    const c1 = isSilhouette ? "#1e293b" : colors[0];
    const c2 = isSilhouette ? "#0f172a" : colors[1];
    const c3 = isSilhouette ? "#334155" : colors[2];
    const bg1 = isSilhouette ? "#cbd5e1" : "#ecfdf5";
    const bg2 = isSilhouette ? "#94a3b8" : "#d1fae5";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </linearGradient>
      </defs>
      <rect width="400" height="280" fill="url(#bg)"/>
      <circle cx="320" cy="60" r="38" fill="${isSilhouette ? '#64748b' : '#fef08a'}" opacity="0.55"/>
      <path d="M0 230 Q120 200 240 225 T400 215 L400 280 L0 280 Z" fill="#10b981" opacity="${isSilhouette ? '0.18' : '0.25'}"/>
      <path d="M50 215 Q200 195 360 208" stroke="#78350f" stroke-width="8" stroke-linecap="round" fill="none" opacity="${isSilhouette ? '0.4' : '0.8'}"/>
      <path d="M145 165 L75 198 L90 212 L158 180 Z" fill="${c3}"/>
      <ellipse cx="198" cy="152" rx="58" ry="40" transform="rotate(-14 198 152)" fill="${c1}"/>
      <ellipse cx="206" cy="162" rx="46" ry="26" transform="rotate(-10 206 162)" fill="${c2}"/>
      <path d="M155 142 Q195 118 232 146 Q198 175 155 158 Z" fill="${c3}" opacity="0.9"/>
      <circle cx="244" cy="116" r="26" fill="${c1}"/>
      <polygon points="267,110 298,116 267,124" fill="${isSilhouette ? '#1e293b' : '#f59e0b'}"/>
      ${isSilhouette ? '' : '<circle cx="252" cy="112" r="5" fill="#111827"/><circle cx="254" cy="110" r="1.8" fill="#ffffff"/>'}
      <line x1="195" y1="186" x2="190" y2="205" stroke="#451a03" stroke-width="3.5"/>
      <line x1="215" y1="185" x2="212" y2="205" stroke="#451a03" stroke-width="3.5"/>
      <text x="20" y="34" font-family="sans-serif" font-size="15" font-weight="bold" fill="#065f46" opacity="0.8">No.${bird.dexNo} ${bird.name}</text>
    </svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  return {
    init,
    getAllBirds,
    getAllSpots,
    getBirdCaptures,
    isBirdCaptured,
    getBestCapture,
    addCapture,
    setBestCapture,
    deleteCapture,
    setCustomRefPhoto,
    resetCustomRefPhoto,
    hasCustomRefPhoto,
    setCustomBirdAudio,
    resetCustomBirdAudio,
    hasCustomBirdAudio,
    addCustomSpot,
    deleteCustomSpot,
    addCustomBird,
    toggleChecklist,
    getChecklist,
    updateSettings,
    getSettings,
    exportAllData,
    importAllData,
    fetchWikiPhoto,
    fetchCandidatePhotos,
    getFallbackBirdSvgDataUrl
  };
})();
