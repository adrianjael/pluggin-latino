import axios from 'axios';
import * as cheerio from 'cheerio';

const MAIN_URL = 'https://cinemacity.cc';
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const HEADERS = {
    'User-Agent': UA,
    'Cookie': 'dle_user_id=32729; dle_password=894171c6a8dab18ee594d5c652009a35;',
    'Referer': `${MAIN_URL}/`
};

function normalizeTitle(t) {
    return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function atobPolyfill(str) {
    return Buffer.from(str, 'base64').toString('binary');
}

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

export async function getStreams(tmdbId, mediaType, season, episode) {
    try {
        const { title, year } = await getTmdbInfo(tmdbId, mediaType);
        if (!title) return [];

        const searchUrl = `${MAIN_URL}/index.php?do=search&subaction=search&story=${encodeURIComponent(title)}`;
        const { data: searchHtml } = await axios.get(searchUrl, { headers: HEADERS });
        const $search = cheerio.load(searchHtml);

        let mediaUrl = null;
        $search('div.dar-short_item').each((i, el) => {
            const anchor = $search(el).find('a').first();
            const href = anchor.attr('href');
            const entryText = anchor.text().trim();
            if (href && (normalizeTitle(entryText).includes(normalizeTitle(title)) || entryText.includes(year))) {
                mediaUrl = href;
                return false;
            }
        });

        if (!mediaUrl) return [];

        const { data: pageHtml } = await axios.get(mediaUrl, { headers: HEADERS });
        const $page = cheerio.load(pageHtml);

        let fileData = null;
        $page('script').each((i, el) => {
            const script = $page(el).html() || '';
            const atobMatch = script.match(/atob\s*\(\s*['"](.*?)['"]\s*\)/);
            if (atobMatch) {
                const decoded = atobPolyfill(atobMatch[1]);
                const fileMatch = decoded.match(/file\s*:\s*(['"])(.*?)\1/) || decoded.match(/file\s*:\s*(\[.*?\])/);
                if (fileMatch) {
                    try {
                        const raw = fileMatch[2] || fileMatch[1];
                        fileData = raw.startsWith('[') ? JSON.parse(raw) : raw;
                    } catch { fileData = fileMatch[2] || fileMatch[1]; }
                    return false;
                }
            }
        });

        if (!fileData) return [];

        const streams = [];
        const processStr = (str, quality = 'HD') => {
            if (str.includes('[') && str.includes(']')) {
                const m = str.match(/\[(.*?)\](.*)/);
                if (m) streams.push({ url: m[2], q: m[1] });
            } else {
                streams.push({ url: str, q: quality });
            }
        };

        if (mediaType === 'movie') {
            const movieFile = Array.isArray(fileData) ? fileData[0].file : fileData;
            processStr(movieFile);
        } else {
            const seasonLabel = `Season ${season}`;
            const sObj = fileData.find(s => s.title?.includes(seasonLabel) || s.title?.includes(`S${season}`));
            const epLabel = `Episode ${episode}`;
            const eObj = sObj?.folder?.find(e => e.title?.includes(epLabel) || e.title?.includes(`E${episode}`));
            if (eObj?.file) processStr(eObj.file);
        }

        return streams.map(s => ({
            name: 'CinemaCity',
            title: `[Cinema] ${s.q} · Direct`,
            url: s.url,
            quality: s.q,
            headers: HEADERS
        }));

    } catch (e) {
        console.error('[CinemaCity] error:', e.message);
        return [];
    }
}
