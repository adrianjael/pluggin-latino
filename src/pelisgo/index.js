/**
 * PelisGo Provider for Nuvio (V2.5 Hybrid Premium)
 * Magi (Online) + Pixeldrain/BuzzHeavier (Downloads).
 */

const BASE = 'https://pelisgo.online';
const TMDB_KEY = '2dca580c2a14b55200e784d157207b4d';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const PLAYER_ACTION_ID = '4079b11d214b588c12807d99b549e1851b3ee03082';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Eliminado "google drive" por inestabilidad
const TARGET_SERVERS = ['buzzheavier', 'pixeldrain'];

async function fetchJson(url, headers = {}) {
    const res = await fetch(url, { headers: { 'User-Agent': UA, ...headers } });
    return res.json();
}

async function fetchText(url, headers = {}) {
    const res = await fetch(url, { headers: { 'User-Agent': UA, ...headers } });
    return res.text();
}

/**
 * Obtiene info de TMDB (Original Title + Year)
 */
async function getTmdbInfo(tmdbId, mediaType) {
    const type = mediaType === 'movie' ? 'movie' : 'tv';
    const url = `${TMDB_BASE}/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=es-ES`;
    try {
        const data = await fetchJson(url);
        const title = type === 'movie' ? data.title || data.original_title : data.name || data.original_name;
        const originalTitle = type === 'movie' ? data.original_title || data.title : data.original_name || data.name;
        const year = (type === 'movie' ? data.release_date || '' : data.first_air_date || '').slice(0, 4);
        return { title, originalTitle, year };
    } catch (e) {
        return { title: null, originalTitle: null, year: '' };
    }
}

/**
 * Realiza la búsqueda en PelisGo
 */
async function pelisgoSearch(query, type) {
    const url = `${BASE}/search?q=${encodeURIComponent(query)}`;
    try {
        const html = await fetchText(url, { 'Referer': `${BASE}/` });
        const re = /href="(\/(movies|series)\/([a-z0-9\-]+))"/gi;
        const results = [];
        const seen = new Set();
        let m;
        while ((m = re.exec(html)) !== null) {
            const fullPath = m[1];
            const itemType = m[2];
            const slug = m[3];
            if (fullPath.includes('/temporada/') || fullPath.includes('/episodio/')) continue;
            const isMatch = (type === 'movie' && itemType === 'movies') || (type === 'tv' && itemType === 'series');
            if (isMatch && !seen.has(slug)) {
                seen.add(slug);
                results.push(fullPath);
            }
        }
        return results;
    } catch (e) {
        return [];
    }
}

/**
 * Resuelve BuzzHeavier (Direct link)
 */
async function resolveBuzzheavier(url) {
    const id = url.match(/buzzheavier\.com\/([^/?&#]+)/)?.[1];
    if (!id) return null;
    const dlUrl = `https://buzzheavier.com/${id}/download`;
    try {
        const res = await fetch(dlUrl, {
            headers: {
                'User-Agent': UA,
                'Referer': `https://buzzheavier.com/${id}`,
                'HX-Request': 'true',
                'HX-Current-URL': `https://buzzheavier.com/${id}`,
                'Accept': 'text/html, */*'
            },
            redirect: 'manual'
        });
        const redirect = res.headers.get('hx-redirect');
        return redirect || null;
    } catch (e) {
        return null;
    }
}

/**
 * Resuelve un ID de descarga vía API de PelisGo
 */
async function resolveOneId(id) {
    try {
        const data = await fetchJson(`${BASE}/api/download/${id}`, { 'Accept': 'application/json' });
        if (!data || !data.url) return null;
        const serverName = (data.server || '').toLowerCase();
        const isTarget = TARGET_SERVERS.some(s => serverName.includes(s));
        if (!isTarget) return null;

        let finalUrl = data.url;
        if (serverName.includes('buzzheavier')) {
            finalUrl = await resolveBuzzheavier(data.url);
        } else if (serverName.includes('pixeldrain')) {
            const pid = data.url.match(/pixeldrain\.com\/u\/([^?&#/]+)/)?.[1];
            if (pid) finalUrl = `https://pixeldrain.com/api/file/${pid}?download`;
        }

        if (!finalUrl) return null;

        return {
            server: data.server || 'PelisGo',
            quality: data.quality || 'HD',
            language: data.language || '',
            url: finalUrl
        };
    } catch (e) {
        return null;
    }
}

/**
 * Obtiene Reproductores Online (Magi) vía Next-Action
 */
async function getOnlineStreams(movieId, pageUrl) {
    const streams = [];
    try {
        const res = await fetch(pageUrl, {
            method: 'POST',
            headers: {
                'User-Agent': UA,
                'Content-Type': 'text/plain;charset=UTF-8',
                'Next-Action': PLAYER_ACTION_ID,
                'Referer': pageUrl
            },
            body: JSON.stringify([movieId])
        });
        const text = await res.text();
        const iframeRegex = /https?:\/\/(?:filemoon\.sx|f75s\.com)\/e\/[a-zA-Z0-9?=_&%-]+/g;
        const magiLinks = [...new Set(text.match(iframeRegex) || [])];
        
        for (const url of magiLinks) {
            streams.push({
                name: 'PelisGo [Magi]',
                title: 'Magi (Filemoon) · Online',
                url: url.replace(/\\/g, ''),
                quality: 'HD',
                headers: { 'User-Agent': UA, 'Referer': 'https://f75s.com/' }
            });
        }
    } catch (e) {}
    return streams;
}

/**
 * Función principal requerida por Nuvio
 */
async function getStreams(tmdbId, mediaType, season, episode, title) {
    try {
        const resolvedType = mediaType === 'tv' || mediaType === 'series' ? 'tv' : 'movie';
        console.log(`[PelisGo] Request: "${title}" (${resolvedType})`);

        // 1. Identificar Slug
        let paths = await pelisgoSearch(title, resolvedType);
        if (paths.length === 0 && tmdbId) {
            const info = await getTmdbInfo(tmdbId, resolvedType);
            if (info.originalTitle && info.originalTitle !== title) {
                paths = await pelisgoSearch(info.originalTitle, resolvedType);
            }
        }
        if (paths.length === 0) return [];

        const slug = paths[0].split('/')[2];
        const pageUrl = resolvedType === 'movie' 
            ? `${BASE}/movies/${slug}`
            : `${BASE}/series/${slug}/temporada/${season || 1}/episodio/${episode || 1}`;

        // 2. Carga de Página y Extración Balanceada
        const html = await fetchText(pageUrl);
        
        // A. Obtener descargas (Pixeldrain, BuzzHeavier)
        const downloadIds = (/\/[a-z0-9\-]+/gi.exec(html) && (function(h) {
             const re = /\/download\/([a-z0-9]+)/g;
             const ids = []; let m;
             while ((m = re.exec(h)) !== null) ids.push(m[1]);
             return [...new Set(ids)];
        })(html)) || [];
        
        const downloadResults = await Promise.all(downloadIds.map(id => resolveOneId(id)));
        const downloadStreams = downloadResults.filter(r => r !== null).map(link => {
            const langLabel = link.language ? `[${link.language.toUpperCase()}] ` : '';
            return {
                name: 'PelisGo',
                title: `${langLabel}${link.server} · ${link.quality}`,
                url: link.url,
                quality: link.quality,
                headers: { 'User-Agent': UA, 'Referer': `${BASE}/` }
            };
        });

        // B. Obtener reproductores online (Magi/Filemoon)
        let onlineStreams = [];
        const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
        if (nextMatch) {
            try {
                const data = JSON.parse(nextMatch[1]);
                const movie = data.props?.pageProps?.movie || data.props?.pageProps?.movieData || data.props?.pageProps?.serie || data.props?.pageProps?.serieData;
                if (movie && movie.id) {
                    onlineStreams = await getOnlineStreams(movie.id, pageUrl);
                }
            } catch (e) {}
        }

        // 3. Unificar y Retornar
        const allStreams = [...onlineStreams, ...downloadStreams];
        console.log(`[PelisGo] Done: ${allStreams.length} stream(s) found.`);
        return allStreams;

    } catch (e) {
        console.error(`[PelisGo] Fatal Error: ${e.message}`);
        return [];
    }
}

module.exports = { getStreams };
