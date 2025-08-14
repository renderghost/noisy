export const P = {
    // Motion
    speed: 2.0, noiseScale: 0.005, noiseTurn: 0.2, strokeW: 1.2,
    // Lifecycle  
    lifeMin: 200, lifeMax: 800, childMin: 20, childMax: 80,
    shorterBias: 0.7, shortMin: 0.5, shortMax: 0.8, longMin: 1.0, longMax: 1.3,
    jitterDeg: 15,
    // Branching / population
    expChildren: 2, expSpreadDeg: 90, startAgents: 50, minAgents: 20, maxAgents: 100,
    // Post-processing
    distortAmp: 0.1, distortScale: 10.0, distortSpeed: 1.0, chromaAmount: 0.8, chromaRadius: 2.0
};

export const R = {
    speed: [0.6, 3.5, 0.05], noiseScale: [0.0010, 0.0080, 0.0001], noiseTurn: [0.05, 0.50, 0.01], strokeW: [0.3, 2.5, 0.05],
    lifeMin: [150, 1200, 1], lifeMax: [600, 3000, 1], childMin: [6, 120, 1], childMax: [24, 260, 1],
    shorterBias: [0.35, 0.95, 0.01], shortMin: [0.20, 0.70, 0.01], shortMax: [0.35, 0.95, 0.01],
    longMin: [0.70, 1.60, 0.01], longMax: [0.80, 2.00, 0.01], jitterDeg: [0, 45, 0.5],
    expChildren: [0, 10, 1], expSpreadDeg: [30, 260, 1], startAgents: [60, 600, 1], minAgents: [40, 560, 1], maxAgents: [120, 900, 1],
    distortAmp: [0.0, 0.5, 0.01], distortScale: [1.0, 50.0, 0.1], distortSpeed: [0.1, 5.0, 0.05], chromaAmount: [0.0, 2.0, 0.01], chromaRadius: [0.5, 10.0, 0.1]
};

const clamp = (v, [mn, mx]) => Math.max(mn, Math.min(mx, v));
export const formatVal = v => (Number.isInteger(+v) ? String(+v) : (+v).toFixed(3));
export function coerce(key, v) {
    v = Number(v);
    if (['lifeMin', 'lifeMax', 'childMin', 'childMax', 'expChildren', 'startAgents', 'minAgents', 'maxAgents'].includes(key)) return Math.round(v);
    return v;
}
export function enforceCouplings(P) {
    P.lifeMin = Math.max(R.lifeMin[0], Math.min(R.lifeMin[1], P.lifeMin));
    P.lifeMax = Math.max(P.lifeMin + 100, Math.max(R.lifeMax[0], Math.min(R.lifeMax[1], P.lifeMax)));
    P.childMin = Math.max(R.childMin[0], Math.min(R.childMin[1], P.childMin));
    P.childMax = Math.max(P.childMin + 5, Math.max(R.childMax[0], Math.min(R.childMax[1], P.childMax)));
    P.shortMin = Math.max(R.shortMin[0], Math.min(R.shortMin[1], P.shortMin));
    P.shortMax = Math.max(P.shortMin + 0.05, Math.max(R.shortMax[0], Math.min(R.shortMax[1], P.shortMax)));
    P.longMin = Math.max(R.longMin[0], Math.min(R.longMin[1], P.longMin));
    P.longMax = Math.max(P.longMin + 0.05, Math.max(R.longMax[0], Math.min(R.longMax[1], P.longMax)));
    P.minAgents = Math.max(R.minAgents[0], Math.min(R.minAgents[1], P.minAgents));
    P.maxAgents = Math.max(P.minAgents + 20, Math.max(R.maxAgents[0], Math.min(R.maxAgents[1], P.maxAgents)));
    P.startAgents = Math.max(P.minAgents, Math.min(P.startAgents, P.maxAgents));
    P.speed = clamp(P.speed, R.speed); P.noiseScale = clamp(P.noiseScale, R.noiseScale); P.noiseTurn = clamp(P.noiseTurn, R.noiseTurn); P.strokeW = clamp(P.strokeW, R.strokeW);
    P.jitterDeg = clamp(P.jitterDeg, R.jitterDeg); P.expChildren = Math.round(clamp(P.expChildren, R.expChildren)); P.expSpreadDeg = clamp(P.expSpreadDeg, R.expSpreadDeg);
    P.distortAmp = clamp(P.distortAmp, R.distortAmp); P.distortScale = clamp(P.distortScale, R.distortScale); P.distortSpeed = clamp(P.distortSpeed, R.distortSpeed);
    P.chromaAmount = clamp(P.chromaAmount, R.chromaAmount); P.chromaRadius = clamp(P.chromaRadius, R.chromaRadius);
}

export function randomiseParams(P, R) {
    P.speed         = R.speed[0] + Math.random() * (R.speed[1] - R.speed[0]);
    P.noiseScale    = R.noiseScale[0] + Math.random() * (R.noiseScale[1] - R.noiseScale[0]);
    P.noiseTurn     = R.noiseTurn[0] + Math.random() * (R.noiseTurn[1] - R.noiseTurn[0]);
    P.lifeMin       = Math.floor(R.lifeMin[0] + Math.random() * (R.lifeMin[1] - R.lifeMin[0]));
    P.lifeMax       = Math.floor(P.lifeMin + 200 + Math.random() * (R.lifeMax[1] - P.lifeMin - 200));
    P.childMin      = Math.floor(R.childMin[0] + Math.random() * (R.childMin[1] - R.childMin[0]));
    P.childMax      = Math.floor(P.childMin + 20 + Math.random() * (R.childMax[1] - P.childMin - 20));
    P.shorterBias   = R.shorterBias[0] + Math.random() * (R.shorterBias[1] - R.shorterBias[0]);
    P.shortMin      = R.shortMin[0] + Math.random() * (R.shortMin[1] - R.shortMin[0]);
    P.shortMax      = P.shortMin + 0.1 + Math.random() * (R.shortMax[1] - P.shortMin - 0.1);
    P.longMin       = R.longMin[0] + Math.random() * (R.longMin[1] - R.longMin[0]);
    P.longMax       = P.longMin + 0.1 + Math.random() * (R.longMax[1] - P.longMin - 0.1);
    P.jitterDeg     = R.jitterDeg[0] + Math.random() * (R.jitterDeg[1] - R.jitterDeg[0]);
    P.expChildren   = Math.floor(R.expChildren[0] + Math.random() * (R.expChildren[1] - R.expChildren[0] + 1));
    P.expSpreadDeg  = R.expSpreadDeg[0] + Math.random() * (R.expSpreadDeg[1] - R.expSpreadDeg[0]);
    P.strokeW       = R.strokeW[0] + Math.random() * (R.strokeW[1] - R.strokeW[0]);
    P.startAgents   = Math.floor(R.startAgents[0] + Math.random() * (R.startAgents[1] - R.startAgents[0]));
    P.minAgents     = Math.floor(R.minAgents[0] + Math.random() * (R.minAgents[1] - R.minAgents[0]));
    P.maxAgents     = Math.max(P.minAgents + 50, Math.floor(R.maxAgents[0] + Math.random() * (R.maxAgents[1] - R.maxAgents[0])));
    P.distortAmp    = R.distortAmp[0] + Math.random() * (R.distortAmp[1] - R.distortAmp[0]);
    P.distortScale  = R.distortScale[0] + Math.random() * (R.distortScale[1] - R.distortScale[0]);
    P.distortSpeed  = R.distortSpeed[0] + Math.random() * (R.distortSpeed[1] - R.distortSpeed[0]);
    P.chromaAmount  = R.chromaAmount[0] + Math.random() * (R.chromaAmount[1] - R.chromaAmount[0]);
    P.chromaRadius  = R.chromaRadius[0] + Math.random() * (R.chromaRadius[1] - R.chromaRadius[0]);
}
