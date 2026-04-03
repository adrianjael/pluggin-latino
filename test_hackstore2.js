const { getStreams } = require('./providers/hackstore2.js');

async function testHackstore2() {
    console.log("🎬 Testeando proveedor: HackStore2 (Oppenheimer)");
    try {
        const streams = await getStreams('872585', 'movie', null, null, 'Oppenheimer', '');
        console.log(`\n🔎 Se encontraron ${streams.length} enlaces.`);
        
        streams.forEach((s, i) => {
            console.log(`[${i+1}] ${s.title} -> ${s.url.substring(0, 80)}...`);
        });
    } catch(err) {
        console.error("❌ Error", err);
    }
}
testHackstore2();
