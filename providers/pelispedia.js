/**
 * pelispedia - Built from src/pelispedia/
 * Generated: 2026-04-07T17:36:46.932Z
 */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
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

// src/pelispedia/index.js
var pelispedia_exports = {};
__export(pelispedia_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(pelispedia_exports);

// src/utils/string.js
function normalizeTitle(t) {
  if (!t)
    return "";
  return t.toLowerCase().replace(/[áàäâ]/g, "a").replace(/[éèëê]/g, "e").replace(/[íìïî]/g, "i").replace(/[óòöô]/g, "o").replace(/[úùüû]/g, "u").replace(/ñ/g, "n").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function calculateSimilarity(title1, title2) {
  const norm1 = normalizeTitle(title1);
  const norm2 = normalizeTitle(title2);
  if (norm1 === norm2)
    return 1;
  if (norm1.length > 5 && norm2.length > 5) {
    const ratio = Math.min(norm1.length, norm2.length) / Math.max(norm1.length, norm2.length);
    if ((norm2.includes(norm1) || norm1.includes(norm2)) && ratio > 0.8) {
      return 0.9;
    }
  }
  const words1 = new Set(norm1.split(/\s+/).filter((w) => w.length > 2));
  const words2 = new Set(norm2.split(/\s+/).filter((w) => w.length > 2));
  if (words1.size === 0 || words2.size === 0) {
    return norm1 === norm2 ? 1 : norm1.includes(norm2) || norm2.includes(norm1) ? 0.5 : 0;
  }
  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = /* @__PURE__ */ new Set([...words1, ...words2]);
  return intersection.size / union.size;
}

// src/pelispedia/extractor.js
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
function fetchText(url, referer) {
  return __async(this, null, function* () {
    try {
      const headers = { "User-Agent": UA };
      if (referer)
        headers["Referer"] = referer;
      const res = yield fetch(url, { headers });
      return yield res.text();
    } catch (e) {
      return "";
    }
  });
}
function extractStreams(url) {
  return __async(this, null, function* () {
    const html = yield fetchText(url);
    if (!html)
      return [];
    const streams = [];
    const embed69Re = /https?:\/\/embed69\.org\/f\/(tt\d+(-[\d]+x[\d]+)?)/gi;
    let m;
    while ((m = embed69Re.exec(html)) !== null) {
      streams.push({
        server: "Embed69",
        url: m[0],
        priority: 1
      });
    }
    const knownServers = ["Voe", "Filemoon", "Streamwish", "Vidhide", "Uqload"];
    const iframeRe = /https?:\/\/(voe\.sx|filemoon\.sx|bysedikamoum\.com|streamwish\.to|vidhide\.com|minochinos\.com|hglink\.to|audinifer\.com|uqload\.is|uqload\.com)\/([ae]\/)?([a-z0-9]+)/gi;
    while ((m = iframeRe.exec(html)) !== null) {
      const url2 = m[0];
      const domain = m[1].toLowerCase();
      let name = "Desconocido";
      if (domain.includes("voe"))
        name = "Voe";
      else if (domain.includes("filemoon") || domain.includes("bysedikamoum"))
        name = "Filemoon";
      else if (domain.includes("streamwish") || domain.includes("hglink") || domain.includes("audinifer"))
        name = "Streamwish";
      else if (domain.includes("vidhide") || domain.includes("minochinos"))
        name = "Vidhide";
      else if (domain.includes("uqload"))
        name = "Uqload";
      if (!streams.find((s) => s.url === url2)) {
        streams.push({
          server: name,
          url: url2,
          priority: 2
        });
      }
    }
    if (streams.length === 0) {
      const ttMatch = html.match(/tt\d{7,10}/);
      if (ttMatch) {
        const imdbId = ttMatch[0];
        const epMatch = url.match(/\/temporada\/(\d+)\/capitulo\/(\d+)/);
        let embedUrl = `https://embed69.org/f/${imdbId}`;
        if (epMatch) {
          const s = epMatch[1];
          const e = epMatch[2].padStart(2, "0");
          embedUrl += `-${s}x${e}`;
        }
        streams.push({
          server: "Embed69 (Auto)",
          url: embedUrl,
          priority: 1
        });
      }
    }
    console.log(`[Pelispedia Extractor] Found ${streams.length} stream(s).`);
    return streams;
  });
}

// src/pelispedia/index.js
var BASE = "https://pelispedia.mov";
var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var TMDB_KEY = "2dca580c2a14b55200e784d157207b4d";
function fetchText2(url) {
  return __async(this, null, function* () {
    try {
      const res = yield fetch(url, {
        headers: {
          "User-Agent": UA2,
          "Referer": BASE
        }
      });
      return yield res.text();
    } catch (e) {
      return "";
    }
  });
}
function getSpanishTitle(tmdbId, type) {
  return __async(this, null, function* () {
    if (!tmdbId || tmdbId === "dummy")
      return null;
    try {
      const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=es-MX`;
      const res = yield fetch(url);
      const data = yield res.json();
      return data.title || data.name || null;
    } catch (e) {
      return null;
    }
  });
}
function searchMedia(query) {
  return __async(this, null, function* () {
    const url = `${BASE}/search?s=${encodeURIComponent(query)}`;
    const html = yield fetchText2(url);
    if (!html)
      return [];
    const re = /<a[^>]+href="(https:\/\/pelispedia\.mov\/(pelicula|serie)\/([^"]+))"[^>]*title="([^"]+)"|<a[^>]+title="([^"]+)"[^>]+href="(https:\/\/pelispedia\.mov\/(pelicula|serie)\/([^"]+))"/gi;
    const results = [];
    let m;
    while ((m = re.exec(html)) !== null) {
      if (m[1]) {
        results.push({
          url: m[1],
          type: m[2],
          slug: m[3],
          title: m[4].replace(/&amp;/g, "&")
        });
      } else {
        results.push({
          url: m[6],
          type: m[7],
          slug: m[8],
          title: m[5].replace(/&amp;/g, "&")
        });
      }
    }
    if (results.length === 0) {
      const simpleRe = /href="(https:\/\/pelispedia\.mov\/(pelicula|serie)\/([^"]+))"/gi;
      while ((m = simpleRe.exec(html)) !== null) {
        results.push({
          url: m[1],
          type: m[2],
          slug: m[3],
          title: m[3].replace(/-/g, " ")
        });
      }
    }
    return results;
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    try {
      const type = (mediaType || "").toLowerCase();
      const tmdbType = type === "movie" ? "movie" : "tv";
      console.log(`[Pelispedia] Buscando: "${title}" (${type}) tmdbId: ${tmdbId}`);
      let matches = yield searchMedia(title);
      if (matches.length === 0 && tmdbId && tmdbId !== "dummy") {
        const esTitle = yield getSpanishTitle(tmdbId, tmdbType);
        if (esTitle && esTitle !== title) {
          console.log(`[Pelispedia] Reintentando con t\xEDtulo TMDB: "${esTitle}"`);
          matches = yield searchMedia(esTitle);
        }
      }
      if (matches.length === 0) {
        const firstWord = title.split(" ")[0];
        if (firstWord.length > 3) {
          matches = yield searchMedia(firstWord);
        }
      }
      if (matches.length === 0)
        return [];
      const normTarget = (title || "").toLowerCase();
      const bestMatch = matches.find((m) => {
        const normMatch = (m.title || "").toLowerCase();
        const sim = calculateSimilarity(normTarget, normMatch) || (normTarget === normMatch ? 1 : 0);
        const typeMatch = type === "movie" && m.type === "pelicula" || (type === "tv" || type === "series") && m.type === "serie";
        if (sim > 0.4 && typeMatch) {
          m.similarity = sim;
          return true;
        }
        return false;
      });
      if (!bestMatch) {
        console.log("[Pelispedia] No se encontr\xF3 coincidencia adecuada.");
        return [];
      }
      let targetUrl = bestMatch.url;
      if (type === "tv" || type === "series") {
        const s = season || 1;
        const e = episode || 1;
        targetUrl = `${BASE}/serie/${bestMatch.slug}/temporada/${s}/capitulo/${e}`;
      }
      console.log(`[Pelispedia] Extrayendo de: ${targetUrl}`);
      const streams = yield extractStreams(targetUrl);
      return streams;
    } catch (e) {
      console.error("[Pelispedia] Error:", e);
      return [];
    }
  });
}
