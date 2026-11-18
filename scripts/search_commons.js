async function searchCommons(q) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(q) + '&gsrlimit=3&prop=imageinfo&iiprop=url|size&format=json';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'NiigataPhotoDexApp/1.0 (contact: takumi@example.com)'
      }
    }).then(r => r.json());
    if (!res.query) {
      console.log(q, 'NOT FOUND');
      return;
    }
    const pages = Object.values(res.query.pages);
    console.log('=== ' + q + ' ===');
    pages.forEach(p => {
      if (p.imageinfo && p.imageinfo[0]) {
        console.log(p.title, p.imageinfo[0].url);
      }
    });
  } catch(e) {
    console.log(q, 'ERR', e.message);
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  await searchCommons('乙宝寺');
  await sleep(1500);
  await searchCommons('新潟縣護國神社');
  await sleep(1500);
  await searchCommons('湊稲荷神社');
  await sleep(1500);
  await searchCommons('白山神社 新潟市');
}
run();
