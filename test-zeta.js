const { getStreams } = require('./providers/pelisplus.js');

async function test() {
    console.log('--- Probando "Agente Zeta" (Zeta) ---');
    console.log('Buscando ID: 1314786 (Zeta 2026)');
    
    try {
        const streams = await getStreams('1314786', 'movie');
        console.log('\nResultados encontrados:', streams.length);
        
        streams.forEach((s, i) => {
            console.log(`\n[${i+1}] ${s.title}`);
            console.log(`    URL: ${s.url}`);
        });
    } catch (e) {
        console.error('Error en el test:', e);
    }
}

test();
