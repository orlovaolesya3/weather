const roomSprite = {
    image: null, loaded: false, width: 1920, height: 1080,
    load() {
        return new Promise(resolve => {
            this.image = new Image();
            this.image.onload = () => { this.loaded = true; resolve(); };
            this.image.onerror = () => { this.loaded = false; resolve(); };
            this.image.src = 'sprites/room.png';
        });
    },
    draw(ctx, w, h) {
        if (this.loaded && this.image) {
            ctx.imageSmoothingEnabled = false;
            const sc = Math.max(w / this.width, h / this.height);
            const sw = this.width * sc, sh = this.height * sc;
            ctx.drawImage(this.image, (w - sw) / 2, (h - sh) / 2, sw, sh);
            return true;
        }
        return false;
    }
};