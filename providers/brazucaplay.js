/**
 * brazucaplay - Built from src/brazucaplay/
 * Generated: 2026-04-30T16:49:53.238Z
 */
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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

// src/utils/ua.js
var require_ua = __commonJS({
  "src/utils/ua.js"(exports2, module2) {
    var UA_POOL = [
      // Windows - Chrome 146 (Custom modern fingerprint)
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"
    ];
    function getRandomUA() {
      const index = Math.floor(Math.random() * UA_POOL.length);
      return UA_POOL[index];
    }
    module2.exports = { getRandomUA, UA_POOL };
  }
});

// src/utils/http.js
var require_http = __commonJS({
  "src/utils/http.js"(exports2, module2) {
    var { getRandomUA } = require_ua();
    var DEFAULT_CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    var sessionUA = null;
    function setSessionUA2(ua) {
      sessionUA = ua;
    }
    function getSessionUA() {
      return sessionUA || DEFAULT_CHROME_UA;
    }
    function getStealthHeaders() {
      return {
        "User-Agent": getSessionUA(),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "es-US,es;q=0.9,en-US;q=0.8,en;q=0.7,es-419;q=0.6",
        "Connection": "keep-alive",
        "sec-ch-ua": '"Chromium";v="137", "Not-A.Brand";v="24", "Google Chrome";v="137"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
      };
    }
    var DEFAULT_UA = getSessionUA();
    var MOBILE_UA = getSessionUA();
    function request(url, options) {
      return __async(this, null, function* () {
        var opt = options || {};
        var currentUA = opt.headers && opt.headers["User-Agent"] ? opt.headers["User-Agent"] : getSessionUA();
        var headers = Object.assign({
          "User-Agent": currentUA,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "es-MX,es;q=0.9,en;q=0.8"
        }, opt.headers);
        try {
          var fetchOptions = Object.assign({
            redirect: opt.redirect || "follow",
            skipSizeCheck: true
          }, opt, {
            headers
          });
          if (opt.signal)
            fetchOptions.signal = opt.signal;
          var response = yield fetch(url, fetchOptions);
          if (opt.redirect === "manual" && (response.status === 301 || response.status === 302)) {
            const redirectUrl = response.headers.get("location");
            console.log(`[HTTP] Redirecci\xF3n detectada (Manual): ${redirectUrl}`);
            return { status: response.status, redirectUrl, ok: false };
          }
          if (!response.ok && !opt.ignoreErrors) {
            console.warn("[HTTP] Error " + response.status + " en " + url);
          }
          return response;
        } catch (error) {
          console.error("[HTTP] Error en " + url + ": " + error.message);
          throw error;
        }
      });
    }
    function fetchHtml(url, options) {
      return __async(this, null, function* () {
        var res = yield request(url, options);
        return yield res.text();
      });
    }
    function fetchJson2(url, options) {
      return __async(this, null, function* () {
        var res = yield request(url, options);
        return yield res.json();
      });
    }
    module2.exports = {
      request,
      fetchHtml,
      fetchJson: fetchJson2,
      getSessionUA,
      setSessionUA: setSessionUA2,
      getStealthHeaders,
      DEFAULT_UA,
      MOBILE_UA
    };
  }
});

// src/brazucaplay/index.js
var { fetchJson, setSessionUA } = require_http();
var API_DEC = "https://enc-dec.app/api/dec-videasy";
var TMDB_API_KEY = "d131017ccc6e5462a81c9304d21476de";
var TMDB_BASE_URL = "https://api.themoviedb.org/3";
var SERVERS = {
  "Gekko": { url: "https://api2.videasy.net/cuevana/sources-with-title", label: "Cuevana" }
};
var CINEBY_HEADERS = {
  "Accept": "*/*",
  "Origin": "https://cineby.sc",
  "Referer": "https://cineby.sc/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 OPR/126.0.0.0 (Edition std-2)"
};
function getStreams(tmdbId, mediaType = "movie", season = null, episode = null) {
  return __async(this, null, function* () {
    const results = [];
    try {
      setSessionUA(CINEBY_HEADERS["User-Agent"]);
      const tmdbUrl = `${TMDB_BASE_URL}/${mediaType === "tv" ? "tv" : "movie"}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`;
      const tmdbData = yield fetchJson(tmdbUrl);
      const imdbId = tmdbData.external_ids && tmdbData.external_ids.imdb_id ? tmdbData.external_ids.imdb_id : "";
      const title = tmdbData.title || tmdbData.name;
      const year = (tmdbData.release_date || tmdbData.first_air_date || "").split("-")[0];
      const doubleEncTitle = encodeURIComponent(encodeURIComponent(title));
      for (const [serverId, config] of Object.entries(SERVERS)) {
        try {
          let searchUrl = `${config.url}?title=${doubleEncTitle}&mediaType=${mediaType === "tv" ? "tv" : "movie"}&year=${year}&tmdbId=${tmdbId}&imdbId=${imdbId}`;
          if (mediaType === "tv")
            searchUrl += `&episodeId=${episode || 1}&seasonId=${season || 1}`;
          const encryptedRes = yield fetch(searchUrl, { headers: CINEBY_HEADERS });
          const encryptedText = yield encryptedRes.text();
          if (!encryptedText || encryptedText.length < 20 || encryptedText.startsWith("<!"))
            continue;
          const decRes = yield fetch(API_DEC, {
            method: "POST",
            headers: { "Content-Type": "application/json", "User-Agent": CINEBY_HEADERS["User-Agent"] },
            body: JSON.stringify({ text: encryptedText, id: String(tmdbId) })
          });
          if (!decRes.ok)
            continue;
          const decData = yield decRes.json();
          const mediaData = decData.result || decData;
          if (mediaData && mediaData.sources) {
            for (const source of mediaData.sources) {
              if (source.url) {
                let quality = (source.quality || "HD").toUpperCase();
                if (quality === "AUTO")
                  quality = "1080p";
                results.push({
                  name: `BrazucaPlay - ${config.label} ${quality} [Latino]`,
                  title: `Servidor: ${config.label} | Audio: Latino \u2705`,
                  url: source.url,
                  quality,
                  headers: CINEBY_HEADERS
                });
              }
            }
          }
        } catch (err) {
        }
      }
    } catch (error) {
    }
    return results;
  });
}
module.exports = { getStreams };
