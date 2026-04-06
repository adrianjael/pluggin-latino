/**
 * Extractor para ZonaLeRoS
 * Selectores basados en el HTML proporcionado por el usuario.
 **/

export function extractSearchResults(html) {
    const results = [];

    // El HTML tiene múltiples secciones. Filtramos para Juegos (no deseados en streaming)
    // Buscamos resultados bajo "Resultados de: ... en Peliculas" y "Series TV"

    // Nota: Si parseamos como DOM, podemos usar selectores precisos.
    // Si estamos en un entorno sin DOM nativo, usaremos regex.
    // Basado en otros proveedores, asumiremos que se cuenta con un parser o regex simple.

    // Regex ultra-flexible para capturar los datos de películas/series en ZonaLeRoS
    // Buscamos el bloque de artículo y extraemos la URL, la imagen (si existe) y el título
    const articleRegex = /<article class="Anime alt B">([\s\S]*?)<\/article>/g;
    
    let artMatch;
    while ((artMatch = articleRegex.exec(html)) !== null) {
        const content = artMatch[1];
        
        const urlMatch = content.match(/href="([^"]+)"/);
        const imgMatch = content.match(/src="([^"]+)"/);
        const titleMatch = content.match(/<h3 class="Title"[^>]*>([\s\S]*?)<\/h3>/);
        
        if (urlMatch && titleMatch) {
            let url = urlMatch[1];
            if (url.startsWith('/')) url = `https://www.zona-leros.com${url}`;
            
            const title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
            const poster = imgMatch ? imgMatch[1] : "";
            const type = url.includes('/series/') ? 'series' : 'movie';
            
            // Solo agregar películas o series
            if (url.includes('/peliculas/') || url.includes('/series/')) {
                results.push({
                    title,
                    url,
                    poster,
                    type
                });
            }
        }
    }

    return results;
}

export function extractMetadata(html) {
    const metadata = {
        title: "",
        poster: "",
        synopsis: "",
        servers: []
    };

    // Título
    const titleMatch = html.match(/<h1 class="Title">([\s\S]*?)<\/h1>/);
    if (titleMatch) metadata.title = titleMatch[1].replace(/online hd/i, '').trim();

    // Poster
    const posterMatch = html.match(/<div class="AnimeCover[\s\S]*?<img src="([^"]+)"/);
    if (posterMatch) metadata.poster = posterMatch[1];

    // Sinopsis
    const synopsisMatch = html.match(/<div class="Description">([\s\S]*?)(<p>Avatar: Fuego y cenizas por mega|<\/div>)/);
    if (synopsisMatch) metadata.synopsis = synopsisMatch[1].replace(/<[^>]+>/g, '').trim();

    // Extraer Scripts de Video (Reproductores)
    // El sitio guarda los iframes en arrays JS: video10757[107571] = '<iframe...src="url"...>';
    const scriptRegex = /video\d+\[\d+\] = '<iframe[^>]*src="([^"]+)"[^>]*><\/iframe>';/g;
    let sMatch;
    while ((sMatch = scriptRegex.exec(html)) !== null) {
        metadata.servers.push(sMatch[1]);
    }

    return metadata;
}
