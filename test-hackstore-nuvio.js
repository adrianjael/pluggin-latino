import { getStreams } from './src/hackstore2/index.js';

async function run() {
    console.log("--- Probando HackStore2: Oppenheimer (TMDB 872585) ---\n");
    const streams = await getStreams('872585', 'movie', null, null);
    
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
