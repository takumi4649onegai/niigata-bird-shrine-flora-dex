const targets = [
  { no: '001', title: '彌彦神社' },
  { no: '002', title: '慈光寺 (五泉市)' },
  { no: '003', title: '北方文化博物館' },
  { no: '006', title: '白山神社 (新潟市中央区一番堀通町)' },
  { no: '008', title: '雲洞庵' },
  { no: '009', title: '宝徳山稲荷大社' },
  { no: '010', title: '妙宣寺 (佐渡市)' },
  { no: '014', title: '国上寺' },
  { no: '016', title: '高龍神社' },
  { no: '018', title: '良寛堂' },
  { no: '020', title: '清水寺 (佐渡市)' },
  { no: '022', title: '諏訪神社 (新発田市)' },
  { no: '023', title: '菅谷寺' },
  { no: '024', title: '三条八幡宮' },
  { no: '025', title: '居多神社' },
  { no: '026', title: '林泉寺 (上越市)' },
  { no: '027', title: '春日山神社' },
  { no: '028', title: '羽黒神社 (村上市)' },
  { no: '038', title: '五智国分寺' }
];

async function run() {
  const titles = targets.map(t => t.title).join('|');
  const url = 'https://ja.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(titles) + '&prop=pageimages&pithumbsize=800&format=json';
  const res = await fetch(url, { headers: { 'User-Agent': 'NiigataPhotoDexApp/1.0' } }).then(r => r.json());
  const pages = Object.values(res.query.pages);
  pages.forEach(p => {
    const t = targets.find(x => x.title === p.title);
    console.log((t ? t.no : '??') + ' | ' + p.title + ' | ' + (p.thumbnail ? p.thumbnail.source : 'NO THUMB'));
  });
}
run();
