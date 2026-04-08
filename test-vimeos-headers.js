// native fetch

async function testVimeos() {
    const embedUrl = "https://vimeos.net/embed-7msjvajelmhg.html";
    console.log("Fetching Vimeos HTML to extract M3U8...");
    const htmlRes = await fetch(embedUrl);
    const body = await htmlRes.text();
    
    // Extrayendo "eval("
    function unpackEval(payload, radix, symtab) {
        return payload.replace(/\b([0-9a-zA-Z]+)\b/g, function(match) {
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

    const packMatch = body.match(/eval\(function\(p,a,c,k,e,[\w]+\)\{[\s\S]+?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
    if (!packMatch) return console.log("Fallo extracción P.A.C.K.E.R.");
    
    const unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
    const m3u8Match = unpacked.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
    
    if (!m3u8Match) return console.log("Fallo extracción de regex m3u8.");
    const m3u8 = m3u8Match[0].replace(/\\/g, '');
    console.log("URL Extraída: ", m3u8);
    
    // Intento 1: Fetching Without Headers
    console.log("\n[TEST 1] Fetching M3U8 WITHOUT Headers:");
    const res1 = await fetch(m3u8);
    console.log("Status: ", res1.status);
    console.log("Body: ", (await res1.text()).substring(0, 50));
    
    // Intento 2: Fetching With Referer
    console.log("\n[TEST 2] Fetching M3U8 WITH Headers:");
    const res2 = await fetch(m3u8, {
        headers: {
            "Referer": "https://vimeos.net/",
            "Origin": "https://vimeos.net",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    });
    console.log("Status: ", res2.status);
    console.log("Body: ", (await res2.text()).substring(0, 50));
}

testVimeos();
