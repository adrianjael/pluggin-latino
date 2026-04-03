// Verificar qué sitios están respondiendo
async function checkSites() {
    const sites = [
        { name: 'PelisPlusHD', url: 'https://www.pelisplushd.la' },
        { name: 'PelisPanda', url: 'https://pelispanda.org' },
        { name: 'Cuevana.gs', url: 'https://cuevana.gs' },
        { name: 'HackStore2 (API)', url: 'https://hackstore.ws/movie/872585' },
    ];

    for (const site of sites) {
        try {
            const res = await fetch(site.url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
                signal: AbortSignal.timeout(8000)
            });
            console.log(`✅ ${site.name}: Status ${res.status}`);
        } catch (e) {
            console.log(`❌ ${site.name}: CAÍDO - ${e.message}`);
        }
    }
}
checkSites();
