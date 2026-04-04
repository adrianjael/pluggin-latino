const CryptoJS = require('crypto-js');

/**
 * PelisGo Provider for Nuvio (V2)
 * Soporte para Películas y Series con búsqueda automática y enlaces directos.
 */

const BASE = 'https://pelisgo.online';
const PLAYER_ID = '4079b11d214b588c12807d99b549e1851b3ee03082';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function fetchHtml(url, referer = BASE) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': UA,
            'Referer': referer,
            'Accept-Language': 'es-ES,es;q=0.9'
        }
    });
    return res.text();
}

/**
 * Busca el slug real en PelisGo basado en el título de Nuvio
 */
async function findSlug(title, mediaType) {
    try {
        console.log(`[PelisGo] Searching slug for: ${title}`);
        const searchHtml = await fetchHtml(`${BASE}/search?q=${encodeURIComponent(title)}`);
        
        const normalizedTarget = title.toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetPath = mediaType === 'movie' ? 'movies' : 'series';

        // 1. Intentar buscar en el JSON de Next.js (Altamente fiable)
        const nextMatch = searchHtml.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
        if (nextMatch) {
            try {
                const data = JSON.parse(nextMatch[1]);
                const results = data.props?.pageProps?.searchResults || data.props?.pageProps?.results || [];
                for (const item of results) {
                    const itemTitle = (item.title || item.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                    if (itemTitle.includes(normalizedTarget) || normalizedTarget.includes(itemTitle)) {
                        return item.slug || item.id;
                    }
                }
            } catch (jsonErr) {}
        }

        // 2. Regex permisivo como respaldo (Busca coincidencias de href y título cercano)
        const hrefRegex = new RegExp(`href="\\/(${targetPath})\\/([^"]+)"[^>]*>([\\s\\S]{1,300}?)<\\/`, 'gi');
        let match;
        while ((match = hrefRegex.exec(searchHtml)) !== null) {
            const snippet = match[3].toLowerCase().replace(/[^a-z0-9]/g, '');
            if (snippet.includes(normalizedTarget) || normalizedTarget.includes(snippet)) {
                return match[2];
            }
        }

        // 3. Último recurso: Analizar todos los enlaces /movies/ o /series/
        const fallbackRegex = new RegExp(`href="\\/${targetPath}\\/([^"]+)"`, 'gi');
        while ((match = fallbackRegex.exec(searchHtml)) !== null) {
            const slug = match[1];
            const slugPlain = slug.replace(/-/g, '');
            if (slugPlain.includes(normalizedTarget) || normalizedTarget.includes(slugPlain)) {
                return slug;
            }
        }

        return null;
    } catch (e) {
        return null;
    }
}

/**
 * Extrae enlaces de una página específica
 */
async function extractFromPage(pageUrl) {
    const streams = [];
    try {
        const html = await fetchHtml(pageUrl);
        
        // 1. Extraer ID del video (movieId) de __NEXT_DATA__
        let movieId = null;
        const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
        if (nextMatch) {
            const data = JSON.parse(nextMatch[1]);
            const movie = data.props?.pageProps?.movie || data.props?.pageProps?.serie || data.props?.pageProps?.movieData;
            if (movie && movie.id) movieId = movie.id;
        }

        // 2. Extraer Enlaces Directos (Pixeldrain/BuzzHeavier)
        const downloadRegex = /https?:\/\/(?:pixeldrain\.com|buzzheavier\.com)\/[a-zA-Z0-9\/._-]+/g;
        const downloads = [...new Set(html.match(downloadRegex) || [])];
        
        for (const dl of downloads) {
            if (dl.includes('pixeldrain.com')) {
                const id = dl.split('/').pop();
                streams.push({
                    name: 'PelisGo (Pixeldrain MP4)',
                    title: 'Streaming HD (Pixeldrain)',
                    url: `https://pixeldrain.com/api/file/${id}`,
                    quality: '1080p'
                });
            } else if (dl.includes('buzzheavier.com')) {
                streams.push({
                    name: 'PelisGo (BuzzHeavier)',
                    title: 'Streaming HD (BuzzHeavier)',
                    url: dl,
                    quality: 'HD'
                });
            }
        }

        // 3. Obtener Reproductores Online (Magi, etc.) vía Server Action
        if (movieId) {
            try {
                const actionRes = await fetch(pageUrl, {
                    method: 'POST',
                    headers: {
                        'User-Agent': UA,
                        'Content-Type': 'text/plain;charset=UTF-8',
                        'Next-Action': PLAYER_ID,
                        'Referer': pageUrl
                    },
                    body: JSON.stringify([movieId])
                });
                const actionText = await actionRes.text();
                
                // Regex para capturar servidores conocidos
                const iframeRegex = /https?:\/\/(?:filemoon\.sx|hqq\.to|netu\.to|desu\.pelisgo\.online|embedseek\.com|seekstreaming\.com|f75s\.com)\/e\/[a-zA-Z0-9?=_&%-]+/g;
                const players = [...new Set(actionText.match(iframeRegex) || [])];
                
                for (const pUrl of players) {
                    let name = 'PelisGo Online';
                    if (pUrl.includes('filemoon') || pUrl.includes('f75s')) name = 'Magi (Filemoon)';
                    if (pUrl.includes('seek')) name = 'SeekStreaming';
                    if (pUrl.includes('netu') || pUrl.includes('hqq')) name = 'Netu';

                    streams.push({
                        name: `PelisGo [${name}]`,
                        title: name,
                        url: pUrl.replace(/\\/g, ''),
                        quality: 'HD'
                    });
                }
            } catch (e) {
                console.log('[PelisGo] Action Error:', e.message);
            }
        }
    } catch (e) {
        console.log('[PelisGo] Page Extract Error:', e.message);
    }
    return streams;
}

/**
 * Función principal requerida por Nuvio
 */
async function getStreams(tmdbId, mediaType, season, episode, title) {
    try {
        console.log(`[PelisGo] Solicitude: ${title} (${mediaType}) S${season}E${episode}`);
        
        // 1. Encontrar el slug
        const slug = await findSlug(title, mediaType);
        if (!slug) {
            console.log(`[PelisGo] No result found for: ${title}`);
            return [];
        }

        // 2. Construir URL final
        let finalUrl = '';
        if (mediaType === 'movie') {
            finalUrl = `${BASE}/movies/${slug}`;
        } else {
            // Nuvio envía temporada 1 como 1, PelisGo usa el mismo número
            finalUrl = `${BASE}/series/${slug}/temporada/${season}/episodio/${episode}`;
        }

        console.log(`[PelisGo] Resolved URL: ${finalUrl}`);

        // 3. Extraer streams
        return await extractFromPage(finalUrl);

    } catch (e) {
        console.error(`[PelisGo] Global Error: ${e.message}`);
        return [];
    }
}

module.exports = { getStreams };
