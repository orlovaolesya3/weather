const sunMoonSprites = {
    sun: { image: null, loaded: false }, moon: { image: null, loaded: false },
    async loadAll() {
        await Promise.all(['sun', 'moon'].map(t => new Promise(resolve => {
            const img = new Image();
            img.onload = () => { this[t].image = img; this[t].loaded = true; resolve(); };
            img.onerror = () => { this[t].loaded = false; resolve(); };
            img.src = `sprites/${t}.png`;
        })));
    },
    draw(ctx, type, x, y, sc = 1) {
        const s = this[type];
        if (!s?.loaded) return false;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(s.image, x - 16 * sc, y - 16 * sc, 32 * sc, 32 * sc);
        return true;
    }
};