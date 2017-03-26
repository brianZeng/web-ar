/**
 * Created by brian on 13/03/2017.
 */
import {
  GLRenderPipeline,
  CANVAS_DISPLAY_MODE_FULL_SCREEN,
  CANVAS_DISPLAY_MODE_ORIGIN
} from '../animations/base/GLRenderPipeline'
let task: GLRenderPipeline;
export function init({ fullScreen, drawers, renders }) {
  const canvas = Flip.$('#gl-cvs');
  task = new GLRenderPipeline({
    name: 'test-gl',
    canvas,
    display: fullScreen ? CANVAS_DISPLAY_MODE_FULL_SCREEN : CANVAS_DISPLAY_MODE_ORIGIN,
    clear: Flip.GL.COLOR_BUFFER_BIT
  });
  task.init({ preserveDrawingBuffer: true });
  if (renders) {
    renders.forEach(r => task.add(r));
  }
  Flip.instance.add(task);
  drawers.forEach(d => task.addDrawer(d));
}
export function setGLCanvasSize(width, height) {
  let cvs = Flip.$('#gl-cvs');
  cvs.width = width;
  cvs.height = height;
}
