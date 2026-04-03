import { extractStreams as extractPelisPlus } from './src/pelisplus/extractor.js';
import { extractStreams as extractPelisPanda } from './src/pelispanda/extractor.js';

async function testSeries() {
    console.log("=== Probando PelisPlus: The Boys S01E01 (TMDB 76479) ===");
    try {
        const resPP = await extractPelisPlus('76479', 'tv', 1, 1);
        console.log("PelisPlus Result:", JSON.stringify(resPP, null, 2));
    } catch (e) {
        console.error("PelisPlus ERROR:", e.message);
    }

    console.log("\n=== Probando PelisPanda: The Boys S01E01 (TMDB 76479) ===");
    try {
        const resPanda = await extractPelisPanda('76479', 'tv', 1, 1);
        console.log("PelisPanda Result:", JSON.stringify(resPanda, null, 2));
    } catch (e) {
        console.error("PelisPanda ERROR:", e.message);
    }
}

testSeries();
