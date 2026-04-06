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

    // Regex para capturar artículos de películas y series
    // <article class="Anime alt B"> ... <a href="url"> ... <img src="poster"> ... <h3 class="Title">titulo</h3> ...
    const itemRegex = /<article class="Anime alt B">[\s\S]*?<a href="(https:\/\/www\.zona-leros\.com\/(peliculas|series)\/[^"]+)"[^>]*>[\s\S]*?<img src="([^"]+)"[\s\S]*?<h3 class="Title"[^>]*>([\s\S]*?)<\/h3>/g;

    let match;
    while ((match = itemRegex.exec(html)) !== null) {
        const [_, url, type, poster, title] = match;
        results.push({
            title: title.replace(/<[^>]+>/g, '').trim(),
            url: url,
            poster: poster,
            type: type === 'peliculas' ? 'movie' : 'series'
        });
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
