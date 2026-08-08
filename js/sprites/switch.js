const switchSprite = {
    imageOn: null, imageOff: null, loaded: false, width: 48, height: 48, state: false,
    async load() {
        await Promise.all([
            new Promise(resolve => { this.imageOff = new Image(); this.imageOff.onload = resolve; this.imageOff.onerror = resolve; this.imageOff.src = 'sprites/switch_off.png'; }),
            new Promise(resolve => { this.imageOn = new Image(); this.imageOn.onload = resolve; this.imageOn.onerror = resolve; this.imageOn.src = 'sprites/switch_on.png'; })
        ]);
        this.loaded = true;
    },
    toggle() { this.state = !this.state; return this.state; },
    draw(ctx, x, y, w, h) {
        if (!this.loaded) return false;
        ctx.imageSmoothingEnabled = false;
        const img = this.state ? this.imageOn : this.imageOff;
        if (img) ctx.drawImage(img, x, y, w, h);
        return true;
    }
};