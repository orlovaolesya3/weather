// Спрайт комнаты (стена, подоконник, рама окна)
const roomSprite = {
    image: null,
    loaded: false,
    width: 1776,
    height: 886,
    
    load() {
        return new Promise((resolve) => {
            this.image = new Image();
            this.image.onload = () => {
                this.loaded = true;
                resolve();
            };
            this.image.onerror = () => {
                console.warn('Room sprite not found');
                this.loaded = false;
                resolve();
            };
            this.image.src = 'sprites/room.png';
        });
    },
    
    draw(ctx, w, h) {
        if (this.loaded && this.image) {
            ctx.imageSmoothingEnabled = false;
            const scale = Math.max(w / this.width, h / this.height);
            const sw = this.width * scale;
            const sh = this.height * scale;
            const sx = (w - sw) / 2;
            const sy = (h - sh) / 2;
            ctx.drawImage(this.image, sx, sy, sw, sh);
            return true;
        }
        return false;
    }
};