// Отрисовка сцены
function drawCloud(cx, cy, w, h, c1, c2) {
    const b = CONFIG.PX * 2;
    for (let row = 0; row < h; row++) {
        for (let col = 0; col < w; col++) {
            const dc = Math.abs(col - w / 2) / (w / 2);
            const rn = row / h;
            if ((rn < 0.2 && dc > 0.9) || (rn < 0.4 && dc > 0.95) || (rn > 0.7 && dc > 0.8)) continue;
            pixelRect(cx + col * b, cy + row * b, b, b, (row + col) & 1 ? c1 : c2);
        }
    }
    
    const bumps = [
        [-1, -1, 2, 1],
        [Math.floor(w / 2) - 2, -2, 3, 2],
        [w - 2, -1, 2, 1]
    ];
    
    for (const [ox, oy, bw, bh] of bumps) {
        for (let row = 0; row < bh; row++) {
            for (let col = 0; col < bw; col++) {
                pixelRect(cx + (ox + col) * b, cy + oy * b + row * b, b, b, (row + col) & 1 ? c1 : c2);
            }
        }
    }
}

function drawTree(tx, ty, size, sway, isNight) {
    const b = CONFIG.PX;
    const trunkW = Math.floor(3 * size);
    const trunkH = Math.floor(14 * size);
    const trunkX = R(tx - trunkW * b / 2);
    const trunkY = R(ty - trunkH * b);

    // Ствол
    for (let row = 0; row < trunkH; row++) {
        const shade = row % 3 ? 1 : 0.85;
        const [cr, cg, cb] = isNight ? 
            [40 * shade, 25 * shade, 15 * shade] : 
            [90 * shade, 55 * shade, 30 * shade];
        
        pixelRect(trunkX, trunkY + row * b, trunkW * b, b, 
            `rgb(${R(cr)},${R(cg)},${R(cb)})`);
        
        if (!(row & 3) && trunkW > 2) {
            pixelRect(trunkX + b, trunkY + row * b, b, b, 
                `rgb(${R(cr + 10)},${R(cg + 5)},${R(cb + 5)})`);
        }
        if (row % 5 === 2 && trunkW > 2) {
            pixelRect(trunkX + (trunkW - 2) * b, trunkY + row * b, b, b, 
                `rgb(${R(cr - 5)},${R(cg - 5)},${R(cb - 5)})`);
        }
    }

    // Крона
    const cx = tx + sway * b * 6;
    const cy = ty - trunkH * b - 2 * b;
    const cSize = Math.floor(10 * size);
    const leafColors = isNight ?
        ['#1a3a1a', '#1f3f1f', '#153015', '#224422'] :
        ['#3a8a3a', '#4a9a4a', '#2d7d2d', '#459045'];

    // Боковые блоки
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = cSize * b * (0.4 + Math.sin(i * 1.5) * 0.2);
        const bx = RG(cx + Math.cos(angle) * dist, b);
        const by = RG(cy + Math.sin(angle) * dist * 0.6, b);
        const bSize = Math.floor((3 + Math.sin(i * 2.3) * 1.5) * size);
        
        for (let row = 0; row < bSize; row++) {
            for (let col = 0; col < bSize; col++) {
                const dx = col - bSize / 2;
                const dy = row - bSize / 2;
                if (dx * dx + dy * dy > (bSize / 2) ** 2) continue;
                pixelRect(bx + col * b, by + row * b, b, b, leafColors[(i + row + col) & 3]);
            }
        }
    }

    // Центральный блок
    for (let row = 0; row < cSize; row++) {
        for (let col = 0; col < cSize; col++) {
            const dx = col - cSize / 2;
            const dy = row - cSize / 2;
            if (dx * dx + dy * dy > (cSize / 2) ** 2) continue;
            pixelRect(R(cx - cSize * b / 2 + col * b), R(cy - cSize * b / 2 + row * b), 
                b, b, leafColors[(row + col) & 3]);
        }
    }
}

function drawScene() {
    State.frame++;
    const { W, H } = State;
    const hour = State.hour;
    const wind = State.wind;
    const isNight = hour < 6 || hour >= 20;
    const isDawn = hour >= 6 && hour < 10;
    const isDusk = hour >= 17 && hour < 20;
    const weatherCat = getWeatherCategory(State.conditionCode);
    const isRainy = weatherCat === 'rain' || weatherCat === 'storm';
    const isSnowy = weatherCat === 'snow';
    const showClouds = weatherCat === 'cloudy' || weatherCat === 'partly' || isRainy || isSnowy;
    const showStars = isNight && weatherCat === 'clear';

    // Выбор цветов неба
    let skyKey;
    if (isRainy) skyKey = 'rain';
    else if (isSnowy) skyKey = 'snow';
    else if (weatherCat === 'cloudy') skyKey = 'cloudy';
    else if (isNight) skyKey = 'clear_night';
    else if (isDawn) skyKey = 'clear_dawn';
    else if (isDusk) skyKey = 'clear_dusk';
    else skyKey = 'clear_day';

    const skyColors = CONFIG.SKY_COLORS[skyKey];
    const nightIndex = isNight ? 0 : 1;
    const skyTop = skyColors.top[nightIndex];
    const skyBottom = skyColors.bottom[nightIndex];
    const sunColor = skyColors.sun;

    // Небо
    const gradient = DOM.ctx.createLinearGradient(0, 0, 0, H * 0.75);
    gradient.addColorStop(0, skyTop);
    gradient.addColorStop(1, skyBottom);
    DOM.ctx.fillStyle = gradient;
    DOM.ctx.fillRect(0, 0, W, H);

    // Звёзды
    if (showStars) {
        for (const star of State.stars) {
            const flicker = Math.sin(State.frame * star.twinkleSpeed + star.x) * 0.5 + 0.5;
            const sx = R(star.x / 100 * W);
            const sy = R(star.y / 100 * H);
            pixelRect(sx, sy, CONFIG.PX, CONFIG.PX, 
                `rgb(${180 + R(flicker * star.brightness * 10)},${200 + R(flicker * star.brightness * 5)},255)`);
            
            if (star.brightness > 4) {
                const dimColor = `rgba(255,255,255,${0.1 * flicker})`;
                for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                    pixelRect(sx + dx * CONFIG.PX, sy + dy * CONFIG.PX, CONFIG.PX, CONFIG.PX, dimColor);
                }
            }
        }
    }

    // Горы
    const groundY = H * 0.78;
    const mountainColor1 = isNight ? '#1a2a3a' : isRainy ? '#5a6a7a' : isSnowy ? '#c0d0e0' : '#6a8a6a';
    const mountainColor2 = isNight ? '#152535' : isRainy ? '#4a5a6a' : isSnowy ? '#b0c0d0' : '#5a7a5a';

    for (const [mx, mw, mh] of [[0.15, 0.35, 0.3], [0.5, 0.4, 0.25]]) {
        const startX = W * mx;
        const width = W * mw;
        const height = H * mh;
        
        for (let x = 0; x < width; x += CONFIG.PX) {
            const heightFactor = 1 - Math.abs(x - width / 2) / (width / 2);
            const peakHeight = RG(height * heightFactor * heightFactor);
            pixelRect(startX + x, groundY - peakHeight, CONFIG.PX, peakHeight, 
                (x / CONFIG.PX) & 1 ? mountainColor1 : mountainColor2);
        }
    }

    // Земля
    const groundColor1 = isNight ? '#1a2a1a' : isSnowy ? '#e8f0f0' : '#4a7a3a';
    const groundColor2 = isNight ? '#152515' : isSnowy ? '#dde8e8' : '#3a6a2a';
    
    for (let y = groundY; y < H; y += CONFIG.PX) {
        pixelRect(0, y, W, CONFIG.PX, ((y / CONFIG.PX) & 1) ? groundColor1 : groundColor2);
    }

    // Дорога
    const roadY = groundY;
    for (let y = roadY - 2 * CONFIG.PX; y < roadY + 2 * CONFIG.PX; y += CONFIG.PX) {
        pixelRect(0, y, W, CONFIG.PX, 
            ((y / CONFIG.PX) & 1) ? (isNight ? '#2a2a2a' : '#5a5a5a') : (isNight ? '#252525' : '#4a4a4a'));
    }

    // Разметка
    const dashWidth = RG(W * 0.04);
    const dashGap = RG(W * 0.06);
    for (let x = 0; x < W; x += dashWidth + dashGap) {
        pixelRect(x, roadY - CONFIG.PX, dashWidth, CONFIG.PX * 2, isNight ? '#444' : '#ddd');
    }

    // Солнце/Луна
    const sunProgress = (hour + State.minute / 60) / 24;
    const sunX = R(W * (0.1 + sunProgress * 0.8));
    const sunY = R(H * 0.15 + Math.sin(sunProgress * Math.PI) * H * 0.4);
    const sunRadius = Math.floor(W * 0.05 / CONFIG.PX);

    // Свечение
    const glowRadius = sunRadius * 3;
    for (let r = glowRadius; r > 0; r--) {
        const alpha = 0.03 * (1 - r / glowRadius);
        if (sunColor.startsWith('#')) {
            const [cr, cg, cb] = [
                parseInt(sunColor.slice(1, 3), 16),
                parseInt(sunColor.slice(3, 5), 16),
                parseInt(sunColor.slice(5, 7), 16)
            ];
            DOM.ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
        } else {
            DOM.ctx.fillStyle = sunColor;
        }
        DOM.ctx.fillRect(sunX - r * CONFIG.PX, sunY - r * CONFIG.PX, 
            r * 2 * CONFIG.PX, r * 2 * CONFIG.PX);
    }

    // Отрисовка солнца/луны
    if (isNight) {
        const [mr, mg, mb] = [
            parseInt(sunColor.slice(1, 3), 16),
            parseInt(sunColor.slice(3, 5), 16),
            parseInt(sunColor.slice(5, 7), 16)
        ];
        
        for (let dy = -sunRadius; dy <= sunRadius; dy++) {
            for (let dx = -sunRadius; dx <= sunRadius; dx++) {
                if (dx * dx + dy * dy <= sunRadius * sunRadius) {
                    const shade = (Math.abs(dx) + Math.abs(dy)) % 3 ? 1 : 0.9;
                    pixelRect(sunX + dx * CONFIG.PX, sunY + dy * CONFIG.PX, CONFIG.PX, CONFIG.PX,
                        `rgb(${R(mr * shade)},${R(mg * shade)},${R(mb * shade)})`);
                }
            }
        }
        pixelRect(sunX + 2 * CONFIG.PX, sunY - 2 * CONFIG.PX, CONFIG.PX * 3, CONFIG.PX * 3,
            `rgb(${mr - 20},${mg - 20},${mb - 10})`);
    } else {
        for (let dy = -sunRadius; dy <= sunRadius; dy++) {
            for (let dx = -sunRadius; dx <= sunRadius; dx++) {
                if (dx * dx + dy * dy <= sunRadius * sunRadius) {
                    const shade = (Math.abs(dx) + Math.abs(dy)) & 1 ? 0.85 : 1;
                    pixelRect(sunX + dx * CONFIG.PX, sunY + dy * CONFIG.PX, CONFIG.PX, CONFIG.PX,
                        `rgb(${R(255 * shade)},${R(220 * shade)},${R(60 * shade)})`);
                }
            }
        }
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const lx = sunX + Math.cos(angle) * sunRadius * CONFIG.PX * 1.5;
            const ly = sunY + Math.sin(angle) * sunRadius * CONFIG.PX * 1.5;
            pixelRect(lx - CONFIG.PX, ly - CONFIG.PX, CONFIG.PX * 2, CONFIG.PX * 2, '#ffdd44');
        }
    }

    // Облака
    if (showClouds && State.clouds.length) {
        const cloudColor1 = isNight ? '#3a3a5a' : '#ddeeff';
        const cloudColor2 = isNight ? '#2a2a4a' : '#ccddee';
        const cloudColor3 = isNight ? '#4a4a6a' : '#eef4ff';
        
        for (const cloud of State.clouds) {
            const cx = R(cloud.x * W + Math.sin(State.frame * 0.005 * cloud.speed + cloud.y * 10) * W * 0.02);
            const cy = R(cloud.y * H);
            drawCloud(cx, cy, cloud.w, cloud.h, cloudColor1, cloudColor2);
            
            const offsetX = Math.floor(cloud.w * 0.3) * CONFIG.PX * 2;
            const offsetY = -Math.floor(cloud.h * 0.3) * CONFIG.PX * 2;
            drawCloud(cx + offsetX, cy + offsetY, Math.floor(cloud.w * 0.7), 
                Math.floor(cloud.h * 0.6), cloudColor3, cloudColor1);
        }
    }

    // Дождь
    if (isRainy) {
        const count = weatherCat === 'storm' ? 180 : 100;
        for (let i = 0; i < count && i < State.rain.length; i++) {
            const drop = State.rain[i];
            const fallOffset = (State.frame * 0.03 * drop.speed + drop.phase) % 100;
            const rx = R(drop.x / 100 * W);
            const ry = R(((drop.y + fallOffset) % 90) / 100 * H);
            
            for (let dy = 0; dy < drop.len * CONFIG.PX; dy += CONFIG.PX) {
                pixelRect(rx + dy * 0.3, ry + dy, CONFIG.PX, CONFIG.PX,
                    `rgba(150,180,220,${0.3 + dy / (drop.len * CONFIG.PX) * 0.3})`);
            }
        }
    }

    // Снег
    if (isSnowy) {
        for (const flake of State.snow) {
            const fallOffset = (State.frame * 0.015 * flake.speed + flake.phase) % 100;
            const sx = R((flake.x + Math.sin(State.frame * 0.02 + flake.wobble) * 3) / 100 * W);
            const sy = R(((flake.y + fallOffset) % 90) / 100 * H);
            const size = flake.size * CONFIG.PX;
            
            pixelRect(sx, sy, size, size, 'rgba(255,255,255,0.8)');
            
            if (size > CONFIG.PX * 2) {
                for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
                    pixelRect(sx + dx * size, sy + dy * size, size, size, 'rgba(255,255,255,0.4)');
                }
            }
        }
    }

    // Деревья
    for (const treeConfig of CONFIG.TREES) {
        const sway = Math.sin(State.frame * 0.015 + treeConfig.x * 10) * wind * 0.003;
        drawTree(R(treeConfig.x * W), R(groundY), treeConfig.size, sway, isNight);
    }

    // Блик на стекле
    for (let y = 0; y < H * 0.3; y += CONFIG.PX * 2) {
        for (let x = 0; x < W * 0.3; x += CONFIG.PX * 2) {
            if (!(((x / CONFIG.PX + y / CONFIG.PX) & 3))) {
                const alpha = 0.04 * (1 - x / (W * 0.3)) * (1 - y / (H * 0.3));
                pixelRect(x, y, CONFIG.PX * 2, CONFIG.PX * 2, `rgba(255,255,255,${alpha})`);
            }
        }
    }
}