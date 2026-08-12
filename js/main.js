async function initializeApp() {
    initCanvas();
    resizeCanvas();
    
    await Promise.all([SpriteLoader.loadAll(), SoundSystem.loadAll()]);
    generateStars();

    const soundToggle = document.getElementById('soundToggle');
    const soundVolume = document.getElementById('soundVolume');
    soundToggle.textContent = '▷';
    
    soundToggle.addEventListener('click', () => {
        SoundSystem.toggleMute();
        if (!SoundSystem.muted && SoundSystem.currentSound) {
            const s = SoundSystem.sounds[SoundSystem.currentSound];
            if (s) { s.volume = SoundSystem.masterVolume; s.play().catch(() => {}); }
        }
    });
    soundVolume.addEventListener('input', () => SoundSystem.setMasterVolume(parseInt(soundVolume.value) / 100));

    let testHour = null, testMinute = null, testWeather = null;

    document.getElementById('timeSlider').addEventListener('input', () => {
        const m = parseInt(document.getElementById('timeSlider').value);
        testHour = Math.floor(m / 60); testMinute = m % 60;
        document.getElementById('testTime').textContent = `${String(testHour).padStart(2,'0')}:${String(testMinute).padStart(2,'0')}`;
    });

    document.querySelectorAll('.weather-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.weather-btn').forEach(b => b.style.borderColor = '#4a4a6e');
            btn.style.borderColor = '#ffaa66';
            testWeather = btn.dataset.weather === 'real' ? null : btn.dataset.weather;
            applyTestWeather();
        });
    });

    function applyTestWeather() {
        const codes = { clear:0, partly:2, cloudy:3, rain:63, snow:73, storm:95 };
        State.conditionCode = testWeather ? codes[testWeather] || 3 : State.conditionCode;
        generateWeatherParticles(getWeatherCategory(State.conditionCode));
        const h = testHour !== null ? testHour : State.hour;
        SoundSystem.update(State.conditionCode, State.wind || 5, h, h < 6 || h >= 20);
    }

    const origUpdate = updateDisplay;
    updateDisplay = function() {
        if (testHour !== null) {
            State.hour = testHour; State.minute = testMinute; State.second = 0;
            DOM.dbTime.textContent = `${String(testHour).padStart(2,'0')}:${String(testMinute).padStart(2,'0')}:00 (test)`;
            DOM.dbTime.className = 'debug-value warn';
            return;
        }
        origUpdate();
    };

    try {
        const loc = await getCityByIP();
        State.ipCity = loc.city; State.ipRegion = loc.region; State.ipCountry = loc.country;
        State.ipLat = loc.lat; State.ipLon = loc.lon; State.ipTimezone = loc.timezone;
    } catch { State.ipTimezone = 'Europe/Moscow'; }

    try {
        const w = await getWeatherByCoords(State.ipLat, State.ipLon);
        State.apiCity = State.ipCity; State.country = State.ipCountry;
        State.condition = w.condition.text; State.conditionCode = w.condition.code;
        State.temp = Math.round(w.temp_c); State.wind = Math.round(w.wind_speed); State.humidity = w.humidity;
        State.loaded = true;
    } catch {
        State.apiCity = State.ipCity || 'Moscow'; State.country = State.ipCountry || 'Russia';
        State.condition = 'Partly cloudy'; State.conditionCode = 2;
        State.temp = 22; State.wind = 3; State.humidity = 55;
    }

    generateWeatherParticles(getWeatherCategory(State.conditionCode));
    updateDisplay(); updateDebug();
    SoundSystem.update(State.conditionCode, State.wind, State.hour, State.hour < 6 || State.hour >= 20);

    setInterval(() => {
        updateDisplay(); updateDebug();
        const n = State.hour < 6 || State.hour >= 20;
        SoundSystem.update(State.conditionCode, State.wind, State.hour, n);
    }, 1000);

    setInterval(async () => {
        if (testWeather) return;
        try {
            const w = await getWeatherByCoords(State.ipLat, State.ipLon);
            State.apiCity = State.ipCity; State.country = State.ipCountry;
            State.condition = w.condition.text; State.conditionCode = w.condition.code;
            State.temp = Math.round(w.temp_c); State.wind = Math.round(w.wind_speed); State.humidity = w.humidity;
            State.loaded = true;
            generateWeatherParticles(getWeatherCategory(State.conditionCode));
        } catch {}
    }, 30 * 60 * 1000);

    DOM.canvas.addEventListener('click', (e) => {
        const rect = DOM.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        
        const rs = Math.max(State.W / roomSprite.width, State.H / roomSprite.height);
        const roomX = (State.W - roomSprite.width * rs) / 2;
        const roomY = (State.H - roomSprite.height * rs) / 2;
        const winX = roomX + CONFIG.WINDOW.x1 * rs;
        const winW = (CONFIG.WINDOW.x2 - CONFIG.WINDOW.x1) * rs;
        const winH = (CONFIG.WINDOW.y2 - CONFIG.WINDOW.y1) * rs;
        const swX = winX + winW + 100 * rs;
        const swY = roomY + CONFIG.WINDOW.y1 * rs + winH * .48;
        
        if (mx >= swX && mx <= swX + 96 && my >= swY && my <= swY + 96) {
            switchSprite.toggle();
            updateDebug();
        }
    });

    const keys = {};
    document.addEventListener('keydown', e => {
        keys[e.key.toLowerCase()] = true;
        if (keys['d'] && keys['e'] && keys['b']) DOM.debug.classList.toggle('visible');
    });
    document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

    (function loop() { drawScene(); requestAnimationFrame(loop); })();
}

window.addEventListener('resize', resizeCanvas);
document.addEventListener('DOMContentLoaded', initializeApp);