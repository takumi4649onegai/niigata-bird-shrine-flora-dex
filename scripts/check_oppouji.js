async function checkOppouji() {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent('Oppoji OR Oppouji OR "Oppo-ji"') + '&gsrlimit=5&prop=imageinfo&iiprop=url&format=json';
  const res = await fetch(url, { headers: { 'User-Agent': 'NiigataPhotoDexApp/1.0' } }).then(r => r.json());
  console.log(JSON.stringify(res, null, 2));
}
checkOppouji();
