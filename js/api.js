// API функции для работы с Open-Meteo (бесплатный, без ключа)
async function getCityByIP() {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        
        const response = await fetch('https://ipapi.co/json/', { 
            signal: controller.signal 
        });
        clearTimeout(timeout);
        
        if (!response.ok) throw new Error('IP API error');
        
        const data = await response.json();
        
        return {
            city: data.city || 'Москва',
            region: data.region || '',
            country: data.country_name || 'Россия',
            lat: data.latitude || 55.7558,
            lon: data.longitude || 37.6173
        };
    } catch (error) {
        console.warn('Ошибка определения местоположения:', error);
        return { 
            city: 'Москва', 
            region: '',
            country: 'Россия', 
            lat: 55.7558, 
            lon: 37.6173 
        };
    }
}

async function getWeatherData(lat, lon) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,cloud_cover&timezone=auto`;
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        
        if (!response.ok) throw new Error('Weather API error');
        
        const data = await response.json();
        const current = data.current;
        
        const weatherCodes = {
            0: { text: 'Ясно', code: 1000 },
            1: { text: 'Преимущественно ясно', code: 1000 },
            2: { text: 'Переменная облачность', code: 1003 },
            3: { text: 'Пасмурно', code: 1006 },
            45: { text: 'Туман', code: 1135 },
            48: { text: 'Изморозь', code: 1135 },
            51: { text: 'Лёгкая морось', code: 1150 },
            53: { text: 'Морось', code: 1153 },
            55: { text: 'Сильная морось', code: 1168 },
            56: { text: 'Ледяная морось', code: 1198 },
            57: { text: 'Сильная ледяная морось', code: 1201 },
            61: { text: 'Небольшой дождь', code: 1180 },
            63: { text: 'Дождь', code: 1186 },
            65: { text: 'Сильный дождь', code: 1192 },
            66: { text: 'Ледяной дождь', code: 1198 },
            67: { text: 'Сильный ледяной дождь', code: 1201 },
            71: { text: 'Небольшой снег', code: 1210 },
            73: { text: 'Снег', code: 1216 },
            75: { text: 'Сильный снег', code: 1222 },
            77: { text: 'Снежные зёрна', code: 1216 },
            80: { text: 'Ливень', code: 1240 },
            81: { text: 'Сильный ливень', code: 1243 },
            82: { text: 'Очень сильный ливень', code: 1246 },
            85: { text: 'Снегопад', code: 1255 },
            86: { text: 'Сильный снегопад', code: 1258 },
            95: { text: 'Гроза', code: 1273 },
            96: { text: 'Гроза с градом', code: 1276 },
            99: { text: 'Сильная гроза с градом', code: 1282 }
        };
        
        const weatherInfo = weatherCodes[current.weather_code] || { 
            text: 'Неизвестно', 
            code: 1000 
        };
        
        return {
            condition: {
                text: weatherInfo.text,
                code: weatherInfo.code
            },
            temp_c: current.temperature_2m,
            wind_kph: current.wind_speed_10m,
            humidity: current.relative_humidity_2m,
            cloud_cover: current.cloud_cover
        };
        
    } catch (error) {
        console.error('Ошибка получения погоды:', error);
        throw error;
    }
}

// Функция для обратного геокодирования (координаты -> название города)
async function getCityFromCoords(lat, lon) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=ru`
        );
        
        if (!response.ok) throw new Error('Geocoding error');
        
        const data = await response.json();
        
        if (data.address) {
            const city = data.address.city || 
                        data.address.town || 
                        data.address.village || 
                        data.address.county || 
                        data.address.state ||
                        'Неизвестно';
            return city;
        }
        
        return 'Неизвестно';
    } catch (error) {
        console.warn('Ошибка геокодирования:', error);
        return 'Неизвестно';
    }
}