/**
 * pelisgo - Built from src/pelisgo/
 * Generated: 2026-04-04T06:44:11.122Z
 */
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/pelisgo/index.js
var CryptoJS = require("crypto-js");
var BASE = "https://pelisgo.online";
var PLAYER_ID = "4079b11d214b588c12807d99b549e1851b3ee03082";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
function fetchHtml(_0) {
  return __async(this, arguments, function* (url, referer = BASE) {
    const res = yield fetch(url, {
      headers: {
        "User-Agent": UA,
        "Referer": referer,
        "Accept-Language": "es-ES,es;q=0.9"
      }
    });
    return res.text();
  });
}
function findSlug(title, mediaType) {
  return __async(this, null, function* () {
    var _a, _b, _c, _d;
    try {
      console.log(`[PelisGo] Searching slug for: ${title}`);
      const searchHtml = yield fetchHtml(`${BASE}/search?q=${encodeURIComponent(title)}`);
      const normalizedTarget = title.toLowerCase().replace(/[^a-z0-9]/g, "");
      const targetPath = mediaType === "movie" ? "movies" : "series";
      const nextMatch = searchHtml.match(new RegExp('<script id="__NEXT_DATA__"[^>]*>(.*?)<\\/script>', "s"));
      if (nextMatch) {
        try {
          const data = JSON.parse(nextMatch[1]);
          const results = ((_b = (_a = data.props) == null ? void 0 : _a.pageProps) == null ? void 0 : _b.searchResults) || ((_d = (_c = data.props) == null ? void 0 : _c.pageProps) == null ? void 0 : _d.results) || [];
          for (const item of results) {
            const itemTitle = (item.title || item.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
            if (itemTitle.includes(normalizedTarget) || normalizedTarget.includes(itemTitle)) {
              return item.slug || item.id;
            }
          }
        } catch (jsonErr) {
        }
      }
      const hrefRegex = new RegExp(`href="\\/(${targetPath})\\/([^"]+)"[^>]*>([\\s\\S]{1,300}?)<\\/`, "gi");
      let match;
      while ((match = hrefRegex.exec(searchHtml)) !== null) {
        const snippet = match[3].toLowerCase().replace(/[^a-z0-9]/g, "");
        if (snippet.includes(normalizedTarget) || normalizedTarget.includes(snippet)) {
          return match[2];
        }
      }
      const fallbackRegex = new RegExp(`href="\\/${targetPath}\\/([^"]+)"`, "gi");
      while ((match = fallbackRegex.exec(searchHtml)) !== null) {
        const slug = match[1];
        const slugPlain = slug.replace(/-/g, "");
        if (slugPlain.includes(normalizedTarget) || normalizedTarget.includes(slugPlain)) {
          return slug;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  });
}
function extractFromPage(pageUrl) {
  return __async(this, null, function* () {
    var _a, _b, _c, _d, _e, _f;
    const streams = [];
    try {
      const html = yield fetchHtml(pageUrl);
      let movieId = null;
      const nextMatch = html.match(new RegExp('<script id="__NEXT_DATA__"[^>]*>(.*?)<\\/script>', "s"));
      if (nextMatch) {
        const data = JSON.parse(nextMatch[1]);
        const movie = ((_b = (_a = data.props) == null ? void 0 : _a.pageProps) == null ? void 0 : _b.movie) || ((_d = (_c = data.props) == null ? void 0 : _c.pageProps) == null ? void 0 : _d.serie) || ((_f = (_e = data.props) == null ? void 0 : _e.pageProps) == null ? void 0 : _f.movieData);
        if (movie && movie.id)
          movieId = movie.id;
      }
      const downloadRegex = /https?:\/\/(?:pixeldrain\.com|buzzheavier\.com)\/[a-zA-Z0-9\/._-]+/g;
      const downloads = [...new Set(html.match(downloadRegex) || [])];
      for (const dl of downloads) {
        if (dl.includes("pixeldrain.com")) {
          const id = dl.split("/").pop();
          streams.push({
            name: "PelisGo (Pixeldrain MP4)",
            title: "Streaming HD (Pixeldrain)",
            url: `https://pixeldrain.com/api/file/${id}`,
            quality: "1080p"
          });
        } else if (dl.includes("buzzheavier.com")) {
          streams.push({
            name: "PelisGo (BuzzHeavier)",
            title: "Streaming HD (BuzzHeavier)",
            url: dl,
            quality: "HD"
          });
        }
      }
      if (movieId) {
        try {
          const actionRes = yield fetch(pageUrl, {
            method: "POST",
            headers: {
              "User-Agent": UA,
              "Content-Type": "text/plain;charset=UTF-8",
              "Next-Action": PLAYER_ID,
              "Referer": pageUrl
            },
            body: JSON.stringify([movieId])
          });
          const actionText = yield actionRes.text();
          const iframeRegex = /https?:\/\/(?:filemoon\.sx|hqq\.to|netu\.to|desu\.pelisgo\.online|embedseek\.com|seekstreaming\.com|f75s\.com)\/e\/[a-zA-Z0-9?=_&%-]+/g;
          const players = [...new Set(actionText.match(iframeRegex) || [])];
          for (const pUrl of players) {
            let name = "PelisGo Online";
            if (pUrl.includes("filemoon") || pUrl.includes("f75s"))
              name = "Magi (Filemoon)";
            if (pUrl.includes("seek"))
              name = "SeekStreaming";
            if (pUrl.includes("netu") || pUrl.includes("hqq"))
              name = "Netu";
            streams.push({
              name: `PelisGo [${name}]`,
              title: name,
              url: pUrl.replace(/\\/g, ""),
              quality: "HD"
            });
          }
        } catch (e) {
          console.log("[PelisGo] Action Error:", e.message);
        }
      }
    } catch (e) {
      console.log("[PelisGo] Page Extract Error:", e.message);
    }
    return streams;
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      console.log(`[PelisGo] Solicitude: ${title} (${mediaType}) S${season}E${episode}`);
      const slug = yield findSlug(title, mediaType);
      if (!slug) {
        console.log(`[PelisGo] No result found for: ${title}`);
        return [];
      }
      let finalUrl = "";
      if (mediaType === "movie") {
        finalUrl = `${BASE}/movies/${slug}`;
      } else {
        finalUrl = `${BASE}/series/${slug}/temporada/${season}/episodio/${episode}`;
      }
      console.log(`[PelisGo] Resolved URL: ${finalUrl}`);
      return yield extractFromPage(finalUrl);
    } catch (e) {
      console.error(`[PelisGo] Global Error: ${e.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
