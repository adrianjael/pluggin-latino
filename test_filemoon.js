const https = require('https');

const videoId = 'nxn6lfmuu128';
const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function get(url, headers) {
    return new Promise((resolve) => {
        const opts = { headers: { 'User-Agent': ua, ...headers } };
        https.get(url, opts, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve({ status: res.statusCode, body: d }));
        }).on('error', e => resolve({ status: 0, body: e.message }));
    });
}

async function run() {
    console.log('=== Analizando bundle JS de Filemoon ===');
    const bundle = await get('https://filemoon.sx/assets/index-53Q2MK5R.js', { 'Referer': 'https://filemoon.sx/' });
    
    console.log('Bundle length:', bundle.body.length);
    
    // Buscar patterns relevantes
    const searchTerms = ['fetch(', 'axios', 'XMLHttpRequest', 'source', 'stream', 'hls', 'token', 'encrypted', 'decrypt', 'atob', 'btoa'];
    for (const term of searchTerms) {
        const idx = bundle.body.indexOf(term);
        if (idx !== -1) {
            console.log(`\n--- "${term}" encontrado en posición ${idx} ---`);
            console.log(bundle.body.slice(Math.max(0, idx-100), idx+300));
        }
    }
}

run();
