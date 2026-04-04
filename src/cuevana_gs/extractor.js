const BASE_URL = 'https://cuevana.gs';
const BASE_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': BASE_URL,
    'Accept-Language': 'es-ES,es;q=0.9'
};

function unpackEval(payload, radix, symtab) {
    return payload.replace(/\b([0-9a-zA-Z]+)\b/g, function (match) {
        let result = 0;
        const digits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let i = 0; i < match.length; i++) {
            let pos = digits.indexOf(match[i]);
            if (pos === -1 || pos >= radix) return match;
            result = result * radix + pos;
        }
        if (result >= symtab.length) return match;
        return symtab[result] && symtab[result] !== "" ? symtab[result] : match;
    });
}

function extractM3u8FromHtml(html) {
    const packMatch = html.match(/eval\(function\(p,a,c,k,e,[\w]+\)\{[\s\S]+?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
    if (packMatch) {
        const unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
        const m = unpacked.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        if (m) return m[0].replace(/\\/g, '');
    }
    const m = html.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
    return m ? m[0] : null;
}

function decodeBase64(input) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = String(input).replace(/=+$/, '');
    let output = '';
    for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = chars.indexOf(buffer);
    }
    return output;
}

async function fetchHtml(url, referer = BASE_URL) {
    const res = await fetch(url, { headers: { ...BASE_HEADERS, Referer: referer } });
    return res.text();
}

async function resolveGenericEmbed(embedUrl) {
    try {
        const html = await fetchHtml(embedUrl, BASE_URL);
        return extractM3u8FromHtml(html);
    } catch (e) { return null; }
}

async function resolveVoesx(embedUrl) {
    try {
        const html = await fetchHtml(embedUrl, embedUrl);
        if (html.includes('Redirecting') || html.length < 1000) {
            const rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
            if (rm) return resolveVoesx(rm[1]);
        }
        const jsonMatch = html.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
        if (jsonMatch) {
            try {
                let encText = JSON.parse(jsonMatch[1].trim())[0];
                let rot13 = encText.replace(/[a-zA-Z]/g, c =>
                    String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26));
                const noise = ['@$', '^^', '~@', '%?', '*~', '!!', '#&'];
                for (const n of noise) rot13 = rot13.split(n).join('');
                let b64_1 = decodeBase64(rot13);
                let shifted = "";
                for (let i = 0; i < b64_1.length; i++) shifted += String.fromCharCode(b64_1.charCodeAt(i) - 3);
                let reversed = shifted.split('').reverse().join('');
                let data = JSON.parse(decodeBase64(reversed));
                if (data && data.source) return data.source;
            } catch (ex) { }
        }
        return extractM3u8FromHtml(html);
    } catch (e) { return null; }
}

async function getTmdbInfo(tmdbId, mediaType) {
    try {
        const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
        const res = await fetch(url, { headers: { 'User-Agent': BASE_HEADERS['User-Agent'] } });
        const html = await res.text();
        
        let title = "";
        let year = "";
        
        const titleMatch = html.match(/<title>(.*?)(?:\s+&\#8212;|\s+-|\s+\()/);
        if (titleMatch) title = titleMatch[1].trim();
        
        const yearMatch = html.match(/\((\d{4})\)/);
        if (yearMatch) year = yearMatch[1];
        
        return { title, year };
    } catch (e) { }
    return { title: null, year: "" };
}

export async function extractStreams(tmdbId, mediaType, season, episode, providedTitle) {
    const isMovie = mediaType === 'movie';
    const targetType = isMovie ? 'movies' : 'tvshows';
    
    console.log(`[Cuevana.gs] Extracting: ${providedTitle || tmdbId} (${mediaType}) S${season}E${episode}`);

    try {
        const tmdbInfo = await getTmdbInfo(tmdbId, mediaType);
        let searchTitle = providedTitle || tmdbInfo.title;
        const year = tmdbInfo.year;

        async function performSearch(query) {
            console.log(`[Cuevana.gs] Searching: "${query}"`);
            const encodedQuery = encodeURIComponent(query);
            const searchUrl = `${BASE_URL}/wp-api/v1/search?postType=any&q=${encodedQuery}&postsPerPage=10`;
            try {
                const searchRes = await fetch(searchUrl, { headers: BASE_HEADERS });
                return await searchRes.json();
            } catch (err) { return { error: true }; }
        }

        let searchJson = await performSearch(`${searchTitle} ${year}`);
        
        // Estrategia de búsqueda en cascada
        if ((searchJson.error || !searchJson.data?.posts?.length) && providedTitle && tmdbInfo.title) {
            searchJson = await performSearch(`${tmdbInfo.title} ${year}`);
        }
        
        if ((searchJson.error || !searchJson.data?.posts?.length) && tmdbInfo.title) {
            searchJson = await performSearch(tmdbInfo.title);
        }

        if (searchJson.error || !searchJson.data?.posts?.length) {
            searchJson = await performSearch(searchTitle);
        }

        if (searchJson.error || !searchJson.data || !searchJson.data.posts || searchJson.data.posts.length === 0) {
            console.log(`[Cuevana.gs] No results found in any search attempt.`);
            return [];
        }

        const posts = searchJson.data.posts;

        // Filtrado inteligente: buscar coincidencia por tipo y luego por título
        let post = posts.find(p => p.type === targetType && 
            (p.title.toLowerCase().includes(tmdbInfo.title?.toLowerCase() || searchTitle.toLowerCase()) || 
             (tmdbInfo.title || searchTitle).toLowerCase().includes(p.title.toLowerCase()))) ||
            posts.find(p => p.type === targetType) ||
            posts[0];

        let postId = post._id;
        console.log(`[Cuevana.gs] Best match: "${post.title}" (postId: ${postId}) [Type: ${post.type}]`);

        // Si es una serie, necesitamos el ID del EPISODIO, no de la serie.
        if (!isMovie && season && episode) {
            console.log(`[Cuevana.gs] TV Mode: Resolving postId for S${season}E${episode}...`);
            try {
                // Consultamos el API de episodios de la serie
                const episodesUrl = `${BASE_URL}/wp-api/v1/single/episodes/list?_id=${postId}&season=${season}&postsPerPage=100`;
                const epRes = await fetch(episodesUrl, { headers: BASE_HEADERS });
                const epJson = await epRes.json();
                
                if (!epJson.error && epJson.data && epJson.data.posts) {
                    const episodes = epJson.data.posts;
                    // Buscamos el episodio exacto por número
                    const epMatch = episodes.find(e => parseInt(e.episode_number) === parseInt(episode));
                    
                    if (epMatch) {
                        postId = epMatch._id;
                        console.log(`[Cuevana.gs] Episode postId resolved via API: ${postId}`);
                    } else {
                        console.log(`[Cuevana.gs] No episode match found in API for E${episode}.`);
                    }
                } else {
                    console.log(`[Cuevana.gs] Error in episodes API response or empty results.`);
                }
            } catch (err) {
                console.error(`[Cuevana.gs] Error resolving episodes via API: ${err.message}`);
            }
        }

        let playerUrl = `${BASE_URL}/wp-api/v1/player?postId=${postId}&demo=0`;
        const playerRes = await fetch(playerUrl, { headers: BASE_HEADERS });
        const playerJson = await playerRes.json();

        if (playerJson.error || !playerJson.data || !playerJson.data.embeds || playerJson.data.embeds.length === 0) {
            console.log(`[Cuevana.gs] No embeds found for postId: ${postId}`);
            return [];
        }

        const embeds = playerJson.data.embeds;
        console.log(`[Cuevana.gs] Embeds found: ${embeds.length}`);

        const streamPromises = embeds.map(function (embed) {
            const proxyUrl = embed.url;
            const lang = embed.lang || 'Latino';
            const quality = embed.quality || 'HD';

            let server = 'unknown';
            try {
                const urlObj = new URL(proxyUrl);
                server = (urlObj.searchParams.get('server') || 'unknown').toLowerCase();
            } catch (e) { }

            console.log(`[Cuevana.gs] -> Resolving [${server}] ${lang} ${quality}`);

            return fetchHtml(proxyUrl, BASE_URL)
                .then(function (proxyHtml) {
                    const iframeMatch = proxyHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);
                    if (!iframeMatch) return null;
                    const embedUrl = iframeMatch[1];

                    let resolvePromise;
                    if (server === 'voe') {
                        resolvePromise = resolveVoesx(embedUrl);
                    } else if (server === 'vimeos') {
                        // Vimeos funciona con embed directo
                        resolvePromise = Promise.resolve(embedUrl);
                    } else if (server === 'goodstream') {
                        // Goodstream da error 403 forbidden
                        return Promise.resolve(null);
                    } else {
                        resolvePromise = resolveGenericEmbed(embedUrl);
                    }

                    return resolvePromise.then(function (finalUrl) {
                        if (!finalUrl || !finalUrl.startsWith('http')) {
                            return null;
                        }
                        return {
                            name: "Cuevana.gs",
                            title: server + " (" + lang + ") " + quality,
                            url: finalUrl,
                            quality: quality,
                            headers: {
                                "Referer": embedUrl,
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                            }
                        };
                    });
                })
                .catch(function () { return null; });
        });

        const results = await Promise.all(streamPromises);
        const streams = results.filter(function (s) { return s !== null; });
        console.log(`[Cuevana.gs] Final streams: ${streams.length}`);
        return streams;

    } catch (error) {
        console.error(`[Cuevana.gs] Global Error: ${error.message}`);
        return [];
    }
}
