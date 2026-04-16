const { fetchHtml, DEFAULT_UA } = require('../utils/http.js');

/**
 * Resuelve un enlace de Playmogo.
 * Playmogo es un hoster de video (alias de DoodStream).
 */
async function resolve(url) {
    try {
        console.log("[Playmogo] Resolving: " + url);

        // Nuvio intentará reproducir este hoster. 
        // Si el reproductor de Nuvio tiene soporte nativo para Playmogo/Dood, 
        // solo necesitamos pasarle la URL y las cabeceras correctas.
        
        return {
            url: url,
            quality: '720p',
            serverName: 'Playmogo',
            headers: { 
                'User-Agent': DEFAULT_UA,
                'Referer': 'https://dsvplay.com/',
                'Origin': 'https://dsvplay.com'
            }
        };
    } catch (e) {
        console.error("[Playmogo] Error: " + e.message);
        return null;
    }
}

module.exports = { resolve };
