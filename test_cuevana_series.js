const { getStreams } = require('./providers/cuevana_gs.js');

(async () => {
    try {
        console.log("Testeando Serie: The Boys (TMDB 76479) - S1E1");
        // tmdbId, mediaType, season, episode, title
        const streams = await getStreams("76479", "tv", 1, 1, "The Boys");
        console.log("Resultado final:", streams.length > 0 ? streams : "NO HAY ENLACES");
    } catch (e) {
        console.error("Error:", e);
    }
})();
