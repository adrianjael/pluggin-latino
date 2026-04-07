const fs = require('fs');
const path = require('path');

// 1. Refactorizar http.js en todos los proveedores
const src = './src';
const dirs = fs.readdirSync(src).filter(d => fs.statSync(path.join(src, d)).isDirectory());

dirs.forEach(d => {
    const httpPath = path.join(src, d, 'http.js');
    if (fs.existsSync(httpPath)) {
        let baseUrl = '';
        if (d === 'pelisplus') baseUrl = 'https://www.pelisplushd.la';
        if (d === 'cuevana_gs') baseUrl = 'https://cuevana.gs';
        if (d === 'cinecalidad') baseUrl = 'https://cinecalidad.li';
        
        const content = `import axios from 'axios';

export const BASE_URL = "${baseUrl}";

export async function fetchText(url, options = {}) {
    try {
        const res = await axios.get(url, { 
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                ...options.headers
            },
            timeout: 10000,
            responseType: 'text'
        });
        return res.data;
    } catch (e) {
        console.error("[HTTP] Error fetching " + url + ": " + e.message);
        return "";
    }
}

export async function fetchHtml(url, options = {}) {
    return fetchText(url, options);
}
`;
        fs.writeFileSync(httpPath, content, 'utf8');
    }
});

// 2. Corregir extractores que usaban fetch directo
function fixFiles(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixFiles(fullPath);
        } else if (file.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('fetch(') && !content.includes("from './http.js'")) {
                content = "import axios from 'axios';\n" + content;
                content = content.replace(/await\s+fetch\(([^)]+)\)/g, 'await axios.get($1)');
                content = content.replace(/\.json\(\)/g, '.data');
            }
            // Asegurar exportación CommonJS al final
            if (file === 'index.js' && content.includes('getStreams') && !content.includes('module.exports')) {
                content += "\n\nmodule.exports = { getStreams };\n";
            }
            fs.writeFileSync(fullPath, content, 'utf8');
        }
    });
}
fixFiles(src);

// 3. Restaurar manifest.json al formato de objeto funcional
const scrapers = [
  {
    "id": "pelisplus",
    "name": "PelisPlusHD",
    "description": "Películas y series en español latino desde PelisPlusHD.la",
    "version": "1.2.0",
    "author": "AdrianJael",
    "supportedTypes": ["movie", "tv"],
    "filename": "providers/pelisplus.js",
    "enabled": true,
    "logo": "https://www.pelisplushd.la/images/logo/logo5.png",
    "contentLanguage": ["es"],
    "formats": ["m3u8", "mp4"],
    "limited": false,
    "supportsExternalPlayer": true
  },
  {
    "id": "pelisgo",
    "name": "PelisGo",
    "description": "Descargas directas y streaming de alta fidelidad.",
    "version": "1.2.0",
    "author": "AdrianJael",
    "supportedTypes": ["movie", "tv"],
    "filename": "providers/pelisgo.js",
    "enabled": true,
    "logo": "https://pelisgo.online/icon.webp",
    "contentLanguage": ["es"],
    "formats": ["m3u8", "mp4"],
    "limited": false,
    "supportsExternalPlayer": true
  },
  {
    "id": "hackstore2",
    "name": "HackStore2",
    "description": "API Nativa de Películas en HD",
    "version": "1.2.0",
    "author": "AdrianJael",
    "supportedTypes": ["movie", "tv"],
    "filename": "providers/hackstore2.js",
    "enabled": true,
    "logo": "https://www.appcreator24.com/srv/imgs/gen/972192_ico.png?v=5",
    "contentLanguage": ["es"],
    "formats": ["m3u8", "mp4"],
    "limited": false,
    "supportsExternalPlayer": true
  },
  {
    "id": "cuevana_gs",
    "name": "Cuevana.gs",
    "description": "Películas y series en alta definición (Latino) con servidores estables",
    "version": "1.2.0",
    "author": "AdrianJael",
    "supportedTypes": ["movie", "tv"],
    "filename": "providers/cuevana_gs.js",
    "enabled": true,
    "logo": "https://s3-eu-west-1.amazonaws.com/tpd/logos/66c3f232d88824e9254695de/0x0.png",
    "contentLanguage": ["es"],
    "formats": ["m3u8", "mp4"],
    "limited": false,
    "supportsExternalPlayer": true
  },
  {
    "id": "embed69",
    "name": "Embed69",
    "description": "Películas y series (Latino) via embed69.org usando IMDB IDs directos",
    "version": "1.2.0",
    "author": "AdrianJael",
    "supportedTypes": ["movie", "tv"],
    "filename": "providers/embed69.js",
    "enabled": true,
    "logo": "https://play-lh.googleusercontent.com/5oy8Mdjfj1sEzBWe5WxuQ_8MqFRC6Yu-PM2c4QkXEN_isAQvqrWeMwZV7z3__lDm8Q",
    "contentLanguage": ["es"],
    "formats": ["m3u8", "mp4"],
    "limited": false,
    "supportsExternalPlayer": true
  },
  {
    "id": "cinecalidad",
    "name": "CineCalidad",
    "description": "Películas en HD (Latino) con servidores rápidos como Voe y Filemoon",
    "version": "1.2.0",
    "author": "AdrianJael",
    "supportedTypes": ["movie"],
    "filename": "providers/cinecalidad.js",
    "enabled": true,
    "logo": "https://image.firstory-cdn.me/Avatar/cm0dkng7s07o601qjdh958yiy/1724832356858.jpg",
    "contentLanguage": ["es"],
    "formats": ["m3u8", "mp4"],
    "limited": false,
    "supportsExternalPlayer": true
  },
  {
    "id": "pelispedia",
    "name": "Pelispedia",
    "description": "Catálogo masivo con servidores Voe, Uqload y Streamgrade.",
    "version": "1.2.0",
    "author": "AdrianJael",
    "supportedTypes": ["movie", "tv"],
    "filename": "providers/pelispedia.js",
    "enabled": true,
    "logo": "https://www.pelispedia.li/favicon.ico",
    "contentLanguage": ["es"],
    "formats": ["m3u8", "mp4"],
    "limited": false,
    "supportsExternalPlayer": true
  }
];

const manifest = {
    "name": "AdrianJael",
    "version": "1.2.0",
    "scrapers": scrapers
};

fs.writeFileSync('./manifest.json', JSON.stringify(manifest, null, 2), 'utf8');
console.log("Restauración técnica completada.");
