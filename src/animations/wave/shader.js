/**
 * Created by brian on 04/02/2017.
 */
export const QUAD_VERTEX_SHADER = `
precision mediump float;
attribute vec2 aQuad;
varying vec2 vTexCoord;
void main(){
  vTexCoord = aQuad/2. + .5;
  gl_Position = vec4(aQuad, 0.0, 1.0);
}
`;
export const DROP_FRAG_SHADER = `
precision mediump float;

const float PI = 3.141592653589793;
varying vec2 vTexCoord;
uniform sampler2D uWater;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uStrength;
uniform float uAspectRatio;

void main() {
  vec4 info = texture2D(uWater, vTexCoord);
  vec2 dis = vTexCoord - uCenter;
  dis.y /= uAspectRatio; 
  float drop = max(0.0, 1.0 - length(dis) / uRadius);
  drop = 1. - cos(drop * PI);
  info.r += drop * uStrength;
  info.b = 1. * drop;
  gl_FragColor = info;
}
`;
//(height,vel)
export const UPDATE_FRAG_SHADER = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uWater;
uniform vec2 uTexSize;
uniform float uWaveSpeed;
uniform float uAspectRatio;

void main() {
  vec4 info = texture2D(uWater,vTexCoord);
  vec2 delta = 1./uTexSize;
  /* calculate average neighbor height */
  vec2 dx = vec2(delta.x * uWaveSpeed, 0.0);
  vec2 dy = vec2(0.0, delta.y * uWaveSpeed * uAspectRatio);
  vec3 vw = texture2D(uWater, vTexCoord - dx).rgb;
  vec3 ve = texture2D(uWater, vTexCoord + dx).rgb;
  vec3 vn = texture2D(uWater, vTexCoord - dy).rgb;
  vec3 vs = texture2D(uWater, vTexCoord + dy).rgb;
  vec3 average = (vw+ve+vn+vs) * 0.25;
  
  /* change the velocity to move toward the average */
  info.g += (average.r - info.r) * 2.0;
  /* attenuate the velocity a little so waves do not last forever */
  info.g *= 0.99;
  /* move the vertex along the velocity */
  info.r += info.g;
  
  gl_FragColor = info;
}
`;
export const VISUALIZE_FRAG_SHADER = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uWater;

void main(){
  vec4 info = texture2D(uWater,vTexCoord);
  gl_FragColor = vec4(vec3(info.r),1.0);
}
`;

export const REFRACT_FRAG_SHADER=`
precision mediump float;
varying vec2 vTexCoord;

uniform sampler2D uBackground0;
uniform sampler2D uBackground1;
uniform float uBgTransparent;
uniform sampler2D uWater;
uniform float uWaveSpeed;
uniform vec2 uTexSize;
uniform float uAspectRatio;

vec3 getPoint3D(sampler2D tex,vec2 coord);
void main(){
  vec3 p0 = getPoint3D(uWater,vTexCoord);
  vec3 p1 = getPoint3D(uWater,vTexCoord + vec2(0.,1./uTexSize.y * uWaveSpeed * uAspectRatio));
  vec3 p2 = getPoint3D(uWater,vTexCoord + vec2(1./uTexSize.x * uWaveSpeed,0.));
  vec3 n = normalize(cross(p0-p1,p0-p2));
  vec3 light = vec3(0.,0.,-1.);
  vec3 r = refract(light,n,0.8);
  float k = r.z ==0.?0.:- p0.z /r.z;
  vec3 pos = p0 + k * r;
  gl_FragColor = texture2D(uBackground1,pos.xy) * uBgTransparent + (1.-uBgTransparent) * texture2D(uBackground0,pos.xy);
}

vec3 getPoint3D(sampler2D tex,vec2 coord){
  float height = texture2D(tex,coord).r;
  return vec3(coord,height);
}

`;