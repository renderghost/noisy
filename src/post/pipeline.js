import { VS_PASS } from '../shaders.js';
import { DistortionPass } from './passes/distortion.js';
import { ChromaPass } from './passes/chroma.js';
import { FBMPass } from './passes/fbm.js';

/**
 * Post-processing pipeline with modular pass system and ping-pong buffering.
 * Manages effect passes with deterministic ordering and efficient rendering.
 */
class PostPipeline {
    constructor() {
        this.postA = null;
        this.postB = null;
        this.passRegistry = new Map();
        this.shaderCache = new Map();
        
        this.registerDefaultPasses();
    }

    /**
     * Registers default post-processing passes with priority-based ordering.
     */
    registerDefaultPasses() {
        this.registerPass(new DistortionPass());
        this.registerPass(new ChromaPass());
        this.registerPass(new FBMPass());
    }

    /**
     * Registers a new post-processing pass.
     *
     * @param {PostPass} pass - Pass instance to register.
     */
    registerPass(pass) {
        if (!pass.id || typeof pass.priority !== 'number') {
            throw new Error('Pass must have id and priority properties');
        }
        this.passRegistry.set(pass.id, pass);
    }

    /**
     * Unregisters a post-processing pass.
     *
     * @param {string} passId - ID of the pass to remove.
     */
    unregisterPass(passId) {
        this.passRegistry.delete(passId);
        this.shaderCache.delete(passId);
    }

    /**
     * Initializes post-processing buffers and compiles shaders.
     *
     * @param {number} W - Canvas width.
     * @param {number} H - Canvas height.
     */
    initPost(W, H) {
        this.createBuffers(W, H);
        this.compileShaders();
    }

    /**
     * Resizes post-processing buffers.
     *
     * @param {number} W - Canvas width.
     * @param {number} H - Canvas height.
     */
    resizePost(W, H) {
        this.initPost(W, H);
    }

    /**
     * Creates ping-pong buffers with proper WEBGL settings.
     *
     * @param {number} W - Canvas width.
     * @param {number} H - Canvas height.
     */
    createBuffers(W, H) {
        // Create postA buffer
        this.postA = createGraphics(W, H, WEBGL);
        this.setupBuffer(this.postA);

        // Create postB buffer
        this.postB = createGraphics(W, H, WEBGL);
        this.setupBuffer(this.postB);
    }

    /**
     * Sets up buffer with required properties for post-processing.
     *
     * @param {p5.Graphics} buffer - Graphics buffer to configure.
     */
    setupBuffer(buffer) {
        buffer.pixelDensity(1);
        buffer.textureWrap(CLAMP);
        buffer.noStroke();
        
        // Hide buffer from DOM
        buffer.elt.style.position = 'absolute';
        buffer.elt.style.left = '-10000px';
        buffer.elt.style.top = '-10000px';
        buffer.elt.style.visibility = 'hidden';
    }

    /**
     * Compiles shaders for all registered passes.
     */
    compileShaders() {
        for (const [id, pass] of this.passRegistry) {
            try {
                const shader = pass.compile(this.postA);
                this.shaderCache.set(id, shader);
                console.log(`✓ Compiled shader for pass: ${id}`);
            } catch (error) {
                console.error(`✗ Failed to compile shader for pass: ${id}`, error);
                this.shaderCache.delete(id);
            }
        }
    }

    /**
     * Applies post-processing effects using the pass pipeline.
     *
     * @param {p5.Graphics} pg - Source graphics buffer to process.
     * @param {number} t - Current time for animation.
     * @param {Object} P - Parameters object containing effect settings.
     * @param {number} W - Canvas width.
     * @param {number} H - Canvas height.
     * @returns {p5.Graphics} Processed graphics buffer or original if no passes enabled.
     */
    drawPost(pg, t, P, W, H) {
        if (!this.postA || !this.postB) {
            return pg;
        }

        // Build ordered list of enabled passes
        const enabledPasses = this.getEnabledPasses(P);
        
        // If no passes are enabled, return original buffer
        if (enabledPasses.length === 0) {
            return pg;
        }

        let srcBuffer = pg;
        let dstBuffer = this.postA;
        let nextBuffer = this.postB;

        // Process each pass with ping-pong buffering
        for (let i = 0; i < enabledPasses.length; i++) {
            const pass = enabledPasses[i];
            const shader = this.shaderCache.get(pass.id);
            
            if (!shader) {
                console.warn(`Shader not found for pass: ${pass.id}`);
                continue;
            }

            try {
                // Set up shader and uniforms
                dstBuffer.shader(shader);
                
                const ctx = {
                    time: t,
                    dimensions: [W, H],
                    passIndex: i,
                    totalPasses: enabledPasses.length
                };
                
                // First set tex0 uniform
                shader.setUniform('tex0', srcBuffer);
                // Then set pass-specific uniforms
                pass.setUniforms(shader, ctx, P);

                // Render full-screen quad
                this.renderFullScreenQuad(dstBuffer, srcBuffer);

                // Swap buffers for next pass
                if (i < enabledPasses.length - 1) {
                    srcBuffer = dstBuffer;
                    [dstBuffer, nextBuffer] = [nextBuffer, dstBuffer];
                }
            } catch (error) {
                console.error(`Error rendering pass: ${pass.id}`, error);
                return pg; // Return original on error
            }
        }

        return dstBuffer;
    }

    /**
     * Gets ordered list of enabled passes based on priority.
     *
     * @param {Object} P - Parameters object containing effect settings.
     * @returns {Array} Array of enabled passes sorted by priority.
     */
    getEnabledPasses(P) {
        const passes = Array.from(this.passRegistry.values());
        return passes
            .filter(pass => pass.isEnabled(P))
            .sort((a, b) => a.priority - b.priority);
    }

    /**
     * Renders a full-screen quad with the given texture.
     *
     * @param {p5.Graphics} buffer - Graphics buffer to render to.
     * @param {p5.Graphics} texture - Texture to apply to the quad.
     */
    renderFullScreenQuad(buffer, texture) {
        buffer.clear();
        buffer.resetMatrix();
        buffer.ortho(-1, 1, 1, -1, -1, 1);
        buffer.noStroke();
        buffer.textureMode(NORMAL);
        buffer.texture(texture);
        
        buffer.beginShape();
        buffer.vertex(-1, -1, 0, 0, 0);
        buffer.vertex(1, -1, 0, 1, 0);
        buffer.vertex(1, 1, 0, 1, 1);
        buffer.vertex(-1, 1, 0, 0, 1);
        buffer.endShape(CLOSE);
    }

    /**
     * Gets information about the current pipeline state.
     *
     * @returns {Object} Pipeline configuration and status.
     */
    getInfo() {
        return {
            registeredPasses: Array.from(this.passRegistry.keys()),
            compiledShaders: Array.from(this.shaderCache.keys()),
            hasBuffers: !!(this.postA && this.postB)
        };
    }
}

// Global pipeline instance
let pipeline = null;

/**
 * Initializes the post-processing pipeline.
 *
 * @param {number} W - Canvas width.
 * @param {number} H - Canvas height.
 */
export function initPost(W, H) {
    pipeline = new PostPipeline();
    pipeline.initPost(W, H);
}

/**
 * Resizes the post-processing pipeline buffers.
 *
 * @param {number} W - Canvas width.
 * @param {number} H - Canvas height.
 */
export function resizePost(W, H) {
    if (pipeline) {
        pipeline.resizePost(W, H);
    }
}

/**
 * Applies post-processing effects to the input buffer.
 *
 * @param {p5.Graphics} pg - Source graphics buffer to process.
 * @param {number} t - Current time for animation.
 * @param {Object} P - Parameters object containing effect settings.
 * @param {number} W - Canvas width.
 * @param {number} H - Canvas height.
 * @returns {p5.Graphics} Processed graphics buffer or original if processing fails.
 */
export function drawPost(pg, t, P, W, H) {
    if (!pipeline) {
        return pg;
    }
    return pipeline.drawPost(pg, t, P, W, H);
}

/**
 * Gets information about the pipeline state.
 *
 * @returns {Object} Pipeline configuration and status.
 */
export function getPipelineInfo() {
    return pipeline ? pipeline.getInfo() : { error: 'Pipeline not initialized' };
}

/**
 * Registers a custom post-processing pass.
 *
 * @param {PostPass} pass - Pass instance to register.
 */
export function registerPass(pass) {
    if (pipeline) {
        pipeline.registerPass(pass);
        // Recompile shaders after registration
        pipeline.compileShaders();
    }
}

/**
 * Unregisters a post-processing pass.
 *
 * @param {string} passId - ID of the pass to remove.
 */
export function unregisterPass(passId) {
    if (pipeline) {
        pipeline.unregisterPass(passId);
    }
}
