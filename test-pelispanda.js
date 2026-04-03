async function testPanda() {
    const res = await fetch('https://pelispanda.org/wp-json/wp/v2/movies/15790');
    if (res.ok) {
        const json = await res.json();
        console.log("WP V2 keys:", Object.keys(json));
    } else {
        const res2 = await fetch('https://pelispanda.org/wp-json/wp/v2/posts/15790');
        if (res2.ok) {
            const json2 = await res2.json();
            console.log("WP V2 POST keys:", Object.keys(json2));
        } else {
            console.log("Standard APIs not found");
            const res3 = await fetch('https://pelispanda.org/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({action: 'doo_player_ajax', post: 15790, nume: 1, type: 'movie'})
            });
            console.log("Doo player:", await res3.text());
        }
    }
}
testPanda();
