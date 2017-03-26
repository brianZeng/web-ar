/**
 * Created by brian on 14/03/2017.
 */
import { NeuralNet, Vol } from './NeuralNet';
import type { NeuralNetConstructor } from './NeuralNet';
let net: NeuralNet;
export type { NeuralNetConstructor };
export function setup(arg: NeuralNetConstructor) {
  net = new NeuralNet(arg);
}
export function train(imgData: ImageData|Vol, label) {
  return net.train(ensureVol(imgData), label)
}
export function predict(data: ImageData|Vol): Float32Array {
  return net.predict(ensureVol(data));
}
export function saveNet(key: string): string {
  let json = net.toJSON();
  if (key) {
    localStorage.setItem(key, json);
  }
  return json;
}
function ensureVol(imgData: ImageData|Vol) {
  return imgData instanceof Vol ? Vol : net.createVolFromImageData(imgData);
}