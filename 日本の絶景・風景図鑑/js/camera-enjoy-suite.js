// ============================================================================
// 新潟カメラライフ10倍満喫スイート（5大特別機能モジュール）
// 1. 🚗 半日お出かけ・カメラ黄金ルート自動提案（タイムテーブル）
// 2. 🖼️ 日本の美・ポストカード／2L判プリント用デザイン書き出しスタジオ
// 3. 🏮 御朱印＆野鳥・花コラボデジタル朱印帳
// 4. 🌅 マジックアワー・水鏡・雲海・野鳥活性チャンス予報チェッカー
// 5. 🏅 新潟カメラマン称号・3アプリ横断バッジコレクション
// ============================================================================

window.CameraEnjoySuite = (function () {
  const SUITE_STORAGE_KEY = "niigata_camera_enjoy_suite_v1";

  // 状態データ（御朱印記録・ポストカード作成実績・手動バッジ解除など）
  let suiteState = {
    goshuinRecords: {}, // { [shrineItemId]: { dataUrl, date, memo, metBirds: "ヤマガラ・シジュウカラ", metFlora: "菊・紅葉" } }
    postcardCount: 0,
    checkedRoutes: {}   // { [routeStepId]: true }
  };

  function loadSuiteState() {
    try {
      const raw = localStorage.getItem(SUITE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        suiteState.goshuinRecords = parsed.goshuinRecords || {};
        suiteState.postcardCount = parsed.postcardCount || 0;
        suiteState.checkedRoutes = parsed.checkedRoutes || {};
      }
    } catch (_) {}
  }

  function saveSuiteState() {
    try {
      localStorage.setItem(SUITE_STORAGE_KEY, JSON.stringify(suiteState));
    } catch (_) {}
  }

  // ==========================================================================
  // 1. 🚗 半日お出かけ・カメラ黄金ルート（7大エリア×光の向き・野鳥活性時間順）
  // ==========================================================================
  const GOLDEN_ROUTES = [
    {
      id: "route_kita",
      areaName: "🦢 新潟市北区（福島潟〜島見浜・海辺の森〜阿賀野川河口）黄金コース",
      bestSeason: "通年（特に春4月の菜の花＆夏8月のオニバス＆冬11〜2月の白鳥・猛禽）",
      driveNote: "🚗 すべて無料大駐車場あり・移動距離15〜20分圏内で回れるホームグラウンド最強ルート！",
      steps: [
        {
          id: "kita_1",
          time: "06:00〜07:30",
          genre: "🐦 野鳥 ＋ 🏔️ 絶景",
          spot: "水の公園 福島潟（雁晴れ舎〜菜の花畑）",
          title: "早朝の無風『水鏡』と白鳥・オオヨシキリ・猛禽の朝活ショット",
          detail: "日の出直後は風が弱く、福島潟の水面に五頭連峰が映る『水鏡』チャンス！野鳥も朝食タイムで最も活発に鳴き、順光の柔らかい朝日の中でコハクチョウ・オオハクチョウ・ノスリ・チュウヒ・夏場のオオヨシキリが至近距離で狙えます。",
          composition: "📐 三分割構図（空1：菜の花や水面2）＋ 日の丸構図（野鳥アップ）",
          linkUrl: "../index.html?spot=fukushimagata",
          linkLabel: "🐦 福島潟の野鳥を見る"
        },
        {
          id: "kita_2",
          time: "07:45〜09:00",
          genre: "🌸 四季の花・水生植物",
          spot: "ビュー福島潟周辺・潟来亭横の水路",
          title: "日が昇り始めた光で『菜の花・オニバス・ハス』を前ボケ撮影",
          detail: "朝露が残る時間帯に、春なら菜の花（4月）、夏なら幻の紫花オニバス（8月）やハスを望遠レンズまたはマクロで撮影。背景に野鳥や水面のキラキラ（玉ボケ）を入れるとプロ級の一枚に！",
          composition: "📐 前ボケ＆望遠圧縮レイヤー構図",
          linkUrl: "../四季の花・草木図鑑/index.html?spot=fukushimagata",
          linkLabel: "🌸 福島潟の花を見る"
        },
        {
          id: "kita_3",
          time: "09:30〜11:00",
          genre: "🐦 森の野鳥 ＋ 🌸 海辺の花",
          spot: "島見浜・海辺の森（またはじゅんさい池）",
          title: "木漏れ日のクロマツ林で小鳥（カラ類・キビタキ・サンコウチョウ）探し",
          detail: "日が高くなったら森の中へ。海辺の森の遊歩道は日陰で歩きやすく、シジュウカラ・ヤマガラ・コゲラ、春〜初夏ならキビタキやオオルリが頭上の枝でさえずります。5〜6月は砂浜のハマヒルガオも必見！",
          composition: "📐 枝葉の隙間を使った額縁構図 ＋ 日の丸構図",
          linkUrl: "../index.html?spot=kaibenomori",
          linkLabel: "🐦 海辺の森の野鳥を見る"
        },
        {
          id: "kita_4",
          time: "16:00〜日没",
          genre: "🏔️ 夕日絶景 ＋ 🐦 水鳥",
          spot: "島見浜・松浜橋・阿賀野川河口",
          title: "日本海に沈む黄金の夕日と水鳥の飛翔シルエットで締めくくり",
          detail: "夕方のマジックアワーは海岸または阿賀野川河口へ。黄金色に染まる水面と、ねぐらへ帰るカモメや白鳥・カモ類の飛翔シルエットを三分割構図（空2：海1）でドラマチックに収めます。",
          composition: "📐 三分割構図（空2：海1）",
          linkUrl: "javascript:JapanApp.openDetailModal('jp_019')",
          linkLabel: "🏔️ 日本海夕日の撮り方を見る"
        }
      ]
    },
    {
      id: "route_yahiko",
      areaName: "⛩️ 弥彦・角田エリア（弥彦公園〜彌彦神社〜弥彦山〜角田山）黄金コース",
      bestSeason: "春（3〜4月：雪割草・カタクリ・桜）＆ 秋（11月：菊まつり・もみじ谷紅葉）",
      driveNote: "🚗 観光バスや参拝客が増える『朝9時前』に彌彦神社＆もみじ谷を撮り終えるのが最大の秘訣！",
      steps: [
        {
          id: "yahiko_1",
          time: "06:30〜07:45",
          genre: "🏔️ 絶景 ＋ 🐦 渓流・森林の野鳥",
          spot: "弥彦公園『もみじ谷・観月橋』",
          title: "無人の朱橋『観月橋』を額縁構図で撮り、カワセミ・オオルリ・ヤマガラを狙う",
          detail: "朝7時台なら大人気のもみじ谷もほぼ貸切状態！橋の下の遊歩道からモミジの枝葉を『天然の額縁』にして赤い観月橋を撮影。水辺ではカワセミやキセキレイ、木々ではヤマガラやシジュウカラがすぐ近くまで寄ってきます。",
          composition: "📐 額縁構図（モミジの葉で橋を囲む）",
          linkUrl: "javascript:JapanApp.openDetailModal('jp_014')",
          linkLabel: "🏔️ もみじ谷の3ショットを見る"
        },
        {
          id: "yahiko_2",
          time: "07:45〜09:00",
          genre: "⛩️ 神社仏閣 ＋ 🏮 御朱印",
          spot: "越後一宮 彌彦神社（一の鳥居〜玉ノ橋〜随神門〜拝殿）",
          title: "朝霧と斜光が差し込む千年杉の参道＆『随神門』額縁ショット",
          detail: "東側から昇った朝日が杉並木の間に斜めの光の筋（光芒）を作るゴールデンタイム！随神門の一歩手前（日陰側）から奥の拝殿と弥彦山を額縁構図で撮り、8時半以降に社務所で御朱印をいただきます。",
          composition: "📐 額縁構図（随神門）＋ 放射線構図（参道杉並木）",
          linkUrl: "javascript:JapanApp.openDetailModal('jp_001')",
          linkLabel: "⛩️ 彌彦神社の3ショットを見る"
        },
        {
          id: "yahiko_3",
          time: "09:30〜11:00",
          genre: "🌸 春の山野草・妖精",
          spot: "角田山（湯之腰コース・灯台コース）または弥彦山麓",
          title: "陽が当たって花びらが開いた『雪割草・カタクリ』をローアングル接写",
          detail: "※重要ポイント：雪割草やカタクリは早朝は花びらが閉じており、朝9時〜10時頃に太陽が当たるとパッと全開になります！だから『早朝に神社と野鳥→9時半から花撮影』が完璧な順番です。",
          composition: "📐 前ボケ＆ローアングル接写構図",
          linkUrl: "../四季の花・草木図鑑/index.html?spot=yahiko",
          linkLabel: "🌸 弥彦・角田山の花を見る"
        },
        {
          id: "yahiko_4",
          time: "11:15〜12:30",
          genre: "🏔️ パノラマ絶景 ＋ 🐦 猛禽",
          spot: "弥彦山スカイライン・9合目展望台（または上堰潟公園）",
          title: "越後平野の田園パノラマと日本海に浮かぶ佐渡島を一望！",
          detail: "ドライブまたはロープウェイで山頂域へ。眼下に広がる越後平野の水田と日本海のコントラストを三分割構図で撮影。上空を旋回するハチクマ・サシバ・ノスリなどのタカ類にも注目！",
          composition: "📐 三分割構図（越後平野2：空1）",
          linkUrl: "../index.html?spot=yahiko",
          linkLabel: "🐦 弥彦の野鳥一覧へ"
        }
      ]
    },
    {
      id: "route_akiha",
      areaName: "🍁 新潟市秋葉区・五泉（秋葉公園〜新津丘陵〜滝谷慈光寺〜北方文化博物館）黄金コース",
      bestSeason: "春（4〜5月：桜・藤・夏鳥オオルリ）＆ 秋（11月：紅葉トンネル・冬鳥）",
      driveNote: "🚗 里山の自然・名刹・豪農の館がコンパクトに集結！駐車場もすべて広くて安心。",
      steps: [
        {
          id: "akiha_1",
          time: "06:30〜08:00",
          genre: "🐦 里山の野鳥 ＋ 🌸 季節の花木",
          spot: "秋葉公園・秋葉湖・石油の世界館周辺（秋葉区）",
          title: "朝の秋葉湖でカワセミ＆森の梢でオオルリ・キビタキ・ルリビタキ撮影",
          detail: "早朝の秋葉公園は野鳥カメラマンの聖地。高い木のてっぺん（ソングポスト）で朗々とさえずるオオルリや、水辺のカワセミ、秋冬のルリビタキ・ジョウビタキを狙います。",
          composition: "📐 日の丸構図 ＋ 紅葉や桜の前ボケ構図",
          linkUrl: "../index.html?spot=akiha",
          linkLabel: "🐦 秋葉区の野鳥を見る"
        },
        {
          id: "akiha_2",
          time: "08:30〜10:00",
          genre: "⛩️ 古刹・杉並木 ＋ 🏮 御朱印",
          spot: "滝谷慈光寺（五泉市・秋葉区隣接地）",
          title: "樹齢数百年の老杉参道『放射線構図』と苔むす禅寺・座敷からの額縁庭園",
          detail: "秋葉区から車で約20分。朝の斜光が差し込む天狗杉の参道は、外国人が夢見る『SAMURAI & ZEN』の世界そのもの。参道の真ん中やや端からローアングルで奥の山門へ続く石畳を撮ります。",
          composition: "📐 放射線構図（杉並木参道）＋ 額縁構図（書院座敷）",
          linkUrl: "javascript:JapanApp.openDetailModal('jp_005')",
          linkLabel: "⛩️ 滝谷慈光寺の3ショットを見る"
        },
        {
          id: "akiha_3",
          time: "10:30〜12:00",
          genre: "🌸 大藤・紅葉 ＋ ⛩️ 豪農建築",
          spot: "北方文化博物館（江南区・秋葉区すぐ隣）または中野邸記念館（秋葉区）",
          title: "樹齢150年の大藤棚（5月）／2000本の紅葉庭園（11月）と100畳大広間の額縁美",
          detail: "5月中旬なら北方文化博物館の大藤と和建築、11月なら秋葉区・中野邸記念館（もみじ園）の燃えるような紅葉と日本家屋を撮影。建物の中から庭を切り取る額縁構図が抜群に映えます。",
          composition: "📐 額縁構図（大広間から庭園）",
          linkUrl: "../四季の花・草木図鑑/index.html?spot=akiha",
          linkLabel: "🌸 秋葉区・近郊の花を見る"
        }
      ]
    },
    {
      id: "route_agano_tainai",
      areaName: "🌾 阿賀野・胎内エリア（瓢湖〜旦飯野神社〜乙宝寺三重塔〜胎内渓谷）黄金コース",
      bestSeason: "冬（11〜2月：白鳥6000羽）＆ 春（4月：乙宝寺の桜）＆ 夏（6〜8月：あやめ・ハス）",
      driveNote: "🚗 新潟市北区（福島潟）から車で15〜30分！北区とセットで回れる大人気ルート。",
      steps: [
        {
          id: "agano_1",
          time: "06:30〜08:00",
          genre: "🐦 白鳥・カモ大群 ＋ 🏔️ 朝霧絶景",
          spot: "瓢湖水きん公園（阿賀野市）",
          title: "五頭連峰の朝焼けを背景に飛び立つ数千羽の白鳥とパンダガモ（ミコアイサ）",
          detail: "朝一番の瓢湖は白鳥たちの飛び立ちラッシュ！シャッタースピード1/1000秒以上で羽ばたきを止めるか、あえて1/30秒で羽をブラして躍動感を出すのも面白い撮り方です。",
          composition: "📐 三分割構図（五頭山と朝空1：水面と白鳥2）",
          linkUrl: "../index.html?spot=hyoko",
          linkLabel: "🐦 瓢湖の野鳥を見る"
        },
        {
          id: "agano_2",
          time: "08:15〜09:15",
          genre: "⛩️ 神社仏閣 ＋ 🏮 御朱印",
          spot: "旦飯野神社（阿賀野市・瓢湖から車で約10分）",
          title: "石段の朱塗り鳥居と社殿を『ローアングル対角線構図』で撮影＆福飴と御朱印",
          detail: "地元の人に愛されるパワースポット。石段の下から朱色の連なりを見上げるように撮り、本殿裏の巨大な丸石『御神霊石』も記録に収めましょう。",
          composition: "📐 ローアングル対角線構図",
          linkUrl: "javascript:JapanApp.openDetailModal('jp_008')",
          linkLabel: "⛩️ 旦飯野神社の3ショットを見る"
        },
        {
          id: "agano_3",
          time: "10:00〜11:30",
          genre: "⛩️ 国重要文化財・三重塔 ＋ 🐦 森の野鳥",
          spot: "如意山 乙宝寺（胎内市）",
          title: "1620年建立『木造三重塔』を桜や松の枝越しに前ボケ＆三分割構図で撮る",
          detail: "北陸・越後を代表する美しい三重塔。塔を真ん中に置くのではなく、画面の右または左1/3の交点に配置し、反対側の空間に桜や紅葉の枝をふんわり入れると絵画のような作品になります。",
          composition: "📐 三分割構図 ＋ 前ボケレイヤー構図",
          linkUrl: "javascript:JapanApp.openDetailModal('jp_006')",
          linkLabel: "⛩️ 乙宝寺三重塔の3ショットを見る"
        }
      ]
    },
    {
      id: "route_chuo",
      areaName: "🌉 新潟市中央区・西区（佐潟〜白山神社〜旧齋藤家別邸〜萬代橋）黄金コース",
      bestSeason: "通年（特に夏7月の風鈴まつり＆秋11月の旧齋藤家紅葉＆冬の佐潟白鳥）",
      driveNote: "🚗 市街地でアクセス抜群！和建築の『額縁構図』の練習に一番おすすめのコース。",
      steps: [
        {
          id: "chuo_1",
          time: "07:00〜08:30",
          genre: "🐦 水鳥・猛禽 ＋ 🌸 ハス",
          spot: "佐潟（西区）または鳥屋野潟公園（中央区）",
          title: "ラムサール条約湿地・佐潟で白鳥・ミサゴ・チュウヒ・夏のハスを撮影",
          detail: "朝の光の中で水鳥や猛禽類を撮影。夏（7〜8月）は水面を埋め尽くすハスの花が開く早朝7〜8時台が最高のシャッターチャンスです。",
          composition: "📐 日の丸構図（野鳥）＋ 三分割構図（風景）",
          linkUrl: "../index.html?spot=sakata",
          linkLabel: "🐦 佐潟の野鳥を見る"
        },
        {
          id: "chuo_2",
          time: "09:00〜10:00",
          genre: "⛩️ 神社仏閣 ＋ 🌸 ハス・風鈴",
          spot: "新潟総鎮守 白山神社＆白山公園（中央区）",
          title: "黄金の大随神門と『前ボケ風鈴・瓢箪イルミ』＋お隣の蓮池と空中庭園",
          detail: "手前の風鈴（夏）や提灯をF2.8〜F4でふんわり前ボケさせ、奥の拝殿を切り取ります。参拝後はすぐ隣の白山公園の蓮池と日本の歴史公園100選の散策路へ。",
          composition: "📐 前ボケ＆圧縮レイヤー構図",
          linkUrl: "javascript:JapanApp.openDetailModal('jp_003')",
          linkLabel: "⛩️ 白山神社の3ショットを見る"
        },
        {
          id: "chuo_3",
          time: "10:15〜11:30",
          genre: "⛩️ 日本庭園・和建築の極致",
          spot: "旧齋藤家別邸（中央区・白山神社から車で5分）",
          title: "畳に座って撮る『黄金の額縁構図』！黒塗りの柱と障子枠で庭園を切り取る",
          detail: "『どうすれば風景がプロっぽく撮れるか？』の答えがすぐ体験できる場所！1階大広間のかなり奥（暗い室内側）から、明るい庭園に露出を合わせてシャッターを切るだけで、息を呑む額縁写真が撮れます。",
          composition: "📐 額縁構図（室内フレーム）",
          linkUrl: "javascript:JapanApp.openDetailModal('jp_004')",
          linkLabel: "⛩️ 旧齋藤家別邸の3ショットを見る"
        }
      ]
    },
    {
      id: "route_uonuma",
      areaName: "🏔️ 十日町・魚沼・長岡（星峠の棚田〜美人林〜清津峡〜雲洞庵〜宝徳山）絶景遠征コース",
      bestSeason: "春（5〜6月：水鏡・新緑・ブッポウソウ）＆ 秋（10〜11月：雲海・紅葉・神幸祭）",
      driveNote: "🚗 週末の特別遠征に！外国人が一生に一度は見たい新潟の世界的絶景を1日で制覇。",
      steps: [
        {
          id: "uonuma_1",
          time: "05:00〜06:30",
          genre: "🏔️ 世界級の絶景（水鏡・朝霧）",
          spot: "星峠の棚田（十日町市松代）",
          title: "日の出とともに200枚の棚田が黄金に輝く『空1：棚田2』の三分割ショット",
          detail: "展望台から中望遠レンズ（70〜135mm）で大小の棚田がリズミカルに重なる部分を切り取ります。春・秋は田んぼに空が映る水鏡と朝霧のダブルチャンス！",
          composition: "📐 三分割構図 ＋ 曲線リズム構図",
          linkUrl: "javascript:JapanApp.openDetailModal('jp_012')",
          linkLabel: "🏔️ 星峠の棚田の3ショットを見る"
        },
        {
          id: "uonuma_2",
          time: "07:00〜08:30",
          genre: "🏔️ 美人林 ＋ 🐦 アカショウビン・ブッポウソウ",
          spot: "美人林・松之山（十日町市・星峠から車で約20分）",
          title: "朝霧のブナ林を『垂直リズム＆ローアングル放射線構図』で撮り、夏鳥の声を聴く",
          detail: "朝の斜光がブナの幹を立体的に照らし、林内の池には逆さブナが映り込みます。初夏は周囲でアカショウビン（キョロロ…）やブッポウソウに出会えることも！",
          composition: "📐 放射線構図 ＋ 水面リフレクション構図",
          linkUrl: "javascript:JapanApp.openDetailModal('jp_013')",
          linkLabel: "🏔️ 美人林の3ショットを見る"
        },
        {
          id: "uonuma_3",
          time: "09:30〜11:00",
          genre: "🏔️ 清津峡トンネル ＋ ⛩️ 雲洞庵",
          spot: "清津峡渓谷トンネル（十日町市）〜 雲洞庵（南魚沼市）",
          title: "完全シンメトリーの水鏡トンネルと、赤門から続く『一字一石の石畳』",
          detail: "清津峡ではカメラを水面ギリギリに下げて上下50:50の完全対称ショットを撮影。その後、関越道塩沢石打IC近くの古刹『雲洞庵』で赤門の額縁構図＆石畳のリーディングライン構図を堪能します。",
          composition: "📐 完全シンメトリー水鏡構図 ＋ 額縁構図",
          linkUrl: "javascript:JapanApp.openDetailModal('jp_011')",
          linkLabel: "🏔️ 清津峡＆雲洞庵を見る"
        }
      ]
    }
  ];

  // ==========================================================================
  // 4. 🌅 マジックアワー・水鏡・雲海・野鳥活性チャンス予報ロジック
  // ==========================================================================
  function evaluateWeatherCondition(wind, weather, timeSlot) {
    let reflectionScore = 50; // 水鏡確率
    let mistScore = 30;       // 朝霧・雲海・光芒確率
    let birdScore = 60;       // 野鳥活性＆順光撮影度
    let shrineToneScore = 65; // 神社仏閣・苔・紅葉のしっとり発色度

    // 風速による影響
    if (wind === "calm") {
      reflectionScore += 45;
      birdScore += 20;
    } else if (wind === "breeze") {
      reflectionScore -= 15;
      birdScore += 5;
    } else if (wind === "strong") {
      reflectionScore -= 45;
      mistScore -= 25;
      birdScore -= 25;
    }

    // 天気による影響
    if (weather === "after_rain_clear") {
      mistScore += 55;
      reflectionScore += 5;
      shrineToneScore += 25;
      birdScore += 15;
    } else if (weather === "sunny") {
      reflectionScore += 5;
      birdScore += 15;
      shrineToneScore -= 5; // ピーカン昼間は白飛びしやすい
    } else if (weather === "cloudy_mist") {
      shrineToneScore += 30; // 曇天・小雨上がりは苔・朱塗り・紅葉・花の色が最高に出る！
      mistScore += 25;
      birdScore -= 5;
    } else if (weather === "snow_clear") {
      reflectionScore += 5;
      shrineToneScore += 25; // 雪化粧の社殿は最高
      birdScore += 15;
    }

    // 時間帯による影響
    if (timeSlot === "early_morning") {
      reflectionScore += 10;
      mistScore += 20;
      birdScore += 20;
      shrineToneScore += 10;
    } else if (timeSlot === "morning") {
      birdScore += 10;
      mistScore -= 10;
    } else if (timeSlot === "noon") {
      reflectionScore -= 15;
      mistScore -= 35;
      birdScore -= 20;
      if (weather === "sunny") shrineToneScore -= 20;
    } else if (timeSlot === "magic_hour") {
      reflectionScore += 10;
      birdScore += 5;
      shrineToneScore += 10;
    }

    const clamp = (v) => Math.max(5, Math.min(99, v));
    reflectionScore = clamp(reflectionScore);
    mistScore = clamp(mistScore);
    birdScore = clamp(birdScore);
    shrineToneScore = clamp(shrineToneScore);

    const adviceList = [];
    if (reflectionScore >= 80) {
      adviceList.push("🪞 <strong>【特大チャンス：水鏡（リフレクション）日和！】</strong> 風が弱く水面が鏡になります。福島潟（五頭山反射）、いもり池（逆さ妙高）、清津峡、星峠の棚田で上下対称のシンメトリー構図を狙いましょう！");
    }
    if (mistScore >= 75) {
      adviceList.push("☁️ <strong>【特大チャンス：朝霧・雲海・光芒（天使の梯子）発生条件！】</strong> 雨上がりの放射冷却で水蒸気が立ち込めます。彌彦神社の杉並木、滝谷慈光寺、美人林、星峠の棚田で幻想的な光の筋が撮れます！");
    }
    if (shrineToneScore >= 85) {
      adviceList.push("⛩️🍁 <strong>【実はプロが喜ぶ『神社仏閣・苔・紅葉・山野草』最高の発色条件！】</strong> 強い直射日光がない（または雨上がりで石畳や苔が濡れている）ため、白飛びせず朱塗りの柱・緑の苔・紅葉が驚くほど深く艶やかに写ります！露出補正を「-0.3〜-0.7EV」にして撮ってみてください。");
    }
    if (birdScore >= 80) {
      adviceList.push("🐦 <strong>【野鳥の活性＆羽毛ディテール最高潮！】</strong> 風が穏やかで小鳥が枝先に出てきやすく、低い角度の柔らかい光で野鳥の目にキャッチライトが入ります。福島潟・海辺の森・秋葉公園・弥彦公園へGO！");
    }
    if (adviceList.length === 0) {
      adviceList.push("📸 <strong>【日中のスナップ＆屋内額縁構図がおすすめ！】</strong> 太陽が高い時間帯や風がある日は、旧齋藤家別邸や北方文化博物館など『和室の中から庭園を切り取る額縁構図』や、森の中の木漏れ日スナップ、御朱印巡りが安定して綺麗に撮れます！");
    }

    return {
      reflectionScore,
      mistScore,
      birdScore,
      shrineToneScore,
      adviceList
    };
  }

  // ==========================================================================
  // 5. 🏅 新潟カメラマン称号・3アプリ横断バッジ判定
  // ==========================================================================
  const BADGE_DEFINITIONS = [
    {
      id: "bdg_kita",
      icon: "🦢",
      title: "新潟市北区・福島潟マイスター",
      desc: "ホームグラウンド・新潟市北区（福島潟・海辺の森・阿賀野川）の野鳥・絶景・花のいずれかをGET登録",
      check: (ctx) => ctx.kitaCount > 0,
      progressText: (ctx) => `北区でのGET数: ${ctx.kitaCount}件`
    },
    {
      id: "bdg_akiha",
      icon: "🍁",
      title: "秋葉区・里山＆古刹ハンター",
      desc: "秋葉区・五泉エリア（秋葉公園・新津丘陵・滝谷慈光寺・北方文化博物館など）の被写体をGET登録",
      check: (ctx) => ctx.akihaCount > 0,
      progressText: (ctx) => `秋葉区・近郊でのGET数: ${ctx.akihaCount}件`
    },
    {
      id: "bdg_yahiko",
      icon: "⛩️",
      title: "越後一宮・弥彦＆角田マイスター",
      desc: "弥彦・角田山エリア（彌彦神社・もみじ谷・弥彦の野鳥・雪割草やカタクリ）の被写体をGET登録",
      check: (ctx) => ctx.yahikoCount > 0,
      progressText: (ctx) => `弥彦・角田でのGET数: ${ctx.yahikoCount}件`
    },
    {
      id: "bdg_framing",
      icon: "📐",
      title: "脱・日の丸！額縁構図の魔術師",
      desc: "彌彦神社随神門・旧齋藤家別邸・弥彦もみじ谷・雲洞庵など『額縁構図』の名スポットをGET登録",
      check: (ctx) => ctx.framingCount > 0,
      progressText: (ctx) => `額縁構図スポットGET数: ${ctx.framingCount}件`
    },
    {
      id: "bdg_reflection",
      icon: "🪞",
      title: "水鏡（リフレクション）ハンター",
      desc: "清津峡・星峠の棚田・いもり池・福島潟など『水鏡』が輝く絶景スポットをGET登録",
      check: (ctx) => ctx.reflectionCount > 0,
      progressText: (ctx) => `水鏡スポットGET数: ${ctx.reflectionCount}件`
    },
    {
      id: "bdg_goshuin",
      icon: "🏮",
      title: "越後名社・御朱印＆野鳥巡礼者",
      desc: "『デジタル御朱印帳』に御朱印または参拝コラボ記録を1件以上登録",
      check: (ctx) => ctx.goshuinCount > 0,
      progressText: (ctx) => `御朱印帳の記録数: ${ctx.goshuinCount}社・寺`
    },
    {
      id: "bdg_flora",
      icon: "🌸",
      title: "新潟の花・スプリングエフェメラル発見者",
      desc: "『四季の花・草木図鑑』で雪割草・カタクリ・菜の花・オニバスなどの花を1種以上GET登録",
      check: (ctx) => ctx.totalFlora > 0,
      progressText: (ctx) => `花図鑑GET数: ${ctx.totalFlora}種`
    },
    {
      id: "bdg_bird5",
      icon: "🦅",
      title: "にいがた野鳥フォトグラファー",
      desc: "『にいがた野鳥図鑑』で野鳥を1種以上GET登録（さらに5種・10種でランクアップ！）",
      check: (ctx) => ctx.totalBirds > 0,
      progressText: (ctx) => `野鳥図鑑GET数: ${ctx.totalBirds}種`
    },
    {
      id: "bdg_postcard",
      icon: "🖼️",
      title: "日本の美・写真展クリエイター",
      desc: "『ポストカード＆写真展パネル書き出しスタジオ』で作品画像を1枚以上作成・保存",
      check: (ctx) => ctx.postcardCount > 0,
      progressText: (ctx) => `作品パネル書き出し枚数: ${ctx.postcardCount}枚`
    },
    {
      id: "bdg_trilogy",
      icon: "👑",
      title: "新潟3部作・グランドカメラマスター",
      desc: "『🐦野鳥』『⛩️🏔️神社仏閣・絶景』『🌸四季の花』の3つの図鑑すべてで写真をGET登録！",
      check: (ctx) => ctx.totalBirds > 0 && ctx.totalShrineScenery > 0 && ctx.totalFlora > 0,
      progressText: (ctx) => `野鳥(${ctx.totalBirds})・神社絶景(${ctx.totalShrineScenery})・花(${ctx.totalFlora})`
    }
  ];

  // 他DBからキャプチャを取得する共通関数
  function readDBKey(dbName, keyName) {
    return new Promise((resolve) => {
      if (!window.indexedDB) { resolve(null); return; }
      try {
        const req = indexedDB.open(dbName, 1);
        req.onsuccess = (e) => {
          const d = e.target.result;
          if (!d.objectStoreNames.contains("kv")) { resolve(null); return; }
          const tx = d.transaction("kv", "readonly");
          const g = tx.objectStore("kv").get(keyName);
          g.onsuccess = () => resolve(g.result || null);
          g.onerror = () => resolve(null);
        };
        req.onerror = () => resolve(null);
      } catch (_) {
        resolve(null);
      }
    });
  }

  async function gatherAllDexContext() {
    loadSuiteState();
    let birdCaptures = {};
    let shrineCaptures = {};
    let floraCaptures = {};

    try {
      const bCap = await readDBKey("NiigataBirdDexDB", "captures");
      if (bCap) birdCaptures = bCap;
    } catch (_) {}

    try {
      const sState = await readDBKey("NiigataShrineSceneryDexDB", "state");
      if (sState && sState.captures) shrineCaptures = sState.captures;
    } catch (_) {}

    try {
      const fState = await readDBKey("NiigataFloraDexDB", "state");
      if (fState && fState.captures) floraCaptures = fState.captures;
    } catch (_) {}

    const birdIds = Object.keys(birdCaptures).filter(k => (birdCaptures[k] || []).length > 0);
    const shrineIds = Object.keys(shrineCaptures).filter(k => (shrineCaptures[k] || []).length > 0);
    const floraIds = Object.keys(floraCaptures).filter(k => (floraCaptures[k] || []).length > 0);

    let kitaCount = 0;
    let akihaCount = 0;
    let yahikoCount = 0;
    let framingCount = 0;
    let reflectionCount = 0;

    shrineIds.forEach(id => {
      const it = (window.JAPAN_BEAUTY_DEX || []).find(x => x.id === id);
      if (!it) return;
      if (["fukushimagata", "kaibenomori", "aganogawa"].includes(it.spotId)) kitaCount++;
      if (it.spotId === "akiha") akihaCount++;
      if (it.spotId === "yahiko") yahikoCount++;
      if ((it.compositionType || "").includes("額縁")) framingCount++;
      if ((it.compositionType || "").includes("水鏡") || (it.compositionType || "").includes("リフレクション")) reflectionCount++;
    });

    floraIds.forEach(id => {
      const fl = (window.NIIGATA_FLORA_DEX || []).find(x => x.id === id);
      if (!fl) return;
      if (["fukushimagata", "kaibenomori", "aganogawa"].includes(fl.spotId)) kitaCount++;
      if (fl.spotId === "akiha") akihaCount++;
      if (fl.spotId === "yahiko") yahikoCount++;
    });

    birdIds.forEach(id => {
      const bd = (window.NIIGATA_BIRDS || []).find(x => x.id === id);
      if (!bd || !bd.spotIds) return;
      if (bd.spotIds.some(s => ["fukushimagata", "kaibenomori", "aganogawa"].includes(s))) kitaCount++;
      if (bd.spotIds.includes("akiha")) akihaCount++;
      if (bd.spotIds.includes("yahiko")) yahikoCount++;
    });

    return {
      birdCaptures,
      shrineCaptures,
      floraCaptures,
      totalBirds: birdIds.length,
      totalShrineScenery: shrineIds.length,
      totalFlora: floraIds.length,
      kitaCount,
      akihaCount,
      yahikoCount,
      framingCount,
      reflectionCount,
      goshuinCount: Object.keys(suiteState.goshuinRecords).length,
      postcardCount: suiteState.postcardCount || 0
    };
  }

  // ==========================================================================
  // UIレンダリング：『🌟 カメラ満喫5大ツール（黄金ルート・ポストカード・御朱印帳・気象予報・称号）』
  // ==========================================================================
  let currentToolTab = "routes";
  let postcardImageObj = null;

  async function renderSuiteMain(targetSubTab) {
    if (targetSubTab) currentToolTab = targetSubTab;
    const container = document.getElementById("sec-enjoy-suite");
    if (!container) return;

    // 御朱印帳タブが直接選ばれた場合は、余計なサブメニューやポストカード等を出さず御朱印帳のみをスッキリ表示
    if (currentToolTab === "goshuin") {
      container.innerHTML = `<div id="suite-subview-body"></div>`;
      const bodyEl = document.getElementById("suite-subview-body");
      renderGoshuinSubView(bodyEl);
      return;
    }

    const ctx = await gatherAllDexContext();
    const unlockedBadges = BADGE_DEFINITIONS.filter(b => b.check(ctx)).length;

    container.innerHTML = `
      <div style="background:#0f172a; color:#f8fafc; border-radius:14px; padding:20px; margin-bottom:18px; border:1px solid #334155;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <span style="background:#334155; color:#e2e8f0; font-size:0.72rem; font-weight:700; padding:2px 9px; border-radius:4px;">🌟 カメラ趣味＆お出かけサポート</span>
            <h2 style="font-size:1.25rem; font-weight:900; margin-top:6px;">📸 新潟カメラライフ・お出かけ＆作品スタジオ</h2>
          </div>
          <div style="background:#1e293b; border:1px solid #475569; padding:7px 14px; border-radius:8px; font-size:0.8rem; color:#e2e8f0;">
            🏅 獲得済み称号バッジ: <strong style="color:#fbbf24; font-size:1rem;">${unlockedBadges}</strong> / ${BADGE_DEFINITIONS.length}個
          </div>
        </div>
      </div>

      <div id="suite-subview-body"></div>
    `;

    const bodyEl = document.getElementById("suite-subview-body");
    if (currentToolTab === "routes") {
      renderRoutesSubView(bodyEl);
    } else if (currentToolTab === "weather") {
      renderWeatherSubView(bodyEl);
    } else if (currentToolTab === "badges") {
      renderBadgesSubView(bodyEl, ctx);
    }
  }

  // --------------------------------------------------------------------------
  // SubView 1: 🚗 半日お出かけ・カメラ黄金ルート
  // --------------------------------------------------------------------------
  function renderRoutesSubView(bodyEl) {
    bodyEl.innerHTML = `
      <div style="background:#fff; border:2px solid #e2e8f0; border-radius:16px; padding:20px;">
        <h3 style="font-size:1.18rem; font-weight:900; color:#0f172a; margin-bottom:6px;">
          🚗 光の向き・野鳥の活動時間・花の開花時刻を計算した「半日お出かけ黄金タイムテーブル」
        </h3>
        <p style="font-size:0.84rem; color:#475569; margin-bottom:16px;">
          「野鳥は早朝6〜8時が一番活発」「神社は無人の7〜8時台が最高」「雪割草やカタクリは日が当たる9時半以降に開く」という自然の法則に合わせて、<strong>1回の外出で野鳥・神社・絶景・花をすべてベストな光で撮れる順番</strong>をご案内します！チェックボックスで達成記録も付けられます。
        </p>

        <div style="display:flex; flex-direction:column; gap:18px;">
          ${GOLDEN_ROUTES.map(rt => `
            <div style="border:1px solid #cbd5e1; border-radius:12px; overflow:hidden; background:#f8fafc;">
              <div style="background:#1e293b; color:#f8fafc; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; border-bottom:1px solid #334155;">
                <div>
                  <strong style="font-size:1rem; color:#f8fafc;">${rt.areaName}</strong>
                  <div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">📅 おすすめ時期：${rt.bestSeason}</div>
                </div>
                <span style="background:rgba(255,255,255,0.08); color:#cbd5e1; border:1px solid rgba(255,255,255,0.15); padding:4px 10px; border-radius:6px; font-size:0.74rem;">${rt.driveNote}</span>
              </div>
              <div style="padding:14px; display:grid; grid-template-columns:repeat(auto-fit, minmax(270px, 1fr)); gap:12px;">
                ${rt.steps.map((st, idx) => {
                  const done = !!suiteState.checkedRoutes[st.id];
                  return `
                    <div style="background:${done ? '#fffbeb' : '#fff'}; border:1px solid ${done ? '#f59e0b' : '#e2e8f0'}; border-radius:10px; padding:12px; display:flex; flex-direction:column;">
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span style="background:#334155; color:#f8fafc; font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:4px;">STEP ${idx + 1} ｜ ⏰ ${st.time}</span>
                        <label style="font-size:0.74rem; font-weight:700; color:#64748b; cursor:pointer; display:flex; align-items:center; gap:4px;">
                          <input type="checkbox" ${done ? 'checked' : ''} onchange="CameraEnjoySuite.toggleRouteStep('${st.id}')" />
                          達成済
                        </label>
                      </div>
                      <div style="font-size:0.73rem; font-weight:700; color:#64748b; margin-bottom:3px;">${st.genre} ｜ 📍 ${st.spot}</div>
                      <strong style="font-size:0.9rem; color:#0f172a; margin-bottom:6px;">${st.title}</strong>
                      <p style="font-size:0.78rem; color:#475569; margin-bottom:8px; flex:1;">${st.detail}</p>
                      <div style="font-size:0.72rem; background:#f8fafc; border:1px solid #e2e8f0; padding:5px 8px; border-radius:6px; color:#334155; font-weight:600; margin-bottom:8px;">
                        ${st.composition}
                      </div>
                      <a href="${st.linkUrl.startsWith('javascript:JapanApp') && !window.JapanApp ? '../神社仏閣・絶景・花図鑑/index.html' : st.linkUrl}" class="btn btn-outline btn-sm">${st.linkLabel} →</a>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function toggleRouteStep(stepId) {
    loadSuiteState();
    suiteState.checkedRoutes[stepId] = !suiteState.checkedRoutes[stepId];
    saveSuiteState();
    const plannerRoutesEl = document.getElementById("planner-routes-box");
    if (plannerRoutesEl) {
      renderRoutesSubView(plannerRoutesEl);
    } else {
      renderSuiteMain("routes");
    }
  }

  // --------------------------------------------------------------------------
  // SubView 2: 🖼️ 日本の美・ポストカード／2L判プリント用デザイン書き出しスタジオ
  // --------------------------------------------------------------------------
  function renderPostcardSubView(bodyEl, ctx) {
    // 3アプリから選択可能な登録済みマイ写真リストを作成
    const myPhotosList = [];
    Object.keys(ctx.shrineCaptures).forEach(id => {
      const caps = ctx.shrineCaptures[id] || [];
      const it = (window.JAPAN_BEAUTY_DEX || []).find(x => x.id === id);
      if (caps[0] && it) {
        myPhotosList.push({
          label: `⛩️ [マイ写真] ${it.name} (${caps[0].date || ''})`,
          dataUrl: caps[0].dataUrl,
          titleJp: it.name,
          titleEn: it.englishTitle || "Niigata, Japan",
          area: it.area,
          spec: `${caps[0].camera || 'Camera'} ${caps[0].focalLength || ''} ${caps[0].fNumber || ''} ${caps[0].shutterSpeed || ''}`.trim(),
          date: caps[0].date || new Date().toISOString().slice(0, 10)
        });
      }
    });
    Object.keys(ctx.birdCaptures).forEach(id => {
      const caps = ctx.birdCaptures[id] || [];
      const bd = (window.NIIGATA_BIRDS || []).find(x => x.id === id);
      if (caps[0] && bd) {
        myPhotosList.push({
          label: `🐦 [マイ写真] ${bd.name} (${caps[0].date || ''})`,
          dataUrl: caps[0].dataUrl,
          titleJp: `新潟の野鳥・${bd.name}`,
          titleEn: `${bd.englishName || bd.scientificName || 'Wild Bird'} - Niigata, Japan`,
          area: "Niigata Sanctuary",
          spec: `${caps[0].camera || ''} ${caps[0].focalLength ? caps[0].focalLength + 'mm' : ''} ${caps[0].fNumber ? 'F' + caps[0].fNumber : ''} ${caps[0].shutterSpeed || ''}`.trim(),
          date: caps[0].date || new Date().toISOString().slice(0, 10)
        });
      }
    });
    Object.keys(ctx.floraCaptures).forEach(id => {
      const caps = ctx.floraCaptures[id] || [];
      const fl = (window.NIIGATA_FLORA_DEX || []).find(x => x.id === id);
      if (caps[0] && fl) {
        myPhotosList.push({
          label: `🌸 [マイ写真] ${fl.name} (${caps[0].date || ''})`,
          dataUrl: caps[0].dataUrl,
          titleJp: fl.name,
          titleEn: `${fl.englishName || 'Seasonal Flora'} - Niigata, Japan`,
          area: fl.spotName,
          spec: `${caps[0].camera || 'Camera'}`,
          date: caps[0].date || new Date().toISOString().slice(0, 10)
        });
      }
    });

    bodyEl.innerHTML = `
      <div style="background:#fff; border:2px solid #e2e8f0; border-radius:16px; padding:20px;">
        <h3 style="font-size:1.18rem; font-weight:900; color:#0f172a; margin-bottom:6px;">
          🖼️ 日本の美・ポストカード＆写真展パネル（2L判・SNS用）デザイン書き出しスタジオ
        </h3>
        <p style="font-size:0.84rem; color:#475569; margin-bottom:16px;">
          撮影した写真（またはPC内の好きな写真）を選ぶだけで、<strong>写真展の額装パネルのような余白・英語タイトル・撮影データ・落款（朱印スタンプ）</strong>を自動デザインして高画質PNG画像として保存できます！ご自宅での2L判プリントや海外向けSNS発信にそのまま使えます。
        </p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px; align-items:start;">
          <!-- 左側：設定フォーム -->
          <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:12px; padding:16px;">
            <div style="margin-bottom:12px;">
              <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">① 写真ソースを選択（PCから直接選ぶか、3アプリの登録写真から選択）：</label>
              <input type="file" accept="image/*" onchange="CameraEnjoySuite.onPostcardFileSelect(event)" style="margin-bottom:8px; width:100%;" />
              ${myPhotosList.length > 0 ? `
                <select id="pc-myphoto-select" class="filter-select" style="width:100%;" onchange="CameraEnjoySuite.onSelectMyRegisteredPhoto(this.value)">
                  <option value="">-- または3アプリでGET登録済みのマイ写真（${myPhotosList.length}枚）から選ぶ --</option>
                  ${myPhotosList.map((m, i) => `<option value="${i}">${m.label}</option>`).join("")}
                </select>
              ` : `<div style="font-size:0.75rem; color:#64748b;">※図鑑にGET登録した写真があると、ここからもワンクリックで呼び出せます。</div>`}
            </div>

            <div style="margin-bottom:10px;">
              <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">② 額装フレームデザイン：</label>
              <select id="pc-theme" class="filter-select" style="width:100%;" onchange="CameraEnjoySuite.drawPostcardPreview()">
                <option value="museum_white">🎴 美術館ギャラリー白枠（Museum White / 2Lプリント一番人気）</option>
                <option value="urushi_black">🖤 漆黒＆金文字ギャラリー（Urushi Black / 紅葉・雪景・野鳥が劇的に映える）</option>
                <option value="washi_cream">📜 越後和紙クリーム＆朱印枠（Echigo Washi / 神社仏閣・山野草に最適）</option>
              </select>
            </div>

            <div style="margin-bottom:10px;">
              <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">③ 作品メインタイトル（日本語）：</label>
              <input type="text" id="pc-title-jp" class="filter-input" style="width:100%;" value="越後一宮 彌彦神社 — 悠久の杜" oninput="CameraEnjoySuite.drawPostcardPreview()" />
            </div>

            <div style="margin-bottom:10px;">
              <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">④ 外国人向けサブタイトル（英語）：</label>
              <input type="text" id="pc-title-en" class="filter-input" style="width:100%;" value="Yahiko Shrine Sacred Forest — Niigata, Japan" oninput="CameraEnjoySuite.drawPostcardPreview()" />
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;">
              <div>
                <label style="font-size:0.78rem; font-weight:800; display:block; margin-bottom:4px;">⑤ 撮影データ・カメラ名：</label>
                <input type="text" id="pc-spec" class="filter-input" style="width:100%;" value="50mm F4.0 1/250s ISO200" oninput="CameraEnjoySuite.drawPostcardPreview()" />
              </div>
              <div>
                <label style="font-size:0.78rem; font-weight:800; display:block; margin-bottom:4px;">⑥ 撮影日・クレジット：</label>
                <input type="text" id="pc-date" class="filter-input" style="width:100%;" value="${new Date().toISOString().slice(0, 10)} | NIIGATA DEX" oninput="CameraEnjoySuite.drawPostcardPreview()" />
              </div>
            </div>

            <div style="margin-bottom:14px;">
              <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">⑦ 和の落款（朱印スタンプ）文字：</label>
              <select id="pc-stamp" class="filter-select" style="width:100%;" onchange="CameraEnjoySuite.drawPostcardPreview()">
                <option value="新潟寫眞">印：「新潟寫眞」（おすすめ）</option>
                <option value="越後百景">印：「越後百景」</option>
                <option value="野鳥圖鑑">印：「野鳥圖鑑」</option>
                <option value="和美絶景">印：「和美絶景」</option>
                <option value="none">落款スタンプなし</option>
              </select>
            </div>

            <button class="btn btn-gold" style="width:100%; padding:12px; font-size:0.95rem;" onclick="CameraEnjoySuite.downloadPostcard()">
              💾 完成した作品ポストカード画像（PNG）を保存する
            </button>
          </div>

          <!-- 右側：リアルタイムCanvasプレビュー -->
          <div style="background:#0f172a; padding:16px; border-radius:12px; text-align:center;">
            <div style="color:#fde68a; font-size:0.8rem; font-weight:800; margin-bottom:8px;">🖼️ リアルタイム完成プレビュー（高解像度 1400×1050px）</div>
            <canvas id="pc-canvas" width="1400" height="1050" style="width:100%; max-width:560px; height:auto; border-radius:6px; box-shadow:0 10px 30px rgba(0,0,0,0.5);"></canvas>
          </div>
        </div>
      </div>
    `;

    window._cachedMyPhotosList = myPhotosList;
    if (myPhotosList.length > 0 && !postcardImageObj) {
      onSelectMyRegisteredPhoto(0);
    } else {
      drawPostcardPreview();
    }
  }

  function onPostcardFileSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (window.ExifAnalyzer && window.ExifAnalyzer.extractExifFromFile) {
      window.ExifAnalyzer.extractExifFromFile(file).then(exif => {
        if (exif) {
          const specParts = [];
          if (exif.cameraModel) specParts.push(exif.cameraModel);
          if (exif.focalLength) specParts.push(`${exif.focalLength}mm`);
          if (exif.fNumber) specParts.push(`F${exif.fNumber}`);
          if (exif.shutterSpeedText) specParts.push(exif.shutterSpeedText);
          if (specParts.length > 0) {
            const spEl = document.getElementById("pc-spec");
            if (spEl) spEl.value = specParts.join(" ");
          }
          if (exif.date) {
            const dtEl = document.getElementById("pc-date");
            if (dtEl) dtEl.value = `${exif.date} | NIIGATA PHOTO`;
          }
          drawPostcardPreview();
        }
      }).catch(() => {});
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        postcardImageObj = img;
        drawPostcardPreview();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function onSelectMyRegisteredPhoto(idxStr) {
    const list = window._cachedMyPhotosList || [];
    const item = list[Number(idxStr)];
    if (!item) return;
    const tJp = document.getElementById("pc-title-jp");
    const tEn = document.getElementById("pc-title-en");
    const sp = document.getElementById("pc-spec");
    const dt = document.getElementById("pc-date");
    if (tJp) tJp.value = item.titleJp;
    if (tEn) tEn.value = item.titleEn;
    if (sp && item.spec) sp.value = item.spec;
    if (dt && item.date) dt.value = `${item.date} | ${item.area}`;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      postcardImageObj = img;
      drawPostcardPreview();
    };
    img.src = item.dataUrl;
  }

  function drawPostcardPreview() {
    const canvas = document.getElementById("pc-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    const theme = document.getElementById("pc-theme")?.value || "museum_white";
    const titleJp = document.getElementById("pc-title-jp")?.value || "";
    const titleEn = document.getElementById("pc-title-en")?.value || "";
    const spec = document.getElementById("pc-spec")?.value || "";
    const dateStr = document.getElementById("pc-date")?.value || "";
    const stampText = document.getElementById("pc-stamp")?.value || "新潟寫眞";

    // 背景と文字色
    let bgColor = "#ffffff";
    let innerBorder = "#cbd5e1";
    let mainText = "#0f172a";
    let subText = "#475569";
    let accentLine = "#991b1b";

    if (theme === "urushi_black") {
      bgColor = "#0b0f19";
      innerBorder = "#b45309";
      mainText = "#f8fafc";
      subText = "#fde68a";
      accentLine = "#f59e0b";
    } else if (theme === "washi_cream") {
      bgColor = "#faf6ee";
      innerBorder = "#d6c7b2";
      mainText = "#292524";
      subText = "#78350f";
      accentLine = "#991b1b";
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    // 外周の飾り細線
    ctx.strokeStyle = innerBorder;
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, W - 72, H - 72);

    // 写真描画エリア
    const padX = 85;
    const padTop = 75;
    const photoW = W - padX * 2;
    const photoH = 740;

    ctx.fillStyle = "#090d16";
    ctx.fillRect(padX, padTop, photoW, photoH);

    if (postcardImageObj) {
      // アスペクト比を保って中央に美しくフィット（contain / cover ハイブリッド）
      const iw = postcardImageObj.width;
      const ih = postcardImageObj.height;
      const scale = Math.min(photoW / iw, photoH / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = padX + (photoW - dw) / 2;
      const dy = padTop + (photoH - dh) / 2;
      ctx.drawImage(postcardImageObj, dx, dy, dw, dh);
    } else {
      // デモ風景グラデーション描画
      const grad = ctx.createLinearGradient(padX, padTop, padX + photoW, padTop + photoH);
      grad.addColorStop(0, "#1e1b4b");
      grad.addColorStop(0.55, "#7f1d1d");
      grad.addColorStop(1, "#d97706");
      ctx.fillStyle = grad;
      ctx.fillRect(padX, padTop, photoW, photoH);
      ctx.fillStyle = "rgba(254, 240, 138, 0.28)";
      ctx.beginPath();
      ctx.arc(padX + photoW * 0.72, padTop + photoH * 0.32, 110, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("📷 左の「ファイルを選択」または「マイ写真」から写真を選ぶとここに額装されます", padX + photoW / 2, padTop + photoH / 2);
    }

    // 写真枠の細いゴールド/グレーライン
    ctx.strokeStyle = accentLine;
    ctx.lineWidth = 2;
    ctx.strokeRect(padX, padTop, photoW, photoH);

    // 下部キャプション領域
    const capY = padTop + photoH + 62;
    ctx.textAlign = "left";
    ctx.fillStyle = mainText;
    ctx.font = "900 36px 'Hiragino Mincho ProN', 'Yu Mincho', serif";
    ctx.fillText(titleJp, padX, capY);

    ctx.fillStyle = subText;
    ctx.font = "bold 22px Georgia, serif";
    ctx.fillText(titleEn, padX, capY + 40);

    // 右下に撮影スペック＆日付
    ctx.textAlign = "right";
    const rightEdge = stampText !== "none" ? W - padX - 110 : W - padX;
    ctx.fillStyle = subText;
    ctx.font = "bold 20px monospace";
    ctx.fillText(spec, rightEdge, capY - 2);
    ctx.font = "18px sans-serif";
    ctx.fillText(dateStr, rightEdge, capY + 34);

    // 朱印（落款スタンプ）描画
    if (stampText !== "none") {
      const sx = W - padX - 82;
      const sy = capY - 38;
      ctx.save();
      ctx.fillStyle = "#b91c1c";
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 3;
      ctx.fillRect(sx, sy, 80, 80);
      ctx.strokeStyle = "#fef2f2";
      ctx.lineWidth = 2;
      ctx.strokeRect(sx + 5, sy + 5, 70, 70);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px serif";
      ctx.textAlign = "center";
      const chars = stampText.split("");
      if (chars.length >= 4) {
        ctx.fillText(chars[0], sx + 54, sy + 34);
        ctx.fillText(chars[1], sx + 54, sy + 64);
        ctx.fillText(chars[2], sx + 26, sy + 34);
        ctx.fillText(chars[3], sx + 26, sy + 64);
      }
      ctx.restore();
    }
  }

  function downloadPostcard() {
    const canvas = document.getElementById("pc-canvas");
    if (!canvas) return;
    loadSuiteState();
    suiteState.postcardCount = (suiteState.postcardCount || 0) + 1;
    saveSuiteState();

    const a = document.createElement("a");
    const titleJp = (document.getElementById("pc-title-jp")?.value || "niigata-photo").slice(0, 20);
    a.download = `新潟作品パネル_${titleJp}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  // --------------------------------------------------------------------------
  // SubView 3: 🏮 御朱印＆野鳥・花コラボデジタル朱印帳
  // --------------------------------------------------------------------------
  function renderGoshuinSubView(bodyEl) {
    loadSuiteState();
    const shrines = (window.JAPAN_BEAUTY_DEX || []).filter(it => it.hasGoshuin);
    const gotCount = shrines.filter(sh => !!suiteState.goshuinRecords[sh.id]).length;

    bodyEl.innerHTML = `
      <div style="background:#fff; border:1px solid #cbd5e1; border-radius:14px; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px; border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
          <div>
            <h3 style="font-size:1.15rem; font-weight:900; color:#0f172a;">
              🏮 新潟県・御朱印がもらえる名社・名刹（全${shrines.length}社寺）デジタル御朱印帳
            </h3>
            <p style="font-size:0.82rem; color:#475569; margin-top:3px;">
              いただいた御朱印の写真（または参拝記念写真）と、その日の境内で見かけた野鳥・花を一緒に記録して、あなただけの御朱印帳を作れます。
            </p>
          </div>
          <div style="background:#fef2f2; border:1px solid #fca5a5; color:#991b1b; padding:6px 14px; border-radius:99px; font-size:0.82rem; font-weight:800;">
            💮 御朱印達成: ${gotCount} / ${shrines.length} 社寺
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(330px, 1fr)); gap:16px;">
          ${shrines.map(sh => {
            const rec = suiteState.goshuinRecords[sh.id];
            return `
              <div style="background:${rec ? '#fffbeb' : '#f8fafc'}; border:1.5px solid ${rec ? '#d97706' : '#cbd5e1'}; border-radius:12px; padding:14px; display:flex; flex-direction:column;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="background:#7f1d1d; color:#fef08a; font-size:0.7rem; font-weight:800; padding:2px 8px; border-radius:4px;">No.${sh.dexNo} ｜ ${sh.area}</span>
                  <span style="font-size:0.74rem; font-weight:800; color:${rec ? '#b91c1c' : '#64748b'};">
                    ${rec ? `💮 参拝記録済 (${rec.date})` : (sh.hasGoshuincho ? '📕 オリジナル御朱印帳あり' : '🏮 御朱印あり')}
                  </span>
                </div>
                <h4 style="font-size:1rem; font-weight:900; color:#0f172a; margin-bottom:6px;">${sh.name}</h4>
                <div style="font-size:0.74rem; color:#475569; background:#fff; border:1px solid #e2e8f0; border-radius:6px; padding:6px 8px; margin-bottom:8px;">
                  ${sh.goshuinInfo || ''}
                </div>

                <div style="height:170px; background:#0f172a; border-radius:10px; overflow:hidden; display:flex; align-items:center; justify-content:center; margin-bottom:10px; border:1px solid #cbd5e1;">
                  ${rec && rec.dataUrl
                    ? `<img src="${rec.dataUrl}" style="width:100%; height:100%; object-fit:contain;" alt="御朱印" />`
                    : `<div style="text-align:center; color:#cbd5e1; padding:14px; font-size:0.8rem;">
                        <div style="font-size:2rem; margin-bottom:4px;">🏮</div>
                        御朱印または参拝記念写真を登録できます
                      </div>`
                  }
                </div>

                ${rec ? `
                  <div style="font-size:0.78rem; background:#fff; border:1px solid #fca5a5; border-radius:8px; padding:8px 10px; margin-bottom:10px;">
                    <div><strong>🐦 境内で出会った野鳥：</strong>${rec.metBirds || '記録なし'}</div>
                    <div><strong>🌸 境内で見かけた花・木：</strong>${rec.metFlora || '記録なし'}</div>
                    ${rec.memo ? `<div style="margin-top:3px; color:#78350f;"><strong>📝 参拝メモ：</strong>${rec.memo}</div>` : ''}
                  </div>
                ` : `
                  <div style="font-size:0.75rem; color:#475569; margin-bottom:10px;">
                    🐦 この境内でよく出会える野鳥：${(sh.linkedBirds || []).join("・")}
                  </div>
                `}

                <div style="margin-top:auto; display:flex; gap:6px; flex-wrap:wrap;">
                  <label class="btn btn-vermilion btn-sm" style="flex:1; cursor:pointer;">
                    🏮 ${rec ? '御朱印写真を更新' : '御朱印・参拝を記録する'}
                    <input type="file" accept="image/*" style="display:none;" onchange="CameraEnjoySuite.onUploadGoshuin('${sh.id}', '${sh.name}', event)" />
                  </label>
                  <button class="btn btn-outline btn-sm" onclick="CameraEnjoySuite.editGoshuinNote('${sh.id}', '${sh.name}', '${(sh.linkedBirds||[]).slice(0,2).join('・')}')">✏️ 野鳥・花メモ編集</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  function onUploadGoshuin(shrineId, shrineName, event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        const maxD = 800;
        let w = img.width, h = img.height;
        if (w > maxD || h > maxD) {
          if (w > h) { h = Math.round(h * maxD / w); w = maxD; }
          else { w = Math.round(w * maxD / h); h = maxD; }
        }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

        loadSuiteState();
        const prev = suiteState.goshuinRecords[shrineId] || {};
        const metBirds = prompt(`🐦 「${shrineName}」の参拝時に出会った・声が聞こえた野鳥を入力してください：`, prev.metBirds || "ヤマガラ・シジュウカラ") || prev.metBirds || "";
        const metFlora = prompt(`🌸 境内で見かけた花・紅葉・御神木などを入力してください：`, prev.metFlora || "千年杉・苔") || prev.metFlora || "";
        const memo = prompt(`📝 参拝・撮影ひとことメモ：`, prev.memo || "朝の清々しい空気の中で参拝＆撮影！") || prev.memo || "";

        suiteState.goshuinRecords[shrineId] = {
          dataUrl,
          date: new Date().toISOString().slice(0, 10),
          metBirds,
          metFlora,
          memo
        };
        saveSuiteState();
        renderSuiteMain("goshuin");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function editGoshuinNote(shrineId, shrineName, defaultBirds) {
    loadSuiteState();
    const prev = suiteState.goshuinRecords[shrineId] || {};
    const metBirds = prompt(`🐦 「${shrineName}」で出会った野鳥：`, prev.metBirds || defaultBirds);
    if (metBirds === null) return;
    const metFlora = prompt(`🌸 境内で見かけた花や草木：`, prev.metFlora || "杉並木・季節の花");
    if (metFlora === null) return;
    const memo = prompt(`📝 参拝・撮影メモ：`, prev.memo || "額縁構図で随神門から撮影！");
    if (memo === null) return;

    suiteState.goshuinRecords[shrineId] = {
      dataUrl: prev.dataUrl || "",
      date: prev.date || new Date().toISOString().slice(0, 10),
      metBirds,
      metFlora,
      memo
    };
    saveSuiteState();
    renderSuiteMain("goshuin");
  }

  // --------------------------------------------------------------------------
  // SubView 4: 🌅 マジックアワー・水鏡・雲海・野鳥活性チャンス予報チェッカー
  // --------------------------------------------------------------------------
  function renderWeatherSubView(bodyEl) {
    bodyEl.innerHTML = `
      <div style="background:#fff; border:2px solid #e2e8f0; border-radius:16px; padding:20px;">
        <h3 style="font-size:1.18rem; font-weight:900; color:#0f172a; margin-bottom:6px;">
          🌅 お出かけ前の3秒診断！「水鏡・雲海・神社発色・野鳥活性」シャッターチャンス予報チェッカー
        </h3>
        <p style="font-size:0.84rem; color:#475569; margin-bottom:16px;">
          「今日はちょっと曇りだけど何を撮りに行こう？」「風が弱い朝はどこが狙い目？」を、<strong>風速・天気・時間帯の3つを選ぶだけで即座に判定</strong>します！
        </p>

        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:12px; padding:16px; display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:12px; margin-bottom:18px;">
          <div>
            <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">🍃 ① 今日の風速（風の強さ）：</label>
            <select id="wf-wind" class="filter-select" style="width:100%;" onchange="CameraEnjoySuite.updateWeatherSimulation()">
              <option value="calm">無風〜そよ風（風速 0〜2m/s：木の葉が揺れない）</option>
              <option value="breeze">弱い風（風速 3〜4m/s：小枝が揺れる）</option>
              <option value="strong">やや強い風（風速 5m/s以上：水面が波立つ）</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">⛅ ② 前夜〜今日の天気：</label>
            <select id="wf-weather" class="filter-select" style="width:100%;" onchange="CameraEnjoySuite.updateWeatherSimulation()">
              <option value="after_rain_clear">雨上がりの晴れ・放射冷却（前夜に雨＋朝冷え込む）</option>
              <option value="sunny">快晴・晴れ（青空が広がる）</option>
              <option value="cloudy_mist">曇り・小雨上がり（しっとり落ち着いた光）</option>
              <option value="snow_clear">雪化粧・冬型の晴れ間（雪景色）</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.82rem; font-weight:800; display:block; margin-bottom:4px;">⏰ ③ これから行く時間帯：</label>
            <select id="wf-time" class="filter-select" style="width:100%;" onchange="CameraEnjoySuite.updateWeatherSimulation()">
              <option value="early_morning">日の出〜早朝（05:00〜07:30）</option>
              <option value="morning">午前中（08:00〜11:00）</option>
              <option value="noon">昼前後（11:00〜15:00）</option>
              <option value="magic_hour">夕方マジックアワー（15:30〜日没）</option>
            </select>
          </div>
        </div>

        <div id="wf-result-box"></div>
      </div>
    `;
    updateWeatherSimulation();
  }

  function updateWeatherSimulation() {
    const wind = document.getElementById("wf-wind")?.value || "calm";
    const weather = document.getElementById("wf-weather")?.value || "after_rain_clear";
    const timeSlot = document.getElementById("wf-time")?.value || "early_morning";
    const res = evaluateWeatherCondition(wind, weather, timeSlot);

    const box = document.getElementById("wf-result-box");
    if (!box) return;

    const gaugeCard = (title, pct, color, sub) => `
      <div style="background:#0f172a; color:#fff; padding:14px; border-radius:12px; border:2px solid ${color};">
        <div style="font-size:0.8rem; color:#cbd5e1; margin-bottom:4px;">${title}</div>
        <div style="font-size:1.65rem; font-weight:900; color:${color}; margin-bottom:6px;">${pct}%</div>
        <div style="height:8px; background:#334155; border-radius:99px; overflow:hidden; margin-bottom:6px;">
          <div style="width:${pct}%; height:100%; background:${color};"></div>
        </div>
        <div style="font-size:0.74rem; color:#e2e8f0;">${sub}</div>
      </div>
    `;

    box.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:16px;">
        ${gaugeCard("🪞 水鏡（リフレクション）期待度", res.reflectionScore, "#38bdf8", "福島潟・清津峡・いもり池・星峠の棚田")}
        ${gaugeCard("☁️ 朝霧・雲海・光芒（天使の梯子）", res.mistScore, "#fbbf24", "星峠・美人林・彌彦神社杉並木・慈光寺")}
        ${gaugeCard("⛩️ 神社仏閣・苔・紅葉の艶やか発色度", res.shrineToneScore, "#f87171", "彌彦神社・旧齋藤家・雲洞庵・もみじ谷")}
        ${gaugeCard("🐦 野鳥の活性＆順光キャッチライト度", res.birdScore, "#34d399", "福島潟・海辺の森・秋葉公園・瓢湖")}
      </div>

      <div style="background:linear-gradient(135deg,#fffbeb,#fef2f2); border:2px solid #f59e0b; border-radius:12px; padding:16px;">
        <h4 style="font-size:0.98rem; font-weight:900; color:#78350f; margin-bottom:10px;">🎯 この気象条件で今日いちばんおすすめの撮影作戦：</h4>
        <div style="display:flex; flex-direction:column; gap:8px; font-size:0.85rem; color:#1e293b;">
          ${res.adviceList.map(a => `<div style="background:#fff; padding:10px 12px; border-radius:8px; border-left:4px solid #dc2626;">${a}</div>`).join("")}
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // SubView 5: 🏅 新潟カメラマン称号・3アプリ横断バッジコレクション
  // --------------------------------------------------------------------------
  function renderBadgesSubView(bodyEl, ctx) {
    bodyEl.innerHTML = `
      <div style="background:#fff; border:2px solid #e2e8f0; border-radius:16px; padding:20px;">
        <h3 style="font-size:1.18rem; font-weight:900; color:#0f172a; margin-bottom:6px;">
          🏅 新潟3部作（野鳥×神社仏閣×絶景×花）横断・カメラマン称号バッジコレクション
        </h3>
        <p style="font-size:0.84rem; color:#475569; margin-bottom:16px;">
          3つのアプリで写真をGET登録したり、御朱印帳やポストカードスタジオを使うと、自動的に称号バッジがゴールドに輝きます！
        </p>

        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:14px;">
          ${BADGE_DEFINITIONS.map(b => {
            const unlocked = b.check(ctx);
            return `
              <div style="background:${unlocked ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : '#f8fafc'}; border:2px solid ${unlocked ? '#f59e0b' : '#cbd5e1'}; border-radius:14px; padding:16px; display:flex; gap:12px; align-items:flex-start; opacity:${unlocked ? '1' : '0.82'};">
                <div style="font-size:2.3rem; width:54px; height:54px; border-radius:12px; background:${unlocked ? '#f59e0b' : '#e2e8f0'}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                  ${b.icon}
                </div>
                <div style="flex:1;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                    <span style="font-size:0.7rem; font-weight:900; padding:2px 8px; border-radius:99px; background:${unlocked ? '#dc2626' : '#64748b'}; color:#fff;">
                      ${unlocked ? '🏆 称号獲得済！' : '🔒 未獲得'}
                    </span>
                  </div>
                  <strong style="font-size:0.96rem; color:#0f172a; display:block; margin-bottom:4px;">${b.title}</strong>
                  <p style="font-size:0.78rem; color:#334155; margin-bottom:6px;">${b.desc}</p>
                  <div style="font-size:0.73rem; font-weight:800; color:#b45309;">📊 ${b.progressText(ctx)}</div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  return {
    renderSuiteMain,
    renderRoutesSubView,
    renderWeatherSubView,
    renderGoshuinSubView,
    toggleRouteStep,
    onPostcardFileSelect,
    onSelectMyRegisteredPhoto,
    drawPostcardPreview,
    downloadPostcard,
    onUploadGoshuin,
    editGoshuinNote,
    updateWeatherSimulation
  };
})();
