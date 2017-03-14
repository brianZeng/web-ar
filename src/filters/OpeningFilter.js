/**
 * Created by brian on 07/03/2017.
 */
import { GLFilter } from './GLFilter';
import type { GLFilterConstructor } from './GLFilter';
import * as shader from './shader';
declare class OpeningFilterConstructor extends GLFilterConstructor {
  window:number;
}
export class OpeningFilter extends GLFilter {
  constructor(arg: OpeningFilterConstructor) {
    arg.program = shader.MORPHOLOGICAL_FRAG_SHADER(arg.window || 3);
    super(arg);
    this.addBinder(this.buildBinder({
      uTexSize: [0, 0]
    }));
  }

  set size(size: number[]) {
    this.binder['uTexSize'].value = size;
    this.invalid();
  }

  set input(source: HTMLImageElement|HTMLVideoElement|Image) {
    let binder = this.binder['uSampler'];
    binder.source = source;
    binder.dynamicSource = source instanceof HTMLVideoElement;
    this.invalid();
  }

  getTargetFBOOwner() {
    return this.children[1];
  }

  createMeshes(arg: OpeningFilterConstructor) {
    let framebuffer = new Flip.GL.FrameBuffer({ name: 'fbo' });
    return [
      {
        binder: this.buildBinder({
          uProcess: shader.MORPHOLOGICAL_PROCESS_EROSION,
          framebuffer,
        })
      },
      {
        binder: this.buildBinder({
          uProcess: shader.MORPHOLOGICAL_PROCESS_DILATION,
          uSampler: framebuffer.createSampler2D('uSampler')
        })
      }
    ]
  }
}