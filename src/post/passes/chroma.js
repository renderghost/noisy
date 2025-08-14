import { BasePass } from './base-pass.js';
import { FS_CHROMA } from '../../shaders.js';

/**
 * Chromatic aberration pass applying radial color separation.
 * Priority: 20 (applied after distortion)
 */
export class ChromaPass extends BasePass {
    constructor() {
        super('chroma', 20, FS_CHROMA);
    }

    /**
     * Checks if chromatic aberration pass should be enabled.
     *
     * @param {Object} P - Parameters object containing effect settings.
     * @returns {boolean} True if chroma is enabled and amount > 0.
     */
    isEnabled(P) {
        return P.chromaEnabled && P.chromaAmount > 0;
    }

    /**
     * Sets uniforms specific to chromatic aberration pass.
     *
     * @param {p5.Shader} shader - Shader to set uniforms on.
     * @param {Object} ctx - Rendering context with time, dimensions, etc.
     * @param {Object} P - Parameters object containing effect settings.
     */
    setUniforms(shader, ctx, P) {
        // Set base uniforms
        super.setUniforms(shader, ctx, P);

        // Set chromatic aberration-specific uniforms
        shader.setUniform('amount', P.chromaAmount);
        shader.setUniform('radius', P.chromaRadius);
    }
}
