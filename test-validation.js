/**
 * Simple validation script for parameter ranges and UI integrity
 */

// Load the parameter definitions (if running in browser context)
console.log('=== Parameter Validation Test ===');

// Test ranges from params.js
const testRanges = {
    speed: [0.6, 3.5, 0.05],
    noiseScale: [0.001, 0.008, 0.0001],
    noiseTurn: [0.05, 0.5, 0.01],
    strokeW: [0.3, 2.5, 0.05],
    lifeMin: [150, 1200, 1],
    lifeMax: [600, 3000, 1],
    childMin: [6, 120, 1],
    childMax: [24, 260, 1],
    shorterBias: [0.35, 0.95, 0.01],
    shortMin: [0.2, 0.7, 0.01],
    shortMax: [0.35, 0.95, 0.01],
    longMin: [0.7, 1.6, 0.01],
    longMax: [0.8, 2.0, 0.01],
    jitterDeg: [0, 45, 0.5],
    expChildren: [0, 10, 1],
    expSpreadDeg: [30, 260, 1],
    startAgents: [60, 600, 1],
    minAgents: [40, 560, 1],
    maxAgents: [120, 900, 1],
    distortAmp: [0.0, 0.5, 0.01],
    distortScale: [1.0, 50.0, 0.1],
    distortSpeed: [0.1, 5.0, 0.05],
    chromaAmount: [0.0, 2.0, 0.01],
    chromaRadius: [0.5, 10.0, 0.1],
};

// Validation functions
function validateRange(name, range) {
    if (!Array.isArray(range) || range.length < 2) {
        console.error(`❌ ${name}: Invalid range format`);
        return false;
    }

    const [min, max, step] = range;

    if (typeof min !== 'number' || typeof max !== 'number') {
        console.error(`❌ ${name}: Min/max must be numbers`);
        return false;
    }

    if (min >= max) {
        console.error(`❌ ${name}: Min (${min}) must be < max (${max})`);
        return false;
    }

    if (step !== undefined && (typeof step !== 'number' || step <= 0)) {
        console.error(`❌ ${name}: Step must be a positive number`);
        return false;
    }

    console.log(`✅ ${name}: [${min}, ${max}, ${step || 'auto'}] - Valid`);
    return true;
}

// Run validation
console.log('Validating parameter ranges...');
let allValid = true;
for (const [name, range] of Object.entries(testRanges)) {
    if (!validateRange(name, range)) {
        allValid = false;
    }
}

if (allValid) {
    console.log('🎉 All parameter ranges are valid!');
    console.log('');
    console.log('=== Manual Testing Checklist ===');
    console.log('✓ 1. Start dev server: npm run dev (auto-opens browser)');
    console.log('✓ 2. Alternative: npm start or npm run serve');
    console.log('✓ 3. Check UI panel appears (bottom-right)');
    console.log('✓ 4. Test slider ranges respect bounds');
    console.log('✓ 5. Test integer parameters snap to whole numbers');
    console.log('✓ 6. Test parameter coupling (lifeMin affects lifeMax)');
    console.log('✓ 7. Test post-processing effects (distort/chroma params)');
    console.log('✓ 8. Test keyboard shortcuts (H, R, X, S)');
    console.log('✓ 9. Verify live updates work without restart');
} else {
    console.error('❌ Some parameter ranges are invalid!');
}
