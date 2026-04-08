import axios from 'axios';
import { detectQuality } from './quality.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export async function resolve(embedUrl) {
    try {
        console.log(`[Vimeos] Resolviendo Universal (v2.0): ${embedUrl}`);
        
        // 1. Intentar extraer ID numérico de Vimeo
        // Patrones: vimeos.net/e/ID, vimeo.com/video/ID, etc.
        const resp = await axios.get(embedUrl, {
            headers: {
                'User-Agent': UA,
                'Referer': 'https://vimeos.net/',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            timeout: 10000
        });

        const html = resp.data;
        
        // Buscamos el ID real de Vimeo en el HTML o en la URL
        const vimeoIdMatch = html.match(/vimeo\.com\/video\/(\d+)/i) || embedUrl.match(/\/(\d{7,10})/);
        
        if (vimeoIdMatch) {
            const vimeoId = vimeoIdMatch[1];
            console.log(`[Vimeos] ID Vimeo detectado: ${vimeoId}. Consultado API Config...`);
            
            try {
                const configRes = await axios.get(`https://player.vimeo.com/video/${vimeoId}/config`, {
                    headers: { 'User-Agent': UA, 'Referer': embedUrl }
                });
                const config = configRes.data;
                
                // Prioridad 1: HLS (m3u8)
                const hlsUrl = config.request?.files?.hls?.cdns?.default?.url;
                if (hlsUrl) {
                    console.log(`[Vimeos] ✓ HLS Directo encontrado.`);
                    return {
                        url: hlsUrl,
                        quality: '1080p',
                        isM3U8: true,
                        headers: { 'User-Agent': UA, 'Referer': 'https://player.vimeo.com/' }
                    };
                }
                
                // Prioridad 2: Progressive (mp4)
                const progressive = config.request?.files?.progressive;
                if (progressive && progressive.length > 0) {
                    const best = progressive.sort((a, b) => (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0))[0];
                    console.log(`[Vimeos] ✓ MP4 Directo encontrado (${best.quality}).`);
                    return {
                        url: best.url,
                        quality: best.quality ? `${best.quality}p` : '1080p',
                        headers: { 'User-Agent': UA, 'Referer': 'https://player.vimeo.com/' }
                    };
                }
            } catch (apiErr) {
                console.log(`[Vimeos] API Config Falló: ${apiErr.message}`);
            }
        }

        // 2. Fallback: Técnica de Lamovie (Unpacker P.A.C.K.E.R)
        const packMatch = html.match(/eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]+?\}\('([\s\S]+?)',(\d+),(\d+),'([\s\S]+?)'\.split\('\|'\)/);
        if (packMatch) {
            console.log(`[Vimeos] Usando Fallback Unpacker...`);
            const payload = packMatch[1];
            const radix = parseInt(packMatch[2]);
            const symtab = packMatch[4].split('|');
            const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const unbase = (str) => {
                let result = 0;
                for (let i = 0; i < str.length; i++) result = result * radix + chars.indexOf(str[i]);
                return result;
            };
            const unpacked = payload.replace(/\b(\w+)\b/g, (match) => {
                const idx = unbase(match);
                return (symtab[idx] && symtab[idx] !== '') ? symtab[idx] : match;
            });

            const m3u8Match = unpacked.match(/["']([^"']+\.m3u8[^"']*)['"]/i);
            if (m3u8Match) {
                const url = m3u8Match[1];
                const finalHeaders = { 'User-Agent': UA, 'Referer': 'https://vimeos.net/' };
                return { url, quality: '1080p', isM3U8: true, headers: finalHeaders };
            }
        }

        console.log('[Vimeos] No se encontró video directo.');
        return null;
    } catch (err) {
        console.log(`[Vimeos] Error crítico: ${err.message}`);
        return null;
    }
}
