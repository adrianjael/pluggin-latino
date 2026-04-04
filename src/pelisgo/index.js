import axios from 'axios';

const BASE = 'https://pelisgo.online';
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Acción de servidor detectada para cargar reproductores online
const PLAYER_ACTION_ID = '4079b11d214b588c12807d99b549e1851b3ee03082';

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

function extractMovieId(html) {
    // 1. Buscar en __NEXT_DATA__
    const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (nextMatch) {
        try {
            const data = JSON.parse(nextMatch[1]);
            const movie = data.props?.pageProps?.movie || data.props?.pageProps?.serie;
            if (movie && movie.id) return movie.id;
        } catch (e) {}
    }
    // 2. Buscar patrón de ID en el HTML (cmne...)
    const idMatch = html.match(/"id"\s*:\s*"(cmn[a-z0-9]{15,})"/i);
    if (idMatch) return idMatch[1];
    
    // 3. Buscar en el estado hidratado
    const stateMatch = html.match(/movie["']\s*:\s*\{\s*["']id["']\s*:\s*["'](cmn[a-z0-9]{15,})["']/i);
    return stateMatch ? stateMatch[1] : null;
}

function extractEmbedUrls(componentText) {
    const urls = [];
    const iframeRegex = /src=["'](https?:\\?\/\\?\/[^"']+)["']/g;
    let m;
    while ((m = iframeRegex.exec(componentText)) !== null) {
        let url = m[1].replace(/\\/g, '');
        if (url.includes('pelisgo.online') || url.includes('filemoon') || url.includes('hqq') || url.includes('embedseek') || url.includes('desu')) {
            urls.push(url);
        }
    }
    const desuMatch = componentText.match(/https?:\/\/desu\.pelisgo\.online\/embed\/[a-zA-Z0-9_-]+/);
    if (desuMatch) urls.push(desuMatch[0]);
    return [...new Set(urls)];
}

async function resolveDirectVideo(embedUrl, pageUrl) {
    try {
        if (embedUrl.includes('filemoon.sx') || embedUrl.includes('magi')) {
            const { data: html } = await axios.get(embedUrl, { headers: { ...HEADERS, 'Referer': pageUrl } });
            const m3u8Match = html.match(/file["']\s*:\s*["'](https?:\/\/.*?\.m3u8.*?)["']/);
            if (m3u8Match) return m3u8Match[1];
        }
    } catch { return null; }
    return null;
}

function getHostLabel(url) {
    if (url.includes('filemoon') || url.includes('magi')) return 'Magi';
    if (url.includes('desu')) return 'Desu';
    if (url.includes('hqq') || url.includes('netu')) return 'Netu';
    if (url.includes('embedseek') || url.includes('seekstreaming')) return 'Seek';
    return 'Streaming';
}

export async function getStreams(tmdbId, mediaType, season, episode) {
    try {
        const { title, year } = await getTmdbInfo(tmdbId, mediaType);
        if (!title) return [];

        const searchUrl = `${BASE}/search?q=${encodeURIComponent(title)}`;
        const { data: searchHtml } = await axios.get(searchUrl, { headers: HEADERS });
        
        const slugMatch = searchHtml.match(new RegExp(`\\/(movies|series)\\/([a-z0-9\\-]+)`));
        if (!slugMatch) return [];

        const typeSlug = slugMatch[1];
        const slug = slugMatch[2];
        const pageUrl = typeSlug === 'movies' ? `${BASE}/movies/${slug}` : `${BASE}/series/${slug}/temporada/${season}/episodio/${episode}`;

        const { data: pageHtml } = await axios.get(pageUrl, { headers: HEADERS });
        const movieId = extractMovieId(pageHtml);
        if (!movieId) {
            console.log('[PelisGo] No se encontró el MovieID para:', title);
            return [];
        }

        // Simulación de interacción via Server Action
        const { data: actionResponse } = await axios.post(pageUrl, JSON.stringify([movieId]), {
            headers: {
                ...HEADERS,
                'Content-Type': 'text/plain;charset=UTF-8',
                'Accept': 'text/x-component',
                'Next-Action': PLAYER_ACTION_ID,
                'Referer': pageUrl
            },
            timeout: 8000
        });

        const embedUrls = extractEmbedUrls(actionResponse);
        const streams = [];

        for (const url of embedUrls) {
            const host = getHostLabel(url);
            // Intentar obtener link directo .m3u8
            const directUrl = await resolveDirectVideo(url, pageUrl);
            
            streams.push({
                name: 'PelisGo',
                title: `[LAT] ${host} (Streaming)`,
                url: directUrl || url,
                quality: 'HD',
                headers: { 'User-Agent': UA, 'Referer': `${BASE}/` }
            });
        }

        return streams;

    } catch (e) {
        console.error('[PelisGo] error:', e.message);
        return [];
    }
}
