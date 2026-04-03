import { getStreams } from './src/hackstore2/index.js';

async function run() {
    console.log("--- Probando HackStore2: Zeta (87128 en TMDB es 1314786) ---\n");
    // TMDB ID of Zeta is 1314786 according to previous logs
    const streams = await getStreams('1314786', 'movie', null, null);
    
    if (streams.length === 0) {
        console.log("No se encontraron streams válidos o todos descartados por filtro.");
        return;
    }

    console.log(`\nResultados filtrados: ${streams.length}\n`);
    streams.forEach((s, i) => {
        console.log(`[${i + 1}] ${s.title}`);
        console.log(`    URL: ${s.url}`);
    });
}

run();
