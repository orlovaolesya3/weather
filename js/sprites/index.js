const SpriteLoader = {
    sprites: {
        clock: clockSprite,
    },
    
    async loadAll() {
        const promises = Object.values(this.sprites).map(sprite => sprite.load());
        promises.push(cloudSprites.loadAll());
        promises.push(sunMoonSprites.loadAll());
        promises.push(groundSprite.load());
        promises.push(treesSprite.loadAll());
        promises.push(roomSprite.load());
        promises.push(calendarSprite.load());
        promises.push(switchSprite.load());
        await Promise.all(promises);
        console.log('✅ All sprites loaded');
    },
    
    get(name) {
        return this.sprites[name] || null;
    }
};