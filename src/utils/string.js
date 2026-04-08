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
export function normalizeTitle(t) {
    if (!t) return '';
    let normalized = t.toLowerCase()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Opcional: Filtrar palabras de ruido
    const parts = normalized.split(' ').filter(word => !NOISE_WORDS.includes(word));
    return parts.length > 0 ? parts.join(' ') : normalized;
}

/**
 * Calcula la similitud entre dos títulos usando el índice de Jaccard
 * Retorna un valor entre 0 y 1.
 */
export function calculateSimilarity(title1, title2) {
    const norm1 = normalizeTitle(title1);
    const norm2 = normalizeTitle(title2);

    if (norm1 === norm2) return 1.0;
    
    // Si uno contiene al otro y son largos, es una coincidencia muy probable
    if (norm1.length > 6 && norm2.length > 6 && (norm2.includes(norm1) || norm1.includes(norm2))) {
        return 0.95;
    }

    const words1 = new Set(norm1.split(/\s+/).filter(w => w.length > 1));
    const words2 = new Set(norm2.split(/\s+/).filter(w => w.length > 1));

    if (words1.size === 0 || words2.size === 0) {
        return norm1 === norm2 ? 1.0 : (norm1.includes(norm2) || norm2.includes(norm1) ? 0.5 : 0);
    }

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    const score = intersection.size / union.size;
    
    // Penalización por diferencia de años (si existen en el título)
    const yearMatch1 = title1.match(/\b(19|20)\d{2}\b/);
    const yearMatch2 = title2.match(/\b(19|20)\d{2}\b/);
    if (yearMatch1 && yearMatch2 && yearMatch1[0] !== yearMatch2[0]) {
        return score * 0.5; // Reducir a la mitad si el año no coincide
    }

    return score;
}

/**
 * Comprueba si un título es una coincidencia aceptable (score > 0.45)
 */
export function isGoodMatch(query, result, minScore = 0.45) {
    return calculateSimilarity(query, result) >= minScore;
}
