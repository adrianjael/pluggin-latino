/**
 * User-Agent Generator for Nuvio Latino
 * Pool de navegadores modernos para bypass de bloqueos.
 */

const UA_POOL = [
    // Windows - Chrome 146 (Custom modern fingerprint)
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"
];

/**
 * Retorna un User-Agent aleatorio del pool.
 */
function getRandomUA() {
    const index = Math.floor(Math.random() * UA_POOL.length);
    return UA_POOL[index];
}

module.exports = { getRandomUA, UA_POOL };
