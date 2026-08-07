// Спрайты деревьев (кроны) с анимацией качания
const treesSprite = {
    images: {
        still: null,
        slight: null,
        strong: null
    },
    loaded: false,
    width: 240,
    height: 120,
    animTimer: 0,
    currentFrame: 'still',
    direction: 1,
    
    async loadAll() {
        const types = ['still', 'slight', 'strong'];
        const promises = types.map(type => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.images[type] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Trees ${type} sprite not found`);
                    resolve();
                };
                img.src = `sprites/trees_${type}.png`;
            });
        });
        await Promise.all(promises);
        this.loaded = true;
    },
    
    update(windSpeed) {
        if (windSpeed < 2) {
            this.currentFrame = 'still';
            this.animTimer = 0;
            return;
        }
        
        let speed, frames;
        if (windSpeed < 5) {
            speed = 0.01;
            frames = ['still', 'slight'];
        } else if (windSpeed < 10) {
            speed = 0.03;
            frames = ['still', 'slight', 'strong'];
        } else {
            speed = 0.06;
            frames = ['slight', 'strong'];
        }
        
        this.animTimer += speed * this.direction;
        
        if (this.animTimer >= frames.length - 1) {
            this.animTimer = frames.length - 1;
            this.direction = -1;
        } else if (this.animTimer <= 0) {
            this.animTimer = 0;
            this.direction = 1;
        }
        
        this.currentFrame = frames[Math.round(this.animTimer)];
    },
    
    draw(ctx, windSpeed, x, y, w, h) {
        this.update(windSpeed);
        const img = this.images[this.currentFrame];
        if (!img) return false;
        
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, x, y, w, h);
        return true;
    }
};