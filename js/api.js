// API функции
async function getCityByIP() {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeout);
        const data = await response.json();
        return {
            city: data.city || 'Moscow',
            country: data.country_name || 'Russia'
        };
    } catch {
        return { city: 'Moscow', country: 'Russia' };
    }
}

async function getWeatherData(city) {
    if (CONFIG.API_KEY === 'ТВОЙ_КЛЮЧ_ОТ_WEATHERAPI') {
        throw new Error('API key missing');
    }
    const url = `https://api.weatherapi.com/v1/current.json?key=${CONFIG.API_KEY}&q=${encodeURIComponent(city)}&lang=ru`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data.current;
}