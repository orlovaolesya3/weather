const SpriteLoader = {
    sprites: { clock: clockSprite },
    async loadAll() {
        await Promise.all([
            ...Object.values(this.sprites).map(s => s.load()),
            cloudSprites.loadAll(), sunMoonSprites.loadAll(), groundSprite.load(),
            treesSprite.loadAll(), roomSprite.load(), calendarSprite.load(), switchSprite.load()
        ]);
    },
    get(name) { return this.sprites[name] || null; }
};