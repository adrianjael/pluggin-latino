const { getStreams } = require('./providers/pelisplus.js');

async function test() {
    console.log('--- Probando "Agente Zeta" (Confirmando .m3u8) ---');
    console.log('Buscando ID: 1314786');
    
    try {
        const streams = await getStreams('1314786', 'movie');
        console.log('\nResultados encontrados:', streams.length);
        
        streams.forEach((s, i) => {
            console.log(`\n[${i+1}] ${s.title}`);
            console.log(`    URL: ${s.url}`);
            if (s.url.includes('.m3u8')) {
                console.log('    ✅ VIDEO DIRECTO DETECTADO');
            } else {
                console.log('    ❌ SIGUE SIENDO EMBED (Error probable en Nuvio)');
            }
        });
    } catch (e) {
        console.error('Error en el test:', e);
    }
}

test();
