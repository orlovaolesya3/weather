const CONFIG = {
    API_KEY: '',
    PX: 4,
    
    // Координаты окна на спрайте комнаты (1776×886)
    WINDOW: {
        x1: 415, y1: 120,  // левый верхний угол
        x2: 1400, y2: 696   // правый нижний угол
    },
    
    MONTHS: ['ЯНВ','ФЕВ','МАР','АПР','МАЙ','ИЮН','ИЮЛ','АВГ','СЕН','ОКТ','НОЯ','ДЕК'],
    WEEKDAYS: ['ВС','ПН','ВТ','СР','ЧТ','ПТ','СБ'],
    
    TREES: [
        { x: 0.08, s: 1.0 },
        { x: 0.20, s: 0.7 },
        { x: 0.78, s: 1.1 },
        { x: 0.92, s: 0.75 }
    ],
    
    WEATHER_CONFIG: {
        clear:    { c: 0,  r: 0,   s: 0 },
        partly:   { c: 4,  r: 0,   s: 0 },
        cloudy:   { c: 12, r: 0,   s: 0 },
        rain:     { c: 14, r: 120, s: 0 },
        storm:    { c: 16, r: 180, s: 0 },
        snow:     { c: 14, r: 0,   s: 80 }
    },
    
    SKY_COLORS: {
        rain:       { t: ['#1a1a30','#8a9aaa'], b: ['#0d0d1a','#a0b0c0'], s: '#ccbb88' },
        snow:       { t: ['#2a3a4a','#c0d0e0'], b: ['#1a2a3a','#d8e4ee'], s: '#eeeedd' },
        cloudy:     { t: ['#2a2a3a','#a0b8c8'], b: ['#1a1a2a','#c0d0dd'], s: '#ddccaa' },
        clear_night:{ t: ['#05051a','#05051a'], b: ['#0a1030','#0a1030'], s: '#ccccdd' },
        clear_dawn: { t: ['#8899bb','#8899bb'], b: ['#eeccaa','#eeccaa'], s: '#ffcc88' },
        clear_dusk: { t: ['#667799','#667799'], b: ['#dd9977','#dd9977'], s: '#ffaa66' },
        clear_day:  { t: ['#7799cc','#7799cc'], b: ['#aac8ee','#aac8ee'], s: '#ffee55' }
    },
    
    async loadApiKey() {
        try {
            const r = await fetch('apikey.txt');
            if (r.ok) this.API_KEY = (await r.text()).trim();
        } catch(e) {}
    }
};