/**
 * lamovie - Built from src/lamovie/
 * Generated: 2026-04-15T20:54:39.998Z
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
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

// src/utils/ua.js
var require_ua = __commonJS({
  "src/utils/ua.js"(exports, module2) {
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
  "src/utils/http.js"(exports, module2) {
    var { getRandomUA } = require_ua();
    var DEFAULT_CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36";
    var sessionUA = null;
    function setSessionUA(ua) {
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
    var DEFAULT_UA2 = getSessionUA();
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
            redirect: opt.redirect || "follow"
          }, opt, {
            headers
          });
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
    function fetchHtml2(url, options) {
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
      fetchHtml: fetchHtml2,
      fetchJson: fetchJson2,
      getSessionUA,
      setSessionUA,
      getStealthHeaders,
      DEFAULT_UA: DEFAULT_UA2,
      MOBILE_UA
    };
  }
});

// src/lamovie/index.js
var lamovie_exports = {};
__export(lamovie_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(lamovie_exports);

// src/resolvers/vimeos.js
var import_http = __toESM(require_http());
function resolve(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log("[Vimeos] Resolviendo Universal (v2.0): " + embedUrl);
      var html = yield (0, import_http.fetchHtml)(embedUrl, {
        headers: {
          "User-Agent": import_http.DEFAULT_UA,
          "Referer": "https://vimeos.net/",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });
      var vimeoIdMatch = html.match(/vimeo\.com\/video\/(\d+)/i);
      if (!vimeoIdMatch)
        vimeoIdMatch = embedUrl.match(/\/(\d{7,10})/);
      if (vimeoIdMatch) {
        var vimeoId = vimeoIdMatch[1];
        console.log("[Vimeos] ID Vimeo detectado: " + vimeoId + ". Consultado API Config...");
        try {
          var config = yield (0, import_http.fetchJson)("https://player.vimeo.com/video/" + vimeoId + "/config", {
            headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": embedUrl }
          });
          var hlsUrl = null;
          if (config && config.request && config.request.files && config.request.files.hls && config.request.files.hls.cdns && config.request.files.hls.cdns.default) {
            hlsUrl = config.request.files.hls.cdns.default.url;
          }
          if (hlsUrl) {
            console.log("[Vimeos] \u2713 HLS Directo encontrado.");
            return {
              url: hlsUrl,
              quality: "1080p",
              headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": "https://player.vimeo.com/" }
            };
          }
          var progressive = config && config.request && config.request.files ? config.request.files.progressive : null;
          if (progressive && progressive.length > 0) {
            var best = progressive.sort(function(a, b) {
              return (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0);
            })[0];
            console.log("[Vimeos] \u2713 MP4 Directo encontrado (" + best.quality + ").");
            return {
              url: best.url,
              quality: best.quality ? best.quality + "p" : "1080p",
              headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": "https://player.vimeo.com/" }
            };
          }
        } catch (apiErr) {
          console.log("[Vimeos] API Config Fall\xF3: " + apiErr.message);
        }
      }
      var packMatch = html.match(/eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]+?\}\('([\s\S]+?)',(\d+),(\d+),'([\s\S]+?)'\.split\('\|'\)/);
      if (packMatch) {
        console.log("[Vimeos] Usando Fallback Unpacker...");
        var payload = packMatch[1];
        var radix = parseInt(packMatch[2]);
        var symtab = packMatch[4].split("|");
        var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var unbase = function(str) {
          var result = 0;
          for (var i = 0; i < str.length; i++)
            result = result * radix + chars.indexOf(str[i]);
          return result;
        };
        var unpacked = payload.replace(/\b(\w+)\b/g, function(match) {
          var idx = unbase(match);
          return symtab[idx] && symtab[idx] !== "" ? symtab[idx] : match;
        });
        var m3u8Match = unpacked.match(/["']([^"']+\.m3u8[^"']*)['"]/i);
        if (m3u8Match) {
          var url = m3u8Match[1];
          return {
            url,
            quality: "1080p",
            headers: { "User-Agent": import_http.DEFAULT_UA, "Referer": "https://vimeos.net/" }
          };
        }
      }
      console.log("[Vimeos] No se encontr\xF3 video directo.");
      return null;
    } catch (err) {
      console.log("[Vimeos] Error cr\xEDtico: " + err.message);
      return null;
    }
  });
}

// src/lamovie/index.js
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
var HEADERS = { "User-Agent": UA, "Accept": "application/json" };
var BASE_URL = "https://la.movie";
var ANIME_COUNTRIES = ["JP", "CN", "KR"];
var GENRE_ANIMATION = 16;
var RESOLVERS = {
  //'goodstream.one': resolveGoodStream,
  //'hlswish.com': resolveHlswish,
  //'streamwish.com': resolveHlswish,
  //'streamwish.to': resolveHlswish,
  //'strwish.com': resolveHlswish,
  //'voe.sx': resolveVoe,
  //'filemoon.sx': resolveFilemoon,
  //'filemoon.to': resolveFilemoon,
  "vimeos.net": resolve
};
var IGNORED_HOSTS = [];
function httpGet(_0) {
  return __async(this, arguments, function* (url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeout || 8e3);
    const res = yield fetch(url, {
      headers: __spreadValues({ "User-Agent": UA }, options.headers),
      signal: controller.signal,
      redirect: "follow"
    });
    clearTimeout(timer);
    if (!res.ok)
      throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get("content-type") || "";
    return contentType.includes("json") ? res.json() : res.text();
  });
}
var normalizeQuality = (quality) => {
  const str = quality.toString().toLowerCase();
  const match = str.match(/(\d+)/);
  if (match)
    return `${match[1]}p`;
  if (str.includes("4k") || str.includes("uhd"))
    return "2160p";
  if (str.includes("full") || str.includes("fhd"))
    return "1080p";
  if (str.includes("hd"))
    return "720p";
  return "SD";
};
var getServerName = (url) => {
  if (url.includes("goodstream"))
    return "GoodStream";
  if (url.includes("hlswish") || url.includes("streamwish"))
    return "StreamWish";
  if (url.includes("voe.sx"))
    return "VOE";
  if (url.includes("filemoon"))
    return "Filemoon";
  if (url.includes("vimeos.net"))
    return "Vimeos";
  return "Online";
};
var getResolver = (url) => {
  try {
    if (IGNORED_HOSTS.some((h) => url.includes(h)))
      return null;
    for (const [pattern, resolver] of Object.entries(RESOLVERS)) {
      if (url.includes(pattern))
        return resolver;
    }
  } catch (e) {
  }
  return null;
};
function buildSlug(title, year) {
  const slug = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return year ? `${slug}-${year}` : slug;
}
function getCategories(mediaType, genres, originCountries) {
  if (mediaType === "movie")
    return ["peliculas"];
  const isAnimation = (genres || []).includes(GENRE_ANIMATION);
  if (!isAnimation)
    return ["series"];
  const isAnimeCountry = (originCountries || []).some((c) => ANIME_COUNTRIES.includes(c));
  if (isAnimeCountry)
    return ["animes"];
  return ["animes", "series"];
}
function getTmdbData(tmdbId, mediaType) {
  return __async(this, null, function* () {
    var _a;
    const attempts = [
      { lang: "es-MX", name: "Latino" },
      { lang: "en-US", name: "Ingl\xE9s" }
    ];
    for (const { lang, name } of attempts) {
      try {
        const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=${lang}`;
        const data = yield httpGet(url, { timeout: 5e3, headers: HEADERS });
        const title = mediaType === "movie" ? data.title : data.name;
        const originalTitle = mediaType === "movie" ? data.original_title : data.original_name;
        if (lang === "es-MX" && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(title))
          continue;
        console.log(`[LaMovie] TMDB (${name}): "${title}"${title !== originalTitle ? ` | Original: "${originalTitle}"` : ""}`);
        return {
          title,
          originalTitle,
          year: (data.release_date || data.first_air_date || "").substring(0, 4),
          genres: (data.genres || []).map((g) => g.id),
          originCountries: data.origin_country || ((_a = data.production_countries) == null ? void 0 : _a.map((c) => c.iso_3166_1)) || []
        };
      } catch (e) {
        console.log(`[LaMovie] Error TMDB ${name}: ${e.message}`);
      }
    }
    return null;
  });
}
var HTML_HEADERS = {
  "User-Agent": UA,
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-MX,es;q=0.9",
  "Connection": "keep-alive",
  "Upgrade-Insecure-Requests": "1"
};
function extractIdFromHtml(html) {
  const match = html.match(/rel=['"]shortlink['"]\s+href=['"][^'"]*\?p=(\d+)['"]/);
  return match ? match[1] : null;
}
function getIdBySlug(category, slug) {
  return __async(this, null, function* () {
    const url = `${BASE_URL}/${category}/${slug}/`;
    try {
      const html = yield httpGet(url, {
        timeout: 8e3,
        headers: HTML_HEADERS,
        validateStatus: (s) => s === 200
      });
      const id = extractIdFromHtml(html);
      if (id) {
        console.log(`[LaMovie] \u2713 Slug directo: /${category}/${slug} \u2192 id:${id}`);
        return { id };
      }
      return null;
    } catch (e) {
      return null;
    }
  });
}
function findBySlug(tmdbInfo, mediaType) {
  return __async(this, null, function* () {
    const { title, originalTitle, year, genres, originCountries } = tmdbInfo;
    const categories = getCategories(mediaType, genres, originCountries);
    const slugs = [];
    if (title)
      slugs.push(buildSlug(title, year));
    if (originalTitle && originalTitle !== title)
      slugs.push(buildSlug(originalTitle, year));
    for (const slug of slugs) {
      if (categories.length === 1) {
        const result = yield getIdBySlug(categories[0], slug);
        if (result)
          return result;
      } else {
        const results = yield Promise.allSettled(
          categories.map((cat) => getIdBySlug(cat, slug))
        );
        const found = results.find((r) => r.status === "fulfilled" && r.value);
        if (found)
          return found.value;
      }
    }
    return null;
  });
}
function getEpisodeId(seriesId, seasonNum, episodeNum) {
  return __async(this, null, function* () {
    var _a;
    const url = `${BASE_URL}/wp-api/v1/single/episodes/list?_id=${seriesId}&season=${seasonNum}&page=1&postsPerPage=50`;
    try {
      const data = yield httpGet(url, { timeout: 12e3, headers: HEADERS });
      if (!((_a = data == null ? void 0 : data.data) == null ? void 0 : _a.posts))
        return null;
      const ep = data.data.posts.find((e) => e.season_number == seasonNum && e.episode_number == episodeNum);
      return (ep == null ? void 0 : ep._id) || null;
    } catch (e) {
      console.log(`[LaMovie] Error episodios: ${e.message}`);
      return null;
    }
  });
}
function processEmbed(embed) {
  return __async(this, null, function* () {
    try {
      const resolver = getResolver(embed.url);
      if (!resolver) {
        console.log(`[LaMovie] Sin resolver para: ${embed.url}`);
        return null;
      }
      const result = yield resolver(embed.url);
      if (!result || !result.url)
        return null;
      const quality = normalizeQuality(embed.quality || "1080p");
      const serverName = getServerName(embed.url);
      return {
        name: "LaMovie",
        title: `${quality} \xB7 ${serverName}`,
        url: result.url,
        quality,
        headers: result.headers || {}
      };
    } catch (e) {
      console.log(`[LaMovie] Error procesando embed: ${e.message}`);
      return null;
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    var _a;
    if (!tmdbId || !mediaType)
      return [];
    const startTime = Date.now();
    console.log(`[LaMovie] Buscando: TMDB ${tmdbId} (${mediaType})${season ? ` S${season}E${episode}` : ""}`);
    try {
      const tmdbInfo = yield getTmdbData(tmdbId, mediaType);
      if (!tmdbInfo)
        return [];
      const found = yield findBySlug(tmdbInfo, mediaType);
      if (!found) {
        console.log("[LaMovie] No encontrado por slug");
        return [];
      }
      let targetId = found.id;
      if (mediaType === "tv" && season && episode) {
        const epId = yield getEpisodeId(targetId, season, episode);
        if (!epId) {
          console.log(`[LaMovie] Episodio S${season}E${episode} no encontrado`);
          return [];
        }
        targetId = epId;
      }
      const data = yield httpGet(
        `${BASE_URL}/wp-api/v1/player?postId=${targetId}&demo=0`,
        { timeout: 6e3, headers: HEADERS }
      );
      if (!((_a = data == null ? void 0 : data.data) == null ? void 0 : _a.embeds)) {
        console.log("[LaMovie] No hay embeds disponibles");
        return [];
      }
      const RESOLVER_TIMEOUT = 5e3;
      const embedPromises = data.data.embeds.map((embed) => processEmbed(embed));
      const streams = yield new Promise((resolve2) => {
        const results = [];
        let completed = 0;
        const total = embedPromises.length;
        const finish = () => resolve2(results.filter(Boolean));
        const timer = setTimeout(finish, RESOLVER_TIMEOUT);
        embedPromises.forEach((p) => {
          p.then((result) => {
            if (result)
              results.push(result);
            completed++;
            if (completed === total) {
              clearTimeout(timer);
              finish();
            }
          }).catch(() => {
            completed++;
            if (completed === total) {
              clearTimeout(timer);
              finish();
            }
          });
        });
      });
      const elapsed = ((Date.now() - startTime) / 1e3).toFixed(2);
      console.log(`[LaMovie] \u2713 ${streams.length} streams en ${elapsed}s`);
      return streams;
    } catch (e) {
      console.log(`[LaMovie] Error: ${e.message}`);
      return [];
    }
  });
}
