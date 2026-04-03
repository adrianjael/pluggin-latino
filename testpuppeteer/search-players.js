const puppeteer = require('puppeteer');

(async () => {
  console.log("Iniciando busqueda encubierta en PelisPanda...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('wp-json') || url.includes('.json') || url.includes('ajax')) {
          try {
              const text = await response.text();
              const hasVoe = text.includes('voe.sx');
              const hasHls = text.includes('hlswish.com');
              const hasVimeos = text.includes('vimeos');
              if (hasVoe || hasHls || hasVimeos) {
                  console.log("\n\n=== ENCONTRE LA BÓVEDA DE ENLACES! ===");
                  console.log("URL:", url);
                  console.log("METODO:", response.request().method());
                  if (response.request().method() === "POST") {
                    console.log("POST DATA:", response.request().postData());
                  }
                  console.log("Respuesta parcial:", text.substring(0, 500) + "...\n\n");
                  require('fs').writeFileSync('boveda_enlaces.json', text);
              }
          } catch(e) {}
      }
  });

  await page.goto('https://pelispanda.org/pelicula/zeta/player', { waitUntil: 'networkidle2' });
  await browser.close();
  console.log("Búsqueda terminada.");
})();
