const $ = id => document.getElementById(id);

const DOM = {
    canvas: $('mainCanvas'), ctx: null,
    debug: $('debug'),
    dbIpCity: $('dbIpCity'), dbIpRegion: $('dbIpRegion'), dbIpCountry: $('dbIpCountry'),
    dbIpCoords: $('dbIpCoords'), dbCond: $('dbCond'), dbTemp: $('dbTemp'),
    dbWind: $('dbWind'), dbHum: $('dbHum'), dbTime: $('dbTime'), dbSky: $('dbSky'),
    dbLight: $('dbLight')
};

function initCanvas() {
    DOM.ctx = DOM.canvas.getContext('2d');
    DOM.ctx.imageSmoothingEnabled = false;
}