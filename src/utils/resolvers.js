const { resolve: resolveVoe } = require('../resolvers/voe.js');
const { resolve: resolveHlswish } = require('../resolvers/hlswish.js');
const { resolve: resolveFilemoon } = require('../resolvers/filemoon.js');
const { resolve: resolveVidhide } = require('../resolvers/vidhide.js');
const { resolve: resolveGoodstream } = require('../resolvers/goodstream.js');
const { resolve: resolveFastream } = require('../resolvers/fastream.js');
const { resolve: resolveVimeos } = require('../resolvers/vimeos.js');
const { resolve: resolveBuzzheavier } = require('../resolvers/buzzheavier.js');
const { resolve: resolveOkru } = require('../resolvers/okru.js');
const { resolve: resolvePixeldrain } = require('../resolvers/pixeldrain.js');
const { resolve: resolvePlaymogo } = require('../resolvers/playmogo.js');
const { resolve: resolveTurbovid } = require('../resolvers/turbovid.js');
const { resolve: resolveEmbedseek } = require('../resolvers/embedseek.js');
const { resolve: resolveTplayer } = require('../resolvers/tplayer.js');
const { resolve: resolveLulustream } = require('../resolvers/lulustream.js');
const { getSessionUA } = require('./http.js');
const { isMirror } = require('./mirrors.js');

const UA = getSessionUA();

/**
 * Returns specific headers for CDNs like Filemoon or Streamwish.
 */
function getDirectCdnHeaders(url) {
    if (!url) return null;
    const { getStealthHeaders } = require('./http.js');
    const s = url.toLowerCase();
    try {
        const domain = new URL(url).hostname;
        const baseOrigin = `https://${domain}`;
        const headers = { 
            ...getStealthHeaders(),
            'Referer': baseOrigin, 
            'Origin': baseOrigin 
        };
        
        if (isMirror(s, 'FILEMOON') || isMirror(s, 'VIDHIDE')) {
            headers['X-Requested-With'] = 'XMLHttpRequest';
            headers['x-embed-origin'] = domain;
            if (isMirror(s, 'FILEMOON')) {
                headers['x-embed-origin'] = 'ww3.gnulahd.nu';
                headers['x-embed-parent'] = baseOrigin;
            }
        }
        return headers;
    } catch (e) {
        return { 'User-Agent': UA, 'referer': url.split('?')[0] };
    }
}

/**
 * Applies headers and forces .m3u8 extension for Nuvio compatibility.
 */
function applyPiping(result) {
    if (!result || !result.url) return result;
    let url = result.url;
    const s = url.toLowerCase();
    
    // v5.6.88: Simulación Hermes - Anclaje técnico .m3u8 / .mp4
    // Requerido por el validador de Nuvio Mobile para mostrar y reproducir el enlace.
    if (result.headers) {
        let entries = Object.entries(result.headers);
        
        // v7.0.1: Reordenamiento estratégico. 
        // Referer debe ir al final para recibir el anclaje sin romper validaciones de Origin.
        const refIdx = entries.findIndex(([k]) => k.toLowerCase() === 'referer');
        if (refIdx !== -1) {
            const refEntry = entries.splice(refIdx, 1)[0];
            entries.push(refEntry);
        }

        const parts = entries.map(([k, v]) => `${k}=${v}`);
        if (parts.length > 0) {
            url = `${url}|${parts.join('|')}`;
        }
    }

    // Si la URL resultante (incluyendo pipes) no termina en .m3u8 ni .mp4,
    // añadimos el ancla técnica adecuada (#.m3u8 o #.mp4) al final de la última cabecera.
    if (!url.toLowerCase().includes('.m3u8') && !url.toLowerCase().includes('.mp4')) {
        const isDirectFile = s.includes('pixeldrain') || s.includes('buzzheavier') || s.includes('tplayer') || result.isDirect;
        const anchor = isDirectFile ? '#.mp4' : '#.m3u8';
        url = `${url}${anchor}`;
    }

    result.url = url;
    return result;
}

async function resolveEmbed(url, signal = null) {
    if (!url) return null;
    const s = url.toLowerCase();
    
    // Ignorar HQQ / Netu (Filtro solicitado)
    if (s.includes('hqq.ac') || s.includes('hqq.tv') || s.includes('netu.tv') || s.includes('waaw.to')) {
        return null;
    }
    
    // 1. VOE y sus espejos (Saneado v5.6.79)
    if (isMirror(s, 'VOE')) {
        const res = await resolveVoe(url, signal);
        if (res) return applyPiping(res);
    }
    
    // 2. Streamwish / HGLink / Espejos
    if (isMirror(s, 'STREAMWISH') || s.includes('filelions')) {
        const res = await resolveHlswish(url, signal);
        if (res) return applyPiping(res);
    }

    // 3. Filemoon y sus espejos (Clon PHP v5.6.82)
    if (isMirror(s, 'FILEMOON')) {
        const res = await resolveFilemoon(url, signal);
        if (res) return applyPiping(res);
    }

    // 4. VidHide / Minochinos / Espejos
    if (isMirror(s, 'VIDHIDE') || s.includes('mdfury') || s.includes('dintezuvio')) {
        const res = await resolveVidhide(url, signal);
        if (res) return applyPiping(res);
    }

    // 5. Fastream
    if (isMirror(s, 'FASTREAM')) {
        const res = await resolveFastream(url);
        if (res) return applyPiping(res);
    }

    // 6. Vimeos
    if (s.includes('vimeos') || s.includes('vms.sh')) {
        const res = await resolveVimeos(url);
        if (res) return applyPiping(res);
    }

    // 7. Okru
    if (isMirror(s, 'OKRU')) {
        const res = await resolveOkru(url);
        if (res) return applyPiping(res);
    }

    // 8. Buzzheavier
    if (isMirror(s, 'BUZZHEAVIER')) {
        const res = await resolveBuzzheavier(url);
        if (res) return applyPiping(res);
    }

    // 9. GoodStream
    if (isMirror(s, 'GOODSTREAM')) {
        const res = await resolveGoodstream(url);
        if (res) return applyPiping(res);
    }

    // 10. Otros Resolutores (Playmogo, Turbovid, Pixeldrain)
    if (s.includes('playmogo')) return applyPiping(await resolvePlaymogo(url));
    if (s.includes('turbovid')) return applyPiping(await resolveTurbovid(url));
    if (isMirror(s, 'PIXELDRAIN')) return applyPiping(await resolvePixeldrain(url));
    if (s.includes('tplayer.pelisgo.online')) return applyPiping(await resolveTplayer(url));
    if (s.includes('embedseek')) return applyPiping(await resolveEmbedseek(url));
    if (isMirror(s, 'LULUSTREAM')) return applyPiping(await resolveLulustream(url));

    // 11. Fallback Universal v8.9.7
    // Solo permitimos fallback para dominios desconocidos. 
    // Si llegamos aquí y es un mirror conocido que ya falló en los pasos anteriores, devolvemos null.
    const isKnown = isMirror(s, 'VOE') || isMirror(s, 'STREAMWISH') || isMirror(s, 'FILEMOON') || 
                    isMirror(s, 'VIDHIDE') || isMirror(s, 'FASTREAM') || isMirror(s, 'OKRU');
    
    if (isKnown) {
        console.log(`[Resolvers] Known server failed resolution (Down): ${url}`);
        return null;
    }

    const finalHeaders = getDirectCdnHeaders(url);
    return applyPiping({
        url: url,
        quality: 'SD',
        verified: false,
        headers: finalHeaders
    });
}

module.exports = { resolveEmbed };
