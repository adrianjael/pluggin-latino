const axios = require('axios');
const { getStealthHeaders } = require('../utils/http.js');

/**
 * Resolutor para Buzzheavier (v8.8.0 - Official Bypass)
 * Usa el método de cabeceras HTMX para obtener redirecciones directas.
 */
async function resolve(embedUrl) {
    if (!embedUrl) return null;
    try {
        const cleanUrl = embedUrl.split('|')[0].replace(/\/$/, '');
        const domain = new URL(cleanUrl).hostname;
        const downloadUrl = `${cleanUrl}/download`;
        
        console.log(`[Buzzheavier] Resolviendo v8.8.7 (Python Logic): ${cleanUrl}`);

        const headers = {
            ...getStealthHeaders(),
            'Referer': cleanUrl,
            'hx-current-url': cleanUrl,
            'hx-request': 'true',
            'Accept': '*/*'
        };

        // Paso 1: Obtener el hx-redirect usando HEAD (Igual que el script de Python)
        try {
            const headResponse = await axios.head(downloadUrl, { 
                headers, 
                timeout: 8000,
                maxRedirects: 0, // Importante: no seguir redirecciones para capturar hx-redirect
                validateStatus: (status) => status >= 200 && status < 400
            });

            const hxRedirect = headResponse.headers['hx-redirect'];
            if (hxRedirect) {
                let finalUrl = hxRedirect;
                if (hxRedirect.startsWith('/dl/')) {
                    finalUrl = `https://${domain}${hxRedirect}`;
                }
                
                console.log("[Buzzheavier] ✓ Enlace REAL obtenido via hx-redirect.");
                return {
                    url: finalUrl + "#.mp4",
                    isDirect: true,
                    verified: true,
                    headers: { 
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
                        'Referer': cleanUrl,
                        'sec-ch-ua': '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"',
                        'sec-fetch-dest': 'document',
                        'sec-fetch-mode': 'navigate',
                        'sec-fetch-site': 'cross-site',
                        'upgrade-insecure-requests': '1',
                        'priority': 'u=0, i'
                    }
                };
            }
        } catch (err) {
            console.log("[Buzzheavier] ⚠️ Error en HEAD: " + err.message);
        }

        // Paso 2: Fallback si falla el hx-redirect (v/ID/video.mp4 como última opción)
        const id = cleanUrl.split('/').pop();
        const predictableUrl = `https://buzzheavier.com/v/${id}/video.mp4`;
        
        return {
            url: predictableUrl + "#.mp4",
            isDirect: true,
            verified: true,
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
                'Referer': cleanUrl,
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'cross-site'
            }
        };
    } catch (err) {
        console.error("[Buzzheavier] Error crítico: " + err.message);
        return null;
    }
}

module.exports = { resolve };
