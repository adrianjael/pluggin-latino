import { fetchHtml, fetchJson, DEFAULT_UA } from '../utils/http.js';

export async function resolve(embedUrl) {
    try {
        console.log("[Vimeos] Resolviendo Universal (v2.0): " + embedUrl);
        
        var html = await fetchHtml(embedUrl, {
            headers: {
                'User-Agent': DEFAULT_UA,
                'Referer': 'https://vimeos.net/',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });

        var vimeoIdMatch = html.match(/vimeo\.com\/video\/(\d+)/i);
        if (!vimeoIdMatch) vimeoIdMatch = embedUrl.match(/\/(\d{7,10})/);
        
        if (vimeoIdMatch) {
            var vimeoId = vimeoIdMatch[1];
            console.log("[Vimeos] ID Vimeo detectado: " + vimeoId + ". Consultado API Config...");
            
            try {
                var config = await fetchJson("https://player.vimeo.com/video/" + vimeoId + "/config", {
                    headers: { 'User-Agent': DEFAULT_UA, 'Referer': embedUrl }
                });
                
                // Prioridad 1: HLS (m3u8) - Reemplazo de ?. para Hermes
                var hlsUrl = null;
                if (config && config.request && config.request.files && config.request.files.hls && 
                    config.request.files.hls.cdns && config.request.files.hls.cdns.default) {
                    hlsUrl = config.request.files.hls.cdns.default.url;
                }

                if (hlsUrl) {
                    console.log("[Vimeos] ✓ HLS Directo encontrado.");
                    return {
                        url: hlsUrl,
                        quality: '1080p',
                        headers: { 'User-Agent': DEFAULT_UA, 'Referer': 'https://player.vimeo.com/' }
                    };
                }
                
                // Prioridad 2: Progressive (mp4)
                var progressive = (config && config.request && config.request.files) ? config.request.files.progressive : null;
                if (progressive && progressive.length > 0) {
                    var best = progressive.sort(function(a, b) { 
                        return (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0); 
                    })[0];
                    console.log("[Vimeos] ✓ MP4 Directo encontrado (" + best.quality + ").");
                    return {
                        url: best.url,
                        quality: best.quality ? best.quality + "p" : '1080p',
                        headers: { 'User-Agent': DEFAULT_UA, 'Referer': 'https://player.vimeo.com/' }
                    };
                }
            } catch (apiErr) {
                console.log("[Vimeos] API Config Falló: " + apiErr.message);
            }
        }

        // 2. Fallback: Técnica de Lamovie (Unpacker P.A.C.K.E.R)
        var packMatch = html.match(/eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]+?\}\('([\s\S]+?)',(\d+),(\d+),'([\s\S]+?)'\.split\('\|'\)/);
        if (packMatch) {
            console.log("[Vimeos] Usando Fallback Unpacker...");
            var payload = packMatch[1];
            var radix = parseInt(packMatch[2]);
            var symtab = packMatch[4].split('|');
            var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var unbase = function(str) {
                var result = 0;
                for (var i = 0; i < str.length; i++) result = result * radix + chars.indexOf(str[i]);
                return result;
            };
            var unpacked = payload.replace(/\b(\w+)\b/g, function(match) {
                var idx = unbase(match);
                return (symtab[idx] && symtab[idx] !== '') ? symtab[idx] : match;
            });

            var m3u8Match = unpacked.match(/["']([^"']+\.m3u8[^"']*)['"]/i);
            if (m3u8Match) {
                var url = m3u8Match[1];
                return { 
                    url: url, 
                    quality: '1080p', 
                    headers: { 'User-Agent': DEFAULT_UA, 'Referer': 'https://vimeos.net/' } 
                };
            }
        }

        console.log('[Vimeos] No se encontró video directo.');
        return null;
    } catch (err) {
        console.log("[Vimeos] Error crítico: " + err.message);
        return null;
    }
}
