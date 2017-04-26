export const SAMPLER_DATA_POINT_SIZE = 2;
export const UPDATE_VERTEX_SHADER = `
precision mediump float;

attribute vec2 aTexIndex;
varying vec2 vTexIndex;
const float SAMPLER_DATA_POINT_SIZE = ${SAMPLER_DATA_POINT_SIZE.toFixed(1)};

void main(){
  vTexIndex = aTexIndex;
  gl_Position = vec4(aTexIndex * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize= SAMPLER_DATA_POINT_SIZE;
}
`;
export const UPDATE_FRAGE_SHADER = `
precision mediump float;

uniform sampler2D uVecBuffer;
uniform sampler2D uPosBuffer;
uniform sampler2D uNoise;
uniform vec2 uTimeDelta;
uniform int uUpdatePhrase;
uniform vec3 uAcceleration;
uniform vec3 uResistance;
uniform vec2 uTexRandom;
uniform vec4 uVecRange;
varying vec2 vTexIndex;

const int UPDATE_PHRASE_POS= 0;
const int UPDATE_PHRASE_VEC= 1;
const float BOUNCE_DECREASE= 2.0/3.0;

bool outOfBound(vec2 pos);
vec2 interpolateVecRange(vec4 range,vec2 p);
void main(){
  vec3 curVec = texture2D(uVecBuffer,vTexIndex).xyz * 2.0 - 1.0;
  vec3 curPos = texture2D(uPosBuffer,vTexIndex).xyz * 2.0 - 1.0;
  vec3 _output;
  if(uUpdatePhrase == UPDATE_PHRASE_POS){
    if(outOfBound(curPos.xy)){
      vec4 noise = texture2D(uNoise,fract(vTexIndex + uTexRandom + curVec.xy));
      float x =(fract(noise.x * 6.282) -0.5) * 3.0;
      _output=vec3(x, 1.0, _output.z);
    }
    else{
      _output = curPos + curVec * uTimeDelta[UPDATE_PHRASE_POS];
    }
  }
  else if(uUpdatePhrase == UPDATE_PHRASE_VEC){
    vec3 resistance = uResistance * curVec;
    _output = curVec + (uAcceleration - resistance) * uTimeDelta[UPDATE_PHRASE_VEC];
    if(outOfBound(curPos.xy)){
        vec2 noise = texture2D(uNoise,fract(vTexIndex+ uTexRandom * 4.0)).xy;
        _output.xy = interpolateVecRange(uVecRange,vec2(noise.y));
    }
  }
  gl_FragColor = vec4(( _output  + 1.0 ) / 2.0 ,1.0);
}
bool outOfBound(vec2 pos){
  if(pos.y<= -1.0 || pos.x >= 2.0 || pos.x <= -2.0){
    return true;
  }
  return false;
}
vec2 interpolateVecRange(vec4 range,vec2 p){
  return vec2(range[0] + p[0] * range[1] ,range[2] + p[1] * range[3]);
}
`;
export const DRAW_VERTEX_SHADER = `
precision mediump float;

uniform sampler2D uPosBuffer;
uniform mat4 uViewProjectionMatrix;
uniform float uPointSizeScale;

attribute vec2 aTexIndex;
attribute float aPointSize;
attribute vec4 aPointColor;

varying vec4 vPointColor;

#ifdef DRAW_RAIN
uniform sampler2D uVecBuffer;
varying float vPointVelRatio;
#endif

void main(){
  vec3 pos = (texture2D(uPosBuffer,aTexIndex).xyz) * 2.0 - 1.0;
 
  gl_Position = uViewProjectionMatrix * vec4(pos,1.0);
  
  gl_PointSize = aPointSize * uPointSizeScale;
#ifdef DRAW_SNOW
  float y = (gl_Position.y +1.0)/2.0;
  vPointColor = aPointColor * pow(y,0.2);
#else
  vPointColor = aPointColor;
#endif
  
#ifdef DRAW_RAIN
   vec2 vel = (texture2D(uVecBuffer,aTexIndex).xy * 2.0) -1.0;
   if(vel.x !=0.0){
     vPointVelRatio = -vel.y / vel.x;
   }
   else{
     vPointVelRatio = 0.0;
   }
#endif
}
`;
export const DRAW_FRAGE_SHADER = `
precision mediump float;

#ifdef DRAW_RAIN
varying float vPointVelRatio;
#endif

varying vec4 vPointColor;
uniform float uPointOpacity;
uniform float uPointWidth;
uniform float uDiscardThreshold;

void main(){
  float a=1.0;
  if(vPointColor.a > uDiscardThreshold){
    discard;
  }
#ifdef DRAW_RAIN
    float x = gl_PointCoord.x;
    float y = gl_PointCoord.y;
    float LINE_X_END = 0.5 + uPointWidth /0.5;
    float LINE_X_START = 0.5 - uPointWidth /0.5;
    if(vPointVelRatio !=0.0){
      float k=y/vPointVelRatio;
      if( k > (x - LINE_X_START) || k < (x - LINE_X_END)){
        discard;
      }
      else{
         a = (y*(1.0+vPointVelRatio*vPointVelRatio))/(LINE_X_START * (1.0+vPointVelRatio*vPointVelRatio));
         a = smoothstep(0.0,1.0,a)*0.7;
      }   
    }
    else{
      if(x < LINE_X_START || x > LINE_X_END)
        discard;
      //else 
        //a= y /1.0;
    }
#endif
#ifdef DRAW_SNOW
    float radius =length(gl_PointCoord - 0.5);
    if(radius > 0.5){
      discard;
    }
    a = clamp((radius -0.2)/(0.5-0.2),0.0,1.0);
    a = pow(clamp(1.0 - a, 0.0 ,1.0),0.7);
#endif
  
  gl_FragColor= vPointColor * uPointOpacity * a;
}

`;