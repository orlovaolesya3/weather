// Спрайты машин
const carsSprite = {
    images: {},
    loaded: false,
    width: 48,
    height: 24,
    cars: [],
    timerLeft: 0,
    timerRight: 0,
    lastLeft: null,
    lastRight: null,
    
    async loadAll() {
        const types = ['car1', 'car2', 'car3', 'car4', 'car5'];
        await Promise.all(types.map(t => new Promise(resolve => {
            const img = new Image();
            img.onload = () => { this.images[t] = img; resolve(); };
            img.onerror = () => resolve();
            img.src = `sprites/${t}.png`;
        })));
        this.loaded = true;
    },
    
    getRandomVariant(last) {
        let variant;
        do {
            variant = 'car' + (1 + Math.floor(Math.random() * 5));
        } while (variant === last);
        return variant;
    },
    
    init(ww, gy) {
        this.lastLeft = this.getRandomVariant(null);
        this.cars.push({
            type: this.lastLeft,
            goingRight: false,
            speed: 0.9 + Math.random() * 2,
            x: ww * 0.3 + Math.random() * ww * 0.7,
            y: gy - 8
        });
        
        this.lastRight = this.getRandomVariant(null);
        this.cars.push({
            type: this.lastRight,
            goingRight: true,
            speed: 0.9 + Math.random() * 2,
            x: Math.random() * ww * 0.7,
            y: gy + 22
        });
    },
    
    update(ww, wh, gy) {
        this.timerLeft++;
        this.timerRight++;
        
        if (this.timerLeft > 350 + Math.random() * 500) {
            this.timerLeft = 0;
            const leftCars = this.cars.filter(c => !c.goingRight).length;
            if (leftCars < 2) {
                this.lastLeft = this.getRandomVariant(this.lastLeft);
                this.cars.push({
                    type: this.lastLeft,
                    goingRight: false,
                    speed: 0.9 + Math.random() * 2,
                    x: ww + 50,
                    y: gy - 8
                });
            }
        }
        
        if (this.timerRight > 320 + Math.random() * 550) {
            this.timerRight = 0;
            const rightCars = this.cars.filter(c => c.goingRight).length;
            if (rightCars < 2) {
                this.lastRight = this.getRandomVariant(this.lastRight);
                this.cars.push({
                    type: this.lastRight,
                    goingRight: true,
                    speed: 0.9 + Math.random() * 2,
                    x: -50,
                    y: gy + 22
                });
            }
        }
        
        for (let i = this.cars.length - 1; i >= 0; i--) {
            const car = this.cars[i];
            if (car.goingRight) {
                car.x += car.speed;
                if (car.x > ww + 50) this.cars.splice(i, 1);
            } else {
                car.x -= car.speed;
                if (car.x < -50) this.cars.splice(i, 1);
            }
        }
    },
    
    draw(ctx, wx, wy, ww, wh, gy, scale) {
        this.update(ww, wh, gy);
        
        const carW = this.width * scale;
        const carH = this.height * scale;
        
        for (const car of this.cars) {
            if (car.goingRight) continue;
            const img = this.images[car.type];
            if (img) {
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(img, wx + car.x * scale / 2, car.y, carW, carH);
            }
        }
        
        for (const car of this.cars) {
            if (!car.goingRight) continue;
            const img = this.images[car.type];
            if (img) {
                ctx.imageSmoothingEnabled = false;
                ctx.save();
                ctx.translate(wx + car.x * scale / 2 + carW, car.y);
                ctx.scale(-1, 1);
                ctx.drawImage(img, 0, 0, carW, carH);
                ctx.restore();
            }
        }
    }
};