/**
 * Centralized Mirror Domains for Nuvio Latino
 * Centralizamos aquí todos los dominios para facilitar el mantenimiento.
 */

const MIRRORS = {
    VIDHIDE: [
        'vidhide', 'minochinos', 'vadisov', 'vaiditv', 'amusemre', 
        'callistanise', 'vhaudm', 'mdfury', 'dintezuvio', 'acek-cdn', 
        'vedonm', 'vidhidepro', 'vidhidevip', 'masukestin', 'vidoza'
    ],
    STREAMWISH: [
        'hlswish', 'streamwish', 'hglink', 'hglamioz', 'hglink.to', 
        'audinifer', 'embedwish', 'awish', 'dwish', 'strwish', 
        'filelions', 'wishembed', 'wishfast', 'hanerix'
    ],
    FILEMOON: [
        'filemoon', 'moonalu', 'moonembed', 'bysedikamoum', 
        'r66nv9ed', '398fitus', 'filemoon.sx', 'filemoon.to', 'bysedikamoum'
    ],
    VOE: [
        'voe.sx', 'voe-sx', 'voex.sx', 'marissashare', 'cloudwindow', 'marissasharecareer'
    ],
    FASTREAM: [
        'fastream', 'fastplay', 'fembed'
    ],
    OKRU: [
        'ok.ru', 'okru'
    ],
    PIXELDRAIN: [
        'pixeldrain'
    ],
    BUZZHEAVIER: [
        'buzzheavier', 'bzh.sh'
    ],
    GOODSTREAM: [
        'goodstream', 'gs.one'
    ],
    LULUSTREAM: [
        'lulustream', 'luluvdo', 'luluvids', 'pondy', 'lulupuv'
    ],
    SEEKSTREAMING: [
        'seekplays', 'seekstreaming', 'embedseek'
    ]
};

/**
 * Verifica si una URL pertenece a un grupo de espejos.
 */
function isMirror(url, groupName) {
    if (!url || !MIRRORS[groupName]) return false;
    const s = url.toLowerCase();
    return MIRRORS[groupName].some(m => s.includes(m));
}

module.exports = { MIRRORS, isMirror };
