// native fetch

async function testFetch(url, headers, name) {
    console.log(`[${name}] Testing...`);
    try {
        const res = await fetch(url, { headers });
        console.log(`[${name}] Status: ${res.status}`);
        const text = await res.text();
        console.log(`[${name}] Body preview: ${text.substring(0, 30).trim()}`);
    } catch(e) {
        console.log(`[${name}] Falló: ${e.message}`);
    }
}

async function testAll() {
    const vimeos = "https://s10.vimeos.net/hls2/02/00010/7msjvajelmhg_,n,h,.urlset/master.m3u8?t=Pzp5zfmyMtaKunPquZhbEBacNIGpcEGK9vJPvwPQns4&s=1775240150&e=43200&v=163391574&i=0.3&sp=0&fr=7msjvajelmhg&r=e";
    const goodst = "https://s4.goodstream.one/hls2/03/00085/khmvcbtymaqg_,l,n,h,.urlset/master.m3u8?t=i95MWtHy-DyqKXgd6kH93gHSPqSP9q-q1H_z5eLL-wY&s=1775239770&e=43200&v=258901237&i=0.3&sp=0&fr=khmvcbtymaqg";

    // 1. Vimeos - Empty
    await testFetch(vimeos, {}, "VIMEOS - No headers");
    
    // 2. Vimeos - Empty User-Agent
    await testFetch(vimeos, { "User-Agent": "Mozilla/5.0" }, "VIMEOS - Just UA");
    
    // 3. Vimeos - Correct referer
    await testFetch(vimeos, { "Referer": "https://vimeos.net/embed-7msjvajelmhg.html" }, "VIMEOS - Embed Referer");
    
    // 4. Vimeos - Strict
    await testFetch(vimeos, {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://vimeos.net/embed-7msjvajelmhg.html",
        "Origin": "https://vimeos.net"
    }, "VIMEOS - Strict Headers");

    console.log("\n");

    // 1. Goodstream - Empty
    await testFetch(goodst, {}, "GOOD - No headers");
    
    // 2. Goodstream - Just UA
    await testFetch(goodst, { "User-Agent": "Mozilla/5.0" }, "GOOD - Just UA");
    
    // 3. Goodstream - Referer
    await testFetch(goodst, { "Referer": "https://goodstream.one/" }, "GOOD - Referer");
}

testAll();
