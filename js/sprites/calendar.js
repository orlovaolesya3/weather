// Спрайт календаря
const calendarSprite = {
    image: null,
    loaded: false,
    width: 64,
    height: 96,
    
    load() {
        return new Promise((resolve) => {
            this.image = new Image();
            this.image.onload = () => {
                this.loaded = true;
                resolve();
            };
            this.image.onerror = () => {
                console.warn('Calendar sprite not found');
                this.loaded = false;
                resolve();
            };
            this.image.src = 'sprites/calendar.png';
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