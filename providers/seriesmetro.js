/**
 * seriesmetro - Built from src/seriesmetro/
 * Generated: 2026-04-08T22:14:02.254Z
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/utils/http.js
var require_http = __commonJS({
  "src/utils/http.js"(exports, module2) {
    var DEFAULT_UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    var MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36";
    function request(url, options) {
      return __async(this, null, function* () {
        var opt = options || {};
        var headers = Object.assign({
          "User-Agent": opt.mobile ? MOBILE_UA : DEFAULT_UA2,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "es-MX,es;q=0.9,en;q=0.8"
        }, opt.headers);
        try {
          var fetchOptions = Object.assign({}, opt, { headers });
          var response = yield fetch(url, fetchOptions);
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
    function fetchHtml2(url, options) {
      return __async(this, null, function* () {
        var res = yield request(url, options);
        return yield res.text();
      });
    }
    function fetchJson(url, options) {
      return __async(this, null, function* () {
        var res = yield request(url, options);
        return yield res.json();
      });
    }
    module2.exports = {
      request,
      fetchHtml: fetchHtml2,
      fetchJson,
      DEFAULT_UA: DEFAULT_UA2,
      MOBILE_UA
    };
  }
});

// src/seriesmetro/index.js
var seriesmetro_exports = {};
__export(seriesmetro_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(seriesmetro_exports);
var import_axios3 = __toESM(require("axios"));

// src/utils/m3u8.js
var import_axios = __toESM(require("axios"));
function getQualityFromHeight(height) {
  if (!height)
    return "Auto";
  const h = parseInt(height);
  if (h >= 2160)
    return "4K";
  if (h >= 1440)
    return "1440p";
  if (h >= 1080)
    return "1080p";
  if (h >= 720)
    return "720p";
  if (h >= 480)
    return "480p";
  if (h >= 360)
    return "360p";
  return "240p";
}
function parseBestQuality(content) {
  const lines = content.split("\n");
  let bestHeight = 0;
  for (const line of lines) {
    if (line.includes("RESOLUTION=")) {
      const match = line.match(/RESOLUTION=\d+x(\d+)/);
      if (match) {
        const height = parseInt(match[1]);
        if (height > bestHeight)
          bestHeight = height;
      }
    }
  }
  return bestHeight > 0 ? getQualityFromHeight(bestHeight) : "720p";
}
function validateStream(stream) {
  return __async(this, null, function* () {
    if (!stream || !stream.url)
      return stream;
    const { url, headers } = stream;
    try {
      const response = yield import_axios.default.get(url, {
        timeout: 4e3,
        responseType: "text",
        headers: __spreadProps(__spreadValues({}, headers || {}), {
          "Accept": "*/*",
          "User-Agent": (headers == null ? void 0 : headers["User-Agent"]) || "Mozilla/5.0"
        })
      });
      if (response.data && typeof response.data === "string" && (url.includes(".m3u8") || response.data.includes("#EXTM3U"))) {
        const realQuality = parseBestQuality(response.data);
        return __spreadProps(__spreadValues({}, stream), {
          quality: realQuality,
          verified: true
          // <--- Marcamos como verificado
        });
      }
      return __spreadProps(__spreadValues({}, stream), { verified: true });
    } catch (error) {
      return __spreadProps(__spreadValues({}, stream), { verified: false });
    }
  });
}

// src/utils/sorting.js
var QUALITY_SCORE = {
  "4K": 100,
  "1440p": 90,
  "1080p": 80,
  "720p": 70,
  "480p": 60,
  "360p": 50,
  "240p": 40,
  "Auto": 30,
  "Unknown": 0
};
function sortStreamsByQuality(streams) {
  if (!Array.isArray(streams))
    return [];
  return [...streams].sort((a, b) => {
    const scoreA = QUALITY_SCORE[a.quality] || 0;
    const scoreB = QUALITY_SCORE[b.quality] || 0;
    if (scoreA === scoreB) {
      if (a.quality === "Auto")
        return 1;
      if (b.quality === "Auto")
        return -1;
    }
    return scoreB - scoreA;
  });
}

// src/utils/engine.js
function normalizeLanguage(lang) {
  const l = (lang || "").toLowerCase();
  if (l.includes("latino") || l.includes("lat"))
    return "Latino";
  if (l.includes("espa\xF1ol") || l.includes("castellano") || l.includes("esp"))
    return "Espa\xF1ol";
  if (l.includes("sub") || l.includes("vose"))
    return "Subtitulado";
  return lang || "Latino";
}
function normalizeServer(server) {
  if (!server)
    return "Servidor";
  const s = server.toLowerCase();
  if (s.includes("voe"))
    return "VOE";
  if (s.includes("filemoon"))
    return "Filemoon";
  if (s.includes("streamwish") || s.includes("awish") || s.includes("dwish"))
    return "StreamWish";
  if (s.includes("vidhide") || s.includes("dintezuvio"))
    return "VidHide";
  if (s.includes("waaw") || s.includes("netu"))
    return "Netu";
  if (s.includes("fastream"))
    return "Fastream";
  return server;
}
function finalizeStreams(streams, providerName) {
  return __async(this, null, function* () {
    if (!Array.isArray(streams) || streams.length === 0)
      return [];
    console.log(`[Engine] Processing ${streams.length} streams for ${providerName}...`);
    let validated = streams;
    try {
      const results = yield Promise.allSettled(
        streams.map((s) => validateStream(s))
      );
      validated = results.map(
        (r, i) => r.status === "fulfilled" ? r.value : streams[i]
      );
    } catch (e) {
      console.error(`[Engine] Validation error: ${e.message}`);
    }
    const sorted = sortStreamsByQuality(validated);
    return sorted.map((s) => {
      const q = s.quality || "HD";
      const lang = normalizeLanguage(s.langLabel || s.language);
      const server = normalizeServer(s.serverLabel || s.serverName || s.servername);
      const check = s.verified ? " \u2713" : "";
      return {
        name: providerName || s.name || "Provider",
        title: `${q}${check} \xB7 ${lang} \xB7 ${server}`,
        url: s.url,
        quality: q,
        headers: s.headers || {}
      };
    });
  });
}

// src/resolvers/fastream.js
var import_http = __toESM(require_http());

// src/resolvers/quality.js
var import_axios2 = __toESM(require("axios"));
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
function detectQuality(_0) {
  return __async(this, arguments, function* (url, headers = {}) {
    try {
      if (!url || !url.includes(".m3u8"))
        return "1080p";
      const { data } = yield import_axios2.default.get(url, {
        timeout: 5e3,
        headers: __spreadValues({
          "User-Agent": UA
        }, headers),
        responseType: "text"
      });
      if (!data.includes("#EXT-X-STREAM-INF")) {
        const match = url.match(/[_-](\d{3,4})p/i);
        return match ? `${match[1]}p` : "1080p";
      }
      let maxRes = 0;
      const lines = data.split("\n");
      for (const line of lines) {
        const match = line.match(/RESOLUTION=\d+x(\d+)/i);
        if (match) {
          const res = parseInt(match[1]);
          if (res > maxRes)
            maxRes = res;
        }
      }
      if (maxRes > 0) {
        if (maxRes >= 2160)
          return "4K";
        if (maxRes >= 1080)
          return "1080p";
        if (maxRes >= 720)
          return "720p";
        if (maxRes >= 480)
          return "480p";
        return `${maxRes}p`;
      }
      return "1080p";
    } catch (e) {
      return "1080p";
    }
  });
}

// src/resolvers/fastream.js
function unpackPacker(data) {
  var match = data.match(/eval\(function\(p,a,c,k,e,d\)\{.*?\}\('([\s\S]*?)',(\d+),(\d+),'([\s\S]*?)'\.split\('\|'\)\)\)/);
  if (!match)
    return null;
  var p = match[1];
  var a = parseInt(match[2]);
  var c = parseInt(match[3]);
  var k = match[4].split("|");
  while (c--) {
    if (k[c])
      p = p.replace(new RegExp("\\b" + c.toString(a) + "\\b", "g"), k[c]);
  }
  return p;
}
function resolve(url) {
  return __async(this, null, function* () {
    try {
      console.log("[Fastream] Resolviendo: " + url);
      var data = yield (0, import_http.fetchHtml)(url, {
        headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": "https://www3.seriesmetro.net/" }
      });
      var unpacked = unpackPacker(data);
      var m3u8Match;
      if (!unpacked) {
        m3u8Match = data.match(/file:"(https?:\/\/[^"]+\.m3u8[^"]*)"/);
        if (m3u8Match && m3u8Match[1]) {
          var url1 = m3u8Match[1];
          var q1 = yield detectQuality(url1, { "Referer": "https://fastream.to/" });
          return { url: url1, quality: q1, headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": "https://fastream.to/" } };
        }
        return null;
      }
      m3u8Match = unpacked.match(/file:"(https?:\/\/[^"]+\.m3u8[^"]*)"/);
      if (!m3u8Match || !m3u8Match[1])
        return null;
      var m3u8Url = m3u8Match[1];
      var quality = yield detectQuality(m3u8Url, { "Referer": "https://fastream.to/" });
      return {
        url: m3u8Url,
        quality,
        headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": "https://fastream.to/" }
      };
    } catch (e) {
      console.log("[Fastream] Error: " + e.message);
      return null;
    }
  });
}

// src/seriesmetro/index.js
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var BASE = "https://www3.seriesmetro.net";
var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var HEADERS = {
  "User-Agent": UA2,
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-MX,es;q=0.9",
  "Connection": "keep-alive",
  "Upgrade-Insecure-Requests": "1"
};
var LANG_PRIORITY = ["latino", "lat", "castellano", "espa\xF1ol", "esp", "vose", "sub", "subtitulado"];
var LANG_MAP = {
  "latino": "Latino",
  "lat": "Latino",
  "castellano": "Espa\xF1ol",
  "espa\xF1ol": "Espa\xF1ol",
  "esp": "Espa\xF1ol",
  "vose": "Subtitulado",
  "sub": "Subtitulado",
  "subtitulado": "Subtitulado"
};
function buildSlug(title) {
  return title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
function getTmdbData(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const attempts = [{ lang: "es-MX" }, { lang: "en-US" }];
    for (const { lang } of attempts) {
      try {
        const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=${lang}`;
        const { data } = yield import_axios3.default.get(url, { timeout: 5e3 });
        const title = mediaType === "movie" ? data.title : data.name;
        const originalTitle = mediaType === "movie" ? data.original_title : data.original_name;
        return { title, originalTitle };
      } catch (e) {
      }
    }
    return null;
  });
}
function findContentUrl(tmdbInfo, mediaType) {
  return __async(this, null, function* () {
    const { title, originalTitle } = tmdbInfo;
    const category = mediaType === "movie" ? "pelicula" : "serie";
    const slugs = [];
    if (title)
      slugs.push(buildSlug(title));
    if (originalTitle && originalTitle !== title)
      slugs.push(buildSlug(originalTitle));
    for (const slug of slugs) {
      const url = `${BASE}/${category}/${slug}/`;
      try {
        const { data } = yield import_axios3.default.get(url, { timeout: 8e3, headers: HEADERS });
        if (data.includes("trembed=") || data.includes("data-post=")) {
          console.log(`[SeriesMetro] \u2713 Encontrado: /${category}/${slug}/`);
          return { url, html: data };
        }
      } catch (e) {
      }
    }
    return null;
  });
}
function getEpisodeUrl(serieUrl, serieHtml, season, episode) {
  return __async(this, null, function* () {
    var _a;
    const dpost = (_a = serieHtml.match(/data-post="(\d+)"/)) == null ? void 0 : _a[1];
    if (!dpost)
      return null;
    try {
      const { data: epData } = yield import_axios3.default.post(
        `${BASE}/wp-admin/admin-ajax.php`,
        new URLSearchParams({ action: "action_select_season", post: dpost, season: String(season) }),
        { headers: __spreadProps(__spreadValues({}, HEADERS), { "Content-Type": "application/x-www-form-urlencoded", "Referer": serieUrl }) }
      );
      const epUrls = [...epData.matchAll(/href="([^"]+\/capitulo\/[^"]+)"/g)].map((m) => m[1]);
      return epUrls.find((u) => {
        const m = u.match(/temporada-(\d+)-capitulo-(\d+)/);
        return m && parseInt(m[1]) === season && parseInt(m[2]) === episode;
      }) || null;
    } catch (e) {
      return null;
    }
  });
}
function extractStreams(pageUrl, referer) {
  return __async(this, null, function* () {
    var _a;
    try {
      const { data } = yield import_axios3.default.get(pageUrl, { timeout: 8e3, headers: __spreadProps(__spreadValues({}, HEADERS), { "Referer": referer }) });
      const options = [...data.matchAll(/href="#options-(\d+)"[^>]*>[\s\S]*?<span class="server">([\s\S]*?)<\/span>/g)];
      const trids = [...data.matchAll(/\?trembed=(\d+)(?:&#038;|&)trid=(\d+)(?:&#038;|&)trtype=(\d+)/g)];
      if (trids.length === 0 || options.length === 0)
        return [];
      const trid = trids[0][2];
      const trtype = trids[0][3];
      const sorted = options.sort(([, , a], [, , b]) => {
        const aL = a.replace(/<[^>]+>/g, "").split("-").pop().trim().toLowerCase();
        const bL = b.replace(/<[^>]+>/g, "").split("-").pop().trim().toLowerCase();
        const ai = LANG_PRIORITY.indexOf(aL);
        const bi = LANG_PRIORITY.indexOf(bL);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
      const streams = [];
      for (const [, idx, srvRaw] of sorted) {
        const srvText = srvRaw.replace(/<[^>]+>/g, "").trim();
        const langRaw = srvText.split("-").pop().trim().toLowerCase();
        const lang = LANG_MAP[langRaw] || langRaw;
        try {
          const { data: embedPage } = yield import_axios3.default.get(
            `${BASE}/?trembed=${idx}&trid=${trid}&trtype=${trtype}`,
            { timeout: 8e3, headers: __spreadProps(__spreadValues({}, HEADERS), { "Referer": pageUrl }) }
          );
          const fastreamUrl = (_a = embedPage.match(/<iframe[^>]*src="(https?:\/\/fastream\.to\/[^"]+)"/i)) == null ? void 0 : _a[1];
          if (!fastreamUrl)
            continue;
          const stream = yield resolve(fastreamUrl);
          if (stream) {
            streams.push({
              langLabel: lang,
              serverLabel: "Fastream",
              url: stream.url,
              quality: stream.quality,
              headers: stream.headers
            });
          }
        } catch (e) {
        }
      }
      return streams;
    } catch (e) {
      return [];
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    if (!tmdbId || !mediaType)
      return [];
    try {
      const tmdbInfo = yield getTmdbData(tmdbId, mediaType);
      if (!tmdbInfo)
        return [];
      const found = yield findContentUrl(tmdbInfo, mediaType);
      if (!found)
        return [];
      let targetUrl = found.url;
      if (mediaType === "tv" && season && episode) {
        const epUrl = yield getEpisodeUrl(found.url, found.html, season, episode);
        if (!epUrl)
          return [];
        targetUrl = epUrl;
      }
      const streams = yield extractStreams(targetUrl, found.url);
      return yield finalizeStreams(streams, "SeriesMetro");
    } catch (e) {
      console.log(`[SeriesMetro] Error: ${e.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
