const axios = require('axios');
const CryptoJS = require('crypto-js');
const { getCorrectImdbId } = require('../utils/id_mapper.js');
const { finalizeStreams } = require('../utils/engine.js');
const { resolveEmbed } = require('../utils/resolvers.js');

const INDIVIDUAL_TIMEOUT = 4000; // Carrera rápida para cumplir los 5s del usuario
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function getStreams(tmdbId, mediaType, season, episode) {
    try {
        console.log(`[Embed69] Ráfaga v7.2.8 - ID: ${tmdbId}`);
        
        // 1. Metadatos rápidos vía API TMDB
        const meta = await getCorrectImdbId(tmdbId, mediaType);
        if (!meta.imdbId) return [];
        const title = meta.title || 'Contenido';

        // 2. Construcción de URL oficial
        let url;
        if (mediaType === 'movie' || mediaType === 'movies') {
            url = `https://embed69.org/f/${meta.imdbId}`;
        } else {
            const s = parseInt(season);
            const e = parseInt(episode);
            url = `https://embed69.org/f/${meta.imdbId}-${s}x${e}`;
        }

        // 3. Petición inicial (Axios)
        const response = await axios.get(url, {
            timeout: 5000,
            headers: { 'User-Agent': UA, 'Referer': 'https://embed69.org/' }
        }).catch(() => null);

        if (!response || !response.data) return [];

        // 4. Extracción dataLink
        const dataLinkRegex = /let\s+dataLink\s*=\s*(\[[\s\S]*?\]);/;
        const match = response.data.match(dataLinkRegex);
        if (!match) return [];

        let data;
        try {
            data = JSON.parse(match[1]);
        } catch (e) { return []; }

        const batch = [];
        const seenUrls = new Set();

        // 5. Preparar carrera de servidores
        for (const item of data) {
            const langLabel = item.video_language || 'Latino';
            if (!item.sortedEmbeds) continue;

            for (const embed of item.sortedEmbeds) {
                if (embed.link) {
                    let decodedLink = embed.link;

                    // Descifrado JWT expreso
                    if (decodedLink.includes('.')) {
                        try {
                            const parts = decodedLink.split('.');
                            if (parts.length === 3) {
                                const decoded = CryptoJS.enc.Base64.parse(parts[1]).toString(CryptoJS.enc.Utf8);
                                const payload = JSON.parse(decoded);
                                if (payload.link) decodedLink = payload.link;
                            }
                        } catch (e) {}
                    }

                    // FILTRO DE RAÍZ v7.2.8: Ignorar backups/descargas redundantes que quitan tiempo
                    if (decodedLink.includes('/d/')) continue;
                    
                    if (seenUrls.has(decodedLink)) continue;
                    seenUrls.add(decodedLink);

                    const sLabel = embed.servername || 'Servidor';

                    // LÓGICA DE RÁFAGA (Copiada del backup funcional)
                    const resolutionPromise = Promise.race([
                        resolveEmbed(decodedLink).then(res => {
                            if (!res) return null;
                            return {
                                ...res,
                                langLabel: langLabel,
                                serverLabel: sLabel
                            };
                        }),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), INDIVIDUAL_TIMEOUT))
                    ]).catch(() => {
                        // Fallback rápido si el resolutor demora más de 4s
                        return {
                            url: decodedLink,
                            quality: 'HD',
                            langLabel: langLabel,
                            serverLabel: sLabel,
                            verified: false
                        };
                    });

                    batch.push(resolutionPromise);
                }
            }
        }

        console.log(`[Embed69] Ráfaga activada: Procesando ${batch.length} servidores (Límite 4s)...`);
        
        // Usamos allSettled para que si uno falla no detenga a los demás
        const results = await Promise.allSettled(batch);
        
        const rawStreams = results
            .filter(r => r.status === 'fulfilled' && r.value)
            .map(r => r.value);

        // 6. Finalización via Engine
        return await finalizeStreams(rawStreams, 'Embed69', title);

    } catch (error) {
        console.error(`[Embed69] Fallo Crítico: ${error.message}`);
        return [];
    }
}

module.exports = { getStreams };
