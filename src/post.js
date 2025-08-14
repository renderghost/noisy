import { VS_PASS, FS_POST, FS_PASSTHROUGH } from './shaders.js';

let post = null;
let postShader = null;
let debugMode = false; // Enable full post-processing effects

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
        
        // Log current toggle states each frame
        console.log(`Toggle states - Noise: ${P.noiseEnabled}, Chroma: ${P.chromaEnabled}`);

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
    post.noStroke();
    post.textureMode(NORMAL);
    post.texture(pg);
    post.beginShape();
    post.vertex(-W / 2, -H / 2, 0, 0, 0);
    post.vertex(W / 2, -H / 2, 0, 1, 0);
    post.vertex(W / 2, H / 2, 0, 1, 1);
    post.vertex(-W / 2, H / 2, 0, 0, 1);
    post.endShape(CLOSE);
    return post;
}
