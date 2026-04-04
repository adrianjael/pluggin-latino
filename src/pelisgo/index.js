import axios from 'axios';

const BASE = 'https://pelisgo.online';
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Server Action ID para cargar reproductores
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
    // Intentar extraer de __NEXT_DATA__
    const nextMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (nextMatch) {
        try {
            const data = JSON.parse(nextMatch[1]);
            const movie = data.props?.pageProps?.movie || data.props?.pageProps?.serie;
            if (movie && movie.id) return movie.id;
        } catch (e) {}
    }
    // Fallback: buscar en scripts de hydration o similar
    const idMatch = html.match(/"id"\s*:\s*"([a-z0-9]{20,})"/);
    return idMatch ? idMatch[1] : null;
}

function extractEmbedUrls(componentText) {
    const urls = [];
    // Las URLs de iframes en text/x-component suelen venir escapadas
    const iframeRegex = /src=["'](https?:\\?\/\\?\/[^"']+)["']/g;
    let m;
    while ((m = iframeRegex.exec(componentText)) !== null) {
        let url = m[1].replace(/\\/g, '');
        if (url.includes('pelisgo.online') || url.includes('filemoon') || url.includes('hqq') || url.includes('embedseek')) {
            urls.push(url);
        }
    }
    // También buscar tokens de desu o filemoon
    const desuMatch = componentText.match(/https?:\/\/desu\.pelisgo\.online\/embed\/[a-zA-Z0-9_-]+/);
    if (desuMatch) urls.push(desuMatch[0]);
    
    return [...new Set(urls)];
}

function getHostLabel(url) {
    if (url.includes('filemoon') || url.includes('magi')) return 'Magi';
    if (url.includes('desu')) return 'Desu';
    if (url.includes('hqq') || url.includes('netu')) return 'Netu';
    if (url.includes('embedseek') || url.includes('seekstreaming')) return 'Seek';
    return 'Player';
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
        if (!movieId) return [];

        // Invocamos la Server Action de Next.js para obtener los reproductores
        const { data: actionResponse } = await axios.post(pageUrl, JSON.stringify([movieId]), {
            headers: {
                ...HEADERS,
                'Content-Type': 'text/plain;charset=UTF-8',
                'Accept': 'text/x-component',
                'Next-Action': PLAYER_ACTION_ID
            },
            timeout: 10000
        });

        const embedUrls = extractEmbedUrls(actionResponse);
        const streams = [];

        for (const url of embedUrls) {
            const host = getHostLabel(url);
            streams.push({
                name: 'PelisGo',
                title: `[LAT] ${host} · HD`,
                url: url,
                quality: 'HD',
                headers: {
                    'User-Agent': UA,
                    'Referer': `${BASE}/`
                }
            });
        }

        return streams;

    } catch (e) {
        console.error('[PelisGo] error:', e.message);
        return [];
    }
}
