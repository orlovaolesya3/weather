// API функции
async function getCityByIP() {
    try {
        const response = await fetch('https://ipapi.co/json/', {
            signal: AbortSignal.timeout(4000)
        });
        const data = await response.json();
        
        console.log('📍 IP Location:', data);
        
        return {
            city: data.city,
            country: data.country_name,
            region: data.region,
            lat: data.latitude,
            lon: data.longitude
        };
    } catch (error) {
        console.warn('IP detection failed:', error);
        return { 
            city: 'Владимир', 
            country: 'Russia',
            region: 'Владимирская область',
            lat: 56.1365, 
            lon: 40.3966 
        };
    }
}

async function getWeatherData(city) {
    if (CONFIG.API_KEY === 'ТВОЙ_КЛЮЧ_ОТ_OPENWEATHERMAP') {
        throw new Error('API key missing');
    }
    
    console.log('🌤️ Fetching weather for city:', city);
    
    // Пробуем разные форматы запроса
    const urls = [
        // Город + Россия
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},RU&appid=${CONFIG.API_KEY}&units=metric&lang=ru`,
        // Только город
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${CONFIG.API_KEY}&units=metric&lang=ru`
    ];

    for (const url of urls) {
        try {
            console.log('🔗 Trying URL:', url);
            const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Weather data received:', data.name, data.sys.country);
                
                return {
                    condition: {
                        text: data.weather[0].description,
                        code: data.weather[0].id
                    },
                    temp_c: data.main.temp,
                    wind_kph: data.wind.speed * 3.6,
                    wind_speed: data.wind.speed,
                    humidity: data.main.humidity,
                    city_name: data.name,
                    country: data.sys.country
                };
            }
            
            console.warn('❌ URL failed:', url, response.status);
        } catch (error) {
            console.warn('⚠️ Request failed:', error);
            continue;
        }
    }
    
    throw new Error(`Cannot find weather for: ${city}`);
}

// Резервный метод - поиск ближайшего города по координатам
async function getWeatherByCoords(lat, lon) {
    console.log('🌤️ Fetching weather for coordinates:', lat, lon);
    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}&units=metric&lang=ru`;
    
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Weather by coords:', data.name);
    
    return {
        condition: {
            text: data.weather[0].description,
            code: data.weather[0].id
        },
        temp_c: data.main.temp,
        wind_kph: data.wind.speed * 3.6,
        wind_speed: data.wind.speed,
        humidity: data.main.humidity,
        city_name: data.name,
        country: data.sys.country
    };
}