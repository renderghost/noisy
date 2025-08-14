# Modular Post-Processing Pipeline

A flexible, composable rendering pipeline for applying post-processing effects with deterministic ordering and efficient ping-pong buffering.

## Architecture

### What is it?
- **Modular System**: Each effect is implemented as a separate pass with its own shader and logic
- **Pass Registry**: Central registry manages all available effects with priority-based ordering
- **Ping-Pong Buffers**: Two WEBGL buffers (postA, postB) for efficient multi-pass rendering
- **Automatic Management**: Shaders are compiled once and cached, buffers are automatically resized

### Why use it?
- **Flexibility**: Easy to add, remove, or reorder effects without touching core pipeline code
- **Performance**: Shaders compiled once and cached, efficient buffer management
- **Maintainability**: Each effect is self-contained with clear interface
- **Robustness**: Error handling ensures one broken effect doesn't crash the entire pipeline
- **Extensibility**: Simple to add new effects by implementing the pass interface

### Drawbacks
- **Complexity**: More complex than a single monolithic shader approach
- **Memory**: Uses two additional full-screen WEBGL buffers
- **Overhead**: Small performance overhead from multiple shader switches and buffer swaps

## Usage

### Basic Usage
```javascript
import { initPost, resizePost, drawPost } from './post/pipeline.js';

// Initialize (typically in setup())
initPost(width, height);

// Resize when canvas size changes
resizePost(newWidth, newHeight);

// Apply effects (typically in draw())
const processed = drawPost(sourceBuffer, time, parameters, width, height);
```

### Built-in Passes

#### Distortion Pass (Priority: 10)
- **Effect**: Noise-driven UV distortion
- **Parameters**: `noiseEnabled`, `distortAmp`, `distortScale`, `distortSpeed`
- **Shader**: Uses existing `FS_DISTORTION` fragment shader

#### Chromatic Aberration Pass (Priority: 20)
- **Effect**: Radial color channel separation
- **Parameters**: `chromaEnabled`, `chromaAmount`, `chromaRadius`
- **Shader**: Uses existing `FS_CHROMA` fragment shader

#### FBM Noise Overlay Pass (Priority: 30)
- **Effect**: Fractal Brownian Motion noise overlay with color tinting
- **Parameters**: `fbmEnabled`, `fbmIntensity`, `fbmScale`, `fbmTint`
- **Shader**: Custom FBM shader with 4-octave noise

## Creating Custom Passes

### Pass Interface
```javascript
class CustomPass extends BasePass {
    constructor() {
        super('pass-id', priority, fragmentShaderSource);
    }

    isEnabled(P) {
        // Return boolean based on parameters
        return P.customEnabled && P.customAmount > 0;
    }

    setUniforms(shader, ctx, P) {
        // Set pass-specific uniforms
        // tex0 is set automatically by the pipeline
        shader.setUniform('time', ctx.time);
        shader.setUniform('customParam', P.customParam);
    }
}
```

### Registering Custom Passes
```javascript
import { registerPass } from './post/pipeline.js';
import { CustomPass } from './passes/custom.js';

// Register after pipeline initialization
registerPass(new CustomPass());
```

## Pipeline Internals

### Execution Order
1. Build list of enabled passes sorted by priority (ascending)
2. If no passes enabled, return original buffer unchanged  
3. For each enabled pass:
   - Set shader and uniforms
   - Render full-screen quad from source to destination buffer
   - Swap source/destination buffers for next pass
4. Return final processed buffer

### Buffer Management
- **postA & postB**: Two WEBGL buffers for ping-pong rendering
- **Configuration**: pixelDensity(1), CLAMP wrapping, ortho(-1,1,1,-1,-1,1)
- **Hidden**: Buffers positioned off-screen to prevent DOM interference
- **Auto-resize**: Buffers recreated when canvas size changes

### Error Handling
- Shader compilation errors are logged and cached shader is removed
- Pass rendering errors return the original unprocessed buffer
- Missing shaders are skipped with warnings

## File Structure
```
src/post/
├── pipeline.js           # Main pipeline implementation
├── passes/
│   ├── base-pass.js      # Base class for all passes
│   ├── distortion.js     # Noise distortion pass
│   ├── chroma.js         # Chromatic aberration pass
│   └── fbm.js           # FBM noise overlay pass
└── README.md            # This documentation
```

## API Reference

### Main Functions
- `initPost(W, H)` - Initialize pipeline with given dimensions
- `resizePost(W, H)` - Resize pipeline buffers
- `drawPost(pg, t, P, W, H)` - Apply effects and return processed buffer
- `getPipelineInfo()` - Get pipeline status and configuration
- `registerPass(pass)` - Register new post-processing pass
- `unregisterPass(passId)` - Remove registered pass

### Context Object (ctx)
Passed to `setUniforms()` method:
- `time` - Current animation time
- `dimensions` - [width, height] array  
- `passIndex` - Index of current pass (0-based)
- `totalPasses` - Total number of enabled passes

## Testing

Use the provided test function to verify pipeline functionality:

```javascript
// In browser console after page load
testPipeline();
```

This will test various effect combinations and report any issues.
