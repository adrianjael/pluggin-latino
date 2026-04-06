// src/pelisgo/index.js - Restauración V3.5 (Core)
const BASE = "https://pelisgo.online";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TARGET_SERVERS = ["buzzheavier", "pixeldrain"]; // Google Drive eliminado permanentemente

async function fetchText(url, extraHeaders = {}) {
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": UA, "Referer": BASE, ...extraHeaders }
        });
        return await res.text();
    } catch (e) { return ""; }
}

async function pelisgoSearch(title, type) {
    const url = `${BASE}/search?q=${encodeURIComponent(title)}`;
    const html = await fetchText(url);
    const re = /\/(movies|series)\/([a-z0-9\-]+)/g;
    const paths = [];
    const seen = new Set();
    let m;
    while ((m = re.exec(html)) !== null) {
        const path = m[0];
        if (path.includes('/temporada/') || path.includes('/episodio/')) continue;
        if (!seen.has(path)) {
            seen.add(path);
            paths.push(path);
        }
    }
    return type === 'movie' 
        ? paths.filter(p => p.startsWith('/movies/'))
        : paths.filter(p => p.startsWith('/series/'));
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
        const res = await fetch(`${BASE}/api/download/${id}`, { headers: { "User-Agent": UA, "Referer": BASE, "Accept": "application/json" } });
        const data = await res.json();
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
        console.log(`[PelisGo] v3.5 Request: "${title}" (${resolvedType})`);

        let paths = await pelisgoSearch(title, resolvedType);
        if (paths.length === 0) return [];

        const slug = paths[0].split('/')[2];
        const pageUrl = resolvedType === 'movie' 
            ? `${BASE}/movies/${slug}`
            : `${BASE}/series/${slug}/temporada/${season || 1}/episodio/${episode || 1}`;

        const html = await fetchText(pageUrl);
        
        // 1. ONLINE (Magi, Desu, etc.) de RSC Data
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
                const cleanUrl = url.replace(/\\/g, ''); // Elimina barras invertidas
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
        console.log(`[PelisGo] Done: ${allStreams.length} stream(s) found.`);
        return allStreams;
    } catch (e) {
        console.error(`[PelisGo] Error: ${e.message}`);
        return [];
    }
}

module.exports = { getStreams };
