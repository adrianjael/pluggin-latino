const CryptoJS = require('crypto-js');
const { getSessionUA } = require('../utils/http.js');

/**
 * Resolutor para EmbedSeek (SeekStreaming)
 * Basado en ingeniería inversa del player original.
 * Actualizado v8.0.0 a CommonJS/Fetch para Hermes.
 */
async function resolve(url) {
    try {
        const UA = getSessionUA();
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;
        const hash = parsedUrl.hash;
        const id = hash.replace('#', '').split('&')[0];

        if (!id) return null;

        const apiUrl = `${parsedUrl.origin}/api/v1/info?id=${id}`;
        const headers = {
            'User-Agent': UA,
            'Referer': url,
            'Origin': parsedUrl.origin
        };

        const response = await fetch(apiUrl, { headers });
        if (!response.ok) return null;
        
        const encryptedData = await response.text();
        
        if (typeof encryptedData !== 'string' || encryptedData.length < 10) {
            return null;
        }

        // Generar Clave e IV dinámicos usando la lógica EXACTA
        const key = generateKey(hostname);
        const iv = generateIV(hostname, hash);

        // Descifrar AES-128-CBC
        const decrypted = decrypt(encryptedData, key, iv);
        
        const data = JSON.parse(decrypted);
        if (data && data.url) {
            let videoUrl = data.url;
            if (videoUrl.startsWith('/')) {
                videoUrl = `${parsedUrl.origin}${videoUrl}`;
            }
            
            return {
                url: videoUrl,
                quality: '1080p',
                serverName: 'SeekStreaming',
                headers: {
                    'User-Agent': UA,
                    'Referer': url,
                    'Origin': parsedUrl.origin
                }
            };
        }
        return null;
    } catch (e) {
        console.error('EmbedSeek Resolve Error:', e.message);
        return null;
    }
}

function generateKey(hostname) {
    let n = "";
    const b = "7519".split(""); 
    for (let i = 0; i < b.length; i++) n += String.fromCharCode(parseInt("10" + b[i]));
    
    n += String.fromCharCode(hostname.charCodeAt(1));
    n += n.substring(1, 3);
    n += String.fromCharCode(110, 109, 117);
    
    const re = "3579".split("");
    n += String.fromCharCode(parseInt(re[3] + re[2]), parseInt(re[1] + re[2]));
    const s1 = (parseInt(re[0]) + 1).toString() + re[3];
    n += String.fromCharCode(parseInt(s1), parseInt(s1));
    
    const s2 = (parseInt(re[3]) * 10 + parseInt(re[3])).toString();
    const s3 = re.reverse().join("").substring(0, 2);
    n += String.fromCharCode(parseInt(s2), parseInt(s3));
    
    return CryptoJS.enc.Utf8.parse(n.substring(0, 16));
}

function generateIV(hostname, hash) {
    const s = hostname;
    const p = s + "//";
    const o = hash; 
    const g = s.length * p.length;
    let b = "";
    for (let i = 1; i < 10; i++) b += String.fromCharCode(i + g);
    
    const re = "111";
    const pe = 3 * o.charCodeAt(0); 
    const tt = 111 + s.length;
    const k = tt + 4;
    const ie = s.charCodeAt(1);
    const me = ie - 2;
    
    b += String.fromCharCode(g, 111, pe, tt, k, ie, me);
    
    return CryptoJS.enc.Utf8.parse(b.substring(0, 16));
}

function decrypt(hex, keyWA, ivWA) {
    const ciphertextWA = CryptoJS.enc.Hex.parse(hex);
    const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ciphertextWA },
        keyWA,
        { 
            iv: ivWA, 
            mode: CryptoJS.mode.CBC, 
            padding: CryptoJS.pad.Pkcs7 
        }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
}

module.exports = { resolve };
