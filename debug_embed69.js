const https = require('https');

function get(url) {
    return new Promise((resolve) => {
        https.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'es-ES,es;q=0.9'
            }
        }, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve({ status: res.statusCode, body: d }));
        }).on('error', e => resolve({ status: 0, body: e.message }));
    });
}

async function debug() {
    const title = 'The Boys';
    console.log(`--- Debugging: ${title} ---`);

    // 1. Test TVMaze
    console.log('\n[1] Testing TVMaze...');
    const tvmazeUrl = `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(title)}&embed=externals`;
    const tvmazeRes = await get(tvmazeUrl);
    console.log('Status:', tvmazeRes.status);
    try {
        const data = JSON.parse(tvmazeRes.body);
        console.log('IMDB ID from TVMaze:', data?.externals?.imdb);
        const imdbId = data?.externals?.imdb?.startsWith('tt') ? data.externals.imdb : `tt${data.externals.imdb}`;
        
        if (imdbId) {
            // 2. Test Embed69
            console.log(`\n[2] Testing Embed69 with ${imdbId} S4E1...`);
            const embed69Url = `https://embed69.org/f/${imdbId}?season=4&episode=1`;
            const embed69Res = await get(embed69Url);
            console.log('Status:', embed69Res.status, '| Length:', embed69Res.body.length);
            
            const hasDataLink = /let\s+dataLink/.test(embed69Res.body);
            console.log('Has dataLink:', hasDataLink);
            
            if (hasDataLink) {
                const dlMatch = embed69Res.body.match(/let\s+dataLink\s*=\s*(\[[\s\S]*?\]);\s*\n/);
                if (dlMatch) {
                    const dataLink = JSON.parse(dlMatch[1]);
                    console.log('Languages found:', dataLink.map(f => f.video_language));
                    dataLink.forEach(lang => {
                        console.log(`  Servers for ${lang.video_language}:`, lang.sortedEmbeds?.map(s => s.servername));
                    });
                }
            } else {
                console.log('HTML Snippet (first 500 chars):', embed69Res.body.slice(0, 500));
                // Maybe it's /tv/ instead of /f/?
                console.log('\n[2b] Trying /tv/ format...');
                const tvUrl = `https://embed69.org/tv/${imdbId}/4/1`;
                const tvRes = await get(tvUrl);
                console.log('Status:', tvRes.status, '| Len:', tvRes.body.length, '| DataLink:', /let\s+dataLink/.test(tvRes.body));
            }
        }
    } catch (e) {
        console.log('Error:', e.message);
    }
}

debug();
