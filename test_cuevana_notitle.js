const { getStreams } = require('./providers/cuevana_gs.js');

async function testCuevana() {
    console.log("🎬 Testeando proveedor: Cuevana.gs (sin título)");
    console.log("---------------------------------------");

    try {
        // Oppenheimer ID: 872585 - PASAMOS NULL PARA EL TÍTULO
        const streams = await getStreams('872585', 'movie', null, null, null);
        
        console.log(`\n🔎 Se encontraron ${streams.length} enlaces.`);
    } catch(err) {
        console.error("❌ Error ejecutando getStreams:", err);
    }
}

testCuevana();
