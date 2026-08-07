// Конфигурация приложения
const CONFIG = {
    // Вставь свой API ключ с https://openweathermap.org/api
    API_KEY: '3fe3a80caf1eabf5567ac15cad47aaa3',
    
    PX: 4,
    
    MONTHS: ['ЯНВ','ФЕВ','МАР','АПР','МАЙ','ИЮН','ИЮЛ','АВГ','СЕН','ОКТ','НОЯ','ДЕК'],
    WEEKDAYS: ['ВС','ПН','ВТ','СР','ЧТ','ПТ','СБ'],
    
    TREES: [
        { x: 0.08, size: 1.0 },
        { x: 0.20, size: 0.7 },
        { x: 0.78, size: 1.1 },
        { x: 0.92, size: 0.75 }
    ],
    
    WEATHER_CONFIG: {
        clear:    { clouds: 0,  rain: 0,   snow: 0 },
        partly:   { clouds: 4,  rain: 0,   snow: 0 },
        cloudy:   { clouds: 12, rain: 0,   snow: 0 },
        rain:     { clouds: 14, rain: 120, snow: 0 },
        storm:    { clouds: 16, rain: 180, snow: 0 },
        snow:     { clouds: 14, rain: 0,   snow: 80 }
    },
    
    SKY_COLORS: {
        rain:       { top: ['#1a1a2e','#5a6a8a'], bottom: ['#0d0d1a','#8a9aaa'], sun: '#ffcc88' },
        snow:       { top: ['#2a3a4a','#c8d8e8'], bottom: ['#1a2a3a','#dde8f0'], sun: '#ffeecc' },
        cloudy:     { top: ['#2a2a3a','#8a9aaa'], bottom: ['#1a1a2a','#b0c0d0'], sun: '#ffddaa' },
        clear_night:{ top: ['#0a0a2a','#0a0a2a'], bottom: ['#1a1a3a','#1a1a3a'], sun: '#dddd88' },
        clear_dawn: { top: ['#ff8866','#ff8866'], bottom: ['#ffcc88','#ffcc88'], sun: '#ffdd44' },
        clear_dusk: { top: ['#ff6644','#ff6644'], bottom: ['#ff9966','#ff9966'], sun: '#ffcc44' },
        clear_day:  { top: ['#4a90d9','#4a90d9'], bottom: ['#87CEEB','#87CEEB'], sun: '#ffdd44' }
    }
};