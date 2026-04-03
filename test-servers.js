// nativo fetch

async function getHtml(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;'
        }
    });
    return await res.text();
}

async function test() {
    console.log("== Analizando VIMEOS ==");
    const vimeos = await getHtml("https://vimeos.net/embed-7msjvajelmhg.html");
    const vimeosEval = vimeos.match(/eval\(function\(p,a,c,k,e,[\w]+\)\{[\s\S]+?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
    if (vimeosEval) console.log("Vimeos usa P.A.C.K.E.R. (eval function)!");
    else console.log("Vimeos: Otra ofuscación / Match no encontrado. Tamaño HTML: " + vimeos.length);
    console.log("M3U8 hardcoded in Vimeos? ", vimeos.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i) ? "YES" : "NO");

    console.log("\n== Analizando GOODSTREAM ==");
    const goodstream = await getHtml("https://goodstream.one/embed-khmvcbtymaqg.html");
    const goodEval = goodstream.match(/eval\(function\(p,a,c,k,e,[\w]+\)\{[\s\S]+?\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
    if (goodEval) console.log("Goodstream usa P.A.C.K.E.R. (eval function)!");
    else console.log("Goodstream: Otra ofuscación / Match no encontrado. Tamaño HTML: " + goodstream.length);
    console.log("M3U8 hardcoded in Goodstream? ", goodstream.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i) ? "YES" : "NO");
}

test();
