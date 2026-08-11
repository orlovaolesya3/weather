// Спрайты уточек
const ducksSprite = {
    image: null,
    loaded: false,
    width: 11,
    height: 9,
    ducks: [],
    
    async loadAll() {
        await new Promise(resolve => {
            const img = new Image();
            img.onload = () => { this.image = img; this.loaded = true; resolve(); };
            img.onerror = () => resolve();
            img.src = 'sprites/duck.png';
        });
    },
    
    init(ww, gy) {
        this.ducks = [];
        const minDist = 8;
        const maxAttempts = 100;
        
        for (let i = 0; i < 3; i++) {
            let x, y, attempts = 0;
            do {
                x = ww * 0.24 + Math.random() * ww * 0.12;
                y = gy + 265 + Math.random() * 30;
                attempts++;
                if (attempts > maxAttempts) break;
            } while (this.ducks.some(d => Math.abs(d.x - x) < minDist || Math.abs(d.y - y) < minDist));
            
            this.ducks.push({
                size: 0.7 + Math.random() * 0.6,
                x, y,
                speed: 0.02 + Math.random() * 0.05,
                direction: Math.random() > 0.5 ? 1 : -1
            });
        }
    },
    
    update(ww) {
        for (const duck of this.ducks) {
            duck.x += duck.speed * duck.direction;
            if (duck.x > ww * 0.36 || duck.x < ww * 0.24) {
                duck.direction *= -1;
            }
        }
    },
    
    draw(ctx, wx, wy, ww, wh, gy, scale) {
        if (!this.image) return;
        
        const sorted = [...this.ducks].sort((a, b) => a.y - b.y);
        
        for (const duck of sorted) {
            const duckW = this.width * scale * duck.size;
            const duckH = this.height * scale * duck.size;
            
            ctx.imageSmoothingEnabled = false;
            ctx.save();
            ctx.translate(wx + duck.x * scale / 2 + duckW / 2, duck.y);
            if (duck.direction < 0) ctx.scale(-1, 1);
            ctx.drawImage(this.image, -duckW / 2, 0, duckW, duckH);
            ctx.restore();
        }
    }
};