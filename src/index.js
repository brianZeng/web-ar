/**
 * Created by brian on 13/03/2017.
 */
import { getCameraVideoOfSizeAsync } from './util/webrtc';
import { init, setGLCanvasSize, addScenes } from './util/setup';
import { VideoStage } from './video-process/VideoStage';
const processFrame = { x: 0, y: -.7, size: 64 };
let stage = new VideoStage();
let worker = new Worker(Flip.$('#worker').value);
import { getVertexSunDrawer, getVertexSunDrawerAnimateParam } from './animations/sun/index';
import { getMoonDrawer } from './animations/moon/index';
getCameraVideoOfSizeAsync().then(function (result) {
  let video = result.video;
  let size = result.size;
  stage.size = size;
  stage.processFrame = processFrame;
  stage.source = video;
  setGLCanvasSize(size[0], size[1]);
  init();
  let sun = getMoonDrawer(0.3);
  addScenes(sun);
});

function createCaptureRender(canvas: HTMLCanvasElement) {
  let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  let render = new Flip.Render({ name: 'capture' });
  render.render = function (e) {
    let imageData = stage.captureFrame(e.gl, processFrame);
    ctx.putImageData(imageData, 0, 0);
  };
  return render;
}