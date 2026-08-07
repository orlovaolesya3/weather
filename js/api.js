// Главный модуль приложения
async function initializeApp() {
    console.log('🚀 Запуск приложения...');
    
    initCanvas();
    resizeCanvas();
    generateStars();
    
    DOM.dbCity.textContent = 'Определение...';
    DOM.dbCond.textContent = 'Загрузка...';

    try {
        // Получаем местоположение по IP
        console.log('📍 Определение местоположения по IP...');
        const location = await getCityByIP();
        
        // Берём город напрямую из ipapi.co
        State.city = location.city || location.region || 'Неизвестно';
        State.country = location.country || '';
        State.region = location.region || '';
        
        console.log(`📍 Определено: ${State.city}, ${State.country}`);
        console.log(`🌍 Координаты: ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`);
        
        // Получаем погоду по координатам
        console.log('🌤️ Загрузка погоды...');
        const weatherData = await getWeatherData(location.lat, location.lon);
        
        State.condition = weatherData.condition.text;
        State.conditionCode = weatherData.condition.code;
        State.temp = Math.round(weatherData.temp_c);
        State.wind = Math.round(weatherData.wind_kph / 3.6);
        State.humidity = weatherData.humidity;
        State.cloudCover = weatherData.cloud_cover || 0;
        State.loaded = true;
        
        console.log(`🌡️ Погода: ${State.condition}, ${State.temp}°C`);
        
    } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
        
        // Демо-режим с сохранением последнего известного города
        if (!State.city || State.city === 'Неизвестно') {
            State.city = 'Москва';
        }
        if (!State.country) {
            State.country = 'Россия';
        }
        State.condition = 'Переменная облачность';
        State.conditionCode = 1003;
        State.temp = 15;
        State.wind = 3;
        State.humidity = 65;
        State.loaded = false;
        
        console.log('📦 Используются демо-данные');
    }

    // Генерируем частицы по погоде
    const weatherCategory = getWeatherCategory(State.conditionCode);
    generateWeatherParticles(weatherCategory);
    
    console.log(`🎨 Категория погоды: ${weatherCategory}`);

    // Обновляем интерфейс
    updateDisplay();
    updateDebug();
    
    // Запускаем обновление времени каждую секунду
    setInterval(() => {
        updateDisplay();
        updateDebug();
    }, 1000);

    // Каждые 30 минут обновляем погоду
    setInterval(async () => {
        try {
            console.log('🔄 Обновление погоды...');
            
            const location = await getCityByIP();
            
            // Обновляем город при каждом запросе
            State.city = location.city || location.region || State.city;
            State.country = location.country || State.country;
            
            const weatherData = await getWeatherData(location.lat, location.lon);
            
            State.condition = weatherData.condition.text;
            State.conditionCode = weatherData.condition.code;
            State.temp = Math.round(weatherData.temp_c);
            State.wind = Math.round(weatherData.wind_kph / 3.6);
            State.humidity = weatherData.humidity;
            
            const newCategory = getWeatherCategory(State.conditionCode);
            generateWeatherParticles(newCategory);
            
            console.log(`✅ Погода обновлена: ${State.condition}, ${State.temp}°C, ${State.city}`);
        } catch (error) {
            console.warn('⚠️ Не удалось обновить погоду:', error);
        }
    }, 30 * 60 * 1000);

    // Запускаем анимацию
    console.log('🎬 Запуск анимации...');
    
    function animationLoop() {
        drawScene();
        requestAnimationFrame(animationLoop);
    }
    
    animationLoop();
    
    console.log('✅ Приложение запущено!');
}

// Обработчики событий
window.addEventListener('resize', () => {
    resizeCanvas();
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Страница загружена');
    initializeApp();
});

// Обработка проблем с сетью
window.addEventListener('offline', () => {
    console.warn('📡 Соединение потеряно');
    DOM.dbCond.textContent = 'Офлайн';
});

window.addEventListener('online', () => {
    console.log('📡 Соединение восстановлено');
    // Перезапускаем с чистым состоянием
    State.city = '';
    State.country = '';
    setTimeout(() => initializeApp(), 2000);
});