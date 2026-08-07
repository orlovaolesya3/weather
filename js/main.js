async function initializeApp() {
    await CONFIG.loadApiKey();
    initCanvas();
    await SpriteLoader.loadAll();
    initClockCanvas();
    initCalendarCanvas();
    initSwitchCanvas();
    drawSwitch();
    resizeCanvas();
    generateStars();

    let testHour = null;
    let testMinute = null;
    let testWeather = null;

    const timeSlider = document.getElementById('timeSlider');
    const testTimeDisplay = document.getElementById('testTime');
    
    timeSlider.addEventListener('input', () => {
        const totalMinutes = parseInt(timeSlider.value);
        testHour = Math.floor(totalMinutes / 60);
        testMinute = totalMinutes % 60;
        const h = String(testHour).padStart(2, '0');
        const m = String(testMinute).padStart(2, '0');
        testTimeDisplay.textContent = `${h}:${m}`;
    });

    const weatherButtons = document.querySelectorAll('.weather-btn');
    weatherButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            weatherButtons.forEach(b => b.style.borderColor = '#4a4a6e');
            btn.style.borderColor = '#ffaa66';
            testWeather = btn.dataset.weather;
            if (testWeather === 'real') testWeather = null;
            applyTestWeather();
        });
    });

    function applyTestWeather() {
        if (!testWeather) {
            generateWeatherParticles(getWeatherCategory(State.conditionCode));
            return;
        }
        const configs = { 'clear':'clear', 'partly':'partly', 'cloudy':'cloudy', 'rain':'rain', 'snow':'snow', 'storm':'storm' };
        generateWeatherParticles(configs[testWeather] || 'cloudy');
        const codes = { clear:800, partly:801, cloudy:803, rain:500, snow:601, storm:202 };
        State.conditionCode = codes[testWeather] || 803;
    }

    const originalUpdateDisplay = updateDisplay;
    updateDisplay = function() {
        if (testHour !== null) {
            State.hour = testHour;
            State.minute = testMinute;
            State.second = 0;
            const timeStr = `${String(testHour).padStart(2, '0')}:${String(testMinute).padStart(2, '0')}:00`;
            drawClock(timeStr);
            DOM.dbTime.textContent = timeStr + ' (тест)';
            DOM.dbTime.className = 'debug-value warn';
            return;
        }
        originalUpdateDisplay();
    };

    try {
        const loc = await getCityByIP();
        State.ipCity = loc.city; State.ipRegion = loc.region; State.ipCountry = loc.country;
        State.ipLat = loc.lat; State.ipLon = loc.lon; State.ipTimezone = loc.timezone;
    } catch {
        State.ipTimezone = 'Europe/Moscow';
    }

    try {
        let w;
        try { w = await getWeatherByCoords(State.ipLat, State.ipLon); }
        catch { w = await getWeatherData(State.ipCity); }
        State.apiCity = w.city_name || State.ipCity;
        State.country = w.country || State.ipCountry;
        State.condition = w.condition.text;
        State.conditionCode = w.condition.code;
        State.temp = Math.round(w.temp_c);
        State.wind = Math.round(w.wind_speed);
        State.humidity = w.humidity;
        State.loaded = true;
    } catch {
        State.apiCity = State.ipCity || 'Moscow';
        State.country = State.ipCountry || 'Russia';
        State.condition = 'Переменная облачность';
        State.conditionCode = 802;
        State.temp = 22; State.wind = 3; State.humidity = 55;
    }

    generateWeatherParticles(getWeatherCategory(State.conditionCode));
    updateDisplay(); updateDebug();
    setInterval(() => { updateDisplay(); updateDebug(); }, 1000);

    setInterval(async () => {
        if (testWeather) return;
        try {
            const w = await getWeatherByCoords(State.ipLat, State.ipLon);
            State.apiCity = w.city_name || State.ipCity;
            State.country = w.country || State.ipCountry;
            State.condition = w.condition.text;
            State.conditionCode = w.condition.code;
            State.temp = Math.round(w.temp_c);
            State.wind = Math.round(w.wind_speed);
            State.humidity = w.humidity;
            State.loaded = true;
            generateWeatherParticles(getWeatherCategory(State.conditionCode));
        } catch {}
    }, 30 * 60 * 1000);

    // Показываем всё после загрузки
    document.querySelector('.clock').classList.add('visible');
    document.querySelector('.calendar-wall').classList.add('visible');
    document.querySelector('.light-switch').classList.add('visible');

    (function loop() { drawScene(); requestAnimationFrame(loop); })();
}

window.addEventListener('resize', resizeCanvas);
document.addEventListener('DOMContentLoaded', initializeApp);