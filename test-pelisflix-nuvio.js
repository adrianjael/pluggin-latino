import { getStreams } from './src/pelisflix/index.js';

async function run() {
    console.log("--- Probando PelisFlix: John Wick 4 ---\n");
    
    // John Wick 4 (Movie)
    const title = "John Wick 4";
    const tmdbId = "603692";
    
    console.log(`Buscando: ${title} (tmdbId: ${tmdbId})`);
    
    try {
        const streams = await getStreams(tmdbId, 'movie', null, null, title);
        
        if (streams.length === 0) {
            console.log("\nNo se encontraron streams válidos o todos descartados por filtro.");
            return;
        }

        console.log(`\nResultados encontrados: ${streams.length}\n`);
        streams.forEach((s, i) => {
            console.log(`[${i + 1}] ${s.title}`);
            console.log(`    URL: ${s.url}`);
        });
    } catch (e) {
        console.error("Error en la ejecución:", e.message);
    }
}

run();
