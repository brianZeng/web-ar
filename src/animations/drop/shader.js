/**
 * Created by brian on 07/04/2017.
 */
export { UPDATE_VERTEX_SHADER, SAMPLER_DATA_POINT_SIZE } from '../rain/shader';
export const UPDATE_PHRASE_POS = 0;
export const UPDATE_PHRASE_VEL = 1;

export const UPDATE_FRAG_SHADER = `
precision mediump float;

varying vec2 vTexIndex;

uniform sampler2D uVelBuffer;
uniform sampler2D uPosBuffer;
uniform sampler2D uNoise;
uniform float uTimeDelta;
uniform vec2 uAcceleration;
uniform float uShrink;
uniform int uUpdatePhrase;
uniform vec2 uSizeRange;
uniform vec2 uTexRandom;
bool outOfBound(vec2 v);
vec2 random(float min,float max);

void main(){
  vec2 vel = texture2D(uVelBuffer,vTexIndex).xy;
  vec3 pos = texture2D(uPosBuffer,vTexIndex).xyz;
  vec4 ret = vec4(1.0);
  if(uUpdatePhrase == ${UPDATE_PHRASE_POS}){
    float size = pos.z - pos.z * uShrink * uTimeDelta;
    if(size<0.0 || outOfBound(pos.xy)){
      ret.xy = random(-1.,1.);
      ret.z = random(uSizeRange[0],uSizeRange[1]).x;
    }
    else{
      ret.z = size;
      ret.xy = pos.xy + uTimeDelta * vel;
    }
  }
  else if(uUpdatePhrase == ${UPDATE_PHRASE_VEL}){
    float size = pos.z;
    if(outOfBound(pos.xy)){
      ret.xy = random(-1.,1.);
    }else{
      ret.xy = pos.z * uAcceleration * uTimeDelta + vel;
    }
  }
  
  gl_FragColor = ret;
}

bool outOfBound(vec2 v){
  return v.x > 1. || v.x < -1. || v.y > 1. || v.y < -1.;
}
vec2 random(float min,float max){
   vec2 p = texture2D(uNoise,fract(vTexIndex+ uTexRandom * 4.0)).xy;
   return vec2(min) * p + vec2(max)*(1.0-p);
}
`;

export const DRAW_VERTEX_SHADER = `
precision mediump float;

attribute vec2 aTexIndex;
uniform sampler2D uPosBuffer;
uniform float uPointSizeScale;

void main(){
  vec4 pos = texture2D(uPosBuffer,aTexIndex);
  gl_Position = vec4(pos.xy,0.0,1.0);
  gl_PointSize = pos.z * uPointSizeScale;
}

`;

export const DRAW_FRAG_SHADER=`
precision mediump float;

void main(){
  vec2 pos = (gl_PointCoord - 0.5) * 2.0;
  if(length(pos)>1.0){
    discard;
  }
  gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}
`;