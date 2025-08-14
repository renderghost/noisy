// Pure helpers
function rnd(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
}
function idx(x, y, W) {
    return y * W + x;
}
function stampPoint(ix, iy, val, mask, W, H) {
    if (ix < 0 || iy < 0 || ix >= W || iy >= H) return;
    const i = idx(ix, iy, W);
    mask[i] = val;
    if (ix > 0) mask[i - 1] = val;
    if (ix < W - 1) mask[i + 1] = val;
    if (iy > 0) mask[i - W] = val;
    if (iy < H - 1) mask[i + W] = val;
}
function setMaskLine(x0, y0, x1, y1, val, mask, W, H) {
    let dx = x1 - x0,
        dy = y1 - y0;
    const steps = Math.max(Math.abs(dx), Math.abs(dy)) | 0;
    if (!steps) {
        stampPoint(x0 | 0, y0 | 0, val, mask, W, H);
        return;
    }
    const sx = dx / steps,
        sy = dy / steps;
    let x = x0,
        y = y0;
    for (let i = 0; i <= steps; i++) {
        stampPoint(x | 0, y | 0, val, mask, W, H);
        x += sx;
        y += sy;
    }
}
function getMask(ix, iy, mask, W, H) {
    if (ix < 0 || iy < 0 || ix >= W || iy >= H) return 0;
    return mask[idx(ix, iy, W)];
}

// Factory to bind shared state without globals
export function makeSim(shared) {
    // shared: { getW, getH, getMask, P, tRef }
    const { getW, getH, getMask, P, tRef } = shared;

    class Agent {
        constructor(x, y, ang, life, toChild, sign) {
            this.x = x;
            this.y = y;
            this.px = x;
            this.py = y;
            this.ang = ang;
            this.phase = Math.random() * 1000;
            this.age = 0;
            this.life = life;
            this.toChild = toChild;
            this.childTimer = toChild;
            this.sign = sign;
            this.dead = false;
        }
        step(out) {
            if (this.dead) return;
            const W = getW(),
                H = getH(),
                mask = getMask();
            const n = noise(
                this.x * P.noiseScale,
                this.y * P.noiseScale,
                this.phase + tRef()
            );
            this.ang += (n * 2 - 1) * P.noiseTurn;
            const nx = this.x + Math.cos(this.ang) * P.speed;
            const ny = this.y + Math.sin(this.ang) * P.speed;
            if (nx < 5 || ny < 5 || nx > W - 5 || ny > H - 5) {
                this.dead = true;
                return;
            }
            this.px = this.x;
            this.py = this.y;
            this.x = nx;
            this.y = ny;
            this.age++;
            if (this.age > this.life) {
                this.dead = true;
                return;
            }
            this.childTimer--;
            if (this.childTimer <= 0) this.spawnChild(out);
        }
        draw(g) {
            if (this.dead) return;
            const isWhite = this.sign > 0;
            g.stroke(isWhite ? 0 : 255, 230);
            g.line(this.px, this.py, this.x, this.y);
            const W = getW(),
                H = getH(),
                mask = getMask();
            setMaskLine(
                this.px,
                this.py,
                this.x,
                this.y,
                isWhite ? 2 : 1,
                mask,
                W,
                H
            );
        }
        spawnChild(out) {
            const RIGHT = Math.PI / 2,
                jitter = (P.jitterDeg * Math.PI) / 180;
            const turn = Math.random() < 0.5 ? RIGHT : -RIGHT;
            const childAng = this.ang + turn + (Math.random() * 2 - 1) * jitter;
            const childLife = Math.max(
                120,
                Math.floor(this.life * (0.65 + Math.random() * 0.3))
            );
            const next = this.nextTimer(this.toChild);
            if (out.length < P.maxAgents)
                out.push(
                    new Agent(
                        this.x,
                        this.y,
                        childAng,
                        childLife,
                        next,
                        this.sign
                    )
                );
            this.toChild = this.nextTimer(this.toChild);
            this.childTimer = this.toChild;
        }
        explode(out) {
            const spread = (P.expSpreadDeg * Math.PI) / 180,
                opp = -this.sign;
            const base = this.ang + (Math.random() * 2 - 1) * Math.PI;
            const n = Math.max(0, Math.floor(P.expChildren));
            for (let i = 0; i < n; i++) {
                if (out.length >= P.maxAgents) break;
                const a =
                    base + -spread / 2 + spread * (n === 1 ? 0.5 : i / (n - 1));
                const life = rnd(
                    Math.max(60, P.lifeMin / 3),
                    Math.max(120, P.lifeMax / 2)
                );
                const toChild = rnd(P.childMin, P.childMax);
                out.push(new Agent(this.x, this.y, a, life, toChild, opp));
            }
        }
        nextTimer(current) {
            const shorter = Math.random() < P.shorterBias;
            const mult = shorter
                ? P.shortMin + Math.random() * (P.shortMax - P.shortMin)
                : P.longMin + Math.random() * (P.longMax - P.longMin);
            const base = Math.max(6, Math.floor(current * mult));
            return Math.max(4, base + rnd(-5, 5));
        }
    }

    function seedAgent() {
        const W = getW(),
            H = getH();
        return new Agent(
            Math.random() * W,
            Math.random() * H,
            Math.random() * Math.PI * 2,
            rnd(P.lifeMin, P.lifeMax),
            rnd(P.childMin, P.childMax),
            Math.random() < 0.5 ? +1 : -1
        );
    }

    return { Agent, seedAgent };
}
