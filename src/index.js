/**
 * Created by brian on 13/03/2017.
 */
import { getCameraVideoOfSizeAsync } from './util/webrtc';
import { init, setGLCanvasSize } from './util/setup';
import { VideoStage } from './process/VideoStage';
import { BackgroundWorker } from './process/BackgroundWorker';
import { MSG_EVENT_INIT_NET, MSG_EVENT_WORKER_READY, MSG_EVENT_PREDICT } from './process/worker-msg';
import { transitionAnimationAsync, isTransitioning } from './animation';
import { ProcessWindow } from './process/ProcessWindow';
const processFrame = { x: 0, y: -.6, size: 64 };
const animations = ['none', 'snow', 'rain', 'sun', 'moon'];
let stage = new VideoStage();
let worker = new BackgroundWorker(Flip.$('#worker').value);
let predictReady = false;
let processWindow = new ProcessWindow();
let currentAnimation;
worker.onmessage(MSG_EVENT_WORKER_READY, function () {
  worker.postMessage(MSG_EVENT_INIT_NET);
});
worker.onmessage(MSG_EVENT_INIT_NET, function () {
  predictReady = true;
});
worker.onmessage(MSG_EVENT_PREDICT, function (d) {
  processWindow.push(d);
  let maxIndex = processWindow.currentIndex;
  if (maxIndex > -1 && !isTransitioning() && currentAnimation != animations[maxIndex]) {
    transitionAnimationAsync(currentAnimation = animations[maxIndex]);
  }
});
getCameraVideoOfSizeAsync().then(function (result) {
  let video = result.video;
  let size = result.size;
  stage.size = size;
  stage.processFrame = processFrame;
  stage.source = video;
  setGLCanvasSize(size[0], size[1]);
  stage.add(createCaptureRender(Flip.$('#capture-cvs')));
  init({
    drawers: [stage]
  });
});

function createCaptureRender(canvas: HTMLCanvasElement) {
  let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  let render = new Flip.GL.Render({ name: 'capture' });
  render.render = function (e) {
    if (predictReady && !worker.busy && !isTransitioning()) {
      let imageData = stage.captureFrame(e.gl, processFrame);
      /* canvas.width = imageData.width;
       canvas.height = imageData.height;
       ctx.putImageData(imageData, 0, 0);*/
      worker.postMessage(MSG_EVENT_PREDICT, imageData, [imageData.data.buffer]);
    }
    /**/
  };
  return render;
}