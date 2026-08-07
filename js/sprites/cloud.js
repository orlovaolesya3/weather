const cloudSprites = {
    small: { image:null, w:32, h:16, loaded:false },
    medium: { image:null, w:48, h:24, loaded:false },
    large: { image:null, w:64, h:32, loaded:false },
    
    async loadAll() {
        await Promise.all(['small','medium','large'].map(t => new Promise(resolve => {
            const img = new Image();
            img.onload = () => { this[t].image = img; this[t].loaded = true; resolve(); };
            img.onerror = () => { this[t].loaded = false; resolve(); };
            img.src = `sprites/cloud_${t}.png`;
        })));
    },
    
    getRandomType() {
        const types = ['small','medium','large'].filter(t => this[t].loaded);
        return types.length ? types[Math.floor(Math.random()*types.length)] : null;
    },
    
    draw(ctx, type, x, y, sc=1) {
        const s = this[type];
        if (!s?.loaded) return false;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(s.image, x, y, s.w*sc, s.h*sc);
        return true;
    }
};