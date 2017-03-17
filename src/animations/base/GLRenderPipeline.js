/**
 * Created by brian on 16/03/2017.
 */
import { createViewport, defaultDPI, viewportEquals, Viewport, alignCanvas } from '../../util/viewport';
import type { GLDrawer } from './GLDrawer';
export const CANVAS_DISPLAY_MODE_FULL_SCREEN = 'full-screen';
export const CANVAS_DISPLAY_MODE_ORIGIN = 'origin';
export const CANVAS_DISPLAY_MODE_FULL_CONTENT_SCROLL = 'full-scroll';
export type GLRenderPipelineConstructor={
  dpi:number;
  canvas:HTMLCanvasElement;
  display:CANVAS_DISPLAY_MODE_FULL_SCREEN|CANVAS_DISPLAY_MODE_ORIGIN|CANVAS_DISPLAY_MODE_FULL_CONTENT_SCROLL;
};

export class GLRenderPipeline extends Flip.GL.Task {
  constructor(arg: GLRenderPipelineConstructor) {
    super(arg);
    this.dpi = arg.dpi || defaultDPI;
    this.canvas = arg.canvas;
    this.viewport = this.getCanvasViewport();
    this.canvasDisplayMode = arg.display || CANVAS_DISPLAY_MODE_FULL_SCREEN;
    this.drawers = [];
  }

  init(arg) {
    super.init(arg);
  }

  addDrawer(drawer: GLDrawer): GLRenderPipeline {
    if (this.add(drawer)) {
      drawer.parentPipeline = this;
      this.drawers.push(drawer);
      drawer.viewportResize(this.viewport);
    }
    return this;
  }

  update(e) {
    if (!this.disabled) {
      super.update(e);
      let parentViewport = this.getCanvasParentViewport();
      if (!viewportEquals(this.parentViewport, parentViewport)) {
        this.alignCanvas();
        this.parentViewport = parentViewport;
      }
      let viewport = this.getCanvasViewport();
      if (!viewportEquals(this.viewport, viewport)) {
        this.onViewportResize(viewport, e.gl);
      }
      this.drawers.forEach(drawer => !drawer.disabled && drawer.update(e));
    }
  }

  onViewportResize(viewport: Viewport, gl: WebGLRenderingContext) {
    this.viewport = viewport;
    if (gl) {
      gl.viewport(0, 0, viewport.width, viewport.height);
    }
    this.drawers.forEach(drawer => {
      drawer.viewportResize(viewport);
      drawer.invalid();
    });
  }

  getCanvasParentViewport() {
    let p: HTMLElement = this.canvas.parentElement;
    if (p) {
      let isScrollSize = this.canvasDisplayMode == CANVAS_DISPLAY_MODE_FULL_CONTENT_SCROLL;
      let width = isScrollSize ? p.scrollWidth : p.clientWidth;
      let height = isScrollSize ? p.scrollHeight : p.clientHeight;
      return createViewport(width, height, this.dpi);
    }
    return createViewport(0, 0, this.dpi);
  }

  alignCanvas() {
    let extendScroll = this.canvasDisplayMode == CANVAS_DISPLAY_MODE_FULL_CONTENT_SCROLL;
    if (this.canvasDisplayMode == CANVAS_DISPLAY_MODE_FULL_SCREEN || extendScroll) {
      alignCanvas(this.canvas, { extendScroll });
    }
  }

  getCanvasViewport() {
    let cvs = this.canvas;
    return createViewport(cvs.width, cvs.height, this.dpi);
  }
}