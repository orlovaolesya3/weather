async function initializeApp() {
    initCanvas();
    resizeCanvas();
    
    // Загружаем всё параллельно
    await Promise.all([SpriteLoader.loadAll(), SoundSystem.loadAll()]);
    
    initClockCanvas(); initCalendarCanvas(); initSwitchCanvas();
    drawSwitch(); generateStars();

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
            drawClock(`${String(testHour).padStart(2,'0')}:${String(testMinute).padStart(2,'0')}:00`);
            DOM.dbTime.textContent = `${String(testHour).padStart(2,'0')}:${String(testMinute).padStart(2,'0')}:00 (test)`;
            DOM.dbTime.className = 'debug-value warn';
            return;
        }
        origUpdate();
    };

    // Погода и IP параллельно
    const [loc] = await Promise.all([getCityByIP().catch(() => null)]);
    if (loc) {
        State.ipCity = loc.city; State.ipRegion = loc.region; State.ipCountry = loc.country;
        State.ipLat = loc.lat; State.ipLon = loc.lon; State.ipTimezone = loc.timezone;
    }

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

    document.querySelector('.clock').classList.add('visible');
    document.querySelector('.calendar-wall').classList.add('visible');
    document.querySelector('.light-switch').classList.add('visible');

    const keys = {};
    document.addEventListener('keydown', e => {
        keys[e.key.toLowerCase()] = true;
        if (keys['d'] && keys['e'] && keys['b']) DOM.debug.classList.toggle('visible');
    });
    document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

    // Запускаем анимацию
    (function loop() { drawScene(); requestAnimationFrame(loop); })();
}

window.addEventListener('resize', resizeCanvas);
document.addEventListener('DOMContentLoaded', initializeApp);