import { VS_PASS, FS_POST, FS_PASSTHROUGH } from './shaders.js';

let post = null;
let postShader = null;
let debugMode = false; // Enable full post-processing effects

/**
 * Initializes post-processing graphics buffer and shaders.
 *
 * @param {number} W - Canvas width.
 * @param {number} H - Canvas height.
 */
export function initPost(W, H) {
    post = createGraphics(W, H, WEBGL);
    post.pixelDensity(1);
    post.noStroke();
    post.textureWrap(CLAMP);
    post.elt.style.position = 'absolute';
    post.elt.style.left = '-10000px';
    post.elt.style.top = '-10000px';
    post.elt.style.visibility = 'hidden';

    const fragmentShader = debugMode ? FS_PASSTHROUGH : FS_POST;
    try {
        postShader = post.createShader(VS_PASS, fragmentShader);
        console.log(
            `Post-processing shader created (${debugMode ? 'pass-through' : 'full effects'})`
        );
    } catch (error) {
        console.error('Shader compilation failed:', error);
        postShader = null;
    }
}

export function resizePost(W, H) {
    initPost(W, H);
}

/**
 * Applies post-processing effects to the drawing buffer.
 *
 * @param {p5.Graphics} pg - Source graphics buffer to process.
 * @param {number} t - Current time for animation.
 * @param {Object} P - Parameters object containing effect settings.
 * @param {number} W - Canvas width.
 * @param {number} H - Canvas height.
 * @returns {p5.Graphics} Processed graphics buffer or original if processing fails.
 */
export function drawPost(pg, t, P, W, H) {
    if (!post || !postShader) {
        return pg;
    }

    try {
        post.shader(postShader);

        // Respect toggle states - disable effects when toggles are false
        let amp = P.distortAmp;
        let amount = P.chromaAmount;

        if (P.noiseEnabled === false) {
            amp = 0.0;
        }

        if (P.chromaEnabled === false) {
            amount = 0.0;
        }

        // Only log toggle state changes, not every frame
        // console.log(`Toggle states - Noise: ${P.noiseEnabled}, Chroma: ${P.chromaEnabled}`);

        postShader.setUniform('tex0', pg);
        postShader.setUniform('time', t);
        postShader.setUniform('amp', amp);
        postShader.setUniform('scale', P.distortScale);
        postShader.setUniform('speed', P.distortSpeed);
        postShader.setUniform('amount', amount);
        postShader.setUniform('radius', P.chromaRadius);
    } catch (error) {
        console.error('Error setting shader uniforms:', error);
        return pg;
    }

    post.clear();
    post.resetMatrix();
    // Optional explicit orthographic projection for normalized coordinates
    post.ortho(-1, 1, 1, -1, -1, 1);
    post.noStroke();
    post.textureMode(NORMAL);
    post.texture(pg);
    post.beginShape();
    post.vertex(-1, -1, 0, 0, 0);
    post.vertex( 1, -1, 0, 1, 0);
    post.vertex( 1,  1, 0, 1, 1);
    post.vertex(-1,  1, 0, 0, 1);
    post.endShape(CLOSE);
    return post;
}
