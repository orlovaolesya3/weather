// DOM-элементы
const $ = id => document.getElementById(id);

const DOM = {
    canvas: $('streetCanvas'),
    ctx: null,
    
    clock: $('clockTime'),
    calMonth: $('calMonth'),
    calDay: $('calDay'),
    calWeekday: $('calWeekday'),
    
    // IP информация
    dbIpCity: $('dbIpCity'),
    dbIpRegion: $('dbIpRegion'),
    dbIpCountry: $('dbIpCountry'),
    dbIpCoords: $('dbIpCoords'),
    
    // Погода
    dbCity: $('dbCity'),
    dbCond: $('dbCond'),
    dbTemp: $('dbTemp'),
    dbWind: $('dbWind'),
    dbHum: $('dbHum'),
    
    // Система
    dbTime: $('dbTime'),
    dbSky: $('dbSky')
};

// Инициализация контекста
function initCanvas() {
    DOM.ctx = DOM.canvas.getContext('2d');
    DOM.ctx.imageSmoothingEnabled = false;
}