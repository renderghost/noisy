import { BasePass } from './base-pass.js';
import { FS_DISTORTION } from '../../shaders.js';

/**
 * Distortion pass applying noise-driven UV offset.
 * Priority: 10 (applied early in pipeline)
 */
export class DistortionPass extends BasePass {
    constructor() {
        super('distortion', 10, FS_DISTORTION);
    }

    /**
     * Checks if distortion pass should be enabled.
     *
     * @param {Object} P - Parameters object containing effect settings.
     * @returns {boolean} True if noise is enabled and distortion amplitude > 0.
     */
    isEnabled(P) {
        return P.noiseEnabled && P.distortAmp > 0;
    }

    /**
     * Sets uniforms specific to distortion pass.
     *
     * @param {p5.Shader} shader - Shader to set uniforms on.
     * @param {Object} ctx - Rendering context with time, dimensions, etc.
     * @param {Object} P - Parameters object containing effect settings.
     */
    setUniforms(shader, ctx, P) {
        // Set base uniforms
        super.setUniforms(shader, ctx, P);

        // Set distortion-specific uniforms
        shader.setUniform('amp', P.distortAmp);
        shader.setUniform('scale', P.distortScale);
        shader.setUniform('speed', P.distortSpeed);
    }
}
