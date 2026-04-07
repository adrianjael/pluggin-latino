const BASE = "https://pelispedia.mov";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function debugSearch(query) {
    const url = `${BASE}/search?s=${encodeURIComponent(query)}`;
    console.log(`Searching: ${url}`);
    
    try {
        const res = await fetch(url, { headers: { "User-Agent": UA, "Referer": BASE } });
        const html = await res.text();
        console.log(`HTML Length: ${html.length}`);
        
        // Regex corregida
        const re = /<a[^>]+href="(https:\/\/pelispedia\.mov\/(pelicula|serie)\/([^"]+))"[^>]*title="([^"]+)"/gi;
        let m;
        let found = 0;
        while ((m = re.exec(html)) !== null) {
            found++;
            console.log(`Found: ${m[4]} (${m[2]}) -> ${m[1]}`);
        }
        console.log(`Total found: ${found}`);

        if (found === 0) {
            console.log("No se encontraron coincidencias. Fragmento del HTML:");
            // Buscar cualquier enlace que tenga /pelicula/ o /serie/
            const simpleRe = /href="[^"]*(pelicula|serie)\/[^"]*"/gi;
            const matches = html.match(simpleRe);
            if (matches) {
                console.log("Enlaces encontrados (formato crudo):");
                console.log(matches.slice(0, 5));
            } else {
                console.log("No se encontraron enlaces con /pelicula/ o /serie/.");
            }
        }
    } catch (e) {
        console.error(e);
    }
}

debugSearch("Deadpool");
