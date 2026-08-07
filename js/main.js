// Главный модуль приложения
async function initializeApp() {
    console.log('🚀 Starting Pixel Weather App...');
    
    initCanvas();
    resizeCanvas();
    generateStars();

    try {
        // 1. Получаем местоположение по IP через ipinfo.io
        console.log('📍 Detecting location via ipinfo.io...');
        const location = await getCityByIP();
        console.log('📍 Location:', location);
        
        // Сохраняем IP информацию
        State.ipCity = location.city;
        State.ipRegion = location.region;
        State.ipCountry = location.country;
        State.ipLat = location.lat;
        State.ipLon = location.lon;
        
        let weatherData;
        
        // 2. Пробуем получить погоду по координатам (точнее)
        try {
            console.log('🌤️ Fetching weather by coordinates:', location.lat, location.lon);
            weatherData = await getWeatherByCoords(location.lat, location.lon);
        } catch (coordsError) {
            console.warn('⚠️ Failed to get weather by coordinates, trying city name...');
            
            // 3. Если не получилось по координатам, пробуем по названию города
            try {
                console.log('🌤️ Fetching weather for city:', location.city);
                weatherData = await getWeatherData(location.city);
            } catch (cityError) {
                throw new Error('All weather APIs failed');
            }
        }
        
        // 4. Обновляем состояние с данными погоды
        State.apiCity = weatherData.city_name || location.city;
        State.country = weatherData.country || location.country;
        State.condition = weatherData.condition.text;
        State.conditionCode = weatherData.condition.code;
        State.temp = Math.round(weatherData.temp_c);
        State.wind = Math.round(weatherData.wind_speed);
        State.humidity = weatherData.humidity;
        State.loaded = true;
        
        console.log('✅ Weather loaded successfully');
        
    } catch (error) {
        console.error('❌ Failed to load weather:', error);
        
        // Демо-данные
        State.apiCity = State.ipCity || 'Moscow';
        State.country = State.ipCountry || 'Russia';
        State.condition = 'Переменная облачность';
        State.conditionCode = 802;
        State.temp = 22;
        State.wind = 3;
        State.humidity = 55;
        State.loaded = false;
        
        console.log('📦 Using demo data');
    }

    // Генерируем частицы
    const weatherCategory = getWeatherCategory(State.conditionCode);
    console.log('🎨 Weather category:', weatherCategory);
    generateWeatherParticles(weatherCategory);

    // Обновляем отображение
    updateDisplay();
    updateDebug();
    
    // Обновление каждую секунду
    setInterval(() => {
        updateDisplay();
        updateDebug();
    }, 1000);
    
    // Автообновление погоды каждые 30 минут
    setInterval(async () => {
        console.log('🔄 Auto-refreshing weather...');
        try {
            const weatherData = await getWeatherByCoords(State.ipLat, State.ipLon);
            
            State.apiCity = weatherData.city_name || State.ipCity;
            State.country = weatherData.country || State.ipCountry;
            State.condition = weatherData.condition.text;
            State.conditionCode = weatherData.condition.code;
            State.temp = Math.round(weatherData.temp_c);
            State.wind = Math.round(weatherData.wind_speed);
            State.humidity = weatherData.humidity;
            State.loaded = true;
            
            const weatherCategory = getWeatherCategory(State.conditionCode);
            generateWeatherParticles(weatherCategory);
            
            console.log('✅ Weather refreshed');
        } catch (error) {
            console.warn('⚠️ Failed to refresh weather:', error);
        }
    }, 30 * 60 * 1000);

    // Запускаем анимацию
    function animationLoop() {
        drawScene();
        requestAnimationFrame(animationLoop);
    }
    
    animationLoop();
    console.log('🎮 Animation started');
}

// Обработчики событий
window.addEventListener('resize', () => {
    resizeCanvas();
});

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing app...');
    initializeApp().catch(error => {
        console.error('💥 Fatal error:', error);
    });
});

// Утилиты для отладки
window.debugApp = {
    getState: () => State,
    getConfig: () => CONFIG,
    refreshWeather: async () => {
        try {
            const weatherData = await getWeatherByCoords(State.ipLat, State.ipLon);
            
            State.apiCity = weatherData.city_name || State.ipCity;
            State.country = weatherData.country || State.ipCountry;
            State.condition = weatherData.condition.text;
            State.conditionCode = weatherData.condition.code;
            State.temp = Math.round(weatherData.temp_c);
            State.wind = Math.round(weatherData.wind_speed);
            State.humidity = weatherData.humidity;
            State.loaded = true;
            
            const weatherCategory = getWeatherCategory(State.conditionCode);
            generateWeatherParticles(weatherCategory);
            
            updateDebug();
            console.log('✅ Manual refresh successful');
            return State;
        } catch (error) {
            console.error('❌ Manual refresh failed:', error);
            throw error;
        }
    }
};