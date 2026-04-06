const { extractSearchResults } = require('./src/zonaleros/extractor.js');
const fs = require('fs');

const html = `
[PEGAR AQUÍ EL HTML PROPORCIONADO POR EL USUARIO O CARGARLO DESDE ARCHIVO SI LO GUARDO]
`;

// Para no ensuciar el log, leeré el HTML que guardaré en un archivo temporal
const testHtml = fs.readFileSync('zonaleros_debug.html', 'utf8');

console.log("--- TEST DE EXTRacción CON HTML REAL ---");
const results = extractSearchResults(testHtml);

console.log(`Resultados encontrados: ${results.length}`);
results.forEach((r, i) => {
    console.log(`[${i+1}] ${r.type.toUpperCase()}: ${r.title}`);
    console.log(`    URL: ${r.url}`);
});

if (results.length > 0) {
    console.log("\n✅ EXTRACCIÓN EXITOSA");
} else {
    console.log("\n❌ EXTRACCIÓN FALLIDA - El regex no coincide con el HTML real.");
}
