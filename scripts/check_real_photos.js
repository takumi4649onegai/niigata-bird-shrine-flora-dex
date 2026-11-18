const https = require('https');

const candidates = [
  { no: '005', title: '乙宝寺' },
  { no: '011', title: '新潟県護国神社' },
  { no: '012', title: '種月寺' },
  { no: '013', title: '妙光寺 (新潟市)' },
  { no: '014', title: '国上寺' },
  { no: '023', title: '菅谷寺' },
  { no: '025', title: '居多神社' },
  { no: '026', title: '林泉寺 (上越市)' },
  { no: '027', title: '春日山神社' },
  { no: '038', title: '五智国分寺' }
];

async function check() {
  for (const c of candidates) {
    const url = 'https://ja.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(c.title) + '&prop=pageimages|extracts&exintro=1&explaintext=1&pithumbsize=800&format=json&origin=*';
    try {
      const res = await fetch(url).then(r => r.json());
      const pages = res.query.pages;
      for (const id in pages) {
        const p = pages[id];
        console.log(c.no, c.title, p.thumbnail ? p.thumbnail.source : 'NO THUMB');
      }
    } catch(e) {
      console.log(c.no, c.title, 'ERR', e.message);
    }
  }
}
check();
