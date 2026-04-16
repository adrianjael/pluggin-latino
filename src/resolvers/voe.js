/**
 * Resolver para VOE (TV Optimized v7.6.2)
 */
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

async function resolve(url, signal = null) {
  try {
    const currentUA = getSessionUA();
    console.log(`[VOE] TV-Resolving: ${url}`);
    
    // v7.6.7: Uso de descifrado local para evitar bugs en el atob nativo de la TV
    const response = await fetch(url, {
      headers: { 'User-Agent': currentUA },
      signal: signal
    });

    if (!response.ok) return null;
    const html = await response.text();

    if (html.includes("window.location.href") && html.length < 2000) {
      const rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
      if (rm) return resolve(rm[1]);
    }

    const jsonMatch = html.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1].trim());
        let encText = Array.isArray(parsed) ? parsed[0] : parsed;
        if (typeof encText !== "string") return null;

        let decoded = encText.replace(/[a-zA-Z]/g, (c) => {
          const code = c.charCodeAt(0);
          const limit = c <= "Z" ? 90 : 122;
          const shifted = code + 13;
          return String.fromCharCode(limit >= shifted ? shifted : shifted - 26);
        });

        const noise = ["@$", "^^", "~@", "%?", "*~", "!!", "#&"];
        for (const n of noise) decoded = decoded.split(n).join("");

        // Algoritmo Base64 LOCAL (Independiente de la App)
        const b64_1 = localAtob(decoded);
        if (!b64_1) throw new Error("LocalAtob failed stage 1");

        let shiftedStr = "";
        for (let j = 0; j < b64_1.length; j++) {
          shiftedStr += String.fromCharCode(b64_1.charCodeAt(j) - 3);
        }

        const reversed = shiftedStr.split("").reverse().join("");
        const decrypted = localAtob(reversed);
        if (!decrypted) throw new Error("LocalAtob failed stage 2");
        
        const data = JSON.parse(decrypted);

        if (data && data.source) {
          console.log(`[VOE] Success: ${data.source.substring(0, 50)}...`);
          return {
            url: data.source,
            quality: '1080p',
            verified: true,
            serverName: 'VOE',
            headers: {
              'User-Agent': currentUA,
              'Referer': url
            }
          };
        }
      } catch (ex) {
        console.error(`[VOE] Decryption failed (QuickJS Match): ${ex.message}`);
      }
    }

    const m3u8Match = html.match(/["'](https?:\/\/[^"']+?\.m3u8[^"']*?)["']/i);
    if (m3u8Match) {
      return {
        url: m3u8Match[1],
        quality: '1080p',
        verified: false,
        serverName: 'VOE',
        headers: { 
          'Referer': url,
          'User-Agent': currentUA
        }
      };
    }

    return null;
  } catch (error) {
    console.error(`[VOE] Error: ${error.message}`);
    return null;
  }
}

module.exports = { resolve };

module.exports = { resolve };
