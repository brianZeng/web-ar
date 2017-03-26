/**
 * Created by brian on 23/03/2017.
 */
import { random } from '../util/math';
import type { NeuralNet } from '../net/NeuralNet'
const _canvas: HTMLCanvasElement = document.createElement('canvas');
const _ctx: CanvasRenderingContext2D = _canvas.getContext('2d');
export type ImageParam={
  compress:number;
  format:string;
}
export type SampleParam={
  count:number;
  translate:number[];
  scale:number[];
  rotate:number[];
};
export type TrainParam={
  count:number;
  translate?:number[];
  scale?:number[];
  rotate?:number[];
  images:Image[][];
}
export class ImageSampler {
  imageFromDataAsync(imageData: ImageData, arg?: ImageParam = {}): Promise<Image> {
    resetCanvas(_canvas, imageData);
    _ctx.putImageData(imageData, 0, 0);
    return new Promise(function (res, rej) {
      let image = new Image();
      image.src = _canvas.toDataURL(arg.format || 'image/jpeg', arg.compress || 0.7);
      image.onload = () => res(image);
      image.onerror = rej;
    });
  }

  trainNet(net: NeuralNet, arg: TrainParam, callback: (progress: number, done: boolean)=>void) {
    let imageCursor = 0;
    let sampleCursor = 0;
    let images: Image[][] = arg.images.map(imgs => imgs.slice());
    let imgCountPerClass = images[0].length;
    let sampleCountPerImage = arg.count;
    let sampleArg: SampleParam = {
      count: 40,
      rotate: arg.rotate || [-Math.PI / 18, Math.PI / 18],
      scale: arg.scale || [0.85, 1.15],
      translate: arg.translate || [-6, 6]
    };
    if (images.some(imgs => imgs.length != imgCountPerClass)) {
      throw Error('the size of every image class train set should be same,but got:' + images.map(imgs => imgs.length).join(','))
    }
    let self = this;
    if (!typeof callback === "function") {
      callback = noop;
    }
    process();
    function process() {
      if (imageCursor < imgCountPerClass && sampleCursor < sampleCountPerImage) {
        let sampleImages: Image[][] = [];
        images.forEach((classImages, index) => {
          let image = classImages[imageCursor];
          sampleImages[index] = self.sampleImage(image, sampleArg);
        });

        for (let i = 0; i < sampleCountPerImage; i++) {
          for (let j = 0; j < sampleImages.length; j++) {
            let sample = sampleImages[j][i];
            net.train(net.createVolFromImageData(sample), j);
          }
        }
        sampleCursor++;
        let progress = (imageCursor + sampleCursor / sampleCountPerImage) / imgCountPerClass;
        if (sampleCursor >= sampleCountPerImage) {
          sampleCursor = 0;
          imageCursor++;
        }
        callback(progress, false);
        if (progress <= 1) {
          requestAnimationFrame(process);
        }
      }
    }
  }

  sampleImage(input: Image, arg: SampleParam): ImageData[] {
    let ret = [];
    let width = input.naturalWidth;
    let height = input.naturalHeight;
    resetCanvas(_canvas, { width, height });
    let [scaleMin, scaleMax] =arg.scale;
    let [translateMin, translateMax]=arg.translate;
    let [rotateMin, rotateMax] =arg.rotate;
    for (let i = 0; i < arg.count; i++) {
      _ctx.save();
      _ctx.fillStyle = '#000';
      _ctx.fillRect(0, 0, width, height);
      _ctx.translate(random(translateMin, translateMax), random(translateMin, translateMax));
      _ctx.rotate(random(rotateMin, rotateMax));
      let scale = random(scaleMin, scaleMax);
      _ctx.scale(scale, scale);
      _ctx.drawImage(input, 0, 0, width, height);
      ret.push(_ctx.getImageData(0, 0, width, height));
      _ctx.restore();
    }
    return ret;
  }
}
function noop() {

}
function resetCanvas(canvas, { width, height }) {
  canvas.width = width;
  canvas.height = height;
}

