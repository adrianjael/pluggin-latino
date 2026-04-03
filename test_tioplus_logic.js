const cheerio = require('cheerio');
const BASE_URL = "https://tioplus.app";

async function testObfuscation() {
    console.log(`\n🔍 TEST DE OFUSCACIÓN: Avatar`);

    try {
        const pageRes = await fetch(`${BASE_URL}/pelicula/avatar-el-sentido-del-agua/`, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': BASE_URL }
        });
        const pageHtml = await pageRes.text();
        
        console.log(`\nTamaño HTML: ${pageHtml.length}`);
        
        // Look for the shift-12 cipher script I saw earlier
        const hasCipher = pageHtml.includes('x-65+26-12') || pageHtml.includes('x-97+26-12');
        console.log(`¿Tiene script de cifrado?: ${hasCipher}`);
        
        if (hasCipher) {
            console.log("\n--- EXTRACCIÓN DE BLOQUE OFUSCADO ---");
            // Find the object with keys like m:, JE:, UE:
            const objMatch = pageHtml.match(/(\{.*?"[a-zA-Z]E":.*?\})\.reduce/);
            if (objMatch) {
                const encodedObjStr = objMatch[1];
                console.log(`Objeto encontrado (fragmento): ${encodedObjStr.substring(0, 100)}...`);
                
                // Decode logic from Turn 39
                function decodeChar(c, shift = 12) {
                    let x = c.charCodeAt(0);
                    if (x >= 65 && x <= 90) return String.fromCharCode((x - 65 + 26 - shift) % 26 + 65);
                    if (x >= 97 && x <= 122) return String.fromCharCode((x - 97 + 26 - shift) % 26 + 97);
                    return c;
                }
                
                function decodeBase26(str, shift = 12) {
                    return str.split('').map(c => decodeChar(c, shift)).join('');
                }
                
                // Try decoding 'tqmpqde' (which I hope is 'headers' or 'players')
                console.log(`Decodificando 'tqmpqde': ${decodeBase26('tqmpqde')}`);
                console.log(`Decodificando 'egnefduzs': ${decodeBase26('egnefduzs')}`); // -> 'structure'?
                console.log(`Decodificando 'fuyqagf': ${decodeBase26('fuyqagf')}`); // -> 'timeout'
            }
        } else {
            console.log("\nHTML NO PARECE OFUSCADO (o es distinto).");
            console.log(pageHtml.substring(0, 1000));
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

testObfuscation();
