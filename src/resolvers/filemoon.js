/**
 * Resolver para Filemoon (Shield TV Optimized v7.6.2)
 */
const { decryptByse } = require('../utils/aes_gcm.js');
const { getSessionUA } = require('../utils/http.js');

function localAtob(input) {
  if (!input) return "";
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = String(input).replace(/=+$/, '').replace(/[\s\n\r\t]/g, '');
  let output = '';
  if (str.length % 4 === 1) return '';
  for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}

const UA_CHROME = getSessionUA();

function unpack(p, a, c, k, e, d) {
  while (c--) if (k[c]) p = p.replace(new RegExp("\\b" + c.toString(a) + "\\b", "g"), k[c]);
  return p;
}

async function resolve(url, signal = null) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const videoId = urlObj.pathname.split('/').filter(p => !!p).pop();
    
    if (!videoId) return null;
    console.log(`[Filemoon] TV-Resolving: ${videoId} Host: ${hostname}`);

    // 1. INTENTO SHIELD (AES-GCM) - Fetch Nativo
    try {
        const playbackUrl = `https://${hostname}/api/videos/${videoId}/embed/playback`;
        const response = await fetch(playbackUrl, {
            signal: signal,
            headers: { 
                'User-Agent': UA_CHROME,
                'Referer': url,
                'Origin': `https://${hostname}`,
                'X-Embed-Parent': url
            }
        });

        if (response.ok) {
            const playbackData = await response.json();
            if (playbackData && playbackData.playback) {
                const decrypted = decryptByse(playbackData.playback);
                if (decrypted) {
                    const data = decrypted.includes('{') ? JSON.parse(decrypted) : null;
                    const directUrl = data?.sources?.[0]?.url || data?.url;
                    if (directUrl) {
                        // v8.8.0: Verificación de vida del M3U8/MP4
                        try {
                            const vCheck = await fetch(directUrl, { method: 'HEAD', headers: { 'User-Agent': UA_CHROME } });
                            if (vCheck.status === 404) {
                                console.log("[Filemoon] ❌ URL de video caducada (404).");
                                return null;
                            }
                        } catch (ve) {}

                        return {
                            url: directUrl,
                            quality: data?.sources?.[0]?.label || '1080p',
                            verified: true,
                            serverName: 'Filemoon',
                            headers: { 'User-Agent': UA_CHROME, 'Referer': `https://${hostname}/`, 'Origin': `https://${hostname}`, 'x-embed-origin': 'ww3.gnulahd.nu' }
                        };
                    }
                }
            }
        }
    } catch (e) {
        console.log(`[Filemoon] Shield Falló: ${e.message}`);
    }

    // 2. FALLBACK: Fetch Nativo + Unpacker
    const resp = await fetch(url, { headers: { 'User-Agent': UA_CHROME, 'Referer': urlObj.origin } });
    const html1 = await resp.text();

    const evalMatch = html1.match(/eval\(function\(p,a,c,k,e,(?:d|\w+)\)\{[\s\S]+?\}\s*\(([\s\S]+?)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]+?)'\.split/);
    if (evalMatch) {
      const unpacked = unpack(evalMatch[1], parseInt(evalMatch[2]), parseInt(evalMatch[3]), evalMatch[4].split("|"), 0, {});
      const m3u8Match = unpacked.match(/sources\s*:\s*\[\s*\{\s*file\s*:\s*["']([^"']+)["']/i);
      if (m3u8Match) {
        return {
          url: m3u8Match[1],
          verified: true,
          serverName: 'Filemoon',
          headers: { 
          'User-Agent': UA_CHROME, 
          'Referer': `https://${hostname}`, 
          'Origin': `https://${hostname}` 
        }
        };
      }
    }

    return null;
  } catch (error) {
    console.error(`[Filemoon] Error: ${error.message}`);
    return null;
  }
}

module.exports = { resolve };

module.exports = { resolve };
