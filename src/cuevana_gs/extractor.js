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

async function getTmdbTitle(tmdbId, mediaType) {
    try {
        const url = `https://www.themoviedb.org/${mediaType}/${tmdbId}?language=es-MX`;
        const res = await fetch(url, { headers: { 'User-Agent': BASE_HEADERS['User-Agent'] } });
        const html = await res.text();
        const titleMatch = html.match(/<title>(.*?)(?:\s+&\#8212;|\s+-|\s+\()/);
        if (titleMatch) {
            return titleMatch[1].trim();
        }
    } catch (e) { }
    return null;
}

export async function extractStreams(tmdbId, mediaType, season, episode, providedTitle) {
    console.log(`[Cuevana.gs] Extracting: ${providedTitle || tmdbId} (${mediaType}) S${season}E${episode}`);

    try {
        let searchTitle = providedTitle;
        if (!searchTitle) {
            searchTitle = await getTmdbTitle(tmdbId, mediaType);
            console.log(`[Cuevana.gs] TMDB Fallback Title: ${searchTitle}`);
        }

        const query = encodeURIComponent(searchTitle || String(tmdbId));
        const searchUrl = `${BASE_URL}/wp-api/v1/search?postType=any&q=${query}&postsPerPage=5`;
        const searchRes = await fetch(searchUrl, { headers: BASE_HEADERS });
        const searchJson = await searchRes.json();

        if (searchJson.error || !searchJson.data || !searchJson.data.posts || searchJson.data.posts.length === 0) {
            console.log(`[Cuevana.gs] No results for: ${providedTitle}`);
            return [];
        }

        const posts = searchJson.data.posts;
        const isMovie = mediaType === 'movie';
        const post = posts.find(p => String(p.tmdb_id) === String(tmdbId)) ||
            posts.find(p => p.post_type === (isMovie ? 'pelicula' : 'series')) ||
            posts[0];

        const postId = post._id;
        console.log(`[Cuevana.gs] Match: "${post.title}" (postId: ${postId})`);

        let playerUrl = `${BASE_URL}/wp-api/v1/player?postId=${postId}&demo=0`;
        if (!isMovie && season && episode) {
            playerUrl += `&season=${season}&episode=${episode}`;
        }

        const playerRes = await fetch(playerUrl, { headers: BASE_HEADERS });
        const playerJson = await playerRes.json();

        if (playerJson.error || !playerJson.data || !playerJson.data.embeds || playerJson.data.embeds.length === 0) {
            console.log('[Cuevana.gs] No embeds found.');
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
                    } else if (server === 'vimeos' || server === 'goodstream') {
                        // Para Vimeos pasamos el embed directamente, ya que su m3u8 
                        // es muy protegido. Nuvio lo abrirá en su WebView interno.
                        resolvePromise = Promise.resolve(embedUrl);
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
