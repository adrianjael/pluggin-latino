const zonaleros = require('./providers/zonaleros.js');

async function debugFullProcess() {
    const title = "Avatar";
    console.log(`[DEBUG] Iniciando proceso completo para: "${title}"`);

    try {
        // Paso 1: Intentar getStreams (Búsqueda + Extracción)
        console.log("\n--- PASO 1: BÚSQUEDA Y EXTRACCIÓN ---");
        const streams = await zonaleros.getStreams("dummy", "movie", 0, 0, title);
        
        console.log(`\n[RESULTADO] Servidores encontrados: ${streams.length}`);
        
        if (streams.length > 0) {
            streams.forEach((s, i) => {
                console.log(`[${i+1}] ${s.title}`);
                console.log(`    Link Final: ${s.url}`);
            });
        } else {
            console.log("❌ No se encontraron servidores. Esto suele indicar bloqueo de Cloudflare en la búsqueda o en el anomizador.");
            console.log("💡 Nota: En Nuvio, asegúrate de haber resuelto el captcha de 'Un momento...' antes de abrir la película.");
        }

    } catch (e) {
        console.error("❌ ERROR CRÍTICO EN EL TEST:", e.message);
    }
}

debugFullProcess();
