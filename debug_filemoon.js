const COMMON_HEADERS = {
    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.9'
};

async function fetchHtml(url) {
    console.log("Fetching:", url);
    const response = await fetch(url, { headers: COMMON_HEADERS });
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.text();
}

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

async function testFilemoon() {
    try {
        const body = await fetchHtml('https://filemoon.sx/e/s51buakw3ccd');
        console.log("Body length:", body.length);
        const packMatch = body.match(/eval\(function\(p,a,c,k,e,[\w]+\)\{[\s\S]+?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
        if (packMatch) {
            console.log("Found packed code");
            const unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
            console.log("Unpacked snippets:", unpacked.substring(0, 200));
            
            const m3u8 = unpacked.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i) || unpacked.match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i);
            if (m3u8) {
                console.log("✅ FOUND M3U8:", (m3u8[1] || m3u8[0]).replace(/\\/g, ''));
            } else {
                console.log("M3U8 not found in unpacked!");
            }
        } else {
            console.log("No packed code found.");
            console.log(body.substring(0, 1000));
        }
    } catch(e) { console.error(e); }
}

testFilemoon();
