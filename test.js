const zonaleros = require('./providers/zonaleros.js');

async function debugDirect() {
    // Usamos una URL directa que el usuario nos dio como ejemplo
    const directUrl = "https://www.zona-leros.com/peliculas/avatar-fuego-y-cenizas-hd";
    console.log(`[TEST] Forzando extracción directa de: ${directUrl}`);
    
    try {
        // Obtenemos los streams directamente de la URL
        const res = await fetch(directUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Referer": "https://www.zona-leros.com"
            }
        });
        const html = await res.text();
        
        if (html.includes('cf-browser-verification')) {
            console.error("❌ Bloqueado por Cloudflare en consola.");
            console.log("💡 El código está diseñado para Nuvio (donde el usuario resuelve el reto).");
            return;
        }

        // Si no está bloqueado, probamos el extractor
        const streams = await zonaleros.getStreams("dummy", "movie", 0, 0, "Avatar: Fuego y cenizas");
        console.log(`✅ Resultados Finales: ${streams.length} servidores.`);
        streams.forEach(s => console.log(`   - ${s.title}: ${s.url}`));

    } catch (e) {
        console.error("❌ Error en el test:", e.message);
    }
}

debugDirect();
