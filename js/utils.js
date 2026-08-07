const R = v => Math.round(v);
const RG = (v, g = CONFIG.PX) => Math.round(v / g) * g;

function pixelRect(x, y, w, h, c) {
    DOM.ctx.fillStyle = c;
    DOM.ctx.fillRect(R(x), R(y), R(w), R(h));
}

function getWeatherCategory(code) {
    if (code >= 200 && code < 300) return 'storm';
    if (code >= 300 && code < 400) return 'rain';
    if (code >= 500 && code < 600) return 'rain';
    if (code >= 600 && code < 700) return 'snow';
    if (code >= 701 && code < 800) return 'cloudy';
    if (code === 800) return 'clear';
    if (code === 801) return 'partly';
    if (code >= 802) return 'cloudy';
    return 'cloudy';
}

function resizeCanvas() {
    const d = devicePixelRatio || 1;
    State.W = window.innerWidth;
    State.H = window.innerHeight;
    DOM.canvas.width = State.W * d;
    DOM.canvas.height = State.H * d;
    DOM.canvas.style.width = State.W + 'px';
    DOM.canvas.style.height = State.H + 'px';
    DOM.ctx.setTransform(d, 0, 0, d, 0, 0);
}

function drawClock(timeStr) {
    if (!DOM.clockCtx) return;
    const ctx = DOM.clockCtx;
    ctx.clearRect(0, 0, 240, 96);
    const s = SpriteLoader.get('clock');
    if (s) s.draw(ctx, 0, 0, 3);
    ctx.fillStyle = '#88ccaa';
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(timeStr, 120, 48);
}

function drawCalendar() {
    if (!DOM.calendarCtx) return;
    const ctx = DOM.calendarCtx;
    ctx.clearRect(0, 0, 128, 192);
    
    calendarSprite.draw(ctx, 0, 0, 128, 192);
    
    ctx.fillStyle = '#666';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(CONFIG.MONTHS[State.month-1], 64, 70);
    
    ctx.fillStyle = '#2a2a3d';
    ctx.font = '36px "Press Start 2P", monospace';
    ctx.fillText(State.day, 64, 125);
    
    ctx.fillStyle = '#555';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(State.weekday, 64, 143);
}

function updateDisplay() {
    const now = new Date();
    const ts = now.toLocaleString('en-US', { timeZone: State.ipTimezone, hour12: false });
    const ds = now.toLocaleString('en-US', { timeZone: State.ipTimezone, weekday:'short', year:'numeric', month:'numeric', day:'numeric' });
    
    const tp = ts.split(', ')[1]?.split(':') || ['0','0','0'];
    State.hour = +tp[0] || 0;
    State.minute = +tp[1] || 0;
    State.second = +tp[2] || 0;
    
    const dp = ds.split(', ');
    const dn = dp[1]?.split('/') || ['1','1'];
    State.month = +dn[0] || 1;
    State.day = +dn[1] || 1;
    
    const wm = { Mon:'ПН', Tue:'ВТ', Wed:'СР', Thu:'ЧТ', Fri:'ПТ', Sat:'СБ', Sun:'ВС' };
    State.weekday = wm[dp[0]] || 'ПН';

    const t = `${String(State.hour).padStart(2,'0')}:${String(State.minute).padStart(2,'0')}:${String(State.second).padStart(2,'0')}`;
    
    drawClock(t);
    drawCalendar();
    DOM.dbTime.textContent = t;
}

function updateDebug() {
    DOM.dbIpCity.textContent = State.ipCity || '—';
    DOM.dbIpRegion.textContent = State.ipRegion || '—';
    DOM.dbIpCountry.textContent = State.ipCountry || '—';
    DOM.dbIpCoords.textContent = State.ipLat ? `${State.ipLat.toFixed(2)}, ${State.ipLon.toFixed(2)}` : '—';
    DOM.dbCity.textContent = `${State.apiCity}, ${State.country}`;
    DOM.dbCond.textContent = State.condition || '—';
    DOM.dbTemp.textContent = State.temp !== '' ? `${State.temp}°C` : '—';
    DOM.dbWind.textContent = State.wind !== '' ? `${State.wind} м/с` : '—';
    DOM.dbHum.textContent = State.humidity !== '' ? `${State.humidity}%` : '—';

    const wc = getWeatherCategory(State.conditionCode);
    const sm = { clear:'☀️ Ясно', partly:'⛅ Переменная', cloudy:'☁️ Облачно', rain:'🌧 Дождь', snow:'❄️ Снег', storm:'⛈ Гроза' };
    DOM.dbSky.textContent = sm[wc] || wc;
    DOM.dbSky.className = `debug-value ${wc==='clear'?'ok':'warn'}`;
    
    DOM.dbLight.textContent = switchSprite.state ? 'ВКЛ' : 'ВЫКЛ';
    DOM.dbLight.className = switchSprite.state ? 'debug-value ok' : 'debug-value';
}