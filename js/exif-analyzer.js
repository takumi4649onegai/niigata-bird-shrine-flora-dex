// EXIF自動読み取り＆「写真目利き」画像解析エンジン
window.ExifAndPhotoAnalyzer = (function() {

  // バイナリJPEGからのEXIFタグ抽出（外部ライブラリ不要・完全ローカル動作）
  function parseExifFromArrayBuffer(buffer) {
    const view = new DataView(buffer);
    if (view.byteLength < 4 || view.getUint16(0, false) !== 0xFFD8) {
      return {};
    }

    let offset = 2;
    const length = view.byteLength;

    while (offset < length - 2) {
      const marker = view.getUint16(offset, false);
      offset += 2;

      if (marker === 0xFFE1) { // APP1 (EXIF)
        const segLen = view.getUint16(offset, false);
        if (offset + 8 > length) break;
        // "Exif\0\0" チェック
        if (view.getUint32(offset + 2, false) === 0x45786966 && view.getUint16(offset + 6, false) === 0x0000) {
          return readTiffHeader(view, offset + 8, segLen - 8);
        }
        offset += segLen;
      } else if ((marker & 0xFF00) === 0xFF00) {
        if (marker === 0xFFDA || marker === 0xFFD9) break;
        const segLen = view.getUint16(offset, false);
        offset += segLen;
      } else {
        break;
      }
    }
    return {};
  }

  function readTiffHeader(view, tiffStart, maxLen) {
    if (tiffStart + 8 > view.byteLength) return {};
    const endian = view.getUint16(tiffStart, false);
    const little = endian === 0x4949; // 'II' = Little Endian, 'MM' = Big Endian
    if (!little && endian !== 0x4D4D) return {};

    const firstIfdOffset = view.getUint32(tiffStart + 4, little);
    const tags = {};

    readIfd(view, tiffStart, tiffStart + firstIfdOffset, little, tags);

    // ExifIFD (0x8769)
    if (tags._exifIfdPointer) {
      readIfd(view, tiffStart, tiffStart + tags._exifIfdPointer, little, tags);
    }

    return formatExifTags(tags);
  }

  function readIfd(view, tiffStart, dirStart, little, outTags) {
    if (dirStart + 2 > view.byteLength) return;
    const numEntries = view.getUint16(dirStart, little);

    for (let i = 0; i < numEntries; i++) {
      const entryOffset = dirStart + 2 + i * 12;
      if (entryOffset + 12 > view.byteLength) break;

      const tag = view.getUint16(entryOffset, little);
      const type = view.getUint16(entryOffset + 2, little);
      const count = view.getUint32(entryOffset + 4, little);
      const valOffset = entryOffset + 8;

      const val = readTagValue(view, tiffStart, type, count, valOffset, little);
      if (val !== undefined) {
        if (tag === 0x010F) outTags.make = val;
        else if (tag === 0x0110) outTags.model = val;
        else if (tag === 0x0132 && !outTags.dateTime) outTags.dateTime = val;
        else if (tag === 0x8769) outTags._exifIfdPointer = val;
        else if (tag === 0x829A) outTags.exposureTime = val;
        else if (tag === 0x829D) outTags.fNumber = val;
        else if (tag === 0x8827) outTags.iso = val;
        else if (tag === 0x9003) outTags.dateTimeOriginal = val;
        else if (tag === 0x920A) outTags.focalLength = val;
        else if (tag === 0xA405) outTags.focalLength35mm = val;
        else if (tag === 0xA434) outTags.lensModel = val;
      }
    }
  }

  function readTagValue(view, tiffStart, type, count, valOffset, little) {
    try {
      if (type === 2) { // ASCII string
        const byteOffset = count <= 4 ? valOffset : tiffStart + view.getUint32(valOffset, little);
        if (byteOffset + count > view.byteLength) return undefined;
        let str = "";
        for (let i = 0; i < count - 1; i++) {
          const ch = view.getUint8(byteOffset + i);
          if (ch === 0) break;
          str += String.fromCharCode(ch);
        }
        return str.trim();
      } else if (type === 3) { // SHORT (16-bit)
        return view.getUint16(valOffset, little);
      } else if (type === 4) { // LONG (32-bit)
        return view.getUint32(valOffset, little);
      } else if (type === 5) { // RATIONAL (two 32-bit unsigned)
        const byteOffset = tiffStart + view.getUint32(valOffset, little);
        if (byteOffset + 8 > view.byteLength) return undefined;
        const num = view.getUint32(byteOffset, little);
        const den = view.getUint32(byteOffset + 4, little);
        return den === 0 ? 0 : { num, den, val: num / den };
      }
    } catch (e) {
      return undefined;
    }
    return undefined;
  }

  function formatExifTags(raw) {
    const result = {};

    // カメラ機種名
    if (raw.make || raw.model) {
      const make = (raw.make || "").trim();
      const model = (raw.model || "").trim();
      result.camera = model.toLowerCase().startsWith(make.toLowerCase()) ? model : `${make} ${model}`.trim();
    }

    // レンズ名
    if (raw.lensModel) {
      result.lens = raw.lensModel;
    }

    // 撮影日時 (YYYY:MM:DD HH:MM:SS -> YYYY-MM-DD)
    const dt = raw.dateTimeOriginal || raw.dateTime;
    if (dt && typeof dt === "string") {
      const m = dt.match(/^(\d{4})[:\-](\d{2})[:\-](\d{2})/);
      if (m) {
        result.date = `${m[1]}-${m[2]}-${m[3]}`;
      }
    }

    // シャッタースピード
    if (raw.exposureTime && raw.exposureTime.val) {
      const sec = raw.exposureTime.val;
      result.shutterSec = sec;
      if (sec >= 1) {
        result.shutterSpeed = `${sec.toFixed(1)}秒`;
      } else {
        const inv = Math.round(1 / sec);
        result.shutterSpeed = `1/${inv}秒`;
      }
    }

    // F値
    if (raw.fNumber && raw.fNumber.val) {
      result.fValue = Number(raw.fNumber.val.toFixed(1));
      result.fStop = `F${result.fValue}`;
    }

    // ISO
    if (raw.iso) {
      result.iso = raw.iso;
    }

    // 焦点距離
    const fl = raw.focalLength35mm || (raw.focalLength && raw.focalLength.val);
    if (fl) {
      result.focalLengthNum = Math.round(fl);
      result.focalLength = `${result.focalLengthNum}mm`;
    }

    return result;
  }

  // 画像のリサイズ＆「写真目利き」ピクセル自動解析
  function processAndAnalyzeImage(file, bird) {
    return new Promise((resolve, reject) => {
      const readerBuf = new FileReader();
      readerBuf.onload = function(eBuf) {
        const exif = parseExifFromArrayBuffer(eBuf.target.result);

        const readerUrl = new FileReader();
        readerUrl.onload = function(eUrl) {
          const img = new Image();
          img.onload = function() {
            // 保存用に最大長辺1280pxにリサイズ（高画質維持＆IndexedDB高速化）
            const maxDim = 1280;
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w >= h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }

            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.86);

            // 写真目利き解析用の縮小キャンバス (240x240)
            const aCanvas = document.createElement("canvas");
            const aw = 240;
            const ah = Math.max(120, Math.round((h / w) * 240));
            aCanvas.width = aw;
            aCanvas.height = ah;
            const aCtx = aCanvas.getContext("2d");
            aCtx.drawImage(img, 0, 0, aw, ah);
            const imgData = aCtx.getImageData(0, 0, aw, ah).data;

            const analysis = runPixelAndExifConnoisseur(imgData, aw, ah, exif, bird);

            resolve({
              dataUrl,
              width: img.width,
              height: img.height,
              exif,
              analysis
            });
          };
          img.onerror = reject;
          img.src = eUrl.target.result;
        };
        readerUrl.onerror = reject;
        readerUrl.readAsDataURL(file);
      };
      readerBuf.onerror = reject;
      readerBuf.readAsArrayBuffer(file);
    });
  }

  // ピクセル輝度・コントラスト・中央シャープネス＆EXIF設定の総合目利きアドバイス生成
  function runPixelAndExifConnoisseur(data, w, h, exif, bird) {
    let sumLum = 0;
    let sumSqLum = 0;
    let highlightClip = 0;
    let shadowCrush = 0;
    let sumSat = 0;
    const totalPixels = w * h;
    const hist = new Array(16).fill(0);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      sumLum += lum;
      sumSqLum += lum * lum;

      if (lum > 246) highlightClip++;
      if (lum < 10) shadowCrush++;

      const bin = Math.min(15, Math.floor(lum / 16));
      hist[bin]++;

      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;
      sumSat += sat;
    }

    const avgLum = sumLum / totalPixels;
    const stdLum = Math.sqrt(Math.max(0, sumSqLum / totalPixels - avgLum * avgLum));
    const highlightPct = (highlightClip / totalPixels) * 100;
    const shadowPct = (shadowCrush / totalPixels) * 100;
    const avgSat = (sumSat / totalPixels) * 100;

    // 中央領域（日の丸〜三分割交点付近）のエッジ強度（ピント・解像感の目安）
    let edgeSum = 0;
    let edgeCount = 0;
    const x0 = Math.floor(w * 0.25);
    const x1 = Math.floor(w * 0.75);
    const y0 = Math.floor(h * 0.25);
    const y1 = Math.floor(h * 0.75);

    for (let y = y0; y < y1 - 1; y++) {
      for (let x = x0; x < x1 - 1; x++) {
        const idx = (y * w + x) * 4;
        const idxR = (y * w + (x + 1)) * 4;
        const idxD = ((y + 1) * w + x) * 4;
        const l0 = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        const lR = 0.299 * data[idxR] + 0.587 * data[idxR + 1] + 0.114 * data[idxR + 2];
        const lD = 0.299 * data[idxD] + 0.587 * data[idxD + 1] + 0.114 * data[idxD + 2];
        edgeSum += Math.abs(l0 - lR) + Math.abs(l0 - lD);
        edgeCount++;
      }
    }
    const centerEdgeScore = edgeCount > 0 ? edgeSum / edgeCount : 10;

    // アドバイスメッセージ組み立て
    const tips = [];

    // 1. 露出・明るさ判定
    if (highlightPct > 8) {
      tips.push({
        type: "warn",
        label: "露出・白飛びチェック",
        text: `明るい部分（ハイライト）がやや強め（${highlightPct.toFixed(1)}%）です。ハクチョウ・ダイサギ・ミコアイサなどの白い羽や順光の背景では、露出補正を「-0.3〜-0.7EV」にすると羽毛のディテールがさらに美しく残ります！`
      });
    } else if (avgLum < 65 || shadowPct > 18) {
      tips.push({
        type: "info",
        label: "露出・暗部チェック",
        text: "全体が少し落ち着いたアンダー気味のトーンです。逆光や森の中で鳥のお腹や瞳が暗くなるときは、露出補正を「+0.3〜+0.7EV」ほどプラスにするか、太陽を背にした順光位置に回り込むと瞳にキャッチライトが入ります！"
      });
    } else {
      tips.push({
        type: "good",
        label: "露出バランス良好！",
        text: `全体の明るさバランス（平均輝度 ${Math.round(avgLum)}/255）が絶妙で、白飛びや黒潰れも少なく羽毛の階調がしっかり出ています。`
      });
    }

    // 2. シャッタースピード＆EXIF判定
    if (exif && exif.shutterSec) {
      const targetMinSec = (bird && bird.recommendedSpec && bird.recommendedSpec.minShutterSec) || 0.002;
      if (exif.shutterSec <= targetMinSec) {
        tips.push({
          type: "good",
          label: `シャッター速度（${exif.shutterSpeed}）◎`,
          text: `${bird ? bird.name : "野鳥"}の動きや微細な羽の震えもしっかり止まる理想的なシャッタースピードです！被写体ブレの心配がありません。`
        });
      } else {
        tips.push({
          type: "warn",
          label: `シャッター速度（${exif.shutterSpeed}）アドバイス`,
          text: `${bird ? bird.name : "この鳥"}の推奨速度（${bird && bird.recommendedSpec ? bird.recommendedSpec.shutterSpeed : "1/500秒以上"}）より少しゆっくりめです。止まりものならOKですが、首を振る瞬間や飛び出しも狙うなら、ISO感度を上げてシャッター速度を1段速くすると歩留まりが劇的に上がります！`
        });
      }
    } else {
      tips.push({
        type: "info",
        label: "推奨カメラ設定ガイド",
        text: `${bird ? bird.name : "この野鳥"}を狙う際は、焦点距離「${bird && bird.recommendedSpec ? bird.recommendedSpec.focalLength : "300mm〜600mm"}」、シャッター速度「${bird && bird.recommendedSpec ? bird.recommendedSpec.shutterSpeed : "1/500秒以上"}」を意識するとベストショット率がアップします。`
      });
    }

    // 3. 解像感・コントラスト判定
    if (centerEdgeScore >= 14) {
      tips.push({
        type: "good",
        label: "シャープネス・ディテール◎",
        text: "画面中央付近のエッジ（羽毛や枝の輪郭）がくっきり出ており、高い解像感が感じられます！"
      });
    } else if (centerEdgeScore < 7.5) {
      tips.push({
        type: "info",
        label: "ピント・解像感のヒント",
        text: "柔らかくふんわりした描写です。背景のふんわりボケなら最高ですが、もし羽毛をさらにシャープに写したい場合は「鳥の目（瞳AFまたはシングルポイントAF）」にピントを置き、F値を1段絞る（例：F5.6→F7.1）のも効果的です。"
      });
    }

    // 推奨初期セルフスコア（5段階）の提案
    const suggestedScores = {
      focus: centerEdgeScore >= 12 ? 5 : centerEdgeScore >= 8 ? 4 : 3,
      composition: stdLum >= 42 ? 4 : 3,
      moment: 4,
      light: (highlightPct <= 8 && avgLum >= 65 && avgLum <= 195) ? 5 : 4,
      manner: 5
    };

    return {
      avgLum: Math.round(avgLum),
      contrast: Math.round(stdLum),
      saturation: Math.round(avgSat),
      sharpnessIndex: Number(centerEdgeScore.toFixed(1)),
      histogram: hist,
      tips,
      suggestedScores
    };
  }

  return {
    processAndAnalyzeImage
  };
})();
