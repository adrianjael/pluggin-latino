// Test Script para HackStore2 API

async function testHackstore(query) {
    try {
        console.log(`Buscando "${query}" en HackStore2 API...`);
        const searchRes = await fetch(`https://hackstore2.com/api/rest/search?post_type=movies&query=${encodeURIComponent(query)}`);
        const searchData = await searchRes.json();
        const movie = searchData.data.posts[0];
        
        console.log(`Encontrado: ${movie.title} (ID: ${movie._id}, Slug: ${movie.slug})`);

        // Extraer los reproductores
        console.log(`\nObteniendo reproductores para el ID ${movie._id}...`);
        const playerRes = await fetch(`https://hackstore2.com/api/rest/player?post_id=${movie._id}`);
        const playerData = await playerRes.json();

        console.log(playerData);

    } catch (e) {
        console.error('Error probando HackStore2:', e.message);
    }
}

testHackstore('Zeta');
