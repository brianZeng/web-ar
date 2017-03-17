/**
 * Created by brian on 8/15/16.
 */
export type Viewport={
  width:number;
  height:number;
  aspectRatio:number;
  displayWidth:number;
  displayHeight:number;
};
export let defaultDPI = global.devicePixelRatio || 1;
export function createViewport(width, height, dpi): Viewport {
  width = Math.ceil(width);
  height = Math.ceil(height);
  let aspectRatio = width / height;
  dpi = dpi || defaultDPI;
  return Object.freeze({
    width: +width,
    height: +height,
    aspectRatio,
    displayWidth: Math.ceil(width / dpi),
    displayHeight: Math.ceil(height / dpi)
  })
}
export function viewportEquals(v1: Viewport, v2: Viewport) {
  return v1 && v2 && v1.width === v2.width && v1.height === v2.height;
}
export function alignCanvas(canvas, { element = document.documentElement, dpi = defaultDPI, extendScroll }={}) {
  let style = canvas.style;
  let width = element.clientWidth;
  let height = element.clientHeight;
  canvas.width = width * dpi;
  canvas.height = height * dpi;
  style.width = width + 'px';
  style.height = height + 'px';
  if (extendScroll) {
    style.position = 'fixed';
    style.left = 0;
    style.top = 0;
  }
}
