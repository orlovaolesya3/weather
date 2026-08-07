// Главный модуль
async function initializeApp() {
    console.log('🚀 Starting app...');
    
    initCanvas();
    resizeCanvas();
    generateStars();

    try {
        // 1. Получаем город по IP
        const location = await getCityByIP();
        
        // СОХРАНЯЕМ ГОРОД ИЗ IPAPI (не перезаписываем!)
        State.city = location.city;
        State.country = location.country;
        
        console.log('📍 Using city:', State.city);
        
        let weatherData;
        
        // 2. Пробуем получить погоду для этого города
        try {
            weatherData = await getWeatherData(State.city);
            
            // Если API вернул другое название - НЕ меняем город!
            // Мы доверяем ipapi, а не погодному API
            console.log('✅ Weather loaded for:', weatherData.city_name);
            
        } catch (cityError) {
            console.warn('⚠️ Cannot get weather by city name, trying coordinates...');
            
            // Пробуем по координатам из ipapi
            weatherData = await getWeatherByCoords(location.lat, location.lon);
            
            // Оставляем оригинальное название города из ipapi
            console.log('✅ Weather loaded by coordinates');
        }
        
        // 3. Обновляем состояние
        State.condition = weatherData.condition.text;
        State.conditionCode = weatherData.condition.code;
        State.temp = Math.round(weatherData.temp_c);
        State.wind = Math.round(weatherData.wind_speed);
        State.humidity = weatherData.humidity;
        State.loaded = true;
        
        console.log('📊 Final state:', {
            city: State.city,
            condition: State.condition,
            temp: State.temp
        });
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
        
        // Запасные данные
        State.condition = 'Переменная облачность';
        State.conditionCode = 802;
        State.temp = 20;
        State.wind = 3;
        State.humidity = 60;
        State.loaded = false;
    }

    // Генерируем частицы
    const weatherCategory = getWeatherCategory(State.conditionCode);
    generateWeatherParticles(weatherCategory);

    // Обновляем отображение
    updateDisplay();
    updateDebug();
    
    // Обновление времени каждую секунду
    setInterval(() => {
        updateDisplay();
        updateDebug();
    }, 1000);

    // Запуск анимации
    function animationLoop() {
        drawScene();
        requestAnimationFrame(animationLoop);
    }
    
    animationLoop();
}

document.addEventListener('DOMContentLoaded', initializeApp);