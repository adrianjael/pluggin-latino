/**
 * AES-GCM Decryptor - TV Optimized v7.6.2
 * Usa el CryptoJS INYECTADO globalmente por la aplicación para evitar peso en el bundle.
 */

// v7.6.2: Prioridad absoluta al CryptoJS global (inyectado por Nuvio TV)
const _CryptoJS = (typeof CryptoJS !== 'undefined') ? CryptoJS : null;

function parseB64(b64) {
    if (!b64 || !_CryptoJS) return null;
    try {
        const normalized = b64.replace(/-/g, '+').replace(/_/g, '/');
        return _CryptoJS.enc.Base64.parse(normalized);
    } catch { return null; }
}

function decryptGCM(keyWA, ivWA, ciphertextWithTagWA) {
    try {
        if (!keyWA || !ivWA || !ciphertextWithTagWA || !_CryptoJS) return null;

        const tagSizeWords = 4;
        const ciphertextWords = ciphertextWithTagWA.words.slice(0, ciphertextWithTagWA.words.length - tagSizeWords);
        const ciphertextWA = _CryptoJS.lib.WordArray.create(
            ciphertextWords,
            ciphertextWithTagWA.sigBytes - 16
        );

        let counterWA = ivWA.clone();
        counterWA.concat(_CryptoJS.lib.WordArray.create([0x00000002], 4));

        const decrypted = _CryptoJS.AES.decrypt(
            { ciphertext: ciphertextWA },
            keyWA,
            {
                iv: counterWA,
                mode: _CryptoJS.mode.CTR,
                padding: _CryptoJS.pad.NoPadding
            }
        );

        return decrypted.toString(_CryptoJS.enc.Utf8);
    } catch (e) {
        console.error("[AES-GCM] Error:", e.message);
        return null;
    }
}

function decryptByse(playback) {
    try {
        if (!playback || !playback.key_parts || !playback.payload || !playback.iv || !_CryptoJS) return null;

        let keyWA = parseB64(playback.key_parts[0]);
        for (let i = 1; i < playback.key_parts.length; i++) {
            const part = parseB64(playback.key_parts[i]);
            if (part) keyWA.concat(part);
        }

        const ivWA = parseB64(playback.iv);
        const ciphertextWithTagWA = parseB64(playback.payload);

        return decryptGCM(keyWA, ivWA, ciphertextWithTagWA);
    } catch (e) {
        console.error("[Byse] Failed:", e.message);
        return null;
    }
}

module.exports = { decryptByse };
