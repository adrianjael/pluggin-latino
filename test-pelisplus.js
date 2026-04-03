/**
 * Script de prueba local para PelisPlusHD
 * Ejecuta: node test-pelisplus.js
 */

const { getStreams } = require('./providers/pelisplus.js');

async function test() {
    console.log('--- Probando Proveedor PelisPlusHD ---');
    console.log('Buscando: Oppenheimer (ID: 872585)');
    
    try {
        const streams = await getStreams('872585', 'movie');
        
        console.log(`\nResultados encontrados: ${streams.length}`);
        
        streams.forEach((s, i) => {
            console.log(`\n[${i + 1}] ${s.title}`);
            console.log(`    URL: ${s.url}`);
        });

        if (streams.length === 0) {
            console.log('\nNo se encontraron streams. Revisa los logs de extractor.js');
        }
    } catch (err) {
        console.error('\nError durante la prueba:', err.message);
    }
}

test();
