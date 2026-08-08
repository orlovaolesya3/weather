// Спрайт кота
const catSprite = {
    images: { cat1: null, cat2: null },
    loaded: false,
    width: 120,
    height: 48,
    animTimer: 0,
    currentFrame: 0,
    direction: 1,
    
    async loadAll() {
        await Promise.all(['cat1', 'cat2'].map(t => new Promise(resolve => {
            const img = new Image();
            img.onload = () => { this.images[t] = img; resolve(); };
            img.onerror = () => resolve();
            img.src = `sprites/${t}.png`;
        })));
        this.loaded = true;
    },
    
    update() {
        this.animTimer += 0.01 * this.direction;
        if (this.animTimer >= 1) { this.animTimer = 1; this.direction = -1; }
        else if (this.animTimer <= 0) { this.animTimer = 0; this.direction = 1; }
        this.currentFrame = Math.round(this.animTimer);
    },
    
    draw(ctx, x, y, w, h) {
        this.update();
        const frameNames = ['cat1', 'cat2'];
        const img = this.images[frameNames[this.currentFrame]];
        if (!img) return false;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, x, y, w, h);
        return true;
    }
};