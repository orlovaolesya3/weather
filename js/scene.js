import { W, H } from './dom.js';
import { SKY_COLORS, WEATHER_CONFIG } from './config.js';
import { getWeatherCategory } from './api.js';
import { state, particles } from './state.js';
import { drawSky, drawStars } from './draw/sky.js';
import { drawMountains, drawGround, drawRoad } from './draw/terrain.js';
import { drawCelestial } from './draw/celestial.js';
import { drawClouds } from './draw/clouds.js';
import { drawRain, drawSnow } from './draw/weather.js';
import { drawAllTrees } from './draw/trees.js';
import { drawGlare } from './draw/effects.js';

let frame = 0;

export function drawScene() {
    frame++;
    const { hour, minute, windSpeed, conditionCode } = state;
    const night = hour < 6 || hour >= 20;
    const dawn = hour >= 6 && hour < 10;
    const dusk = hour >= 17 && hour < 20;
    const wc = getWeatherCategory(conditionCode);
    const rainy = wc === 'rain' || wc === 'storm';
    const snowy = wc === 'snow';
    const showClouds = ['cloudy', 'partly', 'rain', 'storm', 'snow'].includes(wc);
    const showStars = night && wc === 'clear';
    
    // Выбор цветов неба
    let skyKey;
    if (rainy) skyKey = 'rain';
    else if (snowy) skyKey = 'snow';
    else if (wc === 'cloudy') skyKey = 'cloudy';
    else if (night) skyKey = 'night';
    else if (dawn) skyKey = 'dawn';
    else if (dusk) skyKey = 'dusk';
    else skyKey = 'clear_day';
    
    const colors = SKY_COLORS[skyKey];
    const skyTop = night ? colors.top.night : colors.top.day;
    const skyBottom = night ? colors.bottom.night : colors.bottom.day;
    
    // Отрисовка
    drawSky(skyTop, skyBottom);
    if (showStars) drawStars(frame);
    
    const mc1 = night ? '#1a2a3a' : rainy ? '#5a6a7a' : snowy ? '#c0d0e0' : '#6a8a6a';
    const mc2 = night ? '#152535' : rainy ? '#4a5a6a' : snowy ? '#b0c0d0' : '#5a7a5a';
    drawMountains(mc1, mc2);
    
    const gc1 = night ? '#1a2a1a' : snowy ? '#e8f0f0' : '#4a7a3a';
    const gc2 = night ? '#152515' : snowy ? '#dde8e8' : '#3a6a2a';
    drawGround(gc1, gc2);
    drawRoad(night);
    
    drawCelestial(hour, minute, colors.sun, night);
    if (showClouds) drawClouds(frame, night);
    if (rainy) drawRain(frame, wc === 'storm');
    if (snowy) drawSnow(frame);
    
    drawAllTrees(H * 0.78, windSpeed, night, frame);
    drawGlare();
}