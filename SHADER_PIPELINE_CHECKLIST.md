# Shader Pipeline Refactor - Baseline Checklist

**Feature Branch:** `feat/shader-pipeline`  
**Created:** $(date +'%Y-%m-%d %H:%M:%S')

## Current State Analysis

### Existing Post FX System
- ✅ **Post FX toggles currently present:** `noiseEnabled`, `chromaEnabled` in `src/params.js`
- ✅ **Current toggle behavior:** Both default to `true` (lines 25-26 in `src/params.js`)
- ✅ **Effect parameters:** `distortAmp`, `distortScale`, `distortSpeed`, `chromaAmount`, `chromaRadius`
- ✅ **UI integration:** "— Post FX —" group exists in `src/ui.js` (lines 39-49)
- ✅ **API stability:** `initPost()`, `resizePost()`, `drawPost()` functions in `src/post.js`
- ✅ **Single shader approach:** Uses `FS_POST` fragment shader with all effects combined

### Missing FBM Toggle
- ❌ **FBM toggle missing:** No `fbmEnabled` parameter found
- ❌ **FBM not independently controllable:** FBM noise is hardcoded in `FS_POST` shader

## Acceptance Criteria Checklist

### 1. Default Toggle States
- [ ] **All post FX toggles default to OFF**
  - [ ] `noiseEnabled: false` (currently `true`)
  - [ ] `chromaEnabled: false` (currently `true`) 
  - [ ] `fbmEnabled: false` (needs to be added)

### 2. Independent Toggle Control
- [ ] **Each effect is independently toggleable**
  - [ ] Distortion can be toggled on/off without affecting other effects
  - [ ] Chromatic aberration can be toggled on/off without affecting other effects
  - [ ] FBM can be toggled on/off without affecting other effects
  - [ ] Effects work in any combination (all off, all on, mixed states)

### 3. Effect Ordering System  
- [ ] **Effects are orderable**
  - [ ] Implement effect ordering/priority system
  - [ ] Effects are applied in specified order
  - [ ] Order can be changed dynamically
  - [ ] Pipeline supports reordering without breaking

### 4. Extensible Shader System
- [ ] **Adding new shader requires only module and registry entry**
  - [ ] Create modular shader pass system
  - [ ] Implement shader registry/pipeline manager
  - [ ] New effects can be added by creating pass module
  - [ ] New effects auto-integrate with UI and parameter systems

### 5. API Stability
- [ ] **Existing API remains stable**
  - [ ] `initPost(W, H)` signature unchanged
  - [ ] `resizePost(W, H)` signature unchanged  
  - [ ] `drawPost(pg, t, P, W, H)` signature unchanged
  - [ ] Internal refactor maintains external interface
  - [ ] No breaking changes to existing code

### 6. UI Integration
- [ ] **"— Post FX —" group preserved with updates**
  - [ ] Existing toggle checkboxes remain functional
  - [ ] New FBM toggle added to group
  - [ ] Effect parameter sliders remain in group
  - [ ] Group order/appearance preserved
  - [ ] Effect ordering controls added (if implemented in UI)

### 7. Randomization Behavior
- [ ] **Randomization respects toggle defaults**
  - [ ] `randomiseParams()` keeps toggles OFF unless explicitly randomized
  - [ ] Effect parameters randomized within ranges when enabled
  - [ ] Toggle state randomization is opt-in behavior
  - [ ] Maintains separation between parameter and toggle randomization

## Technical Implementation Plan

### Phase 1: Parameter Updates
- [ ] Update `src/params.js` to set all post FX toggles to `false`
- [ ] Add `fbmEnabled: false` parameter
- [ ] Update `src/ui.js` to include FBM toggle in "— Post FX —" group

### Phase 2: Modular Shader System
- [ ] Create `src/shaders/` directory for effect modules
- [ ] Implement base shader pass interface
- [ ] Create individual effect modules (distortion, chroma, fbm)
- [ ] Implement pipeline manager for chaining effects

### Phase 3: Pipeline Integration
- [ ] Update `src/post.js` to use modular pipeline
- [ ] Maintain API compatibility with existing functions
- [ ] Implement effect ordering system
- [ ] Add dynamic pipeline compilation

### Phase 4: Testing & Validation
- [ ] Verify all toggles work independently 
- [ ] Test effect combinations and ordering
- [ ] Validate API stability with existing code
- [ ] Confirm UI integration works correctly
- [ ] Test randomization behavior matches requirements

## Risk Mitigation

### Breaking Changes Prevention
- Maintain exact API signatures for `initPost`, `resizePost`, `drawPost`
- Keep parameter names consistent (don't rename existing parameters)
- Preserve UI group structure and control types

### Regression Testing  
- Test with all effects OFF (should render clean output)
- Test each effect individually 
- Test all possible combinations of effect states
- Verify performance doesn't degrade significantly

### Rollback Plan
- Feature branch allows safe experimentation
- Can revert to main branch if issues arise
- Modular approach allows selective feature rollback

## Current Branch Status

```bash
git branch: feat/shader-pipeline
git status: Working directory has uncommitted changes to src/sketch.js
```

**Next Steps:**
1. Commit current changes or create clean baseline
2. Begin Phase 1: Parameter Updates
3. Update toggles to default OFF state
4. Add missing FBM toggle parameter

---

*This checklist will be updated as work progresses on the shader pipeline refactor.*
