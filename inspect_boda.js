async function debug() {
    try {
        const res = await fetch('https://pelisgo.online/movies/boda-sangrienta-2');
        const html = await res.text();
        
        console.log('--- BUSCANDO BUZZHEAVIER ---');
        const buzzIdx = html.indexOf('Buzzheavier');
        if (buzzIdx !== -1) {
            console.log('✅ Buzzheavier encontrado!');
            console.log('DOM Contexto: ' + html.substring(buzzIdx - 200, buzzIdx + 500));
            
            // Buscar bloques JSON inyectados (Next.js)
            const jsonBlocks = html.match(/\{[^{}]*?Buzzheavier[^{}]*?\}/gi);
            if (jsonBlocks) {
                console.log('\n--- JSON DETECTADO ---');
                console.log(jsonBlocks[0]);
                require('fs').writeFileSync('boda_buzz.json', jsonBlocks[0]);
            }
        } else {
            console.log('❌ Buzzheavier no encontrado en el HTML.');
        }
    } catch (e) {
        console.log('Error: ' + e.message);
    }
}
debug();
