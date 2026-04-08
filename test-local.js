import { extractStreams } from './src/pelispanda/extractor.js';

async function test() {
    console.log("Probando PelisPanda: Oppenheimer (TMDB 872585)");
    const streams = await extractStreams('872585', 'movie', null, null);
    console.log("Streams:", streams);

    console.log("\nProbando PelisPanda: Zeta (TMDB 1314786)");
    const streams2 = await extractStreams('1314786', 'movie', null, null);
    console.log("Streams 2:", streams2);
}
test();
