export const VS_PASS = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTex;
void main(){ vTex = aTexCoord; gl_Position = vec4(aPosition, 1.0); }
`;

// Pass-through shader for debugging (no effects)
export const FS_PASSTHROUGH = `
precision mediump float;
varying vec2 vTex;
uniform sampler2D tex0;
void main(){
  gl_FragColor = texture2D(tex0, vTex);
}
`;

// Distortion pass: noise-driven UV offset
export const FS_DISTORTION = `
precision mediump float;
varying vec2 vTex;
uniform sampler2D tex0;
uniform float time;
uniform float amp, scale, speed;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise2(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i+vec2(1.0,0.0));
  float c = hash(i+vec2(0.0,1.0)), d = hash(i+vec2(1.0,1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
void main(){
  vec2 uv = vTex;
  float tt = time * speed;
  float nx = noise2(uv * scale + vec2(13.2, 7.7) + tt);
  float ny = noise2(uv * scale + vec2(-2.8, 5.4) - tt);
  vec2 off = amp * (vec2(nx, ny) * 2.0 - 1.0);
  vec2 uv2 = uv + off;
  gl_FragColor = texture2D(tex0, uv2);
}
`;

// Chroma pass: radial chromatic aberration
export const FS_CHROMA = `
precision mediump float;
varying vec2 vTex;
uniform sampler2D tex0;
uniform float amount, radius;

void main(){
  vec2 uv = vTex;
  vec2 c = vec2(0.5);
  vec2 dir = uv - c;
  float r = length(dir);
  float m = amount * pow(max(r, 1e-5), radius);
  vec2 shift = normalize(dir + 1e-6) * m;
  float rr = texture2D(tex0, uv + shift).r;
  float gg = texture2D(tex0, uv).g;
  float bb = texture2D(tex0, uv - shift).b;
  gl_FragColor = vec4(rr, gg, bb, 1.0);
}
`;

// FBM pass: Fractional Brownian Motion luminance modulation
export const FS_FBM = `
precision mediump float;
varying vec2 vTex;
uniform sampler2D tex0;
uniform float time;
uniform vec2 dimensions;

// FBM parameters
uniform float fbmAmp;      // 0..1 amplitude
uniform float fbmScale;    // spatial frequency
uniform float fbmSpeed;    // temporal speed
uniform float fbmOctaves;  // number of octaves (as float for WebGL compatibility)
uniform float fbmBlend;    // 0..1 blend factor

/**
 * Simple, robust hash function for noise generation.
 */
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

/**
 * Simple 2D noise function.
 */
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(mix(hash(i + vec2(0.0, 0.0)), 
                   hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), 
                   hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

/**
 * Fractional Brownian Motion with unrolled octaves for WebGL compatibility.
 */
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    // Unrolled octaves for maximum compatibility
    value += amplitude * noise(p * frequency);
    frequency *= 2.0; amplitude *= 0.5;
    
    value += amplitude * noise(p * frequency);
    frequency *= 2.0; amplitude *= 0.5;
    
    value += amplitude * noise(p * frequency);
    frequency *= 2.0; amplitude *= 0.5;
    
    value += amplitude * noise(p * frequency);
    
    return value;
}

void main() {
    vec2 uv = vTex;
    vec4 originalColor = texture2D(tex0, uv);
    
    // Safety check for zero amplitude - pass through unchanged
    if (fbmAmp <= 0.0) {
        gl_FragColor = originalColor;
        return;
    }
    
    // Generate time-animated FBM noise
    vec2 noiseCoord = uv * fbmScale + time * fbmSpeed * 0.1;
    float fbmValue = fbm(noiseCoord);
    
    // Normalize FBM to [0, 1] range for luminance modulation
    fbmValue = fbmValue * 0.5 + 0.5;
    
    // Apply luminance modulation: multiply screen by (1 ± amplitude * fbm)
    float modulation = 1.0 + fbmAmp * (fbmValue - 0.5) * 2.0;
    modulation = clamp(modulation, 0.1, 3.0);  // Prevent extreme values
    
    vec3 modulatedColor = originalColor.rgb * modulation;
    
    // Blend modulated result with original based on fbmBlend
    vec3 finalColor = mix(originalColor.rgb, modulatedColor, fbmBlend);
    
    gl_FragColor = vec4(finalColor, originalColor.a);
}
`;
