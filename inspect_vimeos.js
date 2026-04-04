(async () => {
    const url = 'https://vimeos.net/embed-jazd2ze0zel2.html';
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    console.log(html.substring(0, 10000)); // Ver los primeros 10000 caracteres
})();
