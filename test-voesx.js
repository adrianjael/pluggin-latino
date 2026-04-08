// No require node-fetch, using native

function decodeBase64(input) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = String(input).replace(/=+$/, '');
  let output = '';
  for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}

async function testVoe() {
    const embedUrl = "https://voe.sx/e/r34jkcacnkui";
    console.log("Probando", embedUrl);
    
    let res = await fetch(embedUrl);
    let body = await res.text();
    
    if (body.includes('Redirecting') || body.length < 1000) {
        const redirectMatch = body.match(/window\.location\.href\s*=\s*['"](https?:\/\/[^'"]+)['"]/i);
        if (redirectMatch) {
            console.log("Redirigiendo a", redirectMatch[1]);
            res = await fetch(redirectMatch[1]);
            body = await res.text();
        }
    }

    const jsonMatch = body.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
    if (jsonMatch) {
        try {
            let encText = JSON.parse(jsonMatch[1].trim())[0];
            let rot13 = encText.replace(/[a-zA-Z]/g, function(c) {
                return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
            });
            const noise = ['@$', '^^', '~@', '%?', '*~', '!!', '#&'];
            for (const n of noise) rot13 = rot13.split(n).join('');
            
            let b64_1 = decodeBase64(rot13);
            let shifted = "";
            for(let i=0; i<b64_1.length; i++) shifted += String.fromCharCode(b64_1.charCodeAt(i) - 3);
            
            let reversed = shifted.split('').reverse().join('');
            let b64_2 = decodeBase64(reversed);
            
            let data = JSON.parse(b64_2);
            if (data && data.source) {
                console.log("M3U8 ENCONTRADO:", data.source);
            }
        } catch(ex) {
            console.log("Error rompiendo VoeSX:", ex.message);
        }
    } else {
        console.log("No JSON found.");
        const titleMatch = body.match(/<title>([\s\S]*?)<\/title>/i);
        if (titleMatch) console.log("TITLE:", titleMatch[1].trim());
    }
}
testVoe();
