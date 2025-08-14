import { BasePass } from './base-pass.js';
import { FS_FBM } from '../../shaders.js';

/**
 * Enhanced FBM (Fractal Brownian Motion) luminance modulation pass.
 * Applies procedural noise-based lighting effects with extensible parameters.
 * Priority: 25 (applied after chroma but before other effects)
 */
export class FBMPass extends BasePass {
    constructor() {
        super('fbm', 25, FS_FBM);
    }

    /**
     * Checks if FBM pass should be enabled.
     *
     * @param {Object} P - Parameters object containing effect settings.
     * @returns {boolean} True if FBM is enabled and amplitude > 0.
     */
    isEnabled(P) {
        return P.fbmEnabled && P.fbmAmp > 0;
    }

    /**
     * Sets uniforms specific to FBM pass.
     *
     * @param {p5.Shader} shader - Shader to set uniforms on.
     * @param {Object} ctx - Rendering context with time, dimensions, etc.
     * @param {Object} P - Parameters object containing effect settings.
     */
    setUniforms(shader, ctx, P) {
        // Set base uniforms
        super.setUniforms(shader, ctx, P);

        // Set FBM-specific uniforms with proper defaults
        shader.setUniform('fbmAmp', P.fbmAmp || 0.3);
        shader.setUniform('fbmScale', P.fbmScale || 5.0);
        shader.setUniform('fbmSpeed', P.fbmSpeed || 1.0);
        shader.setUniform('fbmOctaves', P.fbmOctaves || 4.0);
        shader.setUniform('fbmBlend', P.fbmBlend || 0.7);
    }
}
