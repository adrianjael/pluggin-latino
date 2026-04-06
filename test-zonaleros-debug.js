const zonaleros = require('./providers/zonaleros.js');

// Mock de fetch para Node.js si no existe (Node 18+ ya tiene fetch nativo)
if (typeof fetch === 'undefined') {
    global.fetch = require('node-fetch');
}

async function test() {
    console.log("--- TEST ZONALEROS: BUSQUEDA ---");
    const results = await zonaleros.search("Avatar");
    console.log("Resultados:", JSON.stringify(results, null, 2));
    
    if (results.length > 0) {
        console.log("\n--- TEST ZONALEROS: STREAMS ---");
        const url = results.find(r => r.title.includes("Fuego y cenizas"))?.url || results[0].url;
        console.log("Probando URL:", url);
        const streams = await zonaleros.getStreams(url);
        console.log("Streams encontrados:", JSON.stringify(streams, null, 2));
    }
}

test();
