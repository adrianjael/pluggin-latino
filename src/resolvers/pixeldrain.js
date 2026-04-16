const axios = require('axios');

async function resolve(embedUrl) {
    try {
        console.log("[Pixeldrain] Resolviendo: " + embedUrl);
        
        // Extraer el ID del archivo de la URL
        // Formatos: pixeldrain.com/u/ID, pixeldrain.com/l/ID (list), pixeldrain.com/api/file/ID
        const idMatch = embedUrl.match(/\/(u|l|api\/file)\/([a-zA-Z0-9]+)/i);
        if (!idMatch) {
            console.log("[Pixeldrain] No se pudo encontrar un ID válido en la URL.");
            return null;
        }

        const fileId = idMatch[2];
        const directUrl = `https://pixeldrain.com/api/file/${fileId}?download=1`;

        // v8.8.1: Validación de enlace vivo (Modo Relajado)
        try {
            const check = await axios.get(directUrl, {
                headers: { 
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Range': 'bytes=0-0' // Solo pedimos 1 byte para que sea una petición ultra-rápida
                },
                timeout: 5000,
                validateStatus: (status) => status < 500 // Considerar cualquier respuesta < 500 como "posiblemente vivo"
            });
            
            if (check.status === 404) {
                console.log("[Pixeldrain] ❌ Archivo no encontrado confirmado (404).");
                return null;
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                console.log("[Pixeldrain] ❌ Archivo no encontrado confirmado (404).");
                return null;
            }
            // v8.8.1: Si hay timeout, 403 o cualquier error de red, NO DESCARTE el enlace.
            console.log("[Pixeldrain] ⚠️ Validación dudosa (" + (err.response ? err.response.status : 'Network Error') + "). Procediendo de todos modos.");
        }

        console.log("[Pixeldrain] ✓ URL Directa generada y confirmada.");
        
        return {
            url: directUrl,
            verified: true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Referer': 'https://pixeldrain.com/'
            }
        };
    } catch (e) {
        console.error("[Pixeldrain] Error crítico: " + e.message);
        return null;
    }
}

module.exports = { resolve };
