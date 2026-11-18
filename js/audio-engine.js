// 野鳥の本物の鳴き声（生録音4秒クリップ）プレイヤー＆音響波形ビジュアライザー
// ※全42種の本物の野鳥録音データを audio/<birdId>.mp3（約4秒・無音カット＆音量最適化済）として収録！
// ※ユーザーが後から追加したカスタム野鳥（43種目以降）のみシンセサイザー音がフォールバックとして鳴ります。
window.BirdAudioEngine = (function() {
  let audioCtx = null;
  let currentAudioEl = null;
  let isPlaying = false;
  let animFrameId = null;
  let stopTimeouts = [];

  function getCtx() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function stopAll() {
    stopTimeouts.forEach(t => clearTimeout(t));
    stopTimeouts = [];
    if (currentAudioEl) {
      try {
        currentAudioEl.pause();
        currentAudioEl.currentTime = 0;
      } catch (_) {}
      currentAudioEl = null;
    }
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    isPlaying = false;
  }

  // 本物の音声再生中のキャンバス波形アニメーション（鳥の周波数帯に応じたリアルなスペクトラム波形描画）
  function startCanvasVisualizer(canvasEl, bird) {
    if (!canvasEl) return;
    const cCtx = canvasEl.getContext("2d");
    const [f1, f2] = bird.synthFreq || [2800, 3800];
    const speedFactor = Math.max(1.2, Math.min(4.5, (f1 + f2) / 2000));
    let phase = 0;

    function renderFrame() {
      if (!isPlaying) {
        // 停止時はフラットな基準線に戻す
        const w = canvasEl.width;
        const h = canvasEl.height;
        cCtx.fillStyle = "#090d16";
        cCtx.fillRect(0, 0, w, h);
        cCtx.strokeStyle = "#1e293b";
        cCtx.lineWidth = 1.5;
        cCtx.beginPath();
        cCtx.moveTo(0, h / 2);
        cCtx.lineTo(w, h / 2);
        cCtx.stroke();
        return;
      }

      animFrameId = requestAnimationFrame(renderFrame);
      phase += 0.16 * speedFactor;

      const w = canvasEl.width;
      const h = canvasEl.height;
      cCtx.fillStyle = "#090d16";
      cCtx.fillRect(0, 0, w, h);

      // 再生プログレスバー（下部）
      if (currentAudioEl && currentAudioEl.duration) {
        const pct = Math.min(1, currentAudioEl.currentTime / currentAudioEl.duration);
        cCtx.fillStyle = "rgba(52, 211, 153, 0.18)";
        cCtx.fillRect(0, 0, w * pct, h);
      }

      cCtx.lineWidth = 2.4;
      cCtx.strokeStyle = "#34d399";
      cCtx.beginPath();

      const mid = h / 2;
      for (let x = 0; x < w; x += 2) {
        const env = Math.sin((x / w) * Math.PI);
        const burst = 0.45 + 0.55 * Math.max(0, Math.sin(phase * 0.45 + Math.cos(phase * 0.2) * 2));
        const wave =
          Math.sin(x * 0.09 * speedFactor - phase * 2.2) * 0.55 +
          Math.sin(x * 0.21 * speedFactor + phase * 3.1) * 0.3 +
          (Math.random() - 0.5) * 0.25;
        const y = mid + wave * env * burst * (h * 0.42);
        if (x === 0) cCtx.moveTo(x, y);
        else cCtx.lineTo(x, y);
      }
      cCtx.stroke();
    }

    renderFrame();
  }

  // メイン再生関数：まず audio/<birdId>.mp3（本物の野鳥の生録音・約4秒）を再生！
  function playBirdCall(bird, canvasEl, onEndCallback) {
    if (isPlaying) {
      stopAll();
      if (onEndCallback) onEndCallback();
      return;
    }

    stopAll();
    const localMp3Path = bird.customAudioUrl || `audio/${bird.id}.mp3?v=xc2`;
    const audio = new Audio(localMp3Path);
    audio.volume = 0.95;
    currentAudioEl = audio;
    isPlaying = true;

    startCanvasVisualizer(canvasEl, bird);

    let finished = false;
    const finishCleanly = () => {
      if (finished) return;
      finished = true;
      stopAll();
      if (onEndCallback) onEndCallback();
    };

    audio.addEventListener("ended", finishCleanly);

    // 万が一ローカルMP3がない場合（後から追加したカスタム野鳥など）のみシンセ音へフォールバック
    audio.addEventListener("error", () => {
      if (finished) return;
      finished = true;
      currentAudioEl = null;
      playFallbackSynth(bird, canvasEl, onEndCallback);
    });

    // 安全タイマー（内蔵4.2秒クリップは約4.6秒、自分が差し替えた音声ファイルは最大25秒まで再生可能）
    const maxPlayMs = bird.customAudioUrl ? 25000 : 4600;
    const safetyTimer = setTimeout(finishCleanly, maxPlayMs);
    stopTimeouts.push(safetyTimer);

    audio.play().catch(() => {
      if (!finished) {
        finished = true;
        currentAudioEl = null;
        playFallbackSynth(bird, canvasEl, onEndCallback);
      }
    });
  }

  // カスタム追加野鳥用の簡易フォールバック音源
  function playFallbackSynth(bird, canvasEl, onEndCallback) {
    const ctx = getCtx();
    const [f1, f2] = bird.synthFreq || [3000, 3800];
    const now = ctx.currentTime + 0.05;
    isPlaying = true;
    startCanvasVisualizer(canvasEl, bird);

    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(f1, now + i * 0.35);
      osc.frequency.exponentialRampToValueAtTime(f2, now + i * 0.35 + 0.16);
      gain.gain.setValueAtTime(0.001, now + i * 0.35);
      gain.gain.linearRampToValueAtTime(0.22, now + i * 0.35 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.35 + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.35);
      osc.stop(now + i * 0.35 + 0.18);
    }

    const t = setTimeout(() => {
      stopAll();
      if (onEndCallback) onEndCallback();
    }, 1600);
    stopTimeouts.push(t);
  }

  return {
    playBirdCall,
    stopAll,
    isPlaying: () => isPlaying
  };
})();
