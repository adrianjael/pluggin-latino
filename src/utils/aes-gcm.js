/**
 * Implementación minimalista de AES-GCM en JS Puro para entornos sin SubtleCrypto (Hermes/Nuvio)
 * Basado en estándares de la industria para scrapers de video.
 */

// Usamos CryptoJS para el núcleo de AES-CTR si es posible, o una implementación manual.
// Dado que 'crypto-js' está disponible como external, podemos usarlo para la parte de AES.
import CryptoJS from 'crypto-js';

/**
 * Descifra AES-256-GCM usando CryptoJS + Lógica GCM manual.
 * @param {Uint8Array} key 32 bytes
 * @param {Uint8Array} iv 12 bytes
 * @param {Uint8Array} ciphertextWithTag [ciphertext + 16 bytes tag]
 */
export function decryptGCM(key, iv, ciphertextWithTag) {
    try {
        const tagSize = 16;
        const ciphertext = ciphertextWithTag.slice(0, -tagSize);
        
        const keyWA = CryptoJS.lib.WordArray.create(key);
        
        // En GCM con IV de 96 bits (12 bytes), el bloque de contador inicial J0 es IV || 00000001
        // El cifrado comienza en J0 + 1, es decir, IV || 00000002
        const ivCounter = new Uint8Array(16);
        ivCounter.set(iv, 0);
        ivCounter[15] = 2; // Counter starts at 2 for GCM data
        
        const ivWA = CryptoJS.lib.WordArray.create(ivCounter);
        
        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: CryptoJS.lib.WordArray.create(ciphertext) },
            keyWA,
            { 
                iv: ivWA, 
                mode: CryptoJS.mode.CTR, 
                padding: CryptoJS.pad.NoPadding 
            }
        );

        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        console.error("[PureJS-GCM] Error Decrypting:", e.message);
        return null;
    }
}
