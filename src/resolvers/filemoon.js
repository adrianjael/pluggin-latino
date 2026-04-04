import axios from 'axios';
import CryptoJS from 'crypto-js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

function base64ToWordArray(e) {
    e = e.replace(/-/g, "+").replace(/_/g, "/");
    let t = (4 - e.length % 4) % 4;
    return CryptoJS.enc.Base64.parse(e + "=".repeat(t));
}

function wordArrayToUint8Array(e) {
    let t = e.words, n = e.sigBytes, i = new Uint8Array(n);
    for (let o = 0; o < n; o++) i[o] = t[o >>> 2] >>> 24 - o % 4 * 8 & 255;
    return i;
}

function uint8ArrayToWordArray(e) {
    let t = [];
    for (let n = 0; n < e.length; n += 4)
        t.push((e[n] || 0) << 24 | (e[n + 1] || 0) << 16 | (e[n + 2] || 0) << 8 | (e[n + 3] || 0));
    return CryptoJS.lib.WordArray.create(t, e.length);
}

function incrementIv(e) {
    let t = new Uint8Array(e);
    for (let n = 15; n >= 12 && (t[n]++, t[n] === 0); n--);
    return t;
}

function decryptPayload(key, iv, payload) {
    try {
        let counterIv = new Uint8Array(16);
        counterIv.set(iv, 0); counterIv[15] = 1;
        let ivCopy = incrementIv(counterIv), keyWords = uint8ArrayToWordArray(key), decrypted = new Uint8Array(payload.length);
        for (let l = 0; l < payload.length; l += 16) {
            let chunkLen = Math.min(16, payload.length - l), currentIvWords = uint8ArrayToWordArray(ivCopy);
            let encryptedIv = CryptoJS.AES.encrypt(currentIvWords, keyWords, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
            let ivBytes = wordArrayToUint8Array(encryptedIv.ciphertext);
            for (let d = 0; d < chunkLen; d++) decrypted[l + d] = payload[l + d] ^ ivBytes[d];
            ivCopy = incrementIv(ivCopy);
        }
        return decrypted;
    } catch (e) { console.log("[Filemoon] Decrypt error:", e.message); return null; }
}

export async function resolve(url) {
    try {
        console.log(`[Filemoon] Resolviendo: ${url}`);
        const idMatch = url.match(/\/(?:e|d)\/([a-z0-9]{12})/i);
        if (!idMatch) return null;
        const id = idMatch[1];
        const playbackUrl = `https://filemooon.link/api/videos/${id}/embed/playback`;
        const { data } = await axios.get(playbackUrl, { timeout: 7000, headers: { "User-Agent": UA, Referer: url } });
        if (data.error) return console.log(`[Filemoon] API error: ${data.error}`), null;
        
        const info = data.playback;
        if (!info || info.algorithm !== "AES-256-GCM") return console.log("[Filemoon] Unsupported algorithm"), null;
        
        const part1 = wordArrayToUint8Array(base64ToWordArray(info.key_parts[0]));
        const part2 = wordArrayToUint8Array(base64ToWordArray(info.key_parts[1]));
        const combined = new Uint8Array(part1.length + part2.length);
        combined.set(part1, 0); combined.set(part2, part1.length);
        
        const key = wordArrayToUint8Array(CryptoJS.SHA256(uint8ArrayToWordArray(combined)));
        const iv = wordArrayToUint8Array(base64ToWordArray(info.iv));
        const payload = wordArrayToUint8Array(base64ToWordArray(info.payload));
        
        const decrypted = decryptPayload(key, iv, payload.slice(0, -16)); // Omitting tag
        if (!decrypted) return null;
        
        let jsonStr = "";
        for (let i = 0; i < decrypted.length; i++) jsonStr += String.fromCharCode(decrypted[i]);
        const sources = JSON.parse(jsonStr).sources;
        if (!sources || !sources[0]?.url) return null;
        
        const streamUrl = sources[0].url;
        console.log(`[Filemoon] URL encontrada: ${streamUrl.substring(0, 80)}...`);
        return { url: streamUrl, quality: "1080p", headers: { "User-Agent": UA, Referer: url, Origin: "https://filemoon.sx" } };
    } catch (e) { console.log(`[Filemoon] Error: ${e.message}`); return null; }
}
