/**
 * Resolutor para TPlayer (pelisgo.online)
 * v8.6.0: Captura de sesión (Cookies) obligatoria para evitar Error 500.
 */
const axios = require('axios');
const { getStealthHeaders } = require('../utils/http.js');

async function resolve(embedUrl) {
    try {
        console.log("[TPlayer] Resolviendo con sesión: " + embedUrl);
        
        const idMatch = embedUrl.match(/\/embed\/([a-zA-Z0-9_-]+)/);
        if (!idMatch) return null;

        const fileId = idMatch[1];
        const baseUrl = new URL(embedUrl).origin;
        const apiUrl = `${baseUrl}/api/resolve/${fileId}`;

        const baseHeaders = {
            ...getStealthHeaders(),
            'Referer': embedUrl,
            'Origin': baseUrl,
            'X-Requested-With': 'XMLHttpRequest'
        };

        // PASO 1: Obtener la sesión (Cookies)
        const embedResp = await axios.get(embedUrl, { 
            headers: baseHeaders,
            timeout: 5000 
        });
        
        const cookies = (embedResp.headers['set-cookie'] || [])
            .map(c => c.split(';')[0])
            .join('; ');

        if (cookies) {
            baseHeaders['Cookie'] = cookies;
            console.log("[TPlayer] Sesión capturada correctamente.");
        }

        // PASO 2: Resolver el stream
        const { data } = await axios.get(apiUrl, { 
            headers: baseHeaders,
            timeout: 5000 
        });

        if (!data || !data.success || !data.streamUrl) {
            console.log("[TPlayer] La API no autorizó el stream.");
            return null;
        }

        const streamUrl = data.streamUrl.startsWith('http') 
            ? data.streamUrl 
            : `${baseUrl}${data.streamUrl}`;

        console.log("[TPlayer] ✓ Link de sesión generado.");

        return {
            url: streamUrl,
            isDirect: true, 
            verified: true,
            headers: {
                'User-Agent': baseHeaders['User-Agent'],
                'Referer': embedUrl,
                'Origin': baseUrl,
                'Cookie': cookies // Vital para que Nuvio pueda descargar el stream
            }
        };
    } catch (e) {
        console.error("[TPlayer] Error de resolución: " + e.message);
        return null;
    }
}

module.exports = { resolve };
