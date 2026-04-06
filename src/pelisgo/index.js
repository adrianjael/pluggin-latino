/**
 * PelisGo Provider for Nuvio (V3.9 Elite Hybrid)
 * Restoration: TMDB Fallback + Magi/Filemoon RSC Support + No Google Drive.
 */

const BASE = "https://pelisgo.online";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMDB_KEY = "2dca580c2a14b55200e784d157207b4d";
const TMDB_BASE = "https://api.themoviedb.org/3";
const TARGET_SERVERS = ["buzzheavier", "pixeldrain"]; // Google Drive eliminado permanentemente

async function fetchJson(url, headers = {}) {
    try {
        const res = await fetch(url, { headers: { "User-Agent": UA, ...headers } });
        return await res.json();
    } catch (e) { return null; }
}

async function fetchText(url, headers = {}) {
    try {
        const res = await fetch(url, { headers: { "User-Agent": UA, ...headers } });
        return await res.text();
    } catch (e) { return ""; }
}

/**
 * Obtiene info de TMDB para búsqueda inteligente
 */
async function getTmdbInfo(tmdbId, mediaType) {
    const type = mediaType === 'movie' ? 'movie' : 'tv';
    const url = `${TMDB_BASE}/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=es-ES`;
    const data = await fetchJson(url);
    if (!data) return { title: null, originalTitle: null };
    return {
        title: type === 'movie' ? data.title : data.name,
        originalTitle: type === 'movie' ? data.original_title : data.original_name
    };
}

async function pelisgoSearch(query, type) {
    const url = `${BASE}/search?q=${encodeURIComponent(query)}`;
    const html = await fetchText(url, { "Referer": `${BASE}/` });
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
}

async function resolveBuzzheavier(url) {
    const id = url.split('/').pop();
    const dlUrl = `https://buzzheavier.com/${id}/download`;
    try {
        const res = await fetch(dlUrl, {
            method: 'GET',
            headers: { "User-Agent": UA, "HX-Request": "true", "HX-Current-URL": `https://buzzheavier.com/${id}`, "Referer": `https://buzzheavier.com/${id}` },
            redirect: 'follow'
        });
        return res.headers.get('hx-redirect') || null;
    } catch (e) { return null; }
}

async function resolvePixeldrain(url) {
    const id = url.split('/').pop();
    return `https://pixeldrain.com/api/file/${id}?download`;
}

async function resolveOneId(id) {
    try {
        const data = await fetchJson(`${BASE}/api/download/${id}`, { "Accept": "application/json" });
        if (!data?.url) return null;
        
        const serverLower = (data.server || '').toLowerCase();
        if (!TARGET_SERVERS.some(s => serverLower.includes(s))) return null;

        let finalUrl = data.url;
        if (serverLower.includes('buzzheavier')) finalUrl = await resolveBuzzheavier(data.url);
        if (serverLower.includes('pixeldrain')) finalUrl = await resolvePixeldrain(data.url);

        return finalUrl ? { server: data.server, url: finalUrl, quality: data.quality || '1080p', language: data.language || 'Latino' } : null;
    } catch (e) { return null; }
}

async function getStreams(tmdbId, mediaType, season, episode, title) {
    try {
        const resolvedType = mediaType === 'tv' || mediaType === 'series' ? 'tv' : 'movie';
        console.log(`[PelisGo] v3.9 Request: "${title}" (${resolvedType})`);

        let paths = await pelisgoSearch(title, resolvedType);
        
        // Búsqueda inteligente por título original si el español falla
        if (paths.length === 0 && tmdbId) {
            const info = await getTmdbInfo(tmdbId, resolvedType);
            if (info.originalTitle && info.originalTitle !== title) {
                console.log(`[PelisGo] Re-intentando con: ${info.originalTitle}`);
                paths = await pelisgoSearch(info.originalTitle, resolvedType);
            }
        }

        if (paths.length === 0) return [];

        const slug = paths[0].split('/')[2];
        const pageUrl = resolvedType === 'movie' 
            ? `${BASE}/movies/${slug}`
            : `${BASE}/series/${slug}/temporada/${season || 1}/episodio/${episode || 1}`;

        const html = await fetchText(pageUrl);
        
        // 1. ONLINE (Magi, Desu, etc.) - Motor V3.6 Avanzado
        const onlineStreams = [];
        const urlPatterns = [
            { regex: /https?:(?:\\[/\\]|[/]){2}(?:filemoon\.sx|f75s\.com)(?:\\[/\\]|[/])e(?:\\[/\\]|[/])[a-z0-9]+/gi, server: 'Magi (Filemoon)' },
            { regex: /https?:(?:\\[/\\]|[/]){2}desu\.pelisgo\.online(?:\\[/\\]|[/])embed(?:\\[/\\]|[/])[a-z0-9]+/gi, server: 'Desu' },
            { regex: /https?:(?:\\[/\\]|[/]){2}hqq\.ac(?:\\[/\\]|[/])e(?:\\[/\\]|[/])[a-z0-9]+/gi, server: 'Netu' },
            { regex: /https?:(?:\\[/\\]|[/]){2}[a-z0-9.]+\.embedseek\.com(?:\\[/\\]|[/])#[a-z0-9]+/gi, server: 'SeekStreaming' }
        ];

        urlPatterns.forEach(p => {
            const matches = html.match(p.regex) || [];
            [...new Set(matches)].forEach(url => {
                const cleanUrl = url.replace(/\\/g, ''); 
                onlineStreams.push({ 
                    name: 'PelisGo', 
                    title: `[Online] \xB7 ${p.server}`, 
                    url: cleanUrl, 
                    quality: '1080p', 
                    headers: { 'User-Agent': UA, 'Referer': BASE } 
                });
            });
        });

        // 2. DESCARGAS (Pixeldrain, BuzzHeavier)
        const downloadIds = (function(h) {
             const re = /\/download\/([a-z0-9]+)/g;
             const ids = []; let m;
             while ((m = re.exec(h)) !== null) ids.push(m[1]);
             return [...new Set(ids)];
        })(html);
        
        const downloadResults = await Promise.all(downloadIds.map(id => resolveOneId(id)));
        const downloadStreams = downloadResults.filter(r => r !== null).map(link => {
            const langLabel = link.language ? `[${link.language.toUpperCase()}] ` : '';
            return { 
                name: 'PelisGo', 
                title: `${langLabel}${link.server} \xB7 ${link.quality}`, 
                url: link.url, 
                quality: link.quality, 
                headers: { 'User-Agent': UA, 'Referer': `${BASE}/` } 
            };
        });

        const allStreams = [...onlineStreams, ...downloadStreams];
        console.log(`[PelisGo] Éxito: ${allStreams.length} stream(s) encontrados.`);
        return allStreams;
    } catch (e) {
        console.error(`[PelisGo] Error Fatal: ${e.message}`);
        return [];
    }
}

module.exports = { getStreams };
