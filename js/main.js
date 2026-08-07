// Главный модуль приложения
async function initializeApp() {
    console.log('🚀 Starting Pixel Weather App...');
    State.status = 'loading';
    updateDebug();
    
    initCanvas();
    resizeCanvas();
    generateStars();

    try {
        // 1. Получаем местоположение по IP
        console.log('📍 Detecting location...');
        const location = await getCityByIP();
        console.log('📍 Location:', location);
        
        // Сохраняем IP информацию
        State.ipCity = location.city;
        State.ipRegion = location.region;
        State.ipCountry = location.country;
        State.ipLat = location.lat;
        State.ipLon = location.lon;
        
        let weatherData;
        
        // 2. Пробуем получить погоду по названию города
        try {
            console.log('🌤️ Fetching weather for:', location.city);
            weatherData = await getWeatherData(location.city);
        } catch (cityError) {
            console.warn('⚠️ Failed to get weather by city name, trying coordinates...');
            
            // 3. Если не получилось по городу, пробуем по координатам
            try {
                console.log('🌤️ Fetching weather by coordinates:', location.lat, location.lon);
                weatherData = await getWeatherByCoords(location.lat, location.lon);
            } catch (coordsError) {
                throw new Error('All weather APIs failed');
            }
        }
        
        // 4. Обновляем состояние с данными погоды
        State.apiCity = weatherData.city_name || location.city;
        State.apiCountry = weatherData.country || '';
        State.condition = weatherData.condition.text;
        State.conditionCode = weatherData.condition.code;
        State.conditionIcon = weatherData.condition.icon;
        State.temp = Math.round(weatherData.temp_c);
        State.feelsLike = Math.round(weatherData.feels_like);
        State.windSpeed = weatherData.wind_speed;
        State.wind = Math.round(weatherData.wind_speed);
        State.humidity = weatherData.humidity;
        State.pressure = weatherData.pressure;
        State.clouds = weatherData.clouds;
        State.visibility = weatherData.visibility;
        State.loaded = true;
        State.status = 'loaded';
        
        console.log('✅ Weather loaded successfully');
        
    } catch (error) {
        console.error('❌ Failed to load weather:', error);
        State.status = 'demo';
        
        // Демо-данные для тестирования
        State.apiCity = State.ipCity || 'Moscow';
        State.apiCountry = State.ipCountry || 'Russia';
        State.condition = 'Переменная облачность';
        State.conditionCode = 802;
        State.temp = 22;
        State.feelsLike = 20;
        State.windSpeed = 3;
        State.wind = 3;
        State.humidity = 55;
        State.pressure = 1013;
        State.clouds = 40;
        State.visibility = 10000;
        State.loaded = false;
        
        console.log('📦 Using demo data');
    }

    // Генерируем частицы в зависимости от погоды
    const weatherCategory = getWeatherCategory(State.conditionCode);
    console.log('🎨 Weather category:', weatherCategory);
    generateWeatherParticles(weatherCategory);

    // Обновляем отображение
    updateDisplay();
    updateDebug();
    
    // Запускаем обновление каждую секунду
    setInterval(() => {
        updateDisplay();
        updateDebug();
    }, 1000);
    
    // Автообновление погоды каждые 30 минут
    setInterval(async () => {
        console.log('🔄 Auto-refreshing weather...');
        State.status = 'loading';
        updateDebug();
        
        try {
            const weatherData = await getWeatherByCoords(State.ipLat, State.ipLon);
            
            State.apiCity = weatherData.city_name || State.ipCity;
            State.apiCountry = weatherData.country || '';
            State.condition = weatherData.condition.text;
            State.conditionCode = weatherData.condition.code;
            State.conditionIcon = weatherData.condition.icon;
            State.temp = Math.round(weatherData.temp_c);
            State.feelsLike = Math.round(weatherData.feels_like);
            State.windSpeed = weatherData.wind_speed;
            State.wind = Math.round(weatherData.wind_speed);
            State.humidity = weatherData.humidity;
            State.pressure = weatherData.pressure;
            State.clouds = weatherData.clouds;
            State.visibility = weatherData.visibility;
            State.loaded = true;
            State.status = 'loaded';
            
            const weatherCategory = getWeatherCategory(State.conditionCode);
            generateWeatherParticles(weatherCategory);
            
            console.log('✅ Weather refreshed');
        } catch (error) {
            console.warn('⚠️ Failed to refresh weather:', error);
            State.status = 'error';
        }
        
        updateDebug();
    }, 30 * 60 * 1000); // 30 минут

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
        State.status = 'error';
        updateDebug();
    });
});

// Утилиты для отладки в консоли
window.debugApp = {
    getState: () => State,
    getConfig: () => CONFIG,
    refreshWeather: async () => {
        State.status = 'loading';
        updateDebug();
        
        try {
            const weatherData = await getWeatherByCoords(State.ipLat, State.ipLon);
            
            State.apiCity = weatherData.city_name || State.ipCity;
            State.apiCountry = weatherData.country || '';
            State.condition = weatherData.condition.text;
            State.conditionCode = weatherData.condition.code;
            State.conditionIcon = weatherData.condition.icon;
            State.temp = Math.round(weatherData.temp_c);
            State.feelsLike = Math.round(weatherData.feels_like);
            State.windSpeed = weatherData.wind_speed;
            State.wind = Math.round(weatherData.wind_speed);
            State.humidity = weatherData.humidity;
            State.pressure = weatherData.pressure;
            State.clouds = weatherData.clouds;
            State.visibility = weatherData.visibility;
            State.loaded = true;
            State.status = 'loaded';
            
            const weatherCategory = getWeatherCategory(State.conditionCode);
            generateWeatherParticles(weatherCategory);
            
            updateDebug();
            console.log('✅ Manual refresh successful');
            return State;
        } catch (error) {
            console.error('❌ Manual refresh failed:', error);
            State.status = 'error';
            updateDebug();
            throw error;
        }
    }
};