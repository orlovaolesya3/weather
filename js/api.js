async function getCityByIP() {
    try {
        const r = await fetch('https://ipinfo.io/json');
        if (!r.ok) throw new Error();
        const d = await r.json();
        const [lat, lon] = (d.loc || '55.7558,37.6173').split(',').map(Number);
        return { city: d.city || 'Moscow', region: d.region || '', country: d.country || 'Russia', lat, lon, timezone: d.timezone || 'Europe/Moscow' };
    } catch {
        return { city: 'Moscow', region: 'Moscow', country: 'Russia', lat: 55.7558, lon: 37.6173, timezone: 'Europe/Moscow' };
    }
}

async function getWeatherByCoords(lat, lon) {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`);
    if (!r.ok) throw new Error('API error');
    const d = await r.json();
    const c = d.current;
    const codes = { 0:'Ясно', 1:'Преимущественно ясно', 2:'Переменная облачность', 3:'Пасмурно', 45:'Туман', 48:'Изморозь', 51:'Лёгкая морось', 53:'Морось', 55:'Сильная морось', 61:'Небольшой дождь', 63:'Дождь', 65:'Сильный дождь', 71:'Небольшой снег', 73:'Снег', 75:'Сильный снег', 77:'Снежные зёрна', 80:'Ливень', 81:'Сильный ливень', 82:'Очень сильный ливень', 85:'Снегопад', 86:'Сильный снегопад', 95:'Гроза', 96:'Гроза с градом', 99:'Сильная гроза с градом' };
    return { condition: { text: codes[c.weather_code] || 'Неизвестно', code: c.weather_code }, temp_c: c.temperature_2m, wind_speed: c.wind_speed_10m, humidity: c.relative_humidity_2m };
}