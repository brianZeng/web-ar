/**
 * Created by brian on 23/03/2017.
 */
import { getCameraVideoOfSizeAsync } from './util/webrtc';
import { init, setGLCanvasSize } from './util/setup';
import { VideoStage, VideoStageDelegate } from './process/VideoStage';
import { ImageSampler } from './process/ImageSampler';
import { $, $$, toggleClass, removeNodeFromParent } from './util/dom';
import { NeuralNet } from './net/NeuralNet';
let stage = new VideoStage({ debug: true });
let sampler = new ImageSampler();
const processFrame = { x: 0, y: -.6, size: 64 };
let net = new NeuralNet({
  classesCount: 5,
  sampleHeight: processFrame.size,
  sampleWidth: processFrame.size
});
getCameraVideoOfSizeAsync().then(result => {
  let video = result.video;
  let size = result.size;
  stage.source = video;
  stage.size = size;
  stage.processFrame = processFrame;
  stage.delegate = createCaptureDelegate($('#capture-cvs'));
  setGLCanvasSize(size[0], size[1]);
  init({
    drawers: [stage]
  });
  initUI();
});
function createCaptureDelegate(cvs: HTMLCanvasElement): VideoStageDelegate {
  let imageResolvers = [];
  let onImageHandlers = [];
  return {
    processFrameEnd(stage: VideoStage, gl){
      if (imageResolvers.length + onImageHandlers.length) {
        let img = stage.captureFrame(gl);
        onImageHandlers.forEach(func => func(img));
        if (imageResolvers.length) {
          sampler.imageFromDataAsync(img).then(img => {
            imageResolvers.forEach(r => r(img));
            imageResolvers = [];
          })
        }
      }
    },
    onFrame(handler){
      onImageHandlers.push(handler);
    },
    captureImageAsync(){
      return new Promise(res => imageResolvers.push(res));
    }
  }
}
function initUI() {
  const types = ['none', 'snow', 'rain', 'sun', 'moon'];
  let selectEle: HTMLSelectElement = $('select');
  selectEle.innerHTML = types.map(r => `<option value="${r}">${r}</option>`).join('');
  let samplesEle = $('.samples');
  let beginTest = false;
  samplesEle.innerHTML = types.map(r => `<div data-type="${r}"><p>${r}:</p></div>`).join('');

  $('button.capture').onclick = () => stage.delegate.captureImageAsync().then(function (img) {
    samplesEle.children[selectEle.selectedIndex].appendChild(img);
  });
  $('button.remove').onclick = () => $$('img.select', samplesEle).forEach(removeNodeFromParent);
  $('button.train').onclick = () => {
    let images = [];
    $$('.samples [data-type]').forEach(e => images.push($$('img', e)));
    sampler.trainNet(net, {
      count: 3,
      images
    }, (progress, done) => {
      $('.train-progress').textContent = `${parseInt(progress * 100)}%`;
      console.log(progress);
    });
  };
  $('button.test').onclick = function () {
    if (!beginTest) {
      beginTest = true;
      let resultEl = $('.test-result');
      toggleClass(resultEl, 'hide', false);
      stage.delegate.onFrame(imgData => {
        let result = Array.from(net.predict(net.createVolFromImageData(imgData)).w);
        let max = Math.max.apply(Math, result);
        resultEl.textContent = `may be ${types[result.indexOf(max)]}:` + result.map(n => n.toFixed(2)).join(',');
      });
    }
  };
  $('button.save').onclick = () => {
    let input = $('input.save');
    toggleClass(input, 'hide', false);
    input.value = net.toJSON();
  };
  samplesEle.onclick = (e: MouseEvent) => e.target.tagName == 'IMG' && toggleClass(e.target, 'select')
}
function drawSamples(cvs: HTMLCanvasElement, samples: ImageData[], { row, col, width, height }) {
  let ctx = cvs.getContext('2d');
  cvs.height = height * row;
  cvs.width = width * col;
  for (let y = 0, index = 0; y < row; y++) {
    for (let x = 0; x < col; x++, index++) {
      ctx.putImageData(samples[index], x * width, y * height);
    }
  }
}