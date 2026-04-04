const https = require('https');

function request(url, opts = {}) {
    return new Promise((resolve) => {
        const method = opts.method || 'GET';
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': opts.json ? 'application/json' : 'text/html,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9',
            ...opts.headers
        };
        const parsedUrl = new URL(url);
        const reqOpts = { hostname: parsedUrl.hostname, path: parsedUrl.pathname + parsedUrl.search, method, headers };
        const req = https.request(reqOpts, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve({ status: res.statusCode, body: d }));
        });
        req.on('error', e => resolve({ status: 0, body: e.message }));
        if (opts.body) req.write(opts.body);
        req.end();
    });
}

async function resolveEmbed69(imdbId, season, episode) {
    let url = `https://embed69.org/f/${imdbId}`;
    if (season && episode) url += `?season=${season}&episode=${episode}`;

    console.log('[Embed69] Fetching:', url);
    const page = await request(url, { headers: { 'Referer': 'https://sololatino.net/' } });
    if (page.status !== 200) return null;

    // Extraer array dataLink del HTML
    const dlMatch = page.body.match(/let\s+dataLink\s*=\s*(\[[\s\S]*?\]);\s*\n/);
    if (!dlMatch) {
        console.log('[Embed69] No dataLink found');
        return null;
    }

    let dataLink;
    try { dataLink = JSON.parse(dlMatch[1]); }
    catch (e) { console.log('[Embed69] Parse error:', e.message); return null; }

    console.log('[Embed69] Files found:', dataLink.length, '| Total servers:', dataLink.reduce((a, f) => a + (f.sortedEmbeds?.length || 0), 0));

    // Recolectar todos los JWTs
    const allJwts = [];
    const linkMap = [];
    dataLink.forEach((file, fi) => {
        (file.sortedEmbeds || []).forEach((embed, ei) => {
            if (embed.link) {
                allJwts.push(embed.link);
                linkMap.push({ fi, ei, lang: file.video_language, server: embed.servername });
            }
        });
    });

    console.log('[Embed69] JWTs to decrypt:', allJwts.length);

    // Llamar /api/decrypt con todos los JWTs
    const decryptResp = await request('https://embed69.org/api/decrypt', {
        method: 'POST',
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'Referer': url,
            'Origin': 'https://embed69.org'
        },
        body: JSON.stringify({ links: allJwts })
    });

    console.log('[Embed69] Decrypt status:', decryptResp.status);
    
    let decrypted;
    try { decrypted = JSON.parse(decryptResp.body); }
    catch (e) { console.log('[Embed69] Decrypt parse error:', e.message, decryptResp.body.slice(0,200)); return null; }

    if (!decrypted.success || !Array.isArray(decrypted.links)) {
        console.log('[Embed69] Decrypt failed:', decrypted);
        return null;
    }

    console.log('[Embed69] Decrypted links:', decrypted.links.length);
    
    // Mapear los resultados
    const streams = [];
    decrypted.links.forEach((linkObj, i) => {
        const mapping = linkMap[i];
        if (!mapping) return;
        
        let resolvedUrl = typeof linkObj === 'object' ? linkObj.link : linkObj;
        if (typeof resolvedUrl === 'string') resolvedUrl = resolvedUrl.replace(/`/g, '').trim();
        
        if (!resolvedUrl || mapping.server === 'download') return;
        
        console.log(`  [${mapping.lang}] ${mapping.server}: ${resolvedUrl}`);
        streams.push({ lang: mapping.lang, server: mapping.server, url: resolvedUrl });
    });

    return streams;
}

async function run() {
    console.log('=== TEST 1: Oppenheimer (Película) ===');
    const movie = await resolveEmbed69('tt15398776');
    console.log('\nStreams encontrados:', movie ? movie.length : 0);
    
    console.log('\n=== TEST 2: The Boys S4E1 (Serie) ===');
    const series = await resolveEmbed69('tt1190634', 4, 1);
    console.log('\nStreams encontrados:', series ? series.length : 0);
}

run();
