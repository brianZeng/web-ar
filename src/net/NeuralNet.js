/**
 * Created by brian on 10/03/2017.
 */
export type NeuralNetConstructor={
  classesCount:number;
  sampleWidth:number;
  sampleHeight:number;
  json:Object|string;
};
export const convnetjs = typeof window == "object" && window.convnetjs ? window.convnetjs : require('../../lib/convnet.min');
export const Vol = convnetjs.Vol;

export class NeuralNet {
  volSize: number[];

  constructor(arg: NeuralNetConstructor) {
    let net = this.net = new convnetjs.Net();
    this.volSize = [arg.sampleWidth, arg.sampleHeight];
    this.trainer = new convnetjs.SGDTrainer(net, { method: 'adadelta', batch_size: 20, l2_decay: 0.001 });
    if (arg.json) {
      this.loadJSON(arg.json);
    } else {
      let layer_defs = [];
      layer_defs.push({ type: 'input', out_sx: arg.sampleWidth, out_sy: arg.sampleHeight, out_depth: 1 });
      layer_defs.push({ type: 'conv', sx: 5, filters: 8, stride: 1, pad: 2, activation: 'relu' });
      layer_defs.push({ type: 'pool', sx: 2, stride: 2 });
      layer_defs.push({ type: 'conv', sx: 5, filters: 16, stride: 1, pad: 2, activation: 'relu' });
      layer_defs.push({ type: 'pool', sx: 3, stride: 3 });
      layer_defs.push({ type: 'softmax', num_classes: arg.classesCount || 2 });
      net.makeLayers(layer_defs);
    }
  }

  train(v, label) {
    if (!(v instanceof Vol) || v.sx != this.volSize[0] || v.sy != this.volSize[1]) {
      throw Error('invalid Vol');
    }
    this.trainer.train(v, label);
  }

  createVolFromImageData(imgData: ImageData): Vol {
    let [width, height] = this.volSize;
    let vol = new convnetjs.Vol(width, height, 1, 0);
    let p = imgData.data;
    let w = vol.w;
    for (let y = 0, index = 0, volIndex = 0; y < height; y++) {
      index = y * imgData.width * 4;
      for (let x = 0; x < width; x++) {
        w[volIndex++] = p[index] / 255;
        index += 4
      }
    }
    return vol;
  }

  toJSON(): string {
    let jobj = this.net.toJSON();
    return JSON.stringify(jobj, function (k, v) {
      if (v && (v.buffer instanceof ArrayBuffer)) {
        return Array.from(v)
      }
      return v;
    })
  }

  loadJSON(str) {
    let cfg = str;
    if (typeof str === "string") {
      cfg = JSON.parse(str);
    }
    let net = this.net = new convnetjs.Net();
    net.fromJSON(cfg);
    this.trainer.net = net;
  }

  predict(v): Vol {
    if (!(v instanceof Vol) || v.sx != this.volSize[0] || v.sy != this.volSize[1]) {
      throw Error('invalid Vol');
    }
    return this.net.forward(v);
  }
}