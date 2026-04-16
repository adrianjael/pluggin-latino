/**
 * Unified Result Engine for Nuvio Scrapers (Hermes Simulation v5.6.88)
 * Formato Estricto: Estructura de salida compatible con Nuvio Mobile (Regla 276).
 */

const { validateStream } = require('./m3u8.js');
const { sortStreamsByQuality } = require('./sorting.js');
const { isMirror } = require('./mirrors.js');

/**
 * Standardizes language labels
 */
function normalizeLanguage(lang) {
    const l = (lang || "").toLowerCase();
    
    if (l === "latino" || l === "español") return lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();

    if (l.includes("lat") || l.includes("mex") || l.includes("col") || 
        l.includes("arg") || l.includes("chi") || l.includes("per") || 
        l.includes("dub") || l.includes("dual")) {
        return "Latino";
    }
    if (l.includes("esp") || l.includes("cas") || l.includes("spa") || l.includes("cast")) {
        return "Español";
    }
    if (l.includes("sub") || l.includes("vose") || l.includes("eng")) {
        return "Subtitulado";
    }
    return lang || "Desconocido";
}

/**
 * Standardizes server labels
 */
function normalizeServer(server, url = "", resolvedServerName = null) {
    if (resolvedServerName) return resolvedServerName;

    const u = (url || "").toLowerCase();
    const s = (server || "").toLowerCase();

    if (isMirror(u, 'VIDHIDE') || isMirror(s, 'VIDHIDE')) return 'VidHide';
    if (isMirror(u, 'STREAMWISH') || isMirror(s, 'STREAMWISH')) return 'StreamWish';
    if (isMirror(u, 'VOE') || isMirror(s, 'VOE')) return 'VOE';
    if (isMirror(u, 'FILEMOON') || isMirror(s, 'FILEMOON')) return 'Filemoon';
    
    // FALLBACK INTELIGENTE: Si no es reconocido, mostrar el dominio
    if (url) {
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            return domain.charAt(0).toUpperCase() + domain.slice(1);
        } catch (e) {}
    }

    return server || 'Servidor';
}

async function finalizeStreams(streams, providerName, mediaTitle) {
    if (!Array.isArray(streams) || streams.length === 0) return [];

    console.log(`[Engine] PROCESANDO STREAMS - Filtrado Latino Inteligente v7.5.0`);

    const sorted = sortStreamsByQuality(streams);
    const processed = [];
    const seenTitles = new Set();

    for (const s of sorted) {
        // v7.5.0: Normalización robusta de idioma
        const rawLang = normalizeLanguage(s.Audio || s.langLabel || s.language || s.audio || "Latino");
        
        // Filtro Latino: Permitimos "Latino", "Latino (HD)", etc. mediante búsqueda de substring
        const isLatino = rawLang.toLowerCase().includes("latino");
        
        if (!isLatino) {
            console.log(`[Engine] Omitiendo link no latino: ${rawLang}`);
            continue;
        }

        const server = normalizeServer(s.serverLabel || s.serverName || s.servername, s.url, s.serverName);
        
        const displayQuality = s.quality || "HD";
        const checkMark = s.verified ? " (\u2713)" : "";
        
        // v8.7.8: Rediseño visual según captura (Proveedor - Calidad / latino - Servidor)
        const streamName = `${providerName} - ${displayQuality}${checkMark}`;
        const streamTitle = `${rawLang} - ${server}`;

        if (seenTitles.has(streamName + streamTitle + s.url)) continue;
        seenTitles.add(streamName + streamTitle + s.url);
        
        processed.push({
            name: streamName,       // Nombre que verá el usuario en la lista
            title: streamTitle,     // Título de la película/serie
            url: s.url,
            quality: displayQuality,
            provider: server,       // Mapeado a 'provider' en LocalScraperResult
            language: rawLang,      // Mapeado a 'language' en LocalScraperResult
            headers: s.headers || {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            }
        });
    }

    return processed;
}

module.exports = { finalizeStreams, normalizeLanguage };
