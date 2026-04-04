import axios from 'axios';

const BASE = 'https://pelisgo.online';
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const HEADERS = {
    'User-Agent': UA,
    'Accept-Language': 'es-ES,es;q=0.9',
    'Referer': `${BASE}/`
};

async function getTmdbInfo(tmdbId, mediaType) {
    try {
        const type = mediaType === 'movie' ? 'movie' : 'tv';
        const { data } = await axios.get(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-MX`);
        return { 
            title: type === 'movie' ? data.title : data.name,
            year: (type === 'movie' ? data.release_date || '' : data.first_air_date || '').slice(0, 4)
        };
    } catch { return { title: null }; }
}

async function resolveBuzzheavier(id) {
    try {
        const dlUrl = `https://buzzheavier.com/${id}/download`;
        const { headers } = await axios.get(dlUrl, { 
            headers: { 'User-Agent': UA, 'HX-Request': 'true', 'Referer': `https://buzzheavier.com/${id}` },
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400
        });
        return headers['hx-redirect'] || null;
    } catch { return null; }
}

async function resolveOneId(id) {
    try {
        const { data } = await axios.get(`${BASE}/api/download/${id}`, { headers: HEADERS });
        if (!data?.url) return null;

        let finalUrl = data.url;
        if (finalUrl.includes('buzzheavier.com')) {
            const bhId = finalUrl.match(/buzzheavier\.com\/([^/?&#]+)/)?.[1];
            finalUrl = bhId ? await resolveBuzzheavier(bhId) : finalUrl;
        }

        return finalUrl ? {
            server: data.server || 'PelisGo',
            quality: data.quality || '720p',
            language: data.language || 'LAT',
            url: finalUrl
        } : null;
    } catch { return null; }
}

export async function getStreams(tmdbId, mediaType, season, episode) {
    try {
        const { title, year } = await getTmdbInfo(tmdbId, mediaType);
        if (!title) return [];

        const searchUrl = `${BASE}/search?q=${encodeURIComponent(title)}`;
        const { data: html } = await axios.get(searchUrl, { headers: HEADERS });
        
        const slugMatch = html.match(new RegExp(`\\/(movies|series)\\/([a-z0-9\\-]+)`));
        if (!slugMatch) return [];

        const slug = slugMatch[2];
        const pageUrl = mediaType === 'movie' ? `${BASE}/movies/${slug}` : `${BASE}/series/${slug}/temporada/${season}/episodio/${episode}`;

        const { data: pageHtml } = await axios.get(pageUrl, { headers: HEADERS });
        const ids = [...pageHtml.matchAll(/\/download\/([a-z0-9]+)/g)].map(m => m[1]);

        const streamResults = await Promise.all(ids.map(id => resolveOneId(id)));
        const finalStreams = streamResults.filter(s => s !== null);

        return finalStreams.map(s => ({
            name: 'PelisGo',
            title: `[${s.language.toUpperCase()}] ${s.server} · ${s.quality}`,
            url: s.url,
            quality: s.quality,
            headers: HEADERS
        }));

    } catch (e) {
        console.error('[PelisGo] error:', e.message);
        return [];
    }
}
