/**
 * sololatino - Built from src/sololatino/
 * Generated: 2026-04-12T19:03:16.819Z
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

// src/sololatino/index.js
var axios = require("axios");
var BASE_URL = "https://player.pelisserieshoy.com";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36";
var HEADERS = {
  "User-Agent": UA,
  "Accept": "*/*",
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
  "X-Requested-With": "XMLHttpRequest",
  "Referer": "https://sololatino.net/"
};
function getImdbIdInternal(idOrQuery, mediaType) {
  return __async(this, null, function* () {
    const rawId = idOrQuery.toString().split(":")[0];
    if (rawId.startsWith("tt"))
      return rawId;
    try {
      const type = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
      const url = `https://api.themoviedb.org/3/${type}/${rawId}/external_ids?api_key=${TMDB_API_KEY}`;
      const { data } = yield axios.get(url, { timeout: 5e3 });
      return data.imdb_id || null;
    } catch (e) {
      return null;
    }
  });
}
function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
function getDirectStream(id, token, cookie, playerUrl) {
  return __async(this, null, function* () {
    try {
      const body = new URLSearchParams({ a: "2", tok: token, v: id }).toString();
      const config = {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          "referer": playerUrl,
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        })
      };
      if (cookie)
        config.headers["cookie"] = cookie;
      const { data } = yield axios.post(`${BASE_URL}/s.php`, body, config);
      return data && data.u ? { url: data.u, sig: data.sig } : null;
    } catch (e) {
      return null;
    }
  });
}
function decodeLink(encoded) {
  try {
    if (!encoded)
      return null;
    let decoded = Buffer.from(encoded, "base64").toString("utf-8");
    if (decoded.includes("http"))
      return decoded;
    decoded = Buffer.from(decoded, "base64").toString("utf-8");
    return decoded.includes("http") ? decoded : null;
  } catch (e) {
    return null;
  }
}
function resolveInternal(url) {
  return __async(this, null, function* () {
    if (!url)
      return null;
    try {
      const { data: html } = yield axios.get(url, { headers: { "User-Agent": UA }, timeout: 6e3 });
      const m3u8Match = html.match(/file\s*:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/"file"\s*:\s*"([^"]+)"/);
      if (m3u8Match)
        return { url: m3u8Match[1], quality: "HD" };
    } catch (e) {
    }
    return null;
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    if (!tmdbId)
      return [];
    const parts = tmdbId.toString().split(":");
    const realId = parts[0];
    const s = parseInt(parts[1] || season || 1);
    const e = parseInt(parts[2] || episode || 1);
    const isMovie = mediaType === "movie" || mediaType === "movies";
    const imdbId = yield getImdbIdInternal(realId, mediaType);
    if (!imdbId)
      return [];
    const results = [];
    const epStr = e < 10 ? `0${e}` : e;
    const slug = isMovie ? imdbId : `${imdbId}-${s}x${epStr}`;
    const playerUrl = `${BASE_URL}/f/${slug}`;
    try {
      const { data: html, headers: respHeaders } = yield axios.get(playerUrl, { headers: HEADERS });
      const cookie = (respHeaders["set-cookie"] || []).map((c) => c.split(";")[0]).join("; ");
      const tokenMatch = html.match(/(?:let\s+token|const\s+_t)\s*=\s*'([^']+)'/);
      if (tokenMatch && tokenMatch[1]) {
        const token = tokenMatch[1];
        const postH = __spreadProps(__spreadValues({}, HEADERS), {
          "referer": playerUrl,
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        });
        if (cookie)
          postH["cookie"] = cookie;
        yield axios.post(`${BASE_URL}/s.php`, "a=click&tok=" + token, { headers: postH });
        yield sleep(1e3);
        const { data: scanData } = yield axios.post(`${BASE_URL}/s.php`, "a=1&tok=" + token, { headers: postH });
        const servers = scanData && scanData.langs_s && scanData.langs_s.LAT || scanData && scanData.s || [];
        for (const ser of servers.slice(0, 10)) {
          const [name, id] = Array.isArray(ser) ? ser : [ser[0], ser[1]];
          const direct = yield getDirectStream(id, token, cookie, playerUrl);
          if (direct && direct.url) {
            let finalUrl = direct.url;
            if (direct.sig)
              finalUrl = `${BASE_URL}/p.php?url=${encodeURIComponent(direct.url)}&sig=${direct.sig}`;
            results.push({
              name: "SoloLatino",
              title: `[HD] | Latino | ${name}`,
              url: finalUrl,
              quality: "HD",
              headers: { "User-Agent": UA, "Referer": playerUrl, "Origin": BASE_URL }
            });
          }
        }
      }
    } catch (e2) {
    }
    if (results.length === 0) {
      try {
        const mirrorUrl = `https://embed69.org/f/${slug}`;
        const { data: html } = yield axios.get(mirrorUrl, { headers: { "User-Agent": UA, "Referer": "https://embed69.org/" }, timeout: 4e3 });
        const dataLinkMatch = html.match(/let\s+dataLink\s*=\s*(\[[\s\S]*?\]);/);
        if (dataLinkMatch) {
          const dataLink = JSON.parse(dataLinkMatch[1]);
          for (const section of dataLink) {
            if (section.video_language !== "LAT")
              continue;
            for (const emb of section.sortedEmbeds || []) {
              const iframeUrl = decodeLink(emb.link);
              if (iframeUrl) {
                const resolved = yield resolveInternal(iframeUrl);
                if (resolved) {
                  results.push({
                    name: "SoloLatino",
                    title: `[HD] | Latino | ${emb.servername || "Mirror"}`,
                    url: resolved.url,
                    quality: "HD"
                  });
                }
              }
            }
          }
        }
      } catch (e2) {
      }
    }
    return results;
  });
}
module.exports = { getStreams };
