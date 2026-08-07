async function getCityByIP() {
    try {
        const r = await fetch('https://ipinfo.io/json');
        if (!r.ok) throw new Error();
        const d = await r.json();
        const [lat, lon] = (d.loc||'55.7558,37.6173').split(',').map(Number);
        return { city:d.city||'Moscow', region:d.region||'', country:d.country||'Russia', lat, lon, timezone:d.timezone||'Europe/Moscow' };
    } catch {
        return { city:'Moscow', region:'Moscow', country:'Russia', lat:55.7558, lon:37.6173, timezone:'Europe/Moscow' };
    }
}

async function getWeatherData(city) {
    if (!CONFIG.API_KEY) throw new Error('No key');
    const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${CONFIG.API_KEY}&units=metric&lang=ru`);
    if (!r.ok) throw new Error('API error');
    const d = await r.json();
    return {
        condition: { text:d.weather[0].description, code:d.weather[0].id, icon:d.weather[0].icon },
        temp_c: d.main.temp, feels_like: d.main.feels_like,
        wind_kph: d.wind.speed*3.6, wind_speed: d.wind.speed,
        humidity: d.main.humidity, pressure: d.main.pressure,
        clouds: d.clouds.all, visibility: d.visibility,
        city_name: d.name, country: d.sys.country
    };
}

async function getWeatherByCoords(lat, lon) {
    if (!CONFIG.API_KEY) throw new Error('No key');
    const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}&units=metric&lang=ru`);
    if (!r.ok) throw new Error('API error');
    const d = await r.json();
    return {
        condition: { text:d.weather[0].description, code:d.weather[0].id, icon:d.weather[0].icon },
        temp_c: d.main.temp, feels_like: d.main.feels_like,
        wind_kph: d.wind.speed*3.6, wind_speed: d.wind.speed,
        humidity: d.main.humidity, pressure: d.main.pressure,
        clouds: d.clouds.all, visibility: d.visibility,
        city_name: d.name, country: d.sys.country
    };
}