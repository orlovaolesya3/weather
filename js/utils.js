// Утилиты
const R = v => Math.round(v);
const RG = (v, g = CONFIG.PX) => Math.round(v / g) * g;

function pixelRect(x, y, w, h, color) {
    DOM.ctx.fillStyle = color;
    DOM.ctx.fillRect(R(x), R(y), R(w), R(h));
}

function getWeatherCategory(code) {
    if (code === 1000) return 'clear';
    if (code === 1003) return 'partly';
    if ((code >= 1006 && code <= 1030) || code === 1135 || code === 1147) return 'cloudy';
    if ((code >= 1063 && code <= 1201) || (code >= 1240 && code <= 1246) || 
        code === 1273 || code === 1276) return 'rain';
    if ((code >= 1066 && code <= 1237 && code !== 1087) || 
        (code >= 1249 && code <= 1264) || code === 1279 || code === 1282) return 'snow';
    if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 'storm';
    return 'cloudy';
}

function resizeCanvas() {
    const rect = document.querySelector('.window').getBoundingClientRect();
    const dpr = devicePixelRatio || 1;
    State.W = rect.width;
    State.H = rect.height;
    DOM.canvas.width = State.W * dpr;
    DOM.canvas.height = State.H * dpr;
    DOM.canvas.style.width = State.W + 'px';
    DOM.canvas.style.height = State.H + 'px';
    DOM.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function updateDisplay() {
    const now = new Date();
    State.hour = now.getHours();
    State.minute = now.getMinutes();
    State.second = now.getSeconds();
    State.day = now.getDate();
    State.month = now.getMonth() + 1;
    State.weekday = CONFIG.WEEKDAYS[now.getDay()];

    const timeStr = `${String(State.hour).padStart(2, '0')}:${String(State.minute).padStart(2, '0')}:${String(State.second).padStart(2, '0')}`;
    
    DOM.clock.textContent = timeStr;
    DOM.calMonth.textContent = CONFIG.MONTHS[State.month - 1];
    DOM.calDay.textContent = State.day;
    DOM.calWeekday.textContent = State.weekday;
    DOM.dbTime.textContent = timeStr;
}

function updateDebug() {
    DOM.dbCity.textContent = `${State.city}, ${State.country}`;
    DOM.dbCond.textContent = State.condition || '—';
    DOM.dbTemp.textContent = State.temp !== '' ? `${State.temp}°C` : '—';
    DOM.dbWind.textContent = State.wind !== '' ? `${State.wind} м/с` : '—';
    DOM.dbHum.textContent = State.humidity !== '' ? `${State.humidity}%` : '—';

    const wc = getWeatherCategory(State.conditionCode);
    const skyMap = {
        clear: '☀️ Ясно',
        partly: '⛅ Переменная',
        cloudy: '☁️ Облачно',
        rain: '🌧 Дождь',
        snow: '❄️ Снег',
        storm: '⛈ Гроза'
    };
    
    DOM.dbSky.textContent = skyMap[wc] || wc;
    DOM.dbSky.className = `debug-value ${wc === 'clear' ? 'ok' : 'warn'}`;
}