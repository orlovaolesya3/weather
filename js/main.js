async function initializeApp() {
    initCanvas();
    await SpriteLoader.loadAll();
    await SoundSystem.loadAll();
    initClockCanvas(); initCalendarCanvas(); initSwitchCanvas();
    drawSwitch(); resizeCanvas(); generateStars();

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
        const isNight = testHour !== null ? (testHour < 6 || testHour >= 20) : (State.hour < 6 || State.hour >= 20);
        SoundSystem.update(State.conditionCode, State.wind || 5, testHour !== null ? testHour : State.hour, isNight);
    }

    const origUpdate = updateDisplay;
    updateDisplay = function() {
        if (testHour !== null) {
            State.hour = testHour; State.minute = testMinute; State.second = 0;
            drawClock(`${String(testHour).padStart(2,'0')}:${String(testMinute).padStart(2,'0')}:00`);
            DOM.dbTime.textContent = `${String(testHour).padStart(2,'0')}:${String(testMinute).padStart(2,'0')}:00 (тест)`;
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
        State.condition = 'Переменная облачность'; State.conditionCode = 2;
        State.temp = 22; State.wind = 3; State.humidity = 55;
    }

    generateWeatherParticles(getWeatherCategory(State.conditionCode));
    updateDisplay(); updateDebug();
    const isNight = State.hour < 6 || State.hour >= 20;
    SoundSystem.update(State.conditionCode, State.wind, State.hour, isNight);

    setInterval(() => {
        updateDisplay(); updateDebug();
        const isNight = State.hour < 6 || State.hour >= 20;
        SoundSystem.update(State.conditionCode, State.wind, State.hour, isNight);
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
            const isNight = State.hour < 6 || State.hour >= 20;
            SoundSystem.update(State.conditionCode, State.wind, State.hour, isNight);
        } catch {}
    }, 30 * 60 * 1000);

    document.querySelector('.clock').classList.add('visible');
    document.querySelector('.calendar-wall').classList.add('visible');
    document.querySelector('.light-switch').classList.add('visible');

    (function loop() { drawScene(); requestAnimationFrame(loop); })();
}

window.addEventListener('resize', resizeCanvas);
document.addEventListener('DOMContentLoaded', initializeApp);