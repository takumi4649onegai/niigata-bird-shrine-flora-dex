async function getImageUrl(fileTitles) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&titles=' + encodeURIComponent(fileTitles.join('|')) + '&prop=imageinfo&iiprop=url&format=json';
  const res = await fetch(url, { headers: { 'User-Agent': 'NiigataPhotoDexApp/1.0' } }).then(r => r.json());
  const pages = Object.values(res.query.pages);
  pages.forEach(p => {
    if (p.imageinfo && p.imageinfo[0]) {
      console.log(p.title, p.imageinfo[0].url);
    }
  });
}
getImageUrl([
  'File:Niigata Gokoku Shrine 20070815.png',
  'File:Hakusan Shrine (Niigata City) Haiden.jpg'
]);
