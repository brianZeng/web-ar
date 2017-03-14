/**
 * Created by brian on 07/03/2017.
 */
export const MORPHOLOGICAL_PROCESS_EROSION = 1;
export const MORPHOLOGICAL_PROCESS_DILATION = 2;
export const MORPHOLOGICAL_FRAG_SHADER = (windowSize) => `
  const int PROCESS_EROSION =${MORPHOLOGICAL_PROCESS_EROSION};
  const int PROCESS_DILATION = ${MORPHOLOGICAL_PROCESS_DILATION};
  
  const int _ws = ${-parseInt((windowSize - 1) / 2)};
  const int _we = ${parseInt((windowSize - 1) / 2)};
  uniform sampler2D uSampler;
  uniform vec2 uTexSize;
  uniform int uProcess;
  
  vec3 erosion(sampler2D tex,vec2 index,vec2 inc);
  vec3 dilation(sampler2D tex,vec2 index,vec2 inc);
  
  void main(){
    vec3 ret= vec3(0.0);
    float a =1.;
    if(uProcess == PROCESS_EROSION){
      ret = erosion(uSampler,vTexIndex,1./uTexSize);
    }
    else if(uProcess == PROCESS_DILATION){
      ret = dilation(uSampler,vTexIndex,1./uTexSize);
    }
    else{
      ret = texture2D(uSampler,vTexIndex).rgb;
    }
    gl_FragColor = vec4(ret,1.0);
  }
  
  #define t(a,b) texture2D(tex,index + vec2(a,b) * inc).rgb
  vec3 erosion(sampler2D tex,vec2 index,vec2 inc){
    vec3 _zero = vec3(0.0);
    for(int x = _ws;x <= _we;x++){
      for(int y= _ws;y <= _we;y++){
        vec3 c = t(float(x),float(y));
        if(any(equal(c,_zero))){
          return vec3(0.0);
        }
      }
    }
    return vec3(1.0);
  }
  vec3 dilation(sampler2D tex,vec2 index,vec2 inc){
    vec3 _zero = vec3(0.0);
    for(int x = _ws;x <= _we;x++){
      for(int y= _ws;y <= _we;y++){
        vec3 c = t(float(x),float(y));
        if(any(greaterThan(c,_zero))){
          return vec3(1.0);
        }
      }
    }
    return vec3(0.0);
  }
`;