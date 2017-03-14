/**
 * Created by brian on 13/03/2017.
 */
import { getCameraVideoOfSizeAsync } from './util/webrtc';
import { init, setGLCanvasSize, addScenes } from './util/setup';
import { VideoStage } from './VideoStage';
const processFrame = { x: 0, y: -.7, size: 64 };
let stage = new VideoStage();

getCameraVideoOfSizeAsync().then(function (result) {
  let video = result.video;
  let size = result.size;
  stage.size = size;
  stage.processFrame = processFrame;
  stage.source = video;
  setGLCanvasSize(size[0], size[1]);
  init();
  addScenes(stage,createCaptureRender(Flip.$('#capture-cvs')));
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