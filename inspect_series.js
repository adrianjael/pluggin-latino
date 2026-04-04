(async () => {
    const url = 'https://cuevana.gs/series/the-boys-2019/';
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    
    // Buscar links de episodios
    const regex = /href=["']([^"']+\/episodio\/[^"']+)["']/gi;
    let match;
    const links = [];
    while ((match = regex.exec(html)) !== null) {
        links.push(match[1]);
    }
    
    console.log("Links encontrados:", links.length);
    console.log(links.slice(0, 10).join('\n'));
})();
