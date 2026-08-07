function generateClouds(n) {
    State.clouds = Array.from({length:n}, () => ({
        x: .03+Math.random()*.94, y: .02+Math.random()*.30,
        type: cloudSprites.getRandomType()||'medium',
        speed: .1+Math.random()*.3
    }));
}

function generateRain(n=120) {
    State.rain = Array.from({length:n}, () => ({
        x: Math.floor(Math.random()*100), y: Math.floor(Math.random()*80),
        speed: .3+Math.random()*.5, phase: Math.random()*100,
        len: 3+Math.floor(Math.random()*6)
    }));
}

function generateSnow(n=80) {
    State.snow = Array.from({length:n}, () => ({
        x: Math.floor(Math.random()*100), y: Math.floor(Math.random()*80),
        speed: .1+Math.random()*.3, phase: Math.random()*100,
        size: 2+Math.floor(Math.random()*3), wobble: Math.random()*Math.PI*2
    }));
}

function generateStars(n=120) {
    State.stars = Array.from({length:n}, () => ({
        x: Math.floor(Math.random()*100),
        y: Math.floor(Math.random()*60),
        brightness: 4 + Math.floor(Math.random()*5),
        twinkleSpeed: .02 + Math.random()*.06
    }));
}

function generateWeatherParticles(cat) {
    const cfg = CONFIG.WEATHER_CONFIG[cat] || CONFIG.WEATHER_CONFIG.cloudy;
    generateClouds(cfg.c);
    if (cfg.r) generateRain(cfg.r);
    if (cfg.s) generateSnow(cfg.s);
}