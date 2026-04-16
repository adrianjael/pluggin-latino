const { getCorrectImdbId } = require('../utils/id_mapper.js');
const { finalizeStreams } = require('../utils/engine.js');
const { isMirror } = require('../utils/mirrors.js');
const { localAtob } = require('../utils/base64.js');
const { getRandomUA } = require('../utils/ua.js');
const { setSessionUA } = require('../utils/http.js');

// Importaciones selectivas para reducir tamaño del bundle (<20KB objetivo)
const { resolve: resolveVoe } = require('../resolvers/voe.js');
const { resolve: resolveHlswish } = require('../resolvers/hlswish.js');
const { resolve: resolveFilemoon } = require('../resolvers/filemoon.js');
const { resolve: resolveVidhide } = require('../resolvers/vidhide.js');

const INDIVIDUAL_TIMEOUT = 10000; // v7.9.4: Aumentado a 10s para asegurar que el paralelismo masivo tenga éxito
const BATCH_SIZE = 20; // v7.7.7: Paralelismo total para procesar todos los servidores a la vez

/**
 * Lógica local de piping para evitar importar utils/resolvers.js completo
 */
/**
 * Limpia y prepara la URL para el reproductor de la TV.
 * v7.6.5: Se inyectan parámetros críticos (ext=m3u8 y referer) directamente
 * en la URL para asegurar la detección del formato y el acceso al servidor.
 */
function applyPipingLocal(result) {
    if (!result || !result.url) return result;
    
    let url = result.url;
    const ua = result.headers && result.headers['User-Agent'] ? result.headers['User-Agent'] : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    // Formato de tubería oficial de Nuvio para compatibilidad con VLC/MX Player
    const headers = [
        `User-Agent=${ua}`,
        `Referer=${result.headers && result.headers.Referer ? result.headers.Referer : 'https://embed69.org/'}`
    ];

    if (result.headers && result.headers.Origin) {
        headers.push(`Origin=${result.headers.Origin}`);
    }

    url = `${url}|${headers.join('|')}`;

    // Asegurar anclaje técnico para detección de formato
    if (!url.toLowerCase().includes('.m3u8') && !url.toLowerCase().includes('.mp4')) {
        url += '#.m3u8';
    }
    
    result.url = url;
    return result;
}

/**
 * Resolutor local ultra-ligero con soporte para 'Server Hints' (Nativo v7.6.6)
 */
async function resolveEmbedLocal(url, hint = '') {
    if (!url) return null;
    const s = url.toLowerCase();
    const serverHint = (hint || '').toLowerCase();
    
    console.log(`[Embed69] Resolving: ${url} (Hint: ${hint})`);

    try {
        // Prioridad 1: Detección por Hint (Basado en el nombre real del servidor en la API)
        if (serverHint.includes('vidhide') || serverHint.includes('minochinos')) {
            const res = await resolveVidhide(url);
            if (res) return applyPipingLocal(res);
        }
        if (serverHint.includes('voe') || serverHint.includes('marissa')) {
            const res = await resolveVoe(url);
            if (res) return applyPipingLocal(res);
        }
        if (serverHint.includes('filemoon') || serverHint.includes('moon')) {
            const res = await resolveFilemoon(url);
            if (res) return applyPipingLocal(res);
        }
        if (serverHint.includes('wish') || serverHint.includes('lions') || serverHint.includes('hlswish')) {
            const res = await resolveHlswish(url);
            if (res) return applyPipingLocal(res);
        }

        // Prioridad 2: Detección por Dominio (Fallback para mirrors antiguos)
        if (isMirror(s, 'VOE')) return applyPipingLocal(await resolveVoe(url));
        if (isMirror(s, 'STREAMWISH') || s.includes('filelions')) return applyPipingLocal(await resolveHlswish(url));
        if (isMirror(s, 'FILEMOON')) return applyPipingLocal(await resolveFilemoon(url));
        if (isMirror(s, 'VIDHIDE')) return applyPipingLocal(await resolveVidhide(url));
        
        // v7.6.6: Si el mirror aún no se reconoce pero es un embed de VOE/Vidhide por URL, intentamos forzar
        if (s.includes('/v/')) return applyPipingLocal(await resolveVoe(url));
        if (s.includes('/e/')) return applyPipingLocal(await resolveVidhide(url));

        return applyPipingLocal({ url, quality: 'HD', verified: false });
    } catch (err) {
        console.error(`[Embed69] Critical resolution error in TV environment: ${err.message}`);
        return applyPipingLocal({ url, quality: 'HD', verified: false });
    }
}

async function getStreams(tmdbId, mediaType, season, episode, title, year) {
    try {
        const s = (season !== undefined && season !== null && String(season) !== 'undefined') ? parseInt(season) : null;
        const e = (episode !== undefined && episode !== null && String(episode) !== 'undefined') ? parseInt(episode) : null;
        const rawId = (tmdbId !== undefined && tmdbId !== null) ? String(tmdbId).trim().toLowerCase() : '';
        let displayTitle = title || 'Contenido';

        // Rotación de identidad al inicio del ciclo
        const currentUA = getRandomUA();
        setSessionUA(currentUA);
        console.log(`[Embed69] MOBILE-STRATEGY v7.9.3 | UA: ${currentUA.substring(0, 40)}...`);

        if (!rawId) return [];
        const tmdbIdOnly = String(tmdbId).split(':')[0];
        
        let finalImdbId = null;
        try {
            const imdbInfo = await getCorrectImdbId(tmdbIdOnly, mediaType);
            finalImdbId = imdbInfo ? imdbInfo.imdbId : null;
            if (imdbInfo && imdbInfo.title) displayTitle = imdbInfo.title;
        } catch (e) {
            console.log(`[Embed69] ID Error: ${e.message}`);
        }

        // Según requerimiento: Solo se busca por IMDB
        if (!finalImdbId) {
            console.log(`[Embed69] No se encontró IMDB ID para ${tmdbIdOnly}. Abortando.`);
            return [];
        }

        let urlSuffix = finalImdbId;
        if (s !== null && e !== null) {
            const epPadded = String(e).padStart(2, '0');
            urlSuffix = `${finalImdbId}-${s}x${epPadded}`;
        }
        
        const url = `https://embed69.org/f/${urlSuffix}`;
        console.log(`[Embed69] Buscando en: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'User-Agent': currentUA, 'Referer': 'https://embed69.org/' }
        }).catch(() => null);

        if (!response || !response.ok) return [];
        const html = await response.text();
        const match = html.match(/let\s+dataLink\s*=\s*((\[[\s\S]*?\])|(\{[\s\S]*?\}))\s*;/);
        if (!match) return [];

        let rawData = JSON.parse(match[1].replace(/\\\//g, '/'));
        let data = Array.isArray(rawData) ? rawData : Object.values(rawData);
        const batch = [];
        const seenUrls = new Set();
        const langMap = { 'LAT': 'Latino', 'ESP': 'Español', 'SUB': 'Subtitulado' };

        data.forEach(item => {
            const currentLangLabel = langMap[(item.video_language || '').toUpperCase()] || 'Latino';

            if (item.sortedEmbeds && Array.isArray(item.sortedEmbeds)) {
                item.sortedEmbeds.forEach(embed => {
                    if (embed.link) {
                        let decodedLink = embed.link;
                        if (decodedLink.includes('.')) {
                            try {
                                const parts = decodedLink.split('.');
                                // v7.6.8: Uso de localAtob para evitar fallos en la TV
                                if (parts.length === 3) {
                                    const payload = localAtob(parts[1]);
                                    if (payload) decodedLink = JSON.parse(payload).link || decodedLink;
                                }
                            } catch (err) {
                                console.error(`[Embed69] Decoding error: ${err.message}`);
                            }
                        }

                        if (decodedLink.includes('/d/') || decodedLink.includes('embed69.org/f/')) return;
                        if (seenUrls.has(decodedLink)) return;
                        seenUrls.add(decodedLink);

                        batch.push({
                            url: decodedLink,
                            hint: embed.servername,
                            lang: currentLangLabel,
                            server: embed.servername || 'Servidor'
                        });
                    }
                });
            }
        });

        // v7.6.9: Resolución por LOTES de ALTA VELOCIDAD (Batch: 6 + Early Return)
        console.log(`[Embed69] Processing ${batch.length} mirrors in batches of ${BATCH_SIZE}...`);
        const rawStreams = [];
        
        for (let i = 0; i < batch.length; i += BATCH_SIZE) {
            const currentBatch = batch.slice(i, i + BATCH_SIZE);
            console.log(`[Embed69] Processing batch ${Math.floor(i/BATCH_SIZE) + 1} (${currentBatch.length} servers)`);
            
            const batchPromises = currentBatch.map(task => {
                return Promise.race([
                    resolveEmbedLocal(task.url, task.hint).then(res => {
                        if (!res) return null;
                        return { ...res, Audio: task.lang, serverLabel: task.server };
                    }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), INDIVIDUAL_TIMEOUT))
                ]).catch(err => {
                    // Log silencioso para no saturar la consola de la TV
                    return null;
                });
            });

            const batchResults = await Promise.all(batchPromises);
            batchResults.forEach(r => { if (r) rawStreams.push(r); });
            
            // v7.8.1: Se elimina el early return para mostrar TODOS los resultados disponibles
            /*
            if (rawStreams.length >= 4) {
                console.log(`[Embed69] Early return triggered with ${rawStreams.length} results.`);
                break;
            }
            */
        }

        return await finalizeStreams(rawStreams, 'Embed69', displayTitle);
    } catch (error) {
        console.error(`[Embed69] Critical Error: ${error.message}`);
        return [];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getStreams };
} else {
    global.Embed69ScraperModule = { getStreams };
}
