const SoundSystem = {
    sounds: {}, currentSound: null, masterVolume: 0.5, muted: true,
    
    async loadAll() {
        const list = { rain_light:'sounds/rain_light.mp3', storm:'sounds/storm.mp3', snow:'sounds/snow.mp3', wind_light:'sounds/wind_light.mp3', birds_day:'sounds/birds_day.mp3', crickets_night:'sounds/crickets_night.mp3' };
        await Promise.all(Object.entries(list).map(([name, src]) => new Promise(resolve => {
            const a = new Audio(src); a.loop = true; a.volume = 0; a.preload = 'auto';
            a.addEventListener('canplaythrough', () => { this.sounds[name] = a; resolve(); }, { once: true });
            a.addEventListener('error', () => resolve(), { once: true });
            a.load();
        })));
    },

    setMasterVolume(vol) {
        this.masterVolume = vol; this.muted = false;
        document.getElementById('soundToggle').textContent = '⏸';
        if (this.currentSound && this.sounds[this.currentSound]) this.sounds[this.currentSound].volume = vol;
    },

    toggleMute() {
        this.muted = !this.muted;
        const btn = document.getElementById('soundToggle');
        btn.textContent = this.muted ? '▷' : '⏸';
        if (this.currentSound && this.sounds[this.currentSound]) this.sounds[this.currentSound].volume = this.muted ? 0 : this.masterVolume;
    },

    fadeIn(name, dur = 2000, vol = 0.5) {
        if (this.currentSound === name) return;
        if (this.currentSound && this.sounds[this.currentSound]) {
            const old = this.sounds[this.currentSound];
            const f = setInterval(() => { old.volume = Math.max(0, old.volume - .05); if (old.volume <= 0) { clearInterval(f); old.pause(); old.currentTime = 0; } }, 50);
        }
        const s = this.sounds[name];
        if (!s) { this.currentSound = null; return; }
        const v = this.muted ? 0 : this.masterVolume;
        s.volume = 0;
        s.play().then(() => {
            const f = setInterval(() => { s.volume = Math.min(v, s.volume + .05); if (s.volume >= v) clearInterval(f); }, 50);
        }).catch(() => {});
        this.currentSound = name;
    },

    update(code, wind, hour, night) {
        const cat = getWeatherCategory(code);
        if (cat === 'storm') this.fadeIn('storm', 1000, .5);
        else if (cat === 'rain') this.fadeIn('rain_light', 2000, .4);
        else if (cat === 'snow') this.fadeIn('snow', 2000, .3);
        else if (wind > 8) this.fadeIn('wind_light', 2000, .25);
        else if (night) this.fadeIn('crickets_night', 3000, .4);
        else if (hour >= 6 && hour < 19) this.fadeIn('birds_day', 3000, .4);
        else if (this.currentSound && this.sounds[this.currentSound]) {
            const old = this.sounds[this.currentSound];
            const f = setInterval(() => { old.volume = Math.max(0, old.volume - .05); if (old.volume <= 0) { clearInterval(f); old.pause(); old.currentTime = 0; } }, 50);
            this.currentSound = null;
        }
    }
};