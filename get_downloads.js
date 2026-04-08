async function debug() {
    try {
        const res = await fetch('https://pelisgo.online/movies/pinocho-de-guillermo-del-toro');
        const html = await res.text();
        // Regex flexible para capturar el array downloadLinks
        const match = html.match(/downloadLinks[\\"' ]+:\[(.*?)\]/);
        if (match) {
            console.log('--- ESTRUCTURA ENCONTRADA (fragmento) ---');
            console.log(match[1].substring(0, 500));
            // Guardar el bloque completo para inspección
            require('fs').writeFileSync('downloads_raw.txt', match[1]);
        } else {
            console.log('No se encontro downloadLinks');
        }
    } catch (e) {
        console.log('Error: ' + e.message);
    }
}
debug();
