async function runVoe() {
    console.log("Testeando extractor VoeSX...");
    const url = "https://jefferycontrolmodel.com/e/vcgbwzgm36yq";
    
    // Simulate our fetch (using standard fetch in Node 24)
    const response = await fetch(url);
    const html = await response.text();

    console.log("HTML length:", html.length);

    // 1. Encontrar el <script> JSON u ofuscado
    // Voe suele poner los datos dentro de un script tag vacío o con window.voe
    const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
    let jsonData = null;
    
    // Busquemos en el HTML el script application/json o similar
    // "El reproductor VoeSX incluye un bloque <script type="application/json">"
    const jsonMatch = html.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
    let encText = "";
    if (jsonMatch) {
       encText = JSON.parse(jsonMatch[1].trim())[0];
       console.log("Se encontró script application/json:", encText.substring(0, 50) + "...");
    } else {
       // Buscar si hay algun patrón de datos
       const fallbackData = html.match(/'([A-Za-z0-9@\$\^\~%\*\!\#\&]+)'/g);
       console.log("application/json NO encontrado, otros datos potenciales:", fallbackData ? fallbackData.length : 0);
    }

    if (!encText) return;

    // 2. ROT13
    let rot13 = encText.replace(/[a-zA-Z]/g, function(c) {
        return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
    });

    // 3. Clean Noise
    const noise = ['@$', '^^', '~@', '%?', '*~', '!!', '#&'];
    for (const n of noise) {
        rot13 = rot13.split(n).join('');
    }

    // 4. Base64
    let b64_1;
    try {
        b64_1 = atob(rot13);
    } catch(e) { console.log("atob 1 failed"); return; }

    // 5. Shift ASCII - 3
    let shifted = "";
    for(let i=0; i<b64_1.length; i++){
        shifted += String.fromCharCode(b64_1.charCodeAt(i) - 3);
    }

    // 6. Reverse
    let reversed = shifted.split('').reverse().join('');

    // 7. Base64
    let b64_2;
    try {
        b64_2 = atob(reversed);
    } catch(e){ console.log("atob 2 failed"); return; }

    // 8. JSON
    console.log("RESULT:");
    console.log(b64_2);
}

runVoe();
