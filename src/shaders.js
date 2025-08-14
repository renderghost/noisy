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

// Full post-processing shader with noise distortion and chromatic aberration
export const FS_POST = `
precision mediump float;
varying vec2 vTex;
uniform sampler2D tex0;
uniform float time;
uniform float amp, scale, speed;
uniform float amount, radius;

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
  vec2 c = vec2(0.5);
  vec2 dir = uv2 - c;
  float r = length(dir);
  float m = amount * pow(max(r, 1e-5), radius);
  vec2 shift = normalize(dir + 1e-6) * m;
  float rr = texture2D(tex0, uv2 + shift).r;
  float gg = texture2D(tex0, uv2).g;
  float bb = texture2D(tex0, uv2 - shift).b;
  gl_FragColor = vec4(rr, gg, bb, 1.0);
}
`;
