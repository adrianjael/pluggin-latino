import { getStreams as getPelisgoStreams } from './src/pelisgo/index.js';
import { getStreams as getCuevanaStreams } from './src/cuevana_gs/index.js';

async function testIssues() {
    const title = "Mi\xE9nteme"; // Mi\xE9nteme
    console.log(`--- TEST DE REPRODUCCI\xD3N: ${title} ---`);

    console.log("\n[PELISGO] Buscando...");
    const pelisgoRes = await getPelisgoStreams("dummy", "tv", 1, 8, title);
    console.log("Resultados PelisGo:", JSON.stringify(pelisgoRes, null, 2));

    console.log("\n[CUEVANA.GS] Buscando...");
    const cuevanaRes = await getCuevanaStreams("dummy", "tv", 1, 8, title);
    console.log("Resultados Cuevana:", JSON.stringify(cuevanaRes, null, 2));
}

testIssues();
