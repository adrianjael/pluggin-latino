/**
 * Resolver para VidHide (TV Optimized v7.6.2)
 */
const { getSessionUA, getStealthHeaders } = require('../utils/http.js');
const { validateStream } = require('../utils/m3u8.js');

function unpackVidHide(script) {
  try {
    const match = script.match(/eval\(function\(p,a,c,k,e,[rd]\)\{.*?\}\s*\('([\s\S]*?)',\s*(\d+),\s*(\d+),\s*'([\s\S]*?)'\.split\('\|'\)/);
    if (!match) return null;
    let [full, p, a, c, k] = match;
    a = parseInt(a); c = parseInt(c); k = k.split('|');
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    const decode = (l, s) => {
      let res = '';
      while (l > 0) { res = chars[l % s] + res; l = Math.floor(l / s); }
      return res || '0';
    };
    const unpacked = p.replace(/\b\w+\b/g, (l) => {
      const s = parseInt(l, 36);
      return (s < k.length && k[s]) ? k[s] : decode(s, a);
    });
    return unpacked;
  } catch (e) { return null; }
}

async function resolve(url, signal = null) {
  try {
    const currentUA = getSessionUA();
    console.log(`[VidHide] TV-Resolving: ${url}`);
    
    // v7.6.7: Referer dinámico basado en el host del mirror para evitar bloqueos 403/Forbidden
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    const response = await fetch(url, {
      signal: signal,
      headers: { 
        'User-Agent': currentUA, 
        'Referer': `https://${domain}/` 
      }
    });

    if (!response.ok) return null;
    const html = await response.text();
    
    // Simulación de cookies (Nativo fetch en App a veces no expone set-cookie por seguridad, 
    // pero usualmente no son críticas para el playback de VidHide si el Referer es correcto)
    let finalUrl = null;
    let quality = '1080p';
    
    const packedMatch = html.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
    if (packedMatch) {
      const unpacked = unpackVidHide(packedMatch[0]);
      if (unpacked) {
        const hlsMatch = unpacked.match(/"hls[24]"\s*:\s*"([^"]+)"/);
        if (hlsMatch) finalUrl = hlsMatch[1];
        const labelMatch = unpacked.match(/\{label\s*:\s*"([^"]+)"/i) || unpacked.match(/name\s*:\s*"([^"]+)"/i);
        if (labelMatch) quality = labelMatch[1].toLowerCase().includes('p') ? labelMatch[1] : labelMatch[1] + 'p';
      }
    }

    if (!finalUrl) {
      const rawMatch = html.match(/"hls[24]"\s*:\s*"([^"]+)"/) || 
                       html.match(/file\s*:\s*["']([^"']+)["']/i) ||
                       html.match(/["'](https?:\/\/[^"']+?\/stream\/[^"']+?\.m3u8[^"']*?)["']/i);
      if (rawMatch) finalUrl = rawMatch[1];
    }

    if (!finalUrl) return null;

    if (!finalUrl.startsWith('http')) finalUrl = new URL(url).origin + finalUrl;
    if (!finalUrl.includes('referer=')) finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'referer=embed69.org';

    return { 
        url: finalUrl, 
        quality: quality,
        serverName: 'VidHide',
        headers: { 
            ...getStealthHeaders(),
            'Referer': url.split('?')[0], 
            'Origin': new URL(url).origin,
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': currentUA
        } 
    };
  } catch (e) {
    console.error(`[VidHide] Error: ${e.message}`);
    return null;
  }
}

module.exports = { resolve };
