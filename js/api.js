// API функции для OpenWeatherMap
async function getCityByIP() {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeout);
        
        if (!response.ok) throw new Error('IP API error');
        
        const data = await response.json();
        return {
            city: data.city || 'Moscow',
            country: data.country_name || 'Russia',
            region: data.region || '',
            lat: data.latitude,
            lon: data.longitude
        };
    } catch (error) {
        console.warn('IP detection failed, using default:', error);
        return { 
            city: 'Moscow', 
            country: 'Russia',
            region: 'Moscow',
            lat: 55.7558, 
            lon: 37.6173 
        };
    }
}

async function getWeatherData(city) {
    if (CONFIG.API_KEY === 'ТВОЙ_КЛЮЧ_ОТ_OPENWEATHERMAP') {
        throw new Error('API key missing');
    }
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${CONFIG.API_KEY}&units=metric&lang=ru`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            condition: {
                text: data.weather[0].description,
                code: data.weather[0].id,
                icon: data.weather[0].icon
            },
            temp_c: data.main.temp,
            feels_like: data.main.feels_like,
            wind_kph: data.wind.speed * 3.6, // Конвертация м/с в км/ч
            wind_speed: data.wind.speed, // м/с
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            clouds: data.clouds.all,
            visibility: data.visibility,
            city_name: data.name,
            country: data.sys.country
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
}

// Функция для получения погоды по координатам (запасной вариант)
async function getWeatherByCoords(lat, lon) {
    if (CONFIG.API_KEY === 'ТВОЙ_КЛЮЧ_ОТ_OPENWEATHERMAP') {
        throw new Error('API key missing');
    }
    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}&units=metric&lang=ru`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            condition: {
                text: data.weather[0].description,
                code: data.weather[0].id,
                icon: data.weather[0].icon
            },
            temp_c: data.main.temp,
            feels_like: data.main.feels_like,
            wind_kph: data.wind.speed * 3.6,
            wind_speed: data.wind.speed,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            clouds: data.clouds.all,
            visibility: data.visibility,
            city_name: data.name,
            country: data.sys.country
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
}