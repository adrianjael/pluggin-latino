const fs = require('fs');

const harPath = 'c:\\Users\\adria\\OneDrive - CHYJ\\WEB\\Nuvio Pluggin\\pelisgo.online.har';

function parseHar() {
    try {
        console.log('[HAR Parser] Leyendo archivo...');
        const data = fs.readFileSync(harPath, 'utf8');
        const har = JSON.parse(data);
        const entries = har.log.entries;

        const entry = entries[34];
        if (entry) {
            console.log(`\n--- PETICIÓN ATTEST ENTRADA (34) ---`);
            console.log(`URL: ${entry.request.url}`);
            console.log(`Método: ${entry.request.method}`);
            console.log('Headers:', JSON.stringify(entry.request.headers, null, 2));
            if (entry.request.postData) {
                console.log('PostData:', entry.request.postData.text);
            }
            console.log('Respuesta:', entry.response.content.text);
        }
    } catch (e) {
        console.error('[HAR Parser] Error:', e.message);
    }
}

parseHar();
