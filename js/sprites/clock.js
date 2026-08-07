const clockSprite = {
    image: null, loaded: false, width: 80, height: 32,
    
    load() {
        return new Promise(resolve => {
            this.image = new Image();
            this.image.onload = () => { this.loaded = true; resolve(); };
            this.image.onerror = () => { this.loaded = false; resolve(); };
            this.image.src = 'sprites/clock.png';
        });
    },
    
    draw(ctx, x, y, sc=1) {
        if (this.loaded) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.image, x, y, this.width*sc, this.height*sc);
        } else {
            const w=this.width*sc, h=this.height*sc;
            ctx.fillStyle='#1e1e35'; ctx.fillRect(x,y,w,h);
            ctx.strokeStyle='#5a5a80'; ctx.lineWidth=2; ctx.strokeRect(x+1,y+1,w-2,h-2);
            ctx.fillStyle='#0a0a1a'; ctx.fillRect(x+8,y+6,w-24,h-12);
            ctx.fillStyle='#4a4a6e'; ctx.fillRect(x+w-14,y+4,6,8); ctx.fillRect(x+w-14,y+h-12,6,8);
        }
    }
};