import axios from 'axios';

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const PHM_API = 'https://api.playhubmax.com/api';
const AES_KEY_STR = '33dff3b1c1362e45e1425fcc9724d6f3';
const AES_IV_STR = '33dff3b1c1362e45';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const API_HEADERS = {
    'User-Agent': UA,
    'Accept': 'application/json, text/plain, */*',
    'Origin': 'https://www.playhubmax.com',
    'Referer': 'https://www.playhubmax.com/'
};

/* --- AES Implementation (from compiled source) --- */
const AES_SBOX = [99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164, 114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214, 179, 41, 227, 47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239, 170, 251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245, 188, 182, 218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61, 100, 93, 25, 115, 96, 129, 79, 220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224, 50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109, 141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37, 46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138, 112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29, 158, 225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223, 140, 161, 137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187, 22];
const AES_SBOX_INV = (() => { const inv = new Array(256); for (let i = 0; i < 256; i++) inv[AES_SBOX[i]] = i; return inv; })();
const AES_RCON = [1, 2, 4, 8, 16, 32, 64, 128, 27, 54];

function gmul(a, b) { let p = 0; for (let i = 0; i < 8; i++) { if (b & 1) p ^= a; let hbs = a & 128; a = (a << 1) & 255; if (hbs) a ^= 27; b >>= 1; } return p; }
function aesKeyExpansion(keyBytes) {
    let w = []; for (let i = 0; i < 8; i++) w[i] = keyBytes.slice(i * 4, i * 4 + 4);
    for (let i = 8; i < 60; i++) {
        let temp = w[i - 1].slice();
        if (i % 8 === 0) {
            let rot = [temp[1], temp[2], temp[3], temp[0]];
            temp = [AES_SBOX[rot[0]], AES_SBOX[rot[1]], AES_SBOX[rot[2]], AES_SBOX[rot[3]]];
            temp[0] ^= AES_RCON[i / 8 - 1];
        } else if (i % 8 === 4) { temp = [AES_SBOX[temp[0]], AES_SBOX[temp[1]], AES_SBOX[temp[2]], AES_SBOX[temp[3]]]; }
        w[i] = [w[i - 8][0] ^ temp[0], w[i - 8][1] ^ temp[1], w[i - 8][2] ^ temp[2], w[i - 8][3] ^ temp[3]];
    }
    return w;
}

function aesDecryptBlock(block, roundKeys) {
    let s = [[block[0], block[1], block[2], block[3]], [block[4], block[5], block[6], block[7]], [block[8], block[9], block[10], block[11]], [block[12], block[13], block[14], block[15]]];
    for (let c = 0; c < 4; c++) { let rk = roundKeys[56 + c]; for (let r = 0; r < 4; r++) s[c][r] ^= rk[r]; }
    for (let round = 13; round >= 1; round--) {
        let t1 = s[3][1]; s[3][1] = s[2][1]; s[2][1] = s[1][1]; s[1][1] = s[0][1]; s[0][1] = t1;
        let t2 = s[0][2]; s[0][2] = s[2][2]; s[2][2] = t2; t2 = s[1][2]; s[1][2] = s[3][2]; s[3][2] = t2;
        let t3 = s[0][3]; s[0][3] = s[1][3]; s[1][3] = s[2][3]; s[2][3] = s[3][3]; s[3][3] = t3;
        for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) s[c][r] = AES_SBOX_INV[s[c][r]];
        for (let c = 0; c < 4; c++) { let rk = roundKeys[round * 4 + c]; for (let r = 0; r < 4; r++) s[c][r] ^= rk[r]; }
        for (let c = 0; c < 4; c++) {
            let a = s[c].slice();
            s[c][0] = gmul(a[0], 14) ^ gmul(a[1], 11) ^ gmul(a[2], 13) ^ gmul(a[3], 9);
            s[c][1] = gmul(a[0], 9) ^ gmul(a[1], 14) ^ gmul(a[2], 11) ^ gmul(a[3], 13);
            s[c][2] = gmul(a[0], 13) ^ gmul(a[1], 9) ^ gmul(a[2], 14) ^ gmul(a[3], 11);
            s[c][3] = gmul(a[0], 11) ^ gmul(a[1], 13) ^ gmul(a[2], 9) ^ gmul(a[3], 14);
        }
    }
    let t1 = s[3][1]; s[3][1] = s[2][1]; s[2][1] = s[1][1]; s[1][1] = s[0][1]; s[0][1] = t1;
    let t2 = s[0][2]; s[0][2] = s[2][2]; s[2][2] = t2; t2 = s[1][2]; s[1][2] = s[3][2]; s[3][2] = t2;
    let t3 = s[0][3]; s[0][3] = s[1][3]; s[1][3] = s[2][3]; s[2][3] = s[3][3]; s[3][3] = t3;
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) s[c][r] = AES_SBOX_INV[s[c][r]];
    for (let c = 0; c < 4; c++) { let rk = roundKeys[c]; for (let r = 0; r < 4; r++) s[c][r] ^= rk[r]; }
    let out = []; for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) out.push(s[c][r]);
    return out;
}

function decryptSources(b64) {
    try {
        let key = Array.from(Buffer.from(AES_KEY_STR, 'utf8'));
        let iv = Array.from(Buffer.from(AES_IV_STR, 'utf8'));
        let ct = Array.from(Buffer.from(b64, 'base64'));
        let roundKeys = aesKeyExpansion(key);
        let plain = []; let prev = iv;
        for (let i = 0; i < ct.length; i += 16) {
            let block = ct.slice(i, i + 16);
            let dec = aesDecryptBlock(block, roundKeys);
            for (let j = 0; j < 16; j++) plain.push(dec[j] ^ prev[j]);
            prev = block;
        }
        let pad = plain[plain.length - 1]; if (pad < 1 || pad > 16) return [];
        let json = Buffer.from(plain.slice(0, plain.length - pad)).toString('utf8');
        return JSON.parse(json);
    } catch { return []; }
}

/* --- API Functions --- */
async function searchContents(q) {
    try {
        const { data } = await axios.get(`${PHM_API}/US/en/contents?q=${encodeURIComponent(q)}`, { headers: API_HEADERS, timeout: 8000 });
        return data.data || [];
    } catch { return []; }
}

async function getSources(type, uuid) {
    try {
        const { data } = await axios.get(`${PHM_API}/${type}/${uuid}/sources`, { headers: API_HEADERS, timeout: 8000 });
        if (!data.data) return [];
        const sources = decryptSources(data.data);
        return sources.filter(s => s.languages?.includes('es'));
    } catch { return []; }
}

async function getContentDetail(uuid) {
    try {
        const { data } = await axios.get(`${PHM_API}/en/contents/${uuid}`, { headers: API_HEADERS, timeout: 8000 });
        return data;
    } catch { return {}; }
}

export async function getStreams(tmdbId, mediaType, season, episode) {
    try {
        const type = (mediaType === 'series' || mediaType === 'tv') ? 'tv' : 'movie';
        const { data: tmdbInfo } = await axios.get(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-MX`);
        const title = type === 'movie' ? tmdbInfo.title : tmdbInfo.name;
        if (!title) return [];

        const candidates = await searchContents(title);
        const match = candidates.find(c => c.title?.toLowerCase() === title.toLowerCase());
        if (!match) return [];

        let finalSources = [];
        if (type === 'tv') {
            const detail = await getContentDetail(match.uuid);
            const seasonObj = detail.seasons?.find(s => parseInt(s.seasonNumber) === parseInt(season));
            if (!seasonObj) return [];
            
            const { data: episodes } = await axios.get(`${PHM_API}/en/episodes?season_id=${seasonObj.id}`, { headers: API_HEADERS });
            const ep = episodes.data?.find(e => parseInt(e.episodeNumber) === parseInt(episode));
            if (!ep) return [];
            
            finalSources = await getSources('episode', ep.uuid);
        } else {
            finalSources = await getSources('content', match.uuid);
        }

        return finalSources.map(s => ({
            name: 'PlayHubMax',
            title: `[LAT] PlayHub · ${s.hostName || 'Stream'}`,
            url: s.url,
            quality: '1080p',
            headers: { 'User-Agent': UA, 'Referer': 'https://www.playhubmax.com/' }
        }));

    } catch (e) {
        console.error('[PlayHubMax] error:', e.message);
        return [];
    }
}
