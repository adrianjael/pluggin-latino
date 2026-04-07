const fs = require('fs');
const scrapers = [
  {
    "id": "pelisplus",
    "name": "PelisPlusHD",
    "description": "Peliculas y series en espanol latino.",
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
  }
];
const manifest = {
  "name": "AdrianJael",
  "version": "1.2.0",
  "scrapers": scrapers
};
// Guardar usando un Buffer para asegurar que NO hay BOM (EF BB BF)
const content = JSON.stringify(manifest, null, 2).replace(/\r\n/g, '\n');
fs.writeFileSync('./manifest.json', content, { encoding: 'utf8', flag: 'w' });

// Verificación de los primeros 5 bytes
const buffer = fs.readFileSync('./manifest.json');
console.log('Bytes iniciales:', buffer.slice(0, 5));
