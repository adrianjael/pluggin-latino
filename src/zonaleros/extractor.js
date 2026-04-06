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

    // Regex más flexible para capturar el enlace y el título
    // Buscamos cualquier enlace que contenga /peliculas/ o /series/
    const itemRegex = /<article class="Anime alt B">[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?<img src="([^"]+)"[\s\S]*?<h3 class="Title"[^>]*>([\s\S]*?)<\/h3>/g;

    let match;
    while ((match = itemRegex.exec(html)) !== null) {
        let [_, url, poster, title] = match;

        // Asegurar URL absoluta
        if (url.startsWith('/')) url = `https://www.zona-leros.com${url}`;

        // Determinar tipo por la URL
        const type = url.includes('/series/') ? 'series' : 'movie';

        // Solo agregar si es película o serie (ignorar juegos)
        if (url.includes('/peliculas/') || url.includes('/series/')) {
            results.push({
                title: title.replace(/<[^>]+>/g, '').trim(),
                url: url,
                poster: poster,
                type: type
            });
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
