/**
 * String Utilities for Nuvio Plugin
 */

// Palabras comunes que no aportan al nombre (ruido)
const NOISE_WORDS = [
    'latino', 'espanol', 'hispano', 'dual', 'subs', 'subtitulado', 
    'hd', '1080p', '720p', '4k', 'uhd', 'completa', 'pelicula', 'serie',
    'episodio', 'capitulo', 'temporada'
];

/**
 * Normaliza un título para comparaciones (quita acentos, caracteres especiales y filtros de ruido)
 */
/**
 * Normaliza un título para comparaciones (quita acentos, caracteres especiales y filtros de ruido)
 */
export function normalizeTitle(t) {
    if (!t) return '';
    var normalized = t.toLowerCase()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    var words = normalized.split(' ');
    var filtered = [];
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        var isNoise = false;
        for (var j = 0; j < NOISE_WORDS.length; j++) {
            if (NOISE_WORDS[j] === word) {
                isNoise = true;
                break;
            }
        }
        if (!isNoise) filtered.push(word);
    }
    
    return filtered.length > 0 ? filtered.join(' ') : normalized;
}

/**
 * Calcula la similitud entre dos títulos usando el índice de Jaccard
 */
export function calculateSimilarity(title1, title2) {
    var norm1 = normalizeTitle(title1);
    var norm2 = normalizeTitle(title2);

    if (norm1 === norm2) return 1.0;
    
    if (norm1.length > 6 && norm2.length > 6 && (norm2.indexOf(norm1) !== -1 || norm1.indexOf(norm2) !== -1)) {
        return 0.95;
    }

    var w1 = norm1.split(/\s+/);
    var w2 = norm2.split(/\s+/);
    
    var words1Map = {};
    var words2Map = {};
    var allUniqueWords = {};

    for (var i = 0; i < w1.length; i++) {
        if (w1[i].length > 1) {
            words1Map[w1[i]] = true;
            allUniqueWords[w1[i]] = true;
        }
    }
    for (var j = 0; j < w2.length; j++) {
        if (w2[j].length > 1) {
            words2Map[w2[j]] = true;
            allUniqueWords[w2[j]] = true;
        }
    }

    var intersection = 0;
    var union = 0;
    for (var word in allUniqueWords) {
        union++;
        if (words1Map[word] && words2Map[word]) {
            intersection++;
        }
    }

    if (union === 0) return 0;
    var score = intersection / union;
    
    var yearMatch1 = title1.match(/\b(19|20)\d{2}\b/);
    var yearMatch2 = title2.match(/\b(19|20)\d{2}\b/);
    if (yearMatch1 && yearMatch2 && yearMatch1[0] !== yearMatch2[0]) {
        return score * 0.5;
    }

    return score;
}

/**
 * Comprueba si un título es una coincidencia aceptable (score > 0.45)
 */
export function isGoodMatch(query, result, minScore) {
    var ms = minScore || 0.45;
    return calculateSimilarity(query, result) >= ms;
}

/**
 * Decodificador Base64 puro compatible con Hermes/Nuvio (sin atob ni Buffer)
 */
export function base64Decode(input) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var str = String(input).replace(/=+$/, '');
    var output = '';
    
    if (str.length % 4 === 1) throw new Error("Base64 invalido");
    
    var bc = 0, bs, buffer, idx = 0;
    while ((buffer = str.charAt(idx++))) {
        buffer = chars.indexOf(buffer);
        if (~buffer) {
            bs = bc % 4 ? bs * 64 + buffer : buffer;
            if (bc++ % 4) {
                output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
            }
        }
    }
    return output;
}

/**
 * Decodificador UTF-8 puro (reemplazo de TextDecoder)
 */
export function utf8Decode(bytes) {
    var out = "", i = 0;
    while (i < bytes.length) {
        var c = bytes[i++];
        if (c < 128) out += String.fromCharCode(c);
        else if (c > 191 && c < 224) out += String.fromCharCode((c & 31) << 6 | bytes[i++] & 63);
        else out += String.fromCharCode((c & 15) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63);
    }
    return out;
}

/**
 * Obtiene el origen de una URL sin usar el objeto global URL
 */
export function getOrigin(url) {
    if (!url) return '';
    var match = url.match(/^(https?:\/\/[^\/]+)/);
    return match ? match[1] : '';
}

/**
 * Obtiene el hostname de una URL sin usar el objeto global URL
 */
export function getHostname(url) {
    if (!url) return '';
    var match = url.match(/^https?:\/\/([^\/]+)/);
    return match ? match[1] : '';
}
