// Главный модуль приложения
async function initializeApp() {
    console.log('🚀 Starting Pixel Weather App...');
    
    initCanvas();
    resizeCanvas();
    generateStars();

    try {
        // 1. Получаем местоположение по IP
        console.log('📍 Detecting location...');
        const location = await getCityByIP();
        console.log('📍 Location:', location);
        
        // Сохраняем информацию о местоположении
        State.city = location.city;
        State.country = location.country;
        
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
                
                // Обновляем название города из ответа API
                if (weatherData.city_name) {
                    State.city = weatherData.city_name;
                }
            } catch (coordsError) {
                throw new Error('All weather APIs failed');
            }
        }
        
        // 4. Обновляем состояние с данными погоды
        State.condition = weatherData.condition.text;
        State.conditionCode = weatherData.condition.code;
        State.temp = Math.round(weatherData.temp_c);
        State.wind = Math.round(weatherData.wind_speed); // Используем м/с
        State.humidity = weatherData.humidity;
        State.loaded = true;
        
        console.log('✅ Weather loaded successfully:', {
            city: State.city,
            condition: State.condition,
            temp: State.temp,
            wind: State.wind,
            humidity: State.humidity
        });
        
    } catch (error) {
        console.error('❌ Failed to load weather:', error);
        
        // Демо-данные для тестирования
        State.condition = 'Переменная облачность';
        State.conditionCode = 802; // scattered clouds
        State.temp = 22;
        State.wind = 3;
        State.humidity = 55;
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
        try {
            const weatherData = await getWeatherData(State.city);
            State.condition = weatherData.condition.text;
            State.conditionCode = weatherData.condition.code;
            State.temp = Math.round(weatherData.temp_c);
            State.wind = Math.round(weatherData.wind_speed);
            State.humidity = weatherData.humidity;
            
            const weatherCategory = getWeatherCategory(State.conditionCode);
            generateWeatherParticles(weatherCategory);
            
            console.log('✅ Weather refreshed');
        } catch (error) {
            console.warn('⚠️ Failed to refresh weather:', error);
        }
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

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing app...');
    initializeApp().catch(error => {
        console.error('💥 Fatal error:', error);
    });
});

// Дополнительные утилиты для отладки
window.debugApp = {
    getState: () => State,
    getConfig: () => CONFIG,
    refreshWeather: async () => {
        try {
            const weatherData = await getWeatherData(State.city);
            State.condition = weatherData.condition.text;
            State.conditionCode = weatherData.condition.code;
            State.temp = Math.round(weatherData.temp_c);
            State.wind = Math.round(weatherData.wind_speed);
            State.humidity = weatherData.humidity;
            
            const weatherCategory = getWeatherCategory(State.conditionCode);
            generateWeatherParticles(weatherCategory);
            
            updateDebug();
            console.log('✅ Manual weather refresh successful');
        } catch (error) {
            console.error('❌ Manual refresh failed:', error);
        }
    }
};