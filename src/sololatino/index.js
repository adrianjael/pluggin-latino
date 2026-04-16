/**
 * SoloLatino - TURBO EDITION (v8.5.0)
 * Optimización: Procesamiento paralelo de servidores para velocidad extrema.
 * Filtrado: Ignora Seek y Lulu automáticamente.
 */
const axios = require('axios');
const { finalizeStreams } = require('../utils/engine.js');
const { setSessionUA } = require('../utils/http.js');
const { resolveEmbed } = require('../utils/resolvers.js');

const BASE_URL = 'https://player.pelisserieshoy.com';
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36";
const HEADERS = {
    "User-Agent": UA,
    "Accept": "*/*",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    "X-Requested-With": "XMLHttpRequest",
    "Referer": "https://sololatino.net/"
};

async function getImdbIdInternal(idOrQuery, mediaType) {
    const rawId = idOrQuery.toString().split(':')[0];
    if (rawId.startsWith('tt')) return rawId;
    try {
        const type = (mediaType === 'movie' || mediaType === 'movies') ? 'movie' : 'tv';
        const url = `https://api.themoviedb.org/3/${type}/${rawId}/external_ids?api_key=${TMDB_API_KEY}`;
        const { data } = await axios.get(url, { timeout: 4000 });
        return data.imdb_id || null;
    } catch (e) { return null; }
}

async function getDirectStream(id, token, cookie, playerUrl) {
    try {
        const body = `a=2&v=${id}&tok=${token}`;
        const config = {
            headers: {
                ...HEADERS,
                "Referer": playerUrl,
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            }
        };
        if (cookie) config.headers["cookie"] = cookie;
        
        const { data } = await axios.post(`${BASE_URL}/s.php`, body, config);
        if (data && data.u) {
            let finalUrl = data.u;
            if (data.sig) {
                finalUrl = `${BASE_URL}/p.php?url=${encodeURIComponent(data.u)}&sig=${data.sig}`;
            }
            return finalUrl;
        }
        return null;
    } catch (e) { return null; }
}

async function getStreams(tmdbId, mediaType, season, episode, title) {
    if (!tmdbId) return [];
    
    const parts = tmdbId.toString().split(':');
    const realId = parts[0];
    const s = parseInt(parts[1] || season || 1);
    const e = parseInt(parts[2] || episode || 1);
    const isMovie = (mediaType === 'movie' || mediaType === 'movies');

    setSessionUA(UA);
    
    const imdbId = await getImdbIdInternal(realId, mediaType);
    if (!imdbId) return [];

    const epStr = e < 10 ? `0${e}` : e;
    const slug = isMovie ? imdbId : `${imdbId}-${s}x${epStr}`;
    const playerUrl = `${BASE_URL}/f/${slug}`;

    try {
        const { data: html, headers: respHeaders } = await axios.get(playerUrl, { headers: HEADERS, timeout: 8000 });
        const cookie = (respHeaders['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
        
        const tokenMatch = html.match(/(?:let\s+token|const\s+_t|tok|_t|token)\s*.*['"]([a-f0-9]{32})['"]/);
        if (!tokenMatch) return [];
        const token = tokenMatch[1];
        
        const postH = { 
            ...HEADERS, 
            "Referer": playerUrl, 
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" 
        };
        if (cookie) postH["cookie"] = cookie;

        // Registro de clic y espera de seguridad
        await axios.post(`${BASE_URL}/s.php`, "a=click&tok=" + token, { headers: postH }).catch(()=>{});
        await sleep(1000);

        // Obtener lista de servidores
        const { data: scanData } = await axios.post(`${BASE_URL}/s.php`, `a=1&tok=${token}`, { headers: postH });
        
        const uniqueServers = new Map();
        if (scanData && scanData.s) {
            scanData.s.forEach(ser => { if(ser[1]) uniqueServers.set(ser[1], ser); });
        }
        if (scanData && scanData.langs_s && scanData.langs_s.LAT) {
            scanData.langs_s.LAT.forEach(ser => { if(ser[1]) uniqueServers.set(ser[1], ser); });
        }
        
        const servers = Array.from(uniqueServers.values()).filter(ser => {
            const name = ser[0];
            return !['Seek', 'Lulu'].some(x => name.includes(x));
        }).slice(0, 5); // Tomar solo los mejores 5 internos

        // v8.5.0: RESOLUCIÓN EN PARALELO (TURBO)
        const resultsRaw = await Promise.all(servers.map(async (ser) => {
            const [name, id] = ser;
            const finalUrl = await getDirectStream(id, token, cookie, playerUrl);
            if (finalUrl) {
                const resolvedResult = await resolveEmbed(finalUrl);
                return {
                    url: finalUrl,
                    serverName: (resolvedResult?.serverName ? `${name} - ${resolvedResult.serverName}` : name).replace(/ - Direct/g, ''),
                    langLabel: 'Latino',
                    quality: '1080p',
                    headers: { 'User-Agent': UA, 'Referer': playerUrl, 'Origin': BASE_URL }
                };
            }
            return null;
        }));

        const resolved = resultsRaw.filter(r => r !== null);
        return await finalizeStreams(resolved, 'SoloLatino', title);
    } catch (e) {
        console.log(`[SoloLatino] Error v8.5.0: ${e.message}`);
    }
    return [];
}

module.exports = { getStreams };
