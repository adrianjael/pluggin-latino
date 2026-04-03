/**
 * String Utilities for Nuvio Plugin
 */

/**
 * Normaliza un título para comparaciones (quita acentos, caracteres especiales y espacios extra)
 */
export function normalizeTitle(t) {
    if (!t) return '';
    return t.toLowerCase()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Calcula la similitud entre dos títulos usando el índice de Jaccard
 * Retorna un valor entre 0 y 1.
 */
export function calculateSimilarity(title1, title2) {
    const norm1 = normalizeTitle(title1);
    const norm2 = normalizeTitle(title2);

    if (norm1 === norm2) return 1.0;
    if (norm1.length > 5 && norm2.length > 5 && (norm2.includes(norm1) || norm1.includes(norm2))) return 0.9;

    const words1 = new Set(norm1.split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(norm2.split(/\s+/).filter(w => w.length > 2));

    if (words1.size === 0 || words2.size === 0) {
        // Fallback simple si no hay palabras largas
        return norm1 === norm2 ? 1.0 : (norm1.includes(norm2) || norm2.includes(norm1) ? 0.5 : 0);
    }

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
}

/**
 * Comprueba si un título es una coincidencia aceptable (score > 0.4)
 */
export function isGoodMatch(query, result, minScore = 0.4) {
    return calculateSimilarity(query, result) >= minScore;
}
