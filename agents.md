# Agent Continuity & Decision Log

**Project**: Noisy - Generative Agent-Based Art
**Location**: `~/code/noisy`
**Last Updated**: 2025-11-05
**Current Status**: Active Development

## 🎯 Project Overview

A real-time generative art piece featuring autonomous agents with advanced parameter controls and post-processing effects. Built with P5.js for canvas rendering, featuring intelligent parameter validation and constraint enforcement.

### Key Technologies

- **P5.js v1.9.3** (CDN) - Primary rendering framework and canvas API
- JavaScript ES6 modules
- WebGL shaders for post-processing effects
- Advanced parameter range validation system
- Live-server for development

## 📝 Decision Log

### 2025-11-05 - Fixed Non-Functional Post-Processing Sliders

- **Issue**: Post-processing effect sliders (distortAmp, chromaAmount, fbmAmp, etc.) were moving but producing no visible changes
- **Root Cause**: Effects were gated by boolean enable flags (`noiseEnabled`, `chromaEnabled`, `fbmEnabled`) that defaulted to `false` in `params.js`. Users had to manually toggle checkboxes before sliders would work.
- **Solution**:
  1. Changed default values from `false` to `true` for all three enable flags in `params.js`
  2. Added auto-enable logic in `ui.js` slider input handler to automatically enable effects when amplitude parameters are adjusted above zero
- **Impact**: All post-processing sliders now produce immediate visual effects. Improved UX eliminates need for manual checkbox toggling.
- **Files Modified**: `src/params.js` (lines 25, 30, 34), `src/ui.js` (lines 175-183)

### 2025-08-14 - Critical Correction: P5.js Framework

- **Decision**: Corrected documentation to properly reflect P5.js as core framework
- **Issue**: Initial analysis missed P5.js dependency loaded via CDN
- **Impact**: P5.js provides all canvas rendering, drawing functions, and animation loop
- **Evidence**: `index.html` loads P5.js 1.9.3, `sketch.js` uses P5.js global functions

### 2025-08-14 - Agent Continuity System Created

- **Decision**: Implemented `agents.md` as primary continuity document
- **Rationale**: User frustrated with AI agent context loss between sessions
- **Format**: Markdown chosen for readability and version control compatibility
- **Location**: Project root for easy access

## 🧠 Current Context

### Project State

- ✅ P5.js-based core rendering system working
- ✅ Agent simulation with autonomous movement and drawing
- ✅ Parameter UI with slider controls implemented
- ✅ Automatic constraint enforcement between parameters
- ✅ Post-processing effects (noise distortion, chromatic aberration)
- ✅ Comprehensive range validation system
- 📝 Manual testing procedures documented in README.md

### Architecture Overview

```
P5.js Framework
├── sketch.js         # Main P5.js setup()/draw() loop
├── sim.js           # Agent simulation logic
├── params.js        # Parameter definitions and validation
├── ui.js            # Parameter panel UI generation
├── post.js          # Post-processing shader effects
└── shaders.js       # WebGL shader definitions
```

### P5.js Integration Details

- **Canvas Management**: P5.js `createCanvas()`, `createGraphics()` for layers
- **Drawing Functions**: P5.js stroke, fill, line, rect operations
- **Animation Loop**: P5.js `setup()` and `draw()` lifecycle
- **Event Handling**: P5.js `keyPressed()`, `windowResized()`
- **Graphics Layers**: Main canvas + offscreen graphics (`pg`) + mask array
- **Frame Rate**: 60fps via P5.js `frameRate(60)`

### Recent Work Focus

- Parameter range system validation and optimization
- Live parameter coupling and constraint enforcement
- Post-processing shader effects implementation

### Key Files & Structure

```
/Users/barryprendergast/code/noisy/
├── index.html            # Loads P5.js CDN + module entry point
├── README.md             # Comprehensive project documentation
├── package.json          # Dev dependencies (live-server, prettier)
├── src/
│   ├── sketch.js         # P5.js main setup/draw with ES6 imports
│   ├── sim.js           # Agent simulation logic
│   ├── params.js        # Parameter system with ranges (P, R objects)
│   ├── ui.js           # Dynamic parameter panel generation
│   ├── post.js         # Post-processing pipeline
│   └── shaders.js      # WebGL shader definitions
├── test-validation.js   # Parameter validation testing
└── agents.md           # This continuity document
```

## 🔧 Development Environment

### User Preferences (from rules)

- **Shell**: zsh with p10k
- **Editor**: VS Code
- **Terminal**: Warp Terminal
- **Formatting**: Prettier (config present: `.prettierrc`)
- **Package Manager**: NPM
- **Python**: Always use `python3`
- **Design System**: "bones" naming convention for CSS/Tailwind

### Available Scripts

- `npm run dev` - Start development server (auto-opens browser)
- `npm start` - Start server (manual browser navigation)
- `npm run serve` - Server only (no auto-open)
- `npm test` - Run parameter validation tests

## 🎯 Current Focus Areas

### Immediate Priorities

1. P5.js-based parameter validation system refinement
2. Live constraint enforcement optimization
3. Post-processing effect performance tuning with WebGL

### Testing Approach

- Manual testing via browser at `http://localhost:8000`
- P5.js canvas rendering verification
- Parameter range validation testing
- Live update verification
- Post-processing effect validation

## 🚨 Known Issues & Considerations

### Technical Constraints

- P5.js real-time performance requirements for canvas rendering
- Complex parameter interdependencies requiring careful constraint handling
- Floating-point precision considerations in parameter snapping
- WebGL shader compatibility across browsers

### P5.js Specific Considerations

- Global function namespace (setup, draw, etc.)
- Graphics layer management (main canvas vs pg offscreen buffer)
- Canvas sizing and responsive behavior
- Frame rate optimization for smooth 60fps

## 🔮 Next Steps & TODOs

- [ ] Performance optimization for large agent populations in P5.js
- [ ] Additional WebGL post-processing effects
- [ ] Parameter preset system
- [ ] P5.js canvas export functionality enhancements

## 🤝 Collaboration Notes

> [!NOTE]
> This is a P5.js project - all rendering uses P5.js functions

- Parameter validation system is sophisticated (see README.md)
- All parameter changes must respect defined constraints
- User prefers comprehensive testing before deployment
- Code should follow existing P5.js patterns for consistency

### Context Preservation Strategy

- Always check this file first for project state
- Update decision log for significant changes or decisions
- Maintain current context section accuracy
- Reference README.md for technical details
- Remember P5.js is the core framework, not vanilla Canvas API

---

### 💡 Usage Instructions for AI Agents

1. Read this file completely before starting any work
2. Understand this is a P5.js-based project with ES6 modules
3. Update decision log with any significant changes or decisions
4. Maintain the "Current Context" section with latest project state
5. Add any new issues or considerations to appropriate sections
6. Update "Last Updated" date when making changes