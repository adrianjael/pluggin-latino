const axios = require('axios');
const CryptoJS = require('crypto-js');

const BASE = 'https://pelisgo.online';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const PLAYER_ACTION_ID = '4079b11d214b588c12807d99b549e1851b3ee03082';

const HEADERS = {
    'User-Agent': UA,
    'Accept-Language': 'es-ES,es;q=0.9',
    'Referer': `${BASE}/`
};

/**
 * Desencripta el payload de Magi (Filemoon) usando AES-256-GCM
 */
function decryptMagi(payloadB64, keyParts, ivB64) {
    try {
        const k1 = CryptoJS.enc.Base64.parse(keyParts[0].replace(/-/g, '+').replace(/_/g, '/'));
        const k2 = CryptoJS.enc.Base64.parse(keyParts[1].replace(/-/g, '+').replace(/_/g, '/'));
        const key = k1.concat(k2);
        const iv = CryptoJS.enc.Base64.parse(ivB64.replace(/-/g, '+').replace(/_/g, '/'));
        const cipherText = CryptoJS.enc.Base64.parse(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));

        // En CryptoJS, el tag está al final (16 bytes = 32 hex chars)
        const cipherTextHex = cipherText.toString(CryptoJS.enc.Hex);
        const tag = cipherTextHex.slice(-32);
        const encrypted = cipherTextHex.slice(0, -32);

        const decrypted = CryptoJS.AES.decrypt(
            {
                ciphertext: CryptoJS.enc.Hex.parse(encrypted),
                authTag: CryptoJS.enc.Hex.parse(tag)
            },
            key,
            {
                iv: iv,
                mode: CryptoJS.mode.GCM,
                padding: CryptoJS.pad.NoPadding
            }
        );

        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return null;
    }
}

/**
 * Busca contenidos en PelisGo
 */
async function search(query) {
    try {
        const searchUrl = `${BASE}/search?q=${encodeURIComponent(query)}`;
        const { data: html } = await axios.get(searchUrl, { headers: HEADERS });

        const results = [];
        // Regex universal para capturar películas y series (Next.js h3 structure)
        const itemRegex = /<a\s+[^>]*href="(\/(?:movies|series)\/([^"]+))"[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/gi;
        let match;
        while ((match = itemRegex.exec(html)) !== null) {
            results.push({
                title: match[3].trim().replace(/\s+/g, ' '),
                url: `${BASE}${match[1]}`,
                source: 'PelisGo'
            });
        }

        return results;
    } catch (e) {
        console.log('[PelisGo] Error en búsqueda:', e.message);
        return [];
    }
}

/**
 * Extrae el MovieID externo de Next.js y busca enlaces de descarga en el HTML
 */
async function extractData(url) {
    try {
        const { data: html } = await axios.get(url, { headers: HEADERS });
        let movieId = null;
        const downloads = [];

        // 1. Buscar en __NEXT_DATA__
        const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
        if (nextMatch) {
            const data = JSON.parse(nextMatch[1]);
            const movie = data.props?.pageProps?.movie || data.props?.pageProps?.serie || data.props?.pageProps?.movieData;
            if (movie && movie.id) movieId = movie.id;
        }
        
        // 2. Buscar patrón de ID en el HTML si falla el anterior
        if (!movieId) {
            const idMatch = html.match(/"id"\s*:\s*"(cmn[a-z0-9]{15,})"/i) || html.match(/cmn[a-z0-9]{20,}/);
            movieId = idMatch ? (Array.isArray(idMatch) ? idMatch[1] || idMatch[0] : idMatch) : null;
        }

        // 3. Buscar enlaces de descarga directa (Pixeldrain/BuzzHeavier)
        const downloadRegex = /https?:\/\/(?:pixeldrain\.com|buzzheavier\.com|mediafire\.com)\/[a-zA-Z0-9\/._-]+/g;
        const foundDownloads = html.match(downloadRegex) || [];
        [...new Set(foundDownloads)].forEach(dUrl => {
            if (dUrl.includes('pixeldrain.com')) {
                const pixelId = dUrl.split('/').pop();
                downloads.push({
                    name: 'PelisGo (Pixeldrain MP4)',
                    url: `https://pixeldrain.com/api/file/${pixelId}`,
                    quality: '1080p',
                    type: 'direct'
                });
            } else if (dUrl.includes('buzzheavier.com')) {
                downloads.push({
                    name: 'PelisGo (BuzzHeavier)',
                    url: dUrl,
                    quality: 'HD',
                    type: 'direct'
                });
            }
        });

        return { movieId, downloads };
    } catch (e) {
        return { movieId: null, downloads: [] };
    }
}

/**
 * Obtiene los enlaces de streaming (Solo enlaces directos MP4/M3U8)
 */
async function getStream(url) {
    try {
        const { movieId, downloads } = await extractData(url);
        const streams = [...downloads];

        if (!movieId) return streams;

        // Intentar obtener otros servidores si es necesario (Implementación futura de Magi dinámica)
        // Por ahora, Pixeldrain es nuestra fuente garantizada de mp4
        
        return streams;
    } catch (e) {
        console.log('[PelisGo] Error general en getStream:', e.message);
        return [];
    }
}

module.exports = { search, getStream };
