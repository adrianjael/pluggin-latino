const zonaleros = require('./providers/zonaleros.js');

async function debug() {
    const title = "Avatar";
    console.log(`[TEST] Buscando streams para: ${title}`);
    try {
        // Simulamos la llamada de Nuvio
        const streams = await zonaleros.getStreams("dummyId", "movie", 0, 0, title);
        console.log(`[TEST] Resultados encontrados: ${streams.length}`);
        streams.forEach(s => console.log(` - ${s.title}: ${s.url}`));
    } catch (e) {
        console.error("[TEST] Error fatal:", e);
    }
}

debug();
