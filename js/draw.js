function drawCloud(cx, cy, w, h, c1, c2) {
    const b = CONFIG.PX * 2;
    for (let r = 0; r < h; r++)
        for (let cl = 0; cl < w; cl++) {
            const dc = Math.abs(cl - w / 2) / (w / 2), rn = r / h;
            if ((rn < .2 && dc > .9) || (rn < .4 && dc > .95) || (rn > .7 && dc > .8)) continue;
            pixelRect(cx + cl * b, cy + r * b, b, b, (r + cl) & 1 ? c1 : c2);
        }
    for (const [ox, oy, bw, bh] of [[-1, -1, 2, 1], [Math.floor(w / 2) - 2, -2, 3, 2], [w - 2, -1, 2, 1]])
        for (let r = 0; r < bh; r++)
            for (let cl = 0; cl < bw; cl++)
                pixelRect(cx + (ox + cl) * b, cy + oy * b + r * b, b, b, (r + cl) & 1 ? c1 : c2);
}

let sc, sunX, sunY, sunSc, showMoon, showSun, darkness, twilight, glowAlpha;
let lightningFrames = 0, lightningAlpha = 0, lightningPaths = [];
let wx, wy, ww, wh;
let cachedRoomScale, cachedGroundDrawH, cachedGy, cachedCarScale, cachedCatScale;

function generateLightning() {
    const lx = R(wx + Math.random() * ww), ly = R(wy + Math.random() * wh * .3);
    const segments = 5 + Math.floor(Math.random() * 8);
    const path = [{ x: lx, y: ly }];
    let cx = lx, cy = ly;
    for (let i = 0; i < segments; i++) {
        cx += (Math.random() - .5) * ww * .15; cy += wh * .06 + Math.random() * wh * .1;
        path.push({ x: cx, y: cy });
    }
    const branches = [];
    for (let b = 0; b < 2; b++) {
        const idx = 2 + Math.floor(Math.random() * (segments - 2));
        branches.push({ x: path[idx].x + (Math.random() - .5) * ww * .15, y: path[idx].y + wh * .02, ex: path[idx].x + (Math.random() - .5) * ww * .2, ey: path[idx].y + wh * .1 });
    }
    lightningPaths = [{ path, branches }];
    lightningFrames = 4; lightningAlpha = 1;
}

function drawScene() {
    State.frame++;
    const { W, H, hour, wind } = State;
    const hf = hour + State.minute / 60;

    roomSprite.draw(DOM.ctx, W, H);

    if (State.frame === 1) {
        cachedRoomScale = Math.max(W / roomSprite.width, H / roomSprite.height);
    }
    const rs = cachedRoomScale;
    const roomX = (W - roomSprite.width * rs) / 2, roomY = (H - roomSprite.height * rs) / 2;
    wx = roomX + CONFIG.WINDOW.x1 * rs; wy = roomY + CONFIG.WINDOW.y1 * rs;
    ww = (CONFIG.WINDOW.x2 - CONFIG.WINDOW.x1) * rs; wh = (CONFIG.WINDOW.y2 - CONFIG.WINDOW.y1) * rs;

    darkness = 0;
    if (hf < 4) darkness = 1;
    else if (hf < 7) darkness = 1 - (hf - 4) / 3;
    else if (hf < 19) darkness = 0;
    else if (hf < 22) darkness = (hf - 19) / 3;
    else darkness = 1;

    twilight = darkness > .03 && darkness < .75;
    if (twilight && showSun) {
        if (darkness < .15) glowAlpha = (.15 - darkness) / .15;
        else if (darkness < .3) glowAlpha = 1;
        else glowAlpha = 1 - (darkness - .3) / .45;
    } else glowAlpha = 0;

    const night = darkness > .65;
    const wc = getWeatherCategory(State.conditionCode);
    const rainy = wc === 'rain' || wc === 'storm', snowy = wc === 'snow';
    const showCl = wc === 'cloudy' || wc === 'partly' || rainy || snowy;

    let sk;
    if (rainy) sk = 'rain'; else if (snowy) sk = 'snow'; else if (wc === 'cloudy') sk = 'cloudy';
    else if (night) sk = 'clear_night'; else if (hf >= 4.5 && hf < 6.5) sk = 'clear_dawn';
    else if (hf >= 19.5 && hf < 21.5) sk = 'clear_dusk'; else sk = 'clear_day';

    sc = CONFIG.SKY_COLORS[sk];
    const ni = night ? 0 : 1;
    
    if (State.frame === 1 || !cachedGroundDrawH) {
        const groundScale = ww / groundSprite.width;
        cachedGroundDrawH = groundSprite.height * groundScale;
        cachedGy = wy + wh - cachedGroundDrawH;
        cachedCarScale = ww / 400;
        cachedCatScale = ww / 270;
    }
    const groundDrawH = cachedGroundDrawH, gy = cachedGy, carScale = cachedCarScale, catScale = cachedCatScale;

    DOM.ctx.save();
    DOM.ctx.beginPath(); DOM.ctx.rect(wx, wy, ww, wh); DOM.ctx.clip();

    const grad = DOM.ctx.createLinearGradient(0, wy, 0, wy + wh);
    grad.addColorStop(0, sc.t[ni]); grad.addColorStop(1, sc.b[ni]);
    DOM.ctx.fillStyle = grad; DOM.ctx.fillRect(wx, wy, ww, wh);

    const vigGrad = DOM.ctx.createRadialGradient(wx + ww / 2, wy + wh * .35, ww * .25, wx + ww / 2, wy + wh * .35, ww * .75);
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)'); vigGrad.addColorStop(.5, 'rgba(0,0,0,0)'); vigGrad.addColorStop(1, 'rgba(0,0,0,0.18)');
    DOM.ctx.fillStyle = vigGrad; DOM.ctx.fillRect(wx, wy, ww, gy - wy);

    if (darkness > .25 && !rainy && !snowy && wc !== 'cloudy') {
        const starAlpha = Math.min(1, (darkness - .25) / .5);
        for (const s of State.stars) {
            const fl = Math.sin(State.frame * s.twinkleSpeed + s.x) * .5 + .5;
            const sx = R(wx + s.x / 100 * ww), sy = R(wy + s.y / 100 * wh);
            const sz = s.brightness * starAlpha > 7 ? CONFIG.PX * 2 : CONFIG.PX;
            const alpha = starAlpha * (.6 + fl * .4);
            pixelRect(sx, sy, sz, sz, `rgba(220,230,255,${alpha})`);
            if (s.brightness * starAlpha > 5) {
                const dc = `rgba(200,210,255,${.3 * fl * starAlpha})`;
                for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) pixelRect(sx + dx * CONFIG.PX, sy + dy * CONFIG.PX, CONFIG.PX, CONFIG.PX, dc);
            }
        }
    }

    const sunRise = 5, sunSet = 20, moonRise = 21, moonSet = 4;
    showSun = hf >= sunRise && hf < sunSet;
    showMoon = hf >= moonRise || hf < moonSet;
    sunX = sunY = 0;

    if (showSun || showMoon) {
        let prog;
        if (showSun) { prog = (hf - sunRise) / (sunSet - sunRise); sunSc = Math.max(2, Math.floor(ww * .08 / 16)); }
        else { prog = hf >= moonRise ? (hf - moonRise) / (24 - moonRise + moonSet) : (24 - moonRise + hf) / (24 - moonRise + moonSet); sunSc = Math.max(2, Math.floor(ww * .09 / 16)); }
        sunX = R(wx + ww * (.1 + prog * .8));
        sunY = R(wy + wh * .82 - Math.sin(prog * Math.PI) * wh * .65);
    }

    if (glowAlpha > 0 && showSun && !rainy && !snowy) {
        const alpha = glowAlpha * .9, glowR = ww * .8;
        const pinkGrad = DOM.ctx.createRadialGradient(sunX, sunY, sunSc * 16, sunX, sunY, glowR);
        pinkGrad.addColorStop(0, `rgba(255,180,140,${alpha})`);
        pinkGrad.addColorStop(.2, `rgba(255,150,110,${alpha * .7})`);
        pinkGrad.addColorStop(.5, `rgba(255,120,80,${alpha * .4})`);
        pinkGrad.addColorStop(.8, `rgba(255,80,60,${alpha * .12})`);
        pinkGrad.addColorStop(1, 'rgba(255,60,40,0)');
        DOM.ctx.fillStyle = pinkGrad; DOM.ctx.fillRect(wx, wy, ww, wh);
    }

    if (showSun || showMoon) {
        if (showMoon) {
            if (!sunMoonSprites.draw(DOM.ctx, 'moon', sunX, sunY, sunSc)) {
                const mR = 16 * sunSc;
                for (let dy = -mR; dy <= mR; dy += CONFIG.PX)
                    for (let dx = -mR; dx <= mR; dx += CONFIG.PX)
                        if (dx * dx + dy * dy <= mR * mR) pixelRect(sunX + dx, sunY + dy, CONFIG.PX, CONFIG.PX, 'rgb(220,220,255)');
            }
        } else {
            if (!sunMoonSprites.draw(DOM.ctx, 'sun', sunX, sunY, sunSc)) {
                const sR = 16 * sunSc;
                for (let dy = -sR; dy <= sR; dy += CONFIG.PX)
                    for (let dx = -sR; dx <= sR; dx += CONFIG.PX)
                        if (dx * dx + dy * dy <= sR * sR) pixelRect(sunX + dx, sunY + dy, CONFIG.PX, CONFIG.PX, '#ffdd44');
                for (let i = 0; i < 8; i++) {
                    const a = i / 8 * Math.PI * 2;
                    pixelRect(sunX + Math.cos(a) * sR * 1.5 - CONFIG.PX * 2, sunY + Math.sin(a) * sR * 1.5 - CONFIG.PX * 2, CONFIG.PX * 4, CONFIG.PX * 4, '#ffdd44');
                }
            }
        }
    }

    if (showCl && State.clouds.length) {
        const sortedClouds = [...State.clouds].sort((a, b) => {
            const sizes = { small: 0, medium: 1, large: 2 };
            return (sizes[b.type] || 1) - (sizes[a.type] || 1);
        });
        
        for (const cl of sortedClouds) {
            const cx = R(wx + cl.x * ww + Math.sin(State.frame * .005 * cl.speed + cl.y * 10) * ww * .02);
            const cy = R(wy + cl.y * wh);
            if (!cloudSprites.draw(DOM.ctx, cl.type, cx, cy, 3)) drawCloud(cx, cy, 6, 3, '#ddeeff', '#ccddee');
        }
    }

    if (glowAlpha > 0 && !rainy && !snowy && wc !== 'cloudy') {
        const hazeAlpha = glowAlpha * .7;
        const hazeGrad = DOM.ctx.createLinearGradient(0, wy + wh * .4, 0, wy + wh * .9);
        const hazeColor = hf < 12 ? '255,170,140' : '255,140,100';
        hazeGrad.addColorStop(0, `rgba(${hazeColor},0)`);
        hazeGrad.addColorStop(.3, `rgba(${hazeColor},${hazeAlpha * .3})`);
        hazeGrad.addColorStop(.6, `rgba(${hazeColor},${hazeAlpha * .6})`);
        hazeGrad.addColorStop(1, `rgba(${hazeColor},${hazeAlpha})`);
        DOM.ctx.fillStyle = hazeGrad; DOM.ctx.fillRect(wx, wy + wh * .4, ww, wh * .5);
    }

    groundSprite.draw(DOM.ctx, wx, gy, ww, groundDrawH);
    treesSprite.draw(DOM.ctx, wind, wx, gy, ww, groundDrawH);

    if (State.frame === 1) ducksSprite.init(ww, gy);
    if (State.frame % 4 === 0) ducksSprite.update(ww);
    ducksSprite.draw(DOM.ctx, wx, wy, ww, wh, gy, carScale);

    const carsGy = gy + groundDrawH * .7;
    if (State.frame === 1) carsSprite.init(ww, carsGy);
    carsSprite.draw(DOM.ctx, wx, wy, ww, wh, carsGy, carScale);

    if (rainy) {
        const cnt = wc === 'storm' ? 120 : 60;
        for (let i = 0; i < cnt && i < State.rain.length; i++) {
            const d = State.rain[i], fall = (State.frame * .03 * d.speed + d.phase) % 100;
            const rx = R(wx + d.x / 100 * ww), ry = R(wy + ((d.y + fall) % 90) / 100 * wh);
            for (let dy = 0; dy < d.len * CONFIG.PX; dy += CONFIG.PX) pixelRect(rx + dy * .3, ry + dy, CONFIG.PX, CONFIG.PX, `rgba(150,180,220,${.3 + dy / (d.len * CONFIG.PX) * .3})`);
        }

        if (wc === 'storm' && Math.random() < .01 && lightningFrames === 0) generateLightning();
        if (lightningFrames > 0) {
            lightningFrames--; lightningAlpha = lightningFrames / 4;
            DOM.ctx.fillStyle = `rgba(255,255,255,${lightningAlpha * .15})`; DOM.ctx.fillRect(wx, wy, ww, wh);
            for (const lp of lightningPaths) {
                DOM.ctx.strokeStyle = `rgba(255,255,200,${lightningAlpha * .9})`; DOM.ctx.lineWidth = CONFIG.PX;
                DOM.ctx.beginPath(); DOM.ctx.moveTo(lp.path[0].x, lp.path[0].y);
                for (let i = 1; i < lp.path.length; i++) DOM.ctx.lineTo(lp.path[i].x, lp.path[i].y);
                DOM.ctx.stroke();
                for (const br of lp.branches) {
                    DOM.ctx.strokeStyle = `rgba(255,255,200,${lightningAlpha * .5})`; DOM.ctx.lineWidth = CONFIG.PX / 2;
                    DOM.ctx.beginPath(); DOM.ctx.moveTo(br.x, br.y); DOM.ctx.lineTo(br.ex, br.ey); DOM.ctx.stroke();
                }
            }
        }
    }

    if (snowy) for (const sf of State.snow) {
        const fall = (State.frame * .015 * sf.speed + sf.phase) % 100;
        const sx = R(wx + (sf.x + Math.sin(State.frame * .02 + sf.wobble) * 3) / 100 * ww);
        const sy = R(wy + ((sf.y + fall) % 90) / 100 * wh);
        const sz = sf.size * CONFIG.PX;
        pixelRect(sx, sy, sz, sz, 'rgba(255,255,255,.8)');
        if (sz > CONFIG.PX * 2) for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) pixelRect(sx + dx * sz, sy + dy * sz, sz, sz, 'rgba(255,255,255,.4)');
    }

    if (darkness > .1) { DOM.ctx.fillStyle = `rgba(5,5,25,${(darkness - .1) * .78})`; DOM.ctx.fillRect(wx, wy, ww, wh); }

    if ((showSun || showMoon) && sunX > 0) {
        const glowR = (showMoon ? 80 : 64) * sunSc, ga = showMoon ? .02 : .04;
        for (let r = glowR; r > 0; r -= CONFIG.PX * 2) {
            const a = ga * (1 - r / glowR), color = showMoon ? '160,170,220' : '255,240,180';
            DOM.ctx.fillStyle = `rgba(${color},${a})`;
            DOM.ctx.beginPath(); DOM.ctx.arc(sunX, sunY, r, 0, Math.PI * 2); DOM.ctx.fill();
        }
    }

    if (darkness < .2)
        for (let y = 0; y < wh * .3; y += CONFIG.PX * 2)
            for (let x = 0; x < ww * .3; x += CONFIG.PX * 2)
                if (!(((x / CONFIG.PX + y / CONFIG.PX) & 3)))
                    pixelRect(wx + x, wy + y, CONFIG.PX * 2, CONFIG.PX * 2, `rgba(255,255,255,${.04 * (1 - x / (ww * .3)) * (1 - y / (wh * .3))})`);

    DOM.ctx.restore();

    const catW = 120 * catScale, catH = 48 * catScale;
    const catX = wx + 10, catY = H * .97 - catH;
    catSprite.draw(DOM.ctx, catX, catY, catW, catH);

    if (darkness > 0.1) {
        const lm = switchSprite.state ? 0.3 : 1;
        DOM.ctx.save();
        DOM.ctx.beginPath();
        DOM.ctx.rect(0, 0, W, H);
        DOM.ctx.rect(wx, wy, ww, wh);
        DOM.ctx.clip('evenodd');
        DOM.ctx.fillStyle = `rgba(5, 5, 25, ${(darkness - 0.1) * 0.5 * lm})`;
        DOM.ctx.fillRect(0, 0, W, H);
        DOM.ctx.restore();
    }

    const overlay = document.getElementById('lightOverlay');
    if (overlay) overlay.classList.toggle('on', switchSprite.state);

    const lm = switchSprite.state ? 0.3 : 1;
    const filterVal = darkness > 0.1 ? `brightness(${1 - (darkness - 0.1) * 0.6 * lm})` : 'brightness(1)';
    document.querySelector('.clock').style.filter = filterVal;
    document.querySelector('.calendar-wall').style.filter = filterVal;
    document.querySelector('.light-switch').style.filter = filterVal;
}