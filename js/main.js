// Главный модуль
async function initializeApp() {
    initCanvas();
    resizeCanvas();
    generateStars();

    try {
        const location = await getCityByIP();
        State.city = location.city;
        State.country = location.country;
        
        const weatherData = await getWeatherData(location.city);
        State.condition = weatherData.condition.text;
        State.conditionCode = weatherData.condition.code;
        State.temp = Math.round(weatherData.temp_c);
        State.wind = Math.round(weatherData.wind_kph / 3.6);
        State.humidity = weatherData.humidity;
        State.loaded = true;
    } catch (error) {
        console.warn('Using demo data:', error);
        State.condition = 'Partly cloudy';
        State.conditionCode = 1003;
        State.temp = 22;
        State.wind = 3;
        State.humidity = 55;
    }

    const weatherCategory = getWeatherCategory(State.conditionCode);
    generateWeatherParticles(weatherCategory);

    updateDisplay();
    updateDebug();
    
    setInterval(() => {
        updateDisplay();
        updateDebug();
    }, 1000);

    function animationLoop() {
        drawScene();
        requestAnimationFrame(animationLoop);
    }
    
    animationLoop();
}

window.addEventListener('resize', resizeCanvas);
document.addEventListener('DOMContentLoaded', initializeApp);