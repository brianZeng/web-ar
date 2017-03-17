/**
 * Created by brian on 16/03/2017.
 */
import type { Viewport } from '../../util/viewport';
import  type { GLRenderPipeline } from './GLRenderPipeline';
import { ANIMATION_NONE } from './const';
export class GLDrawer extends Flip.GL.Stage {
  parentPipeline: GLRenderPipeline|null;

  viewportResize(v: Viewport) {

  }

  get type() {
    return ANIMATION_NONE;
  }
}