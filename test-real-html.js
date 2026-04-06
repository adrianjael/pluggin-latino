const { extractSearchResults } = require('./src/zonaleros/extractor.js');

async function testOffline() {
    console.log("--- TEST DE EXTRacción OFFLINE (FRAGMENTOS REALES) ---");
    
    // Pegamos solo los fragmentos CRÍTICOS que el usuario nos dio
    const html = `
    <ul class="ListAnimes AX Rows A06 C04 D02">
        <li>
          <article class="Anime alt B">
            <a href="https://www.zona-leros.com/peliculas/avatar-fuego-y-cenizas-hd">
                <span class='Estreno'><span>Estreno</span></span>
                <div class="Image fa-play">
                <figure>
                  <img src="https://www.zona-leros.com/storage/movies_tumbl/avatar-fuego-y-cenizas-cover-pgk.webp" alt="ver Avatar: Fuego y cenizas" loading="lazy">
                </figure>
              </div>
              <h3 class="Title" style="padding-left:10px; padding-right:10px;">Avatar: Fuego y cenizas</h3>
            </a>
          </article>
        </li>
        <li>
          <article class="Anime alt B">
            <a href="https://www.zona-leros.com/series/avatar-la-leyenda-de-aang">
                  <div class="Image fa-play">
                <figure>
                  <img src="https://www.zona-leros.com/storage/series_tumbl/avatar-la-leyenda-de-aang-cover-rlh.webp" alt="ver Avatar: La leyenda de Aang" loading="lazy">
                </figure>
              </div>
              <h3 class="Title" style="padding-left:10px; padding-right:10px;">Avatar: La leyenda de Aang</h3>
            </a>
          </article>
        </li>
    </ul>
    `;

    const results = extractSearchResults(html);

    console.log(`\nResultados encontrados: ${results.length}`);
    results.forEach((r, i) => {
        console.log(`[${i+1}] ${r.type.toUpperCase()}: ${r.title}`);
        console.log(`    URL: ${r.url}`);
    });

    if (results.length === 2) {
        console.log("\n✅ PRUEBA EXITOSA: El nuevo extractor capturó correctamente los resultados.");
    } else {
        console.log("\n❌ PRUEBA FALLIDA: Se esperaban 2 resultados y se obtuvieron " + results.length);
    }
}

testOffline();
