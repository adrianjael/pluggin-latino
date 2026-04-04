/**
 * PelisGo Provider for Nuvio (Premium Restoration)
 * Búsqueda inteligente por TMDB API y Descargas MP4 Directas.
 */

const BASE = 'https://pelisgo.online';
const TMDB_KEY = '2dca580c2a14b55200e784d157207b4d';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const TARGET_SERVERS = ['buzzheavier', 'google drive', 'googledrive', 'pixeldrain'];

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
 * Realiza la búsqueda en PelisGo usando cabeceras completas
 */
async function pelisgoSearch(query, type) {
    const url = `${BASE}/search?q=${encodeURIComponent(query)}`;
    try {
        const html = await fetchText(url, { 'Referer': `${BASE}/` });
        
        // Regex ultra-permisiva para capturar cualquier enlace a película o serie
        const re = /href="(\/(movies|series)\/([a-z0-9\-]+))"/gi;
        const results = [];
        const seen = new Set();
        let m;
        
        while ((m = re.exec(html)) !== null) {
            const fullPath = m[1];
            const itemType = m[2];
            const slug = m[3];
            
            if (fullPath.includes('/temporada/') || fullPath.includes('/episodio/')) continue;
            
            // Prioridad al tipo solicitado
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
 * Extrae IDs de descarga de una página
 */
function extractDownloadIds(html) {
    const re = /\/download\/([a-z0-9]+)/g;
    const ids = [];
    const seen = {};
    let m;
    while ((m = re.exec(html)) !== null) {
        if (!seen[m[1]]) {
            seen[m[1]] = true;
            ids.push(m[1]);
        }
    }
    return ids;
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
        } else if (serverName.includes('google drive') || serverName.includes('googledrive')) {
            const gid = data.url.match(/\/d\/([^/?&#]+)/)?.[1] || data.url.match(/[?&]id=([^&]+)/)?.[1];
            if (gid) finalUrl = `https://drive.usercontent.google.com/download?id=${gid}&export=download&confirm=t`;
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
 * Función principal requerida por Nuvio
 */
async function getStreams(tmdbId, mediaType, season, episode, title) {
    try {
        const resolvedType = mediaType === 'tv' || mediaType === 'series' ? 'tv' : 'movie';
        console.log(`[PelisGo] Request: "${title}" (${resolvedType})`);

        // 1. Búsqueda en PelisGo (Prioridad al título enviado por Nuvio)
        let paths = await pelisgoSearch(title, resolvedType);
        
        // Si falla, intentamos con info de TMDB
        if (paths.length === 0 && tmdbId) {
            const info = await getTmdbInfo(tmdbId, resolvedType);
            if (info.originalTitle && info.originalTitle !== title) {
                console.log(`[PelisGo] Fallback searching: ${info.originalTitle}`);
                paths = await pelisgoSearch(info.originalTitle, resolvedType);
            }
            if (paths.length === 0 && info.title && info.title !== title) {
                paths = await pelisgoSearch(info.title, resolvedType);
            }
        }
        
        if (paths.length === 0) return [];

        const slug = paths[0].split('/')[2];
        const pageUrl = resolvedType === 'movie' 
            ? `${BASE}/movies/${slug}`
            : `${BASE}/series/${slug}/temporada/${season || 1}/episodio/${episode || 1}`;

        console.log(`[PelisGo] Resolved Page: ${pageUrl}`);

        // 3. Extraer IDs y resolver Descargas
        const html = await fetchText(pageUrl);
        const ids = extractDownloadIds(html);
        
        const results = await Promise.all(ids.map(id => resolveOneId(id)));
        const validLinks = results.filter(r => r !== null);

        // 4. Formatear para Nuvio
        return validLinks.map(link => {
            const langLabel = link.language ? `[${link.language.toUpperCase()}] ` : '';
            return {
                name: 'PelisGo',
                title: `${langLabel}${link.server} · ${link.quality}`,
                url: link.url,
                quality: link.quality,
                headers: {
                    'User-Agent': UA,
                    'Referer': `${BASE}/`
                }
            };
        });

    } catch (e) {
        console.error(`[PelisGo] Error: ${e.message}`);
        return [];
    }
}

module.exports = { getStreams };
