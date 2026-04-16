const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function detectQuality(url, headers = {}) {
  try {
    if (!url || !url.includes('.m3u8')) return '1080p';

    const { data } = await axios.get(url, {
      timeout: 5000,
      headers: { 
        'User-Agent': UA,
        ...headers
      },
      responseType: 'text'
    });

    if (!data.includes('#EXT-X-STREAM-INF')) {
      const match = url.match(/[_-](\d{3,4})p/i);
      return match ? `${match[1]}p` : '1080p';
    }

    let maxRes = 0;
    const lines = data.split('\n');
    for (const line of lines) {
      const match = line.match(/RESOLUTION=\d+x(\d+)/i);
      if (match) {
        const res = parseInt(match[1]);
        if (res > maxRes) maxRes = res;
      }
    }

    if (maxRes > 0) {
      if (maxRes >= 2160) return '4K';
      if (maxRes >= 1080) return '1080p';
      if (maxRes >= 720) return '720p';
      if (maxRes >= 480) return '480p';
      return `${maxRes}p`;
    }

    return '1080p';
  } catch (e) {
    return '1080p';
  }
}

module.exports = { detectQuality };
