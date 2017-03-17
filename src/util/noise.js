/**
 * Created by brian on 8/15/16.
 */
import { random } from './math';
export type NoiseData={
  format:number;
  width:number;
  height:number;
  data:Uint8Array;
}
export function randomNoiseData({ easeFunc, format, size=256, min=0, max=1 }={}):NoiseData {
  let dataPerChannel;
  switch (format) {
    case WebGLRenderingContext.LUMINANCE:
    case WebGLRenderingContext.ALPHA:
      dataPerChannel = 1;
      break;
    case WebGLRenderingContext.RGB:
      dataPerChannel = 3;
      break;
    case WebGLRenderingContext.RGBA:
      dataPerChannel = 4;
      break;
    default:
      format = WebGLRenderingContext.LUMINANCE;
      dataPerChannel = 1;
      break;
  }
  let data = new Uint8Array(dataPerChannel * size * size);
  for (let i = 0, len = data.length; i < len; i++) {
    data[i] = random(min, max, easeFunc) * 255;
  }
  return {
    format, data, width: size, height: size
  }
}
