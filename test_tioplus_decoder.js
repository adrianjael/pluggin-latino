const fs = require('fs');

// Decode logic from TioPlus script (Shift 12)
function decodeChar(c, shift = 12) {
    let x = c.charCodeAt(0);
    if (x >= 65 && x <= 90) return String.fromCharCode((x - 65 + 26 - shift) % 26 + 65);
    if (x >= 97 && x <= 122) return String.fromCharCode((x - 97 + 26 - shift) % 26 + 97);
    return c;
}

function decodeString(str, shift = 12) {
    return str.split('').map(c => decodeChar(c, shift)).join('');
}

// Test strings from Turn 39
const samples = {
    "JE": "f",
    "UE": "baef",
    "dE": "efmfge_oapq",
    "ZE": "puebxmk",
    "IE": "tqmpqde",
    "lE": "qddad.oay",
    "sE": "oxaeqp",
    "DE": "egnefduzs",
    "AE": "eturfEfduzs ",
    "FE": "fuyqagf",
    "RE": "qddad dqcgqef fuyqagf",
    "oE": "efmfgeFqjf"
};

console.log("--- RESULTADOS DE DECODIFICACIÓN (Shift 12) ---");
for (const [key, val] of Object.entries(samples)) {
    console.log(`${val} -> ${decodeString(val)}`);
}
