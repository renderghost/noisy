import { VS_PASS } from '../../shaders.js';

/**
 * Base class for post-processing passes.
 * Defines the interface that all passes must implement.
 */
export class BasePass {
    constructor(id, priority, fragmentShader) {
        this.id = id;
        this.priority = priority;
        this.fragmentShader = fragmentShader;
        this.compiledShader = null;
    }

    /**
     * Compiles the shader for this pass.
     *
     * @param {p5.Graphics} gfx - Graphics context to compile shader with.
     * @returns {p5.Shader} Compiled shader instance.
     */
    compile(gfx) {
        if (this.compiledShader) {
            return this.compiledShader;
        }

        this.compiledShader = gfx.createShader(VS_PASS, this.fragmentShader);
        return this.compiledShader;
    }

    /**
     * Checks if this pass should be enabled based on parameters.
     * Must be implemented by subclasses.
     *
     * @param {Object} P - Parameters object containing effect settings.
     * @returns {boolean} True if pass should be applied.
     */
    isEnabled(P) {
        throw new Error('isEnabled method must be implemented by subclass');
    }

    /**
     * Sets uniforms for this pass.
     * Must be implemented by subclasses.
     *
     * @param {p5.Shader} shader - Shader to set uniforms on.
     * @param {Object} ctx - Rendering context with time, dimensions, etc.
     * @param {Object} P - Parameters object containing effect settings.
     */
    setUniforms(shader, ctx, P) {
        // Set common uniforms (tex0 is set by the pipeline before this is called)
        shader.setUniform('time', ctx.time);
        shader.setUniform('dimensions', ctx.dimensions);

        // Subclasses should call super.setUniforms and add their specific uniforms
    }

    /**
     * Gets human-readable information about this pass.
     *
     * @returns {Object} Pass information.
     */
    getInfo() {
        return {
            id: this.id,
            priority: this.priority,
            hasShader: !!this.compiledShader,
        };
    }
}
