const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../神社仏閣・絶景・花図鑑/js/data-japan-dex.js');

global.window = {};
require(filePath);

const dex = window.JAPAN_BEAUTY_DEX;

const photoMap = {
  'yahiko_shrine': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Yahiko-jinja_Haiden.jpg/800px-Yahiko-jinja_Haiden.jpg',
  'jikoji_cedar': '../img/scenery/jikoji_cedar_telephoto_compression.jpg',
  'hoppo_museum': '../img/scenery/hoppo_bunka_tatami_frame.jpg',
  'asaiino_shrine': '../img/scenery/asaiino_shrine_spirit_stone.jpg',
  'oppouji_pagoda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Oppo-ji_Sanjunoto.JPG/800px-Oppo-ji_Sanjunoto.JPG',
  'hakusan_shrine': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Hakusan-jinja_%28Niigata%29_Haiden.jpg/800px-Hakusan-jinja_%28Niigata%29_Haiden.jpg',
  'saito_villa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Kyu-Saito-ke-Bettei_Garden.jpg/800px-Kyu-Saito-ke-Bettei_Garden.jpg',
  'untouan_temple': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Unto-an_Niigata.jpg/800px-Unto-an_Niigata.jpg',
  'houtokusan_inari': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Aomi_Jinja_%28Kamo_City%29_haiden.jpg/800px-Aomi_Jinja_%28Kamo_City%29_haiden.jpg',
  'myosenji_pagoda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Oppo-ji_Sanjunoto.JPG/800px-Oppo-ji_Sanjunoto.JPG',
  'yahiko_momijidani': '../img/scenery/nakano_tei_maple_sunlight.jpg',
  'fukushimagata_morning_mist': '../img/scenery/fukushimagata_rapeseed_view_tower.jpg',
  'niitsu_sl_banetsu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/JNR_C57_180_Banetsu_Monogatari.jpg/800px-JNR_C57_180_Banetsu_Monogatari.jpg',
  'hoshitoge_terraces': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Hoshitoge_Tanada_Rice_Terraces.jpg/800px-Hoshitoge_Tanada_Rice_Terraces.jpg',
  'bijinbayashi_beech': '../img/scenery/jikoji_cedar_telephoto_compression.jpg',
  'kiyotsukyo_tunnel': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Kiyotsukyo_gorge_tunnel_2019.jpg/800px-Kiyotsukyo_gorge_tunnel_2019.jpg',
  'imoriike_myoko': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Mount_Myoko_from_Imori_Pond.jpg/800px-Mount_Myoko_from_Imori_Pond.jpg',
  'shimamihama_sunset': '../img/scenery/shimamihama_magichour_sado_island.jpg',
  'bandaibashi_night': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Bandai_Bridge_Niigata_City.jpg/800px-Bandai_Bridge_Niigata_City.jpg',
  'sado_kitazawa_shukunegi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/SadoGaShima.jpg/800px-SadoGaShima.jpg',
  'tarodai_kannon_kita': '../img/scenery/otematsu_yakushido_cherry_blossom.jpg',
  'gohyaku_rakan_jikoji': '../img/scenery/jikoji_mossy_lantern_macro.jpg',
  'kakuda_small_shrine': '../img/scenery/asaiino_shrine_spirit_stone.jpg',
  'kokujoji_gogoan': '../img/scenery/kamo_aomi_shrine_stone_stairs.jpg',
  'deyu_yakushido_ubason': '../img/scenery/asaiino_shrine_spirit_stone.jpg',
  'koryu_jinja_small_shrine': '../img/scenery/kamo_aomi_shrine_stone_stairs.jpg',
  'horide_furutsu_akiha': '../img/scenery/kizaki_suwa_giant_zelkova.jpg',
  'minato_inari': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Minato_Inari_Jinja_Niigata.jpg/800px-Minato_Inari_Jinja_Niigata.jpg',
  'shibata_suwa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Suwa_Jinja_Shibata_Niigata.jpg/800px-Suwa_Jinja_Shibata_Niigata.jpg',
  'suganoya_fudo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Sugatani_Fudouson_Shibata.jpg/800px-Sugatani_Fudouson_Shibata.jpg',
  'sanjo_hachiman': '../img/scenery/kizaki_suwa_giant_zelkova.jpg',
  'murakami_haguro': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Sasagawanagare_Niigata.jpg/800px-Sasagawanagare_Niigata.jpg',
  'sasagawanagare': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Sasagawanagare_Niigata.jpg/800px-Sasagawanagare_Niigata.jpg',
  'kakuda_misaki': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Kakuda_Misaki_Lighthouse.jpg/800px-Kakuda_Misaki_Lighthouse.jpg',
  'hyoko_swan_lake': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Lake_Hyo_Agano_Niigata.jpg/800px-Lake_Hyo_Agano_Niigata.jpg',
  'toyano_lagoon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Toyanogata_Niigata.JPG/800px-Toyanogata_Niigata.JPG',
  'ijimino_bentendo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ijimino_Park_Bentendo_Shibata.jpg/800px-Ijimino_Park_Bentendo_Shibata.jpg',
  'tarodai_inari_pine': '../img/scenery/matsuhama_inari_torii_tunnel.jpg',
  'kamo_aomi_shrine': '../img/scenery/kamo_aomi_shrine_stone_stairs.jpg',
  'shibata_shimizuen': '../img/scenery/shibata_shimizuen_frame_pond.jpg',
  'nakano_tei_autumn': '../img/scenery/nakano_tei_maple_sunlight.jpg',
  'teradomari_hakusan_shrine': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Teradomari_Fish_Market_Street_20081013.jpg/800px-Teradomari_Fish_Market_Street_20081013.jpg',
  'matsuhama_inari_shrine': '../img/scenery/matsuhama_inari_torii_tunnel.jpg',
  'sanjo_yagigahana': '../img/scenery/yagigahana_cliff_reflection.jpg',
  'niigata_gokoku_shrine': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Niigataken_Gokoku_Jinja.jpg/800px-Niigataken_Gokoku_Jinja.jpg',
  'niigata_daijingu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Niigata_Daijingu.jpg/800px-Niigata_Daijingu.jpg',
  'kanbara_shrine': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Kanbara_Jinja_Niigata.jpg/800px-Kanbara_Jinja_Niigata.jpg',
  'sansha_shrine_niigata': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Sansha_Jinja_Niigata.jpg/800px-Sansha_Jinja_Niigata.jpg',
  'katsuduka_suwa_kita': '../img/scenery/toyosaka_suwa_kuzutsuka_shrine.jpg',
  'sanjo_honjoji': '../img/scenery/yagigahana_cliff_reflection.jpg',
  'minamiuonuma_uonuma_shrine': '../img/scenery/yukiwarisou_bokeh_macro.jpg',
  'kita_otematsu_yakushi': '../img/scenery/otematsu_yakushido_cherry_blossom.jpg',
  'kita_kizaki_suwa': '../img/scenery/kizaki_suwa_giant_zelkova.jpg',
  'kita_shimami_sandune': '../img/scenery/shimamihama_sunset_telephoto_gull.jpg',
  'seiro_houshakuin': '../img/scenery/otematsu_yakushido_cherry_blossom.jpg',
  'kita_araigo_sluice': '../img/scenery/araigo_sluice_sunset_agano.jpg',
  'kita_nigorigawa_sakura': '../img/scenery/otematsu_yakushido_cherry_blossom.jpg',
  'seiro_shidaihama_inari': '../img/scenery/matsuhama_inari_torii_tunnel.jpg',
  'kita_kuzutsuka_ichiba_inari': '../img/scenery/toyosaka_suwa_kuzutsuka_shrine.jpg',
  'kita_fukushimagata_kataraitei': '../img/scenery/fukushimagata_rapeseed_view_tower.jpg',
  'shibata_kaji_river_cherry': '../img/scenery/otematsu_yakushido_cherry_blossom.jpg',
  'agano_yasuda_stone_buddha': '../img/scenery/asaiino_shrine_spirit_stone.jpg',
  'kamo_aomi_inner_shrine': '../img/scenery/kamo_aomi_shrine_stone_stairs.jpg',
  'sanjo_shitada_morimachi_hachiman': '../img/scenery/kizaki_suwa_giant_zelkova.jpg',
  'uonuma_saifukuji_kaisando': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Saifukuji_Kaisando_Niigata.jpg/800px-Saifukuji_Kaisando_Niigata.jpg',
  'sado_onogame_tobishima': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/SadoGaShima.jpg/800px-SadoGaShima.jpg',
  'nigorikawa_shinmeigu': '../img/scenery/kizaki_suwa_giant_zelkova.jpg',
  'tayu_hama_port_park': '../img/scenery/shimamihama_magichour_sado_island.jpg',
  'matsuhama_hiyoriyama': '../img/scenery/araigo_sluice_sunset_agano.jpg',
  'hosojima_shinmeisha': '../img/scenery/kizaki_suwa_giant_zelkova.jpg',
  'uchishimami_suwa': '../img/scenery/otematsu_yakushido_cherry_blossom.jpg',
  'hayadoori_hachiman': '../img/scenery/toyosaka_suwa_kuzutsuka_shrine.jpg',
  'view_fukushimagata_onibasu': '../img/scenery/fukushimagata_rapeseed_view_tower.jpg',
  'matsuhama_bridge_sunset': '../img/scenery/araigo_sluice_sunset_agano.jpg',
  'seiro_ninomiya_ke': '../img/scenery/shibata_shimizuen_frame_pond.jpg',
  'seiro_bentengata_park': '../img/scenery/matsuhama_inari_torii_tunnel.jpg',
  'shibata_castle_turret': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/160716_Shimizuen_Shibata_Niigata_pref_Japan29s3.jpg/800px-160716_Shimizuen_Shibata_Niigata_pref_Japan29s3.jpg',
  'ijimino_ochaya': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ijimino_Park_Bentendo_Shibata.jpg/800px-Ijimino_Park_Bentendo_Shibata.jpg',
  'asaiino_okunomiya_megalith': '../img/scenery/asaiino_shrine_spirit_stone.jpg',
  'ikarashi_garden': '../img/scenery/shibata_shimizuen_frame_pond.jpg',
  'junsaiike_park': '../img/scenery/shibata_shimizuen_frame_pond.jpg',
  'yamanoshita_shinmeigu_tower': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Bandai_Bridge_Niigata_City.jpg/800px-Bandai_Bridge_Niigata_City.jpg',
  'yokogoshi_shinmeigu_cosmos': '../img/scenery/kizaki_suwa_giant_zelkova.jpg',
  'kamiyachi_suwa': '../img/scenery/otematsu_yakushido_cherry_blossom.jpg',
  'hasuno_suwa_zelkova': '../img/scenery/kizaki_suwa_giant_zelkova.jpg',
  'niizaki_kumano_shrine': '../img/scenery/toyosaka_suwa_kuzutsuka_shrine.jpg'
};

dex.forEach(item => {
  if (photoMap[item.id]) {
    item.photoUrl = photoMap[item.id];
  }
});

const outputCode = 'window.JAPAN_BEAUTY_DEX = ' + JSON.stringify(dex, null, 2) + ';\n';
fs.writeFileSync(filePath, outputCode, 'utf8');

console.log('Successfully updated JAPAN_BEAUTY_DEX!');
console.log('Total spots now:', dex.length);
console.log('Spots with photoUrl:', dex.filter(s => !!s.photoUrl).length);
