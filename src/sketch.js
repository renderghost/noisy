import { P, R, enforceCouplings, randomiseParams } from './params.js';
import { buildParamPanel, refreshPanelValues } from './ui.js';
import { makeSim } from './sim.js';
import { initPost, resizePost, drawPost } from './post/pipeline.js';

// ---- globals used by p5
let canvas,
    pg,
    mask,
    agents = [];
let W,
    H,
    t = 0;
let paramDiv,
    panelVisible = false;

const MAX_CANVAS_H = 720,
    ASPECT = 9 / 16;

// bind sim with shared refs (no globals inside sim.js)
const sim = makeSim({
    getW: () => W,
    getH: () => H,
    getMask: () => mask,
    P,
    tRef: () => t,
});

// ---------- setup / draw ----------
window.setup = function () {
    calcCanvasSize();
    console.log(
        `[Canvas Setup] Calculated dimensions: W=${W}, H=${H} (${W}x${H})`
    );
    console.log(
        `[Canvas Setup] Window dimensions: ${windowWidth}x${windowHeight}`
    );
    canvas = createCanvas(W, H);
    centerCanvas();
    pixelDensity(1);

    // 2D ink layer
    pg = createGraphics(W, H);
    pg.pixelDensity(1);
    pg.background(255);
    pg.noFill();
    pg.strokeWeight(P.strokeW);
    pg.drawingContext.lineCap = 'round';

    noiseDetail(4, 0.5);
    mask = new Uint8Array(W * H);

    agents = [];
    for (let i = 0; i < P.startAgents; i++) agents.push(sim.seedAgent());

    // Initialize post-processing
    initPost(W, H);

    if (!paramDiv) {
        paramDiv = buildParamPanel({ P, R, enforceCouplings });
        paramDiv.style('display', panelVisible ? 'block' : 'none');
    }
    frameRate(60);
};

window.draw = function () {
    pg.strokeWeight(P.strokeW);

    const newborns = [];
    for (let i = 0; i < agents.length; i++) {
        const a = agents[i];
        if (a.dead) continue;
        a.step(newborns);
        a.draw(pg);
    }

    for (let i = 0; i < newborns.length && agents.length < P.maxAgents; i++)
        agents.push(newborns[i]);
    let w = 0;
    for (let r = 0; r < agents.length; r++)
        if (!agents[r].dead) agents[w++] = agents[r];
    agents.length = w;
    while (agents.length < P.minAgents) agents.push(sim.seedAgent());

    // Apply post-processing effects
    const processed = drawPost(pg, t, P, W, H);

    // render processed buffer to main canvas
    background(0);
    image(processed || pg, 0, 0, W, H);
    noFill();
    stroke(255);
    strokeWeight(4);
    rect(0, 0, W, H);

    t += 0.002;
};

// ---------- window / keys ----------
window.windowResized = function () {
    calcCanvasSize();
    resizeCanvas(W, H);

    pg = createGraphics(W, H);
    pg.pixelDensity(1);
    pg.background(255);
    pg.noFill();
    pg.strokeWeight(P.strokeW);
    pg.drawingContext.lineCap = 'round';

    mask = new Uint8Array(W * H);
    agents = [];
    for (let i = 0; i < P.startAgents; i++) agents.push(sim.seedAgent());

    // Resize post-processing
    resizePost(W, H);

    centerCanvas();
};

window.keyPressed = function () {
    if (key === 'r' || key === 'R') setup();
    if (key === 'x' || key === 'X') {
        console.log(
            `[Param Update] ${new Date().toISOString()} | Randomize Key Pressed | Starting parameter randomization | Frame: ${frameCount || 'N/A'}`
        );

        // Store old values for detailed logging
        const oldValues = {};
        for (const key in P) {
            oldValues[key] = P[key];
        }

        randomiseParams(P, R);
        enforceCouplings(P);
        refreshPanelValues(P);

        // Log detailed parameter changes
        console.log(
            `[Param Update] ${new Date().toISOString()} | Randomize Complete | All parameters randomized:`
        );
        for (const key in P) {
            if (oldValues[key] !== P[key]) {
                console.log(
                    `[Param Update]   ${key}: ${oldValues[key]} → ${P[key]}`
                );
            }
        }

        setup();
    }
    if (key === 's' || key === 'S') saveCanvas('bw-agents', 'png');
    if (key === 'h' || key === 'H') {
        panelVisible = !panelVisible;
        paramDiv.style('display', panelVisible ? 'block' : 'none');
    }
};

// ---------- sizing ----------
function calcCanvasSize() {
    const h = min(windowHeight, MAX_CANVAS_H);
    const w = h * ASPECT;
    W = floor(w);
    H = floor(h);
}
function centerCanvas() {
    const x = (windowWidth - W) / 2;
    const y = (windowHeight - H) / 2;
    console.log(`[Canvas Position] Centering canvas at (${x}, ${y})`);
    canvas.position(x, y);
}
