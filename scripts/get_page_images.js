async function getPageImages(title) {
  const url = 'https://ja.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(title) + '&prop=images&format=json';
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'NiigataPhotoDexApp/1.0' } }).then(r => r.json());
    const pages = Object.values(res.query.pages);
    console.log('=== ' + title + ' ===');
    for (const p of pages) {
      if (p.images) {
        p.images.forEach(img => console.log(img.title));
      }
    }
  } catch(e) {
    console.log(title, 'ERR', e.message);
  }
}

async function run() {
  await getPageImages('乙宝寺');
  await getPageImages('新潟縣護國神社');
  await getPageImages('白山神社 (新潟市中央区一番堀通町)');
  await getPageImages('湊稲荷神社');
}
run();
