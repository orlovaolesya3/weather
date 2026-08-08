const $ = id => document.getElementById(id);

const DOM = {
    canvas: $('mainCanvas'), ctx: null,
    clockCanvas: null, clockCtx: null,
    calendarCanvas: null, calendarCtx: null,
    switchCanvas: null, switchCtx: null,
    dbIpCity: $('dbIpCity'), dbIpRegion: $('dbIpRegion'), dbIpCountry: $('dbIpCountry'),
    dbIpCoords: $('dbIpCoords'), dbCond: $('dbCond'), dbTemp: $('dbTemp'),
    dbWind: $('dbWind'), dbHum: $('dbHum'), dbTime: $('dbTime'), dbSky: $('dbSky'),
    dbLight: $('dbLight')
};

function initCanvas() {
    DOM.ctx = DOM.canvas.getContext('2d');
    DOM.ctx.imageSmoothingEnabled = false;
}

function initClockCanvas() {
    const c = document.createElement('canvas');
    c.id = 'clockCanvas'; c.width = 240; c.height = 96;
    c.style.cssText = 'image-rendering:pixelated;display:block';
    document.querySelector('.clock').innerHTML = '';
    document.querySelector('.clock').appendChild(c);
    DOM.clockCanvas = c;
    DOM.clockCtx = c.getContext('2d');
    DOM.clockCtx.imageSmoothingEnabled = false;
}

function initCalendarCanvas() {
    const c = document.createElement('canvas');
    c.id = 'calendarCanvas'; c.width = 128; c.height = 192;
    c.style.cssText = 'image-rendering:pixelated;display:block';
    document.querySelector('.calendar-wall').appendChild(c);
    DOM.calendarCanvas = c;
    DOM.calendarCtx = c.getContext('2d');
    DOM.calendarCtx.imageSmoothingEnabled = false;
}

function initSwitchCanvas() {
    const c = document.createElement('canvas');
    c.id = 'switchCanvas'; c.width = 96; c.height = 96;
    c.style.cssText = 'image-rendering:pixelated;display:block';
    const el = document.querySelector('.light-switch');
    el.appendChild(c);
    DOM.switchCanvas = c;
    DOM.switchCtx = c.getContext('2d');
    DOM.switchCtx.imageSmoothingEnabled = false;
    el.addEventListener('click', () => {
        switchSprite.toggle();
        drawSwitch();
        updateDebug();
    });
}

function drawSwitch() {
    if (!DOM.switchCtx) return;
    DOM.switchCtx.clearRect(0, 0, 96, 96);
    switchSprite.draw(DOM.switchCtx, 0, 0, 96, 96);
}