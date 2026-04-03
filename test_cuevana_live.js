const { getStreams } = require('./providers/cuevana_gs.js');

async function testCuevana() {
    console.log("🎬 Testeando proveedor: Cuevana.gs");
    console.log("---------------------------------------");

    try {
        // Oppenheimer ID: 872585
        const streams = await getStreams('872585', 'movie', null, null, 'Oppenheimer');
        
        console.log(`\n🔎 Se encontraron ${streams.length} enlaces.`);

        for (let i = 0; i < streams.length; i++) {
            const stream = streams[i];
            console.log(`\n▶ [${i+1}] ${stream.title} | ${stream.quality}`);
            console.log(`  URL: ${stream.url.substring(0, 100)}...`);

            try {
                const res = await fetch(stream.url, {
                    headers: stream.headers || {},
                    method: 'GET'
                });

                if (res.status === 200) {
                    const text = await res.text();
                    
                    if (text.includes('#EXTM3U') || stream.url.includes('.mp4')) {
                        console.log(`  ✅ Enlace Válido (m3u8 / mp4) - Size/Length: ${text.length}`);
                    } else {
                        console.log(`  ⚠️ Enlace dudoso: No parece ser un m3u8 válido. Inicia con: ${text.substring(0, 50).replace(/[\\r\\n]/g,' ')}`);
                    }
                } else if (res.status === 403) {
                    console.log(`  ❌ Error 403: Forbidden. Requiere cabeceras o token fresco.`);
                } else {
                    console.log(`  ❌ Response status HTTP ${res.status}`);
                }
            } catch(e) {
                console.log(`  ❌ Error de fetch: ${e.message}`);
            }
        }
    } catch(err) {
        console.error("❌ Error ejecutando getStreams:", err);
    }
}

testCuevana();
