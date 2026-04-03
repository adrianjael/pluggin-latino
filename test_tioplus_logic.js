const cheerio = require('cheerio');
const BASE_URL = "https://tioplus.app";

async function testExtraction() {
    const searchTitle = "Avatar";
    console.log(`\n🔍 Probando con __NEXT_DATA__ para: ${searchTitle}`);

    try {
        const searchUrl = `${BASE_URL}/api/search/${encodeURIComponent(searchTitle)}`;
        const searchRes = await fetch(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': BASE_URL }
        });
        const searchHtml = await searchRes.text();
        const $search = cheerio.load(searchHtml);
        
        const results = [];
        $search('article.item').each((i, el) => {
            const $el = $search(el);
            results.push({
                title: $el.find('h2').text().trim(),
                href: $el.find('a.itemA').attr('href')
            });
        });

        const match = results.find(r => r.title.includes("sentido del agua"));
        if (!match) return;

        console.log(`✅ Match: ${match.title} -> ${match.href}`);

        // Get Content Page and Extract __NEXT_DATA__
        const pageRes = await fetch(match.href, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const pageHtml = await pageRes.text();
        const $page = cheerio.load(pageHtml);
        
        const nextDataScript = $page('script#__NEXT_DATA__').html();
        if (!nextDataScript) {
            console.log("❌ No se encontró __NEXT_DATA__");
            return;
        }

        const nextData = JSON.parse(nextDataScript);
        const players = nextData.props.pageProps.data.players;
        
        if (!players || players.length === 0) {
            console.log("❌ No hay reproductores en __NEXT_DATA__");
            return;
        }

        console.log(`📡 Servidores detectados (JSON): ${players.length}`);

        for (const player of players.slice(0, 3)) {
            console.log(`\n🔨 Canal: ${player.name} (ID: ${player.id.substring(0, 10)}...)`);
            const playerUrl = `${BASE_URL}/player/${player.id}`;
            const playerRes = await fetch(playerUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': BASE_URL }
            });
            const playerHtml = await playerRes.text();
            
            const redirectMatch = playerHtml.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
            if (redirectMatch) {
                const finalUrl = redirectMatch[1];
                console.log(`🔗 Redirección Final: ${finalUrl}`);
                
                // Final fetch for m3u8
                const embedRes = await fetch(finalUrl, { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': BASE_URL } });
                const embedHtml = await embedRes.text();
                const m3u8Match = embedHtml.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i) ||
                                 embedHtml.match(/https?:\/\/[^"'\s\\]+\.mp4[^"'\s\\]*/i);
                
                if (m3u8Match) {
                    console.log(`✅ ENLACE DIRECTO: ${m3u8Match[0]}`);
                } else {
                    console.log(`⚠️ No se encontró m3u8 directo.`);
                }
            }
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

testExtraction();
