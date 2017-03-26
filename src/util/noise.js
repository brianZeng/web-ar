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
    case Flip.GL.LUMINANCE:
    case Flip.GL.ALPHA:
      dataPerChannel = 1;
      break;
    case Flip.GL.RGB:
      dataPerChannel = 3;
      break;
    case Flip.GL.RGBA:
      dataPerChannel = 4;
      break;
    default:
      format = Flip.GL.LUMINANCE;
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
