import { state } from './state.js';
import { dom } from './dom.js';
import { WEEKDAYS, MONTHS } from './config.js';
import { getWeatherCategory } from './api.js';

export function updateClock() {
    const now = new Date();
    state.hour = now.getHours();
    state.minute = now.getMinutes();
    state.second = now.getSeconds();
    state.day = now.getDate();
    state.month = now.getMonth() + 1;
    state.weekday = WEEKDAYS[now.getDay()];
    
    const timeStr = `${String(state.hour).padStart(2, '0')}:${String(state.minute).padStart(2, '0')}:${String(state.second).padStart(2, '0')}`;
    dom.clock.textContent = timeStr;
    dom.calMonth.textContent = MONTHS[state.month - 1];
    dom.calDay.textContent = state.day;
    dom.calWeekday.textContent = state.weekday;
    dom.dbTime.textContent = timeStr;
}

export function updateDebug() {
    dom.dbCity.textContent = `${state.city}, ${state.country}`;
    dom.dbCond.textContent = state.condition || '—';
    dom.dbTemp.textContent = state.temp !== '' ? `${state.temp}°C` : '—';
    dom.dbWind.textContent = state.windSpeed !== '' ? `${state.windSpeed} м/с` : '—';
    dom.dbHum.textContent = state.humidity !== '' ? `${state.humidity}%` : '—';
    
    const cat = getWeatherCategory(state.conditionCode);
    const map = { 
        clear:'☀️ Ясно', partly:'⛅ Переменная', cloudy:'☁️ Облачно', 
        rain:'🌧 Дождь', snow:'❄️ Снег', storm:'⛈ Гроза' 
    };
    dom.dbSky.textContent = map[cat] || cat;
    dom.dbSky.className = `debug-value ${cat === 'clear' ? 'ok' : 'warn'}`;
}