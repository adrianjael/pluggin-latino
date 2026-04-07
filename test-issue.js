import { getStreams as getPelisgoStreams } from './src/pelisgo/index.js';
import { getStreams as getCuevanaStreams } from './src/cuevana_gs/index.js';
import { getStreams as getPelispediaStreams } from './src/pelispedia/index.js';

async function testIssues() {
    const title = "Mi\xE9nteme";
    console.log(`--- TEST DE REPRODUCCI\xD3N: ${title} ---`);

    console.log("\n[PELISGO] Buscando...");
    const pelisgoRes = await getPelisgoStreams("dummy", "tv", 1, 8, title);
    console.log("Resultados PelisGo:", JSON.stringify(pelisgoRes, null, 2));

    console.log("\n[CUEVANA.GS] Buscando...");
    const cuevanaRes = await getCuevanaStreams("dummy", "tv", 1, 8, title);
    console.log("Resultados Cuevana:", JSON.stringify(cuevanaRes, null, 2));

    console.log("\n--- TEST PELISPEDIA (PELÍCULA): Deadpool y Lobezno ---");
    const pMovie = await getPelispediaStreams("dummy", "movie", null, null, "Deadpool y Lobezno");
    console.log("Resultados Pelispedia (Película):", JSON.stringify(pMovie, null, 2));

    console.log("\n--- TEST PELISPEDIA (SERIE): Avatar: La leyenda de Aang ---");
    const pSerie = await getPelispediaStreams("dummy", "tv", 1, 1, "Avatar: La leyenda de Aang");
    console.log("Resultados Pelispedia (Serie):", JSON.stringify(pSerie, null, 2));
}

testIssues();
