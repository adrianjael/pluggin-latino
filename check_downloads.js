const axios = require('axios');

const url = 'https://pelisgo.online/movies/proyecto-fin-del-mundo';
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
};

async function checkDownloadButtons() {
    try {
        const { data: html } = await axios.get(url, { headers });
        console.log('--- BUSCANDO PIXELDRAIN ---');
        const pixeldrain = html.match(/https?:\/\/(?:pixeldrain\.com|buzzheavier\.com)\/[a-zA-Z0-9\/_-]+/g);
        console.log('Encontrados:', pixeldrain || 'Nada');
        
        console.log('\n--- BUSCANDO BOTONES DE DESCARGA ---');
        const buttons = html.match(/<a[^>]+href="([^"]+)"[^>]*>.*?Descargar.*?<\/a>/gs);
        console.log('Botones encontrados:', buttons ? buttons.length : 0);
        if (buttons) console.log('Primero:', buttons[0]);
    } catch (e) {
        console.error('Error:', e.message);
    }
}

checkDownloadButtons();
