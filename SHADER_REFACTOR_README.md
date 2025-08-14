# Shader Pass Refactoring

## Overview

The monolithic `FS_POST` shader has been refactored into two independent passes:

### New Shader Passes

1. **Distortion Pass (`FS_DISTORTION`)**
   - **Purpose**: Noise-driven UV offset distortion
   - **Uniforms**: `time`, `amp`, `scale`, `speed`
   - **What it does**: Uses 2D noise to create organic UV distortion effects

2. **Chroma Pass (`FS_CHROMA`)**  
   - **Purpose**: Radial chromatic aberration
   - **Uniforms**: `amount`, `radius`
   - **What it does**: Separates RGB channels radially from center outward

### Shared Components

- **`VS_PASS`**: Vertex shader used by all passes (unchanged)
- **`FS_PASSTHROUGH`**: Debug shader for safe fallback (unchanged)
- **`FS_POST`**: Original monolithic shader (kept for compatibility)

## What Changed

- **Decomposition**: Effects are now composable individual passes
- **Per-effect toggles**: Each effect can be enabled/disabled independently
- **Buffer management**: Added secondary buffer for multi-pass rendering
- **Fallback support**: Original monolithic system remains as backup

## Why This Change

- **Modularity**: Each effect can be toggled independently
- **Extensibility**: New effects can be easily added as additional passes
- **Performance**: Skip disabled effects entirely (no GPU cost)
- **Debugging**: Easier to isolate and debug individual effects

## Potential Drawbacks

- **Additional overhead**: Multiple draw passes when both effects are enabled
- **Memory usage**: Requires additional graphics buffer for multi-pass rendering
- **Complexity**: More complex buffer management logic

## Usage

The system automatically uses independent passes by default. The `post.js` module exports utility functions:

```javascript
import { setIndependentPasses, setDebugMode, getPostConfig } from './post.js';

// Toggle between systems
setIndependentPasses(true);  // Use new independent passes
setIndependentPasses(false); // Use original monolithic shader

// Enable debug mode (pass-through shader)
setDebugMode(true);

// Get current configuration
const config = getPostConfig();
console.log(config);
```

## Implementation Details

- **Multi-pass rendering**: Uses ping-pong buffer technique for chaining effects
- **Conditional execution**: Effects only execute when enabled and parameters > 0
- **Error handling**: Graceful fallback to original buffer on shader errors
- **Buffer management**: Automatic buffer swapping between passes
