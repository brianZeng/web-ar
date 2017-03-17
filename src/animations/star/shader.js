/**
 * Created by brian on 03/11/2016.
 */
export const VERTEX_SHADER = `
precision mediump float;

attribute vec4 aPoint;
attribute vec3 aPointColor;

uniform mat4 uViewProjection;
uniform mat4 uWorldTransform;

varying vec3 vPointColor;
varying vec2 vNoiseIndex;

void main(){
  vec4 pos = vec4(aPoint.xyz,1.0);
  vPointColor = aPointColor;
  gl_Position = pos * uWorldTransform * uViewProjection;
  gl_PointSize = aPoint.w;
  vNoiseIndex = pos.xy;
}
`;
export const FRAG_SHADER = `
precision mediump float;

const float BASE_ALPHA = 0.2;
const float SHINNING_ALPHA = 0.8;

varying vec3 vPointColor;
varying vec2 vNoiseIndex;

uniform vec2 uShinningRadius;
uniform sampler2D uNoise;
uniform float uOffset;
uniform float uGlobalOpacity;
float shanningOffset();

void main(){
  vec2 pos = (gl_PointCoord.xy - 0.5) * 2.0;
  float len = length(pos);
  if(len >1.0){
    discard;
  }
  float alpha = (1.0 - smoothstep(0.0,1.0,len)) * BASE_ALPHA * uGlobalOpacity;
  float shanningRadius = uShinningRadius[0] + shanningOffset() * uShinningRadius[1];
  alpha += (1.0 - smoothstep(0.0,shanningRadius,len)) * SHINNING_ALPHA;
  gl_FragColor = vec4(vPointColor,alpha);
}
float shanningOffset(){
  float noise = length(texture2D(uNoise,vNoiseIndex));
  float timeOffset = uOffset;
  return abs(sin((noise+timeOffset) * 3.14159));
}
`;