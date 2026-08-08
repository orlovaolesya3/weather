const treesSprite = {
    images: { still: null, slight: null, strong: null }, loaded: false, width: 240, height: 120,
    animTimer: 0, currentFrame: 'still', direction: 1,
    async loadAll() {
        await Promise.all(['still', 'slight', 'strong'].map(t => new Promise(resolve => {
            const img = new Image();
            img.onload = () => { this.images[t] = img; resolve(); };
            img.onerror = () => resolve();
            img.src = `sprites/trees_${t}.png`;
        })));
        this.loaded = true;
    },
    update(wind) {
        if (wind < 3) { this.currentFrame = 'still'; this.animTimer = 0; return; }
        const spd = wind < 9 ? .02 : .04;
        const frames = wind < 9 ? ['still', 'slight'] : ['still', 'slight', 'strong'];
        this.animTimer += spd * this.direction;
        if (this.animTimer >= frames.length - 1) { this.animTimer = frames.length - 1; this.direction = -1; }
        else if (this.animTimer <= 0) { this.animTimer = 0; this.direction = 1; }
        this.currentFrame = frames[Math.round(this.animTimer)];
    },
    draw(ctx, wind, x, y, w, h) {
        this.update(wind);
        const img = this.images[this.currentFrame];
        if (!img) return false;
        ctx.imageSmoothingEnabled = false; ctx.drawImage(img, x, y, w, h);
        return true;
    }
};