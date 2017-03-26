/**
 * Created by brian on 22/03/2017.
 */
import { GLFilter } from './GLFilter';
const FRAG_SHADER = `
uniform sampler2D uSampler;
uniform float uAlpha;
void main(){
  vec3 color = texture2D(uSampler,vTexIndex).rgb;
  vec2 pos =(vTexIndex - .5) * 2.;
  float len =length(pos);
  
  float a = uAlpha * (1.-smoothstep(0.3,1.0,len));
  gl_FragColor = vec4(color,a);
}
`;
export class MirrorFilter extends GLFilter {
  constructor(e) {
    e.program = FRAG_SHADER;
    super(e);
    this.addBinder(this.buildBinder({
      uAlpha: isNaN(e.alpha) ? 0.5 : e.alpha,
      blend(gl){
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }
    }));
  }

  get alpha() {
    return this.binder['uAlpha'].value;
  }

  set alpha(v) {
    if (this.alpha != v) {
      this.binder['uAlpha'].value = +v;
      this.invalid();
    }
  }
}