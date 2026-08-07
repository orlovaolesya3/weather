// Спрайт земли
const groundSprite = {
    image: null,
    loaded: false,
    width: 240,
    height: 120,
    
    load() {
        return new Promise((resolve) => {
            this.image = new Image();
            this.image.onload = () => {
                this.loaded = true;
                resolve();
            };
            this.image.onerror = () => {
                console.warn('Ground sprite not found, using fallback');
                this.loaded = false;
                resolve();
            };
            this.image.src = 'sprites/ground.png';
        });
    },
    
    draw(ctx, x, y, w, h) {
        if (this.loaded && this.image) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.image, x, y, w, h);
            return true;
        }
        return false;
    }
};