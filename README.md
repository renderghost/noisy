# Noisy - Generative Agent-Based Art

A real-time generative art piece featuring autonomous agents drawing on a canvas with advanced parameter controls and post-processing effects.

## Features

- **Real-time agent simulation** - Autonomous agents that move, reproduce, and draw
- **Advanced parameter UI** - Comprehensive slider controls with intelligent range validation
- **Post-processing effects** - Noise distortion and chromatic aberration shaders
- **Live parameter coupling** - Automatic constraint enforcement between related parameters
- **Responsive design** - Adapts to different screen sizes with fixed aspect ratio

## Parameter Control System

### Range Logic

The application uses an intelligent range system (`R` object) that defines valid bounds and step values for all parameters:

```javascript
// Format: [min, max, step]
speed: [0.6, 3.5, 0.05]; // Motion speed with fine control
noiseScale: [0.001, 0.008, 0.0001]; // High-precision noise scaling
```

**Key Features:**

- **Automatic step calculation**: When only `[min, max]` is provided, the system calculates appropriate step values based on range magnitude
- **Integer parameter handling**: Parameters like agent counts automatically use integer steps
- **Validation**: All ranges are validated for proper format, numeric values, and logical min/max relationships
- **Fallback protection**: Invalid ranges fall back to `[0, 1, 0.01]` with error logging

### Parameter Groups

#### Motion Parameters

- `speed` - Agent movement speed (0.6-3.5)
- `noiseScale` - Perlin noise influence on direction (0.001-0.008)
- `noiseTurn` - Turn angle influence (0.05-0.50)
- `strokeW` - Drawing stroke width (0.3-2.5)

#### Lifecycle Parameters

- `lifeMin/Max` - Agent lifespan range (150-3000 frames)
- `childMin/Max` - Child spawning interval range (6-260 frames)
- `shorterBias` - Probability of shorter vs longer intervals (0.35-0.95)
- `shortMin/Max` - Multiplier range for shorter intervals (0.20-0.95)
- `longMin/Max` - Multiplier range for longer intervals (0.70-2.00)
- `jitterDeg` - Angular randomness when spawning (0-45 degrees)

#### Population Control

- `expChildren` - Number of children in explosion events (0-10)
- `expSpreadDeg` - Angular spread for explosions (30-260 degrees)
- `startAgents` - Initial agent count (60-600)
- `minAgents` - Minimum population (40-560)
- `maxAgents` - Maximum population (120-900)

#### Post-Processing Effects

- `distortAmp` - Noise distortion amplitude (0.0-0.5)
- `distortScale` - Distortion noise scale (1.0-50.0)
- `distortSpeed` - Distortion animation speed (0.1-5.0)
- `chromaAmount` - Chromatic aberration intensity (0.0-2.0)
- `chromaRadius` - Aberration falloff radius (0.5-10.0)

### Automatic Constraint Enforcement

The system automatically maintains logical relationships between parameters:

- `lifeMax` ≥ `lifeMin + 100`
- `childMax` ≥ `childMin + 5`
- `shortMax` ≥ `shortMin + 0.05`
- `longMax` ≥ `longMin + 0.05`
- `maxAgents` ≥ `minAgents + 20`
- `startAgents` clamped between `minAgents` and `maxAgents`

### Step Snapping

All parameters are automatically snapped to their defined step values to ensure consistent behavior and prevent floating-point precision issues.

## Controls

- **H** - Toggle parameter panel visibility
- **R** - Reset simulation
- **X** - Randomize all parameters
- **S** - Save current canvas as PNG

## Manual Testing Guide

To test the slider behavior:

1. **Start the development server**: `npm run dev` (opens browser automatically)
    - Alternative: `npm start` (manual browser navigation)
    - Or: `npm run serve` (server only, no auto-open)
2. **Browser opens automatically** to `http://localhost:8000`
3. **Test parameter ranges**:
    - Verify all sliders respect their defined min/max bounds
    - Check that integer parameters (agent counts, degrees) snap to whole numbers
    - Test coupling behavior (e.g., adjusting `lifeMin` affects `lifeMax`)
4. **Test post-processing**:
    - Adjust `distortAmp` to see noise distortion effects
    - Modify `chromaAmount` and `chromaRadius` for color separation
    - Change `distortSpeed` to control animation rate
5. **Test live updates**: All changes should be immediately visible without restart

## Technical Implementation

The range system uses a robust validation pipeline:

1. **Range Definition**: Each parameter has a corresponding entry in the `R` object
2. **Format Validation**: Ensures ranges are arrays with proper numeric values
3. **Logical Validation**: Confirms min ≤ max and positive step values
4. **Smart Defaults**: Calculates appropriate step values for 2-element ranges
5. **Runtime Enforcement**: Applies constraints during parameter changes
6. **Step Snapping**: Rounds values to the nearest step multiple

This creates a robust, user-friendly parameter control system that prevents invalid states while providing fine-grained control over the generative art process.
