const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function fetchText(url, referer) {
    try {
        const headers = { "User-Agent": UA };
        if (referer) headers["Referer"] = referer;
        const res = await fetch(url, { headers });
        return await res.text();
    } catch (e) { return ""; }
}

async function extractStreams(url) {
    const html = await fetchText(url);
    if (!html) return [];

    const streams = [];

    // 1. Buscar Embed69 (ID de IMDB)
    // El subagente identificó que este es el reproductor principal.
    // Buscamos patrones como: embed69.org/f/tt1234567 o similares en el HTML
    const embed69Re = /https?:\/\/embed69\.org\/f\/(tt\d+(-[\d]+x[\d]+)?)/gi;
    let m;
    while ((m = embed69Re.exec(html)) !== null) {
        streams.push({
            server: 'Embed69',
            url: m[0],
            priority: 1
        });
    }

    // 2. Buscar otros servidores comunes (Voe, Filemoon, Streamwish, Vidhide)
    // Estos suelen estar en botones u opciones que cargan dinámicamente o están en arrays de JS.
    const knownServers = ['Voe', 'Filemoon', 'Streamwish', 'Vidhide', 'Wishembed'];
    
    // Buscar URLs que parezcan iframes de estos servidores
    const iframeRe = /https?:\/\/(voe\.sx|filemoon\.sx|streamwish\.to|vidhide\.com|hglink\.to|audinifer\.com)\/([ae]\/)?([a-z0-9]+)/gi;
    while ((m = iframeRe.exec(html)) !== null) {
        const domain = m[1].toLowerCase();
        let name = 'Desconocido';
        if (domain.includes('voe')) name = 'Voe';
        else if (domain.includes('filemoon')) name = 'Filemoon';
        else if (domain.includes('streamwish') || domain.includes('hglink') || domain.includes('audinifer')) name = 'Streamwish';
        else if (domain.includes('vidhide')) name = 'Vidhide';

        // Evitar duplicados
        if (!streams.find(s => s.url === m[0])) {
            streams.push({
                server: name,
                url: m[0],
                priority: 2
            });
        }
    }

    // 3. Fallback: Si no hay streams pero hay un IMDB ID en el meta, intentar construir Embed69 manually?
    // Solo si el sitio es un SPA y no hemos encontrado nada en el HTML estático.
    if (streams.length === 0) {
        // Buscar tt1234567 en todo el texto (meta tags, scripts, etc.)
        const ttMatch = html.match(/tt\d{7,10}/);
        if (ttMatch) {
            const imdbId = ttMatch[0];
            // Si es serie, necesitamos S y E de la URL original
            // /serie/slug/temporada/1/capitulo/1
            const epMatch = url.match(/\/temporada\/(\d+)\/capitulo\/(\d+)/);
            let embedUrl = `https://embed69.org/f/${imdbId}`;
            if (epMatch) {
                const s = epMatch[1];
                const e = epMatch[2].padStart(2, '0');
                embedUrl += `-${s}x${e}`;
            }
            streams.push({
                server: 'Embed69 (Auto)',
                url: embedUrl,
                priority: 1
            });
        }
    }

    console.log(`[Pelispedia Extractor] Found ${streams.length} stream(s).`);
    return streams;
}

export { extractStreams };
