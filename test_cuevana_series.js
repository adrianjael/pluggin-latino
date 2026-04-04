const { getStreams } = require('./providers/cuevana_gs.js');

(async () => {
    try {
        console.log("Testeando Serie: The Boy (TMDB??) - S4E1");
        // tmdbId, mediaType, season, episode, title
        const streams = await getStreams("76479", "tv", 4, 1, "The Boy");
        console.log("Resultado final:", streams.length > 0 ? streams : "NO HAY ENLACES");
    } catch (e) {
        console.error("Error:", e);
    }
})();
