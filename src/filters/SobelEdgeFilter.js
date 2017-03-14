/**
 * Created by brian on 08/03/2017.
 */
import { GLFilter } from './GLFilter';
export type SobelEdgeFilterConstructor={
  threshold:number;
}
export class SobelEdgeFilter extends GLFilter {
  constructor(arg: SobelEdgeFilterConstructor) {
    arg.program = EDGE_FRAG_SHADER;
    super(arg);
    this.addBinder(this.buildBinder({
      uEdgeScale: arg.threshold || 3,
      uTexSize: [0, 0]
    }));
  }

  set size(size) {
    this.binder['uTexSize'].value = size;
  }

}
export const EDGE_FRAG_SHADER = `
  
  uniform vec2 uTexSize;
  uniform float uEdgeScale;
  uniform sampler2D uSampler;
  
  void main(){
    vec2 texInc = 1./uTexSize;
    vec3 ret=vec3(0.0);
    #define texLum(x,y) texture2D(uSampler,vec2(x,y) * texInc + vTexIndex).rgb
    vec3 t = texLum(0.,-1.);
    vec3 b = texLum(0.,1.);
    vec3 l = texLum(-1.,0.);
    vec3 r = texLum(1.,0.);
    vec3 lt = texLum(-1.,-1.);
    vec3 lb = texLum(-1.,1.);
    vec3 rt = texLum(1.,-1.);
    vec3 rb = texLum(1.,1.);
    vec3 h = lt + 2.* t + rt - lb - 2.* b - rb;
    vec3 v = lt + 2.* l + lb - rt - 2.* r - rb;
    float lum =any(greaterThan((abs(v)+abs(h)),vec3(0.5 * uEdgeScale))) ? 1.:0.;
    
    gl_FragColor = vec4(vec3(lum),1.0);
  }
  
`;