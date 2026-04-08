const { getStreams } = require('./providers/pelisplus.js');

async function test() {
    console.log('--- Probando Sin Piedad (1236153) y VoeSX ---');
    try {
        const streams = await getStreams('1236153', 'movie');
        console.log('\nResultados filtrados:', streams.length);
        
        streams.forEach((s, i) => {
            console.log(`\n[${i+1}] ${s.title}`);
            console.log(`    URL: ${s.url}`);
            console.log(`    Calidad Detectada: ${s.quality}`);
        });
        
        if (streams.length === 0) {
            console.log('\n⚠️ No se encontraron servidores funcionales (Filtro aplicado correctamente)');
        }
    } catch (e) {
        console.error('Error en el test:', e);
    }
}

test();
