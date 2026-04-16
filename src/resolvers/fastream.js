const { fetchHtml, getSessionUA } = require('../utils/http.js');
const { detectQuality } = require('./quality.js');

const UA = getSessionUA();

function unpackPacker(data) {
  var match = data.match(/eval\(function\(p,a,c,k,e,d\)\{.*?\}\('([\s\S]*?)',(\d+),(\d+),'([\s\S]*?)'\.split\('\|'\)\)\)/);
  if (!match) return null;

  var p = match[1];
  var a = parseInt(match[2]);
  var c = parseInt(match[3]);
  var k = match[4].split('|');

  while (c--) {
    if (k[c]) p = p.replace(new RegExp('\\b' + c.toString(a) + '\\b', 'g'), k[c]);
  }
  return p;
}

async function resolve(url) {
  try {
    console.log("[Fastream] Resolviendo: " + url);
    var data = await fetchHtml(url, {
      headers: { 'User-Agent': UA, 'Referer': 'https://www3.seriesmetro.net/' }
    });

    var unpacked = unpackPacker(data);
    var m3u8Match;
    if (!unpacked) {
        m3u8Match = data.match(/file:"(https?:\/\/[^"]+\.m3u8[^"]*)"/);
        if (m3u8Match && m3u8Match[1]) {
            var url1 = m3u8Match[1];
            return { 
                url: url1, 
                quality: '1080p', 
                serverName: 'Fastream',
                headers: { 'User-Agent': UA, 'Referer': 'https://fastream.to/' } 
            };
        }
        return null;
    }

    m3u8Match = unpacked.match(/file:"(https?:\/\/[^"]+\.m3u8[^"]*)"/);
    if (!m3u8Match || !m3u8Match[1]) return null;

    var m3u8Url = m3u8Match[1];
    var quality = await detectQuality(m3u8Url, { 'Referer': 'https://fastream.to/' });
    return {
      url: m3u8Url,
      quality: quality || '1080p',
      serverName: 'Fastream',
      headers: { 'User-Agent': UA, 'Referer': 'https://fastream.to/' }
    };
  } catch (e) {
    console.log("[Fastream] Error: " + e.message);
    return null;
  }
}

module.exports = { resolve };
