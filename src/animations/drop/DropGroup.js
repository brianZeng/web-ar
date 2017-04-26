/**
 * Created by brian on 07/04/2017.
 */
import { createFloatSampler, swapTextureAfterDraw } from '../rain/RainRender';
import { UPDATE_PHRASE_VEL, UPDATE_PHRASE_POS, SAMPLER_DATA_POINT_SIZE } from './shader';
import { parseSqrt } from '../../util/math';
declare let Flip: Flip;

export type Drop = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};
export type EncodedDrops = {
  index: Float32Array;
  vel: Float32Array;
  pos: Float32Array;
  width: number;
  height: number;
  count: number;
};
export class DropGroup {
  _posSampler: Flip.GL.Sampler2D;
  _velSampler: Flip.GL.Sampler2D;
  _posUpdateMesh: Flip.GL.Mesh;
  _velUpdateMesh: Flip.GL.Mesh;
  _drawMesh: Flip.GL.Mesh;
  _texIndexBuffer: Flip.GL.Buffer;
  _framebuffer: Flip.GL.FrameBuffer;

  constructor() {
    let uPosBuffer = this._posSampler = createFloatSampler('uPosBuffer');
    let uVelBuffer = this._velSampler = createFloatSampler('uVelBuffer');
    let texIndexBuffer = this._texIndexBuffer = new Flip.GL.Buffer({ data: new Float32Array(0) });
    let frameBuffer = this._framebuffer = new Flip.GL.FrameBuffer({
      dataFormat: Flip.GL.FLOAT,
      textureParam: {
        TEXTURE_MAG_FILTER: Flip.GL.NEAREST,
        TEXTURE_MIN_FILTER: Flip.GL.NEAREST
      }
    });
    let aTexIndex = new Flip.GL.Attribute({ name: 'aTexIndex', data: texIndexBuffer });
    let posUpdateGeo = this._posUpdateMesh = new Flip.GL.Mesh({
      primitive: Flip.GL.POINTS,
      binder: {
        uPosBuffer, uVelBuffer, aTexIndex,
        uUpdatePhrase: new Flip.GL.Uniform({ name: 'uUpdatePhrase', value: UPDATE_PHRASE_POS, type: 'int' })
      }
    });
    let velUpdateGeo = this._velUpdateMesh = new Flip.GL.Mesh({
      primitive: Flip.GL.POINTS,
      binder: {
        uPosBuffer, uVelBuffer, aTexIndex,
        uUpdatePhrase: new Flip.GL.Uniform({ name: 'uUpdatePhrase', value: UPDATE_PHRASE_VEL, type: 'int' })
      }
    });

    swapTextureAfterDraw(velUpdateGeo, uVelBuffer, frameBuffer);
    swapTextureAfterDraw(posUpdateGeo, uPosBuffer, frameBuffer);

    this._drawMesh = new Flip.GL.Mesh({
      primitive: Flip.GL.POINTS,
      binder: { aTexIndex, uPosBuffer, uVelBuffer }
    })
  }

  setEncodedDrops(data: EncodedDrops) {
    let { width, height } = data;
    let fb = this._framebuffer;
    this._posSampler.source = {
      width, height, data: data.pos, format: Flip.GL.RGB
    };
    this._velSampler.source = {
      width, height, data: data.vel, format: Flip.GL.RGB
    };
    fb.width = width * SAMPLER_DATA_POINT_SIZE;
    fb.height = height * SAMPLER_DATA_POINT_SIZE;
    this._texIndexBuffer.data = data.index;
    this._pointCount
      = this._drawMesh.drawCount
      = this._posUpdateMesh.drawCount
      = this._velUpdateMesh.drawCount
      = data.count;
    return this;
  }

  encodeDrops(drops: Drop[]): EncodedDrops {
    return encodeDrops(drops);
  }
}
export function encodeDrops(drops: Drop[]) {
  let count = drops.length;
  let [width, height] = parseSqrt(count);
  let posBufferData = new Float32Array(width * height * 3);
  let velBufferData = new Float32Array(width * height * 2);
  let texIndexData = new Float32Array(width * height * 2);
  for (let pointIndex = 0, posBufferIndex = 0, velBufferIndex = 0,
         texIndex = 0; pointIndex < count; pointIndex++) {
    let x = pointIndex % width;
    let y = (pointIndex - x) / width;
    let drop = drops[pointIndex];
    texIndexData[texIndex++] = x / width + 1 / (width * SAMPLER_DATA_POINT_SIZE);
    texIndexData[texIndex++] = y / height + 1 / (height * SAMPLER_DATA_POINT_SIZE);
    posBufferData[posBufferIndex++] = drop.x;
    posBufferData[posBufferIndex++] = drop.y;
    posBufferData[posBufferIndex++] = drop.radius;
    velBufferData[velBufferIndex++] = drop.vx;
    velBufferData[velBufferIndex++] = drop.vy;
  }
  return {
    vel: velBufferData,
    pos: posBufferData,
    index: texIndexData,
    width, height, count
  }
}
