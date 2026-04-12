/**
 * gnulahd - Built from src/gnulahd/
 * Generated: 2026-04-12T23:08:37.477Z
 */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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

// src/gnulahd/index.js
var { spawnSync } = require("child_process");
var BASE_URL = "https://ww3.gnulahd.nu";
var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
function getUrl(_0) {
  return __async(this, arguments, function* (url, options = {}) {
    try {
      const curlOptions = [
        "-s",
        "-L",
        "--user-agent",
        USER_AGENT,
        "--header",
        "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "--header",
        "Accept-Language: es-ES,es;q=0.9",
        url
      ];
      const result = spawnSync("curl.exe", curlOptions, { encoding: "utf-8", timeout: 15e3 });
      if (result.status === 0 && result.stdout) {
        return result.stdout;
      }
    } catch (e) {
      console.log("[GnulaHD] Curl no disponible o error, usando fetch");
    }
    const response = yield fetch(url, __spreadValues({
      headers: __spreadValues({ "User-Agent": USER_AGENT }, options.headers)
    }, options));
    return yield response.text();
  });
}
function normalizeTitle(title) {
  return title.toLowerCase().replace(/[^\w\s]/gi, "").replace(/\s+/g, " ").trim();
}
function performSearch(query) {
  return __async(this, null, function* () {
    const searchUrl = `${BASE_URL}/?s=${encodeURIComponent(query)}`;
    const html = yield getUrl(searchUrl);
    const regex = new RegExp('<article class="bs"[^>]*>.*?<a href="([^"]+)"[^]*?title="([^"]+)"', "gs");
    const results = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      results.push({
        url: match[1],
        title: match[2]
      });
    }
    return results;
  });
}
function resolveByse(url) {
  return __async(this, null, function* () {
    const idMatch = url.match(/\/e\/([a-zA-Z0-9]+)/);
    if (!idMatch)
      return [];
    const id = idMatch[1];
    const apiUrl = `https://bysevepoin.com/api/videos/${id}/embed/details`;
    try {
      const result = spawnSync("curl.exe", [
        "-s",
        "-L",
        "-A",
        USER_AGENT,
        "-H",
        "Accept: */*",
        "-H",
        "x-embed-origin: ww3.gnulahd.nu",
        "-H",
        `x-embed-referer: ${BASE_URL}/`,
        "-H",
        `referer: ${url}`,
        apiUrl
      ], { encoding: "utf-8", timeout: 1e4 });
      if (result.status === 0 && result.stdout) {
        const data = JSON.parse(result.stdout);
        if (data && data.embed_frame_url) {
          return [{
            url: data.embed_frame_url,
            name: "Byse (Premium)",
            quality: "HD"
          }];
        }
      }
    } catch (e) {
      console.error(`[GnulaHD] Error resolviendo Byse (${id}):`, e.message);
    }
    return [];
  });
}
function extractStreamsFromPage(html, resolvers) {
  return __async(this, null, function* () {
    const streams = [];
    const dataMatch = html.match(new RegExp("var\\s+(_gd|_gnpv_ep_langs)\\s*=\\s*(\\[.*?\\]);", "s"));
    if (!dataMatch) {
      return streams;
    }
    try {
      const data = JSON.parse(dataMatch[2]);
      for (const langObj of data) {
        if (!langObj)
          continue;
        const langName = (langObj.label || langObj.name || "").toLowerCase();
        let lang = "LAT";
        if (langName.includes("latino"))
          lang = "LAT";
        else if (langName.includes("castellano") || langName.includes("espa\xF1ol"))
          lang = "ESP";
        else if (langName.includes("subtitulado"))
          lang = "SUB";
        const serverList = langObj.servers || langObj.data || [];
        for (const player of serverList) {
          let serverName = (player.title || player.name || "GNULA").toUpperCase();
          let streamUrl = player.src || "";
          if (!streamUrl && player.frame) {
            let frameMatch = player.frame.match(/src="([^"]+)"/);
            if (frameMatch)
              streamUrl = frameMatch[1];
          }
          if (!streamUrl)
            continue;
          if (streamUrl.startsWith("//"))
            streamUrl = "https:" + streamUrl;
          if (streamUrl.includes("bysevepoin.com")) {
            const byseStreams = yield resolveByse(streamUrl);
            streams.push(...byseStreams.map((s) => __spreadProps(__spreadValues({}, s), { lang })));
            continue;
          }
          const resolved = yield resolvers.resolve(streamUrl);
          if (resolved && resolved.length > 0) {
            streams.push(...resolved.map((s) => __spreadProps(__spreadValues({}, s), { lang })));
          } else {
            streams.push({
              url: streamUrl,
              name: `GnulaHD - ${serverName}`,
              lang,
              quality: "HD"
            });
          }
        }
      }
    } catch (e) {
      console.error("[GnulaHD] Error parseando datos de video:", e);
    }
    return streams;
  });
}
function getMovieStreams(url, resolvers) {
  return __async(this, null, function* () {
    const html = yield getUrl(url);
    return yield extractStreamsFromPage(html, resolvers);
  });
}
function getSeriesStreams(serieUrl, season, episode, resolvers) {
  return __async(this, null, function* () {
    const serieHtml = yield getUrl(serieUrl);
    const epSlug = `${season}x${episode.toString().padStart(2, "0")}`;
    const epRegex = new RegExp(`href="([^"]*?${epSlug}[^"]*?)"`, "i");
    const epMatch = serieHtml.match(epRegex);
    if (!epMatch) {
      const backupUrl = serieUrl.replace(/\/$/, "") + `-${season}x${episode.toString().padStart(2, "0")}/`;
      return yield extractStreamsFromPage(yield getUrl(backupUrl), resolvers);
    }
    const epHtml = yield getUrl(epMatch[1]);
    return yield extractStreamsFromPage(epHtml, resolvers);
  });
}
module.exports = {
  getStreams: (tmdbData, resolvers) => __async(exports, null, function* () {
    const { title, type, season, episode, year } = tmdbData;
    console.log(`[GnulaHD] Buscando: ${title} (${type})`);
    const results = yield performSearch(title);
    const normTarget = normalizeTitle(title);
    const firstWord = normTarget.split(" ")[0];
    const filtered = results.filter((r) => {
      const normFound = normalizeTitle(r.title);
      return normFound.includes(normTarget) || firstWord.length > 3 && normFound.includes(firstWord);
    });
    if (filtered.length === 0)
      return [];
    const best = filtered[0];
    console.log(`[GnulaHD] Seleccionado: ${best.title} -> ${best.url}`);
    if (type === "movie") {
      return yield getMovieStreams(best.url, resolvers);
    } else {
      return yield getSeriesStreams(best.url, season, episode, resolvers);
    }
  })
};
