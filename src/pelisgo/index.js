/**
 * PelisGo Provider for Nuvio (V1.8.8 - Strict Latino & Simplified UI)
 * v8.7.8: Removed Buzzheavier. Enforced 100% Latino filtering.
 */

const { calculateSimilarity } = require('../utils/string.js');
const { finalizeStreams } = require('../utils/engine.js');
const { resolveEmbed } = require('../utils/resolvers.js');
const { getStealthHeaders } = require('../utils/http.js');
const { getCorrectImdbId } = require('../utils/id_mapper.js');

const BASE = "https://pelisgo.online";
// v8.7.8: Whitelist restringida según tu solicitud
const WHITELIST = ['Magi', 'Filemoon', 'Pixeldrain'];

function getPelisGoHeaders(referer = BASE) {
    return {
        ...getStealthHeaders(),
        'Referer': referer,
        'Origin': BASE,
        'X-Requested-With': 'XMLHttpRequest'
    };
}

async function fetchWithTimeout(url, options = {}, timeout = 6000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (e) {
        clearTimeout(id);
        return { text: () => "", json: () => ({}), status: 404 };
    }
}

function cleanTitle(str) {
    if (!str) return "";
    return str.replace(/[\\"' ]+/g, '').replace(/\\u[\dA-F]{4}/gi, '').trim();
}

/**
 * v8.7.8: Filtro estricto de idioma.
 * Devuelve null si detecta Castellano/España para que el stream se descarte.
 */
function normalizeLanguageStrict(str) {
    if (!str) return 'Latino';
    const low = str.toLowerCase();
    
    // Si es Castellano o de España, lo bloqueamos devolviendo null
    if (low.includes('castellano') || low.includes('españa') || low.includes('esp')) {
        return null; 
    }
    
    return 'Latino';
}

async function getOnlineStreams(rawHtml) {
    const seenUrls = new Set();
    const resolutionPromises = [];

    const objects = rawHtml.match(/\{[^{}]*?server[\\"' ]+:[^{}]*?\}/gis) || [];

    for (const objStr of objects) {
        resolutionPromises.push((async () => {
            try {
                const sM = objStr.match(/server[\\"' ]+:[\\"' ]+([^\\"' ,}]+)/i);
                const uM = objStr.match(/(url|download)[\\"' ]+:[\\"' ]+([^\\"' ,}]+)/i);
                const qM = objStr.match(/quality[\\"' ]+:[\\"' ]+([^\\"' ,}]+)/i);
                const lM = objStr.match(/language[\\"' ]+:[\\"' ]+([^\\"' ,}]+)/i);

                if (!sM || !uM) return null;

                const serverName = cleanTitle(sM[1]);
                let rawUrl = uM[2].replace(/\\/g, '').replace(/[\\"' ]+/g, '');
                const quality = qM ? cleanTitle(qM[1]) : '1080p';
                const lang = lM ? cleanTitle(lM[1]) : 'Latino';

                // v8.7.8: Whitelist Estricta (Solo Magi, Filemoon, Pixeldrain)
                if (!WHITELIST.some(w => serverName.toLowerCase().includes(w.toLowerCase()))) return null;

                // v8.7.8: Filtro de Idioma Latino Estricto
                const finalLang = normalizeLanguageStrict(lang);
                if (!finalLang) {
                    console.log(`[PelisGo] Omitiendo enlace Castellano de ${serverName}`);
                    return null;
                }

                let directUrl = rawUrl;
                if (rawUrl.includes('/download/')) {
                    const id = rawUrl.split('/').pop();
                    const downloadRes = await fetchWithTimeout(`${BASE}/api/download/${id}`, { headers: getPelisGoHeaders() });
                    const downloadData = await downloadRes.json();
                    directUrl = downloadData.url || null;
                }

                if (!directUrl || seenUrls.has(directUrl)) return null;
                seenUrls.add(directUrl);

                const resEmbed = await resolveEmbed(directUrl);
                
                return {
                    name: 'PelisGo',
                    langLabel: finalLang,
                    serverLabel: serverName,
                    url: resEmbed ? resEmbed.url : directUrl,
                    quality: (resEmbed ? resEmbed.quality : quality) || '1080p',
                    headers: (resEmbed ? resEmbed.headers : null) || getPelisGoHeaders(directUrl)
                };
            } catch (e) { return null; }
        })());
    }

    const results = await Promise.allSettled(resolutionPromises);
    return results.filter(r => r.status === 'fulfilled' && r.value !== null).map(r => r.value);
}

async function getStreams(tmdbId, mediaType, season, episode, title) {
    try {
        const type = (mediaType === 'tv' || mediaType === 'series') ? 'tv' : 'movie';
        const meta = await getCorrectImdbId(tmdbId, mediaType);
        const mediaTitle = meta.title || title;

        const slugPath = mediaTitle.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s\-]/gi, '').toLowerCase().trim().replace(/\s+/g, '-');
        const targetPath = type === 'movie' ? `/movies/${slugPath}` : `/series/${slugPath}`;
        
        const finalUrl = type === 'movie' ? `${BASE}${targetPath}` : `${BASE}${targetPath}/temporada/${season || 1}/episodio/${episode || 1}`;
        const resPage = await fetchWithTimeout(finalUrl);
        const html = await resPage.text();
        
        if (!html || html.includes('404')) {
            // Reintentar con búsqueda si el slug directo falló
            console.log(`[PelisGo] Slug fallido, reintentando con búsqueda...`);
            const searchRes = await fetchWithTimeout(`${BASE}/search?q=${encodeURIComponent(mediaTitle)}`);
            const searchHtml = await searchRes.text();
            const re = new RegExp(`href=["\\\\"]+([^"\\\\"]+(movies|series)\\/([\\w\\d\\-]+))["\\\\"]+`, 'gi');
            let m;
            while ((m = re.exec(searchHtml)) !== null) {
                if (calculateSimilarity(mediaTitle, m[3].replace(/-/g, ' ')) > 0.7) {
                    const resRetry = await fetchWithTimeout(`${BASE}${m[1].replace(/\\/g, '')}`);
                    const htmlRetry = await resRetry.text();
                    const streams = await getOnlineStreams(htmlRetry);
                    return await finalizeStreams(streams, 'PelisGo', mediaTitle);
                }
            }
        }

        const streams = await getOnlineStreams(html);
        return await finalizeStreams(streams, 'PelisGo', mediaTitle);
    } catch (e) { return []; }
}

module.exports = { getStreams };
