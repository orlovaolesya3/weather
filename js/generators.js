// Генераторы частиц
function generateClouds(count) {
    State.clouds = Array.from({ length: count }, () => ({
        x: 0.03 + Math.random() * 0.94,
        y: 0.02 + Math.random() * 0.30,
        w: 3 + Math.floor(Math.random() * 10),
        h: 2 + Math.floor(Math.random() * 5),
        speed: 0.1 + Math.random() * 0.3
    }));
}

function generateRain(count = 120) {
    State.rain = Array.from({ length: count }, () => ({
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 80),
        speed: 0.3 + Math.random() * 0.5,
        phase: Math.random() * 100,
        len: 3 + Math.floor(Math.random() * 6)
    }));
}

function generateSnow(count = 80) {
    State.snow = Array.from({ length: count }, () => ({
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 80),
        speed: 0.1 + Math.random() * 0.3,
        phase: Math.random() * 100,
        size: 2 + Math.floor(Math.random() * 3),
        wobble: Math.random() * Math.PI * 2
    }));
}

function generateStars(count = 60) {
    State.stars = Array.from({ length: count }, () => ({
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 50),
        brightness: 3 + Math.floor(Math.random() * 3),
        twinkleSpeed: 0.02 + Math.random() * 0.04
    }));
}

function generateWeatherParticles(weatherCategory) {
    const config = CONFIG.WEATHER_CONFIG[weatherCategory] || CONFIG.WEATHER_CONFIG.cloudy;
    
    generateClouds(config.clouds);
    if (config.rain) generateRain(config.rain);
    if (config.snow) generateSnow(config.snow);
}