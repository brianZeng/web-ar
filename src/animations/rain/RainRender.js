import { parseSqrt } from '../../util/math';
import { randomColor, parseColor } from '../../util/color';
export type  PointWithVel ={
  x:number;
  y:number;
  vx:number;
  vy:number;
  z?:number;
  color?:string;
  size?:number;
  vz?:number;
};
export type EncodedPoints={
  pos: Float32Array;
  vec: Float32Array;
  color: Float32Array;
  index: Float32Array;
  size:Float32Array;
  count:number;
  width:number;
  height:number;
}
export const UPDATE_PHRASE_POS = 0, UPDATE_PHRASE_VEC = 1;
const SAMPLER_DATA_POINT_SIZE = 2;
export class RainRender {
  _posSampler: Flip.GL.Sampler2D;
  _vecSampler: Flip.GL.Sampler2D;
  _posUpdateGeometry: Flip.GL.Mesh;
  _vecUpdateGeometry: Flip.GL.Mesh;
  _drawGeometry: Flip.GL.Mesh;
  _texIndexBuffer: Flip.GL.Buffer;
  _framebuffer: Flip.GL.FrameBuffer;

  get maxDrawCount() {
    return this._pointCount;
  }

  set drawCount(drawCount) {
    if (isNaN(drawCount) || drawCount > this.maxDrawCount) {
      throw Error('invalid drawCount');
    }
    this._drawGeometry.drawCount = +drawCount;
  }

  constructor() {
    let posSampler = this._posSampler = createFloatSampler('uPosBuffer');
    let vecSampler = this._vecSampler = createFloatSampler('uVecBuffer');
    let texIndexBuffer = this._texIndexBuffer = new Flip.GL.Buffer({ data: new Float32Array(0) });
    let frameBuffer = this._framebuffer = new Flip.GL.FrameBuffer({
      dataFormat: WebGLRenderingContext.FLOAT,
      textureParam: {
        TEXTURE_MAG_FILTER: WebGLRenderingContext.NEAREST,
        TEXTURE_MIN_FILTER: WebGLRenderingContext.NEAREST
      }
    });
    let aTexIndex = new Flip.GL.Attribute({ name: 'aTexIndex', data: texIndexBuffer });
    let posUpdateGeo = this._posUpdateGeometry = new Flip.GL.Mesh({
      primitive: WebGLRenderingContext.POINTS,
      binder: {
        [posSampler.name]: posSampler,
        [vecSampler.name]: vecSampler,
        uUpdatePhrase: new Flip.GL.Uniform({ name: 'uUpdatePhrase', value: UPDATE_PHRASE_POS, type: 'int' }),
        aTexIndex
      }
    });
    let vecUpdateGeo = this._vecUpdateGeometry = new Flip.GL.Mesh({
      primitive: WebGLRenderingContext.POINTS,
      binder: {
        [posSampler.name]: posSampler,
        [vecSampler.name]: vecSampler,
        uUpdatePhrase: new Flip.GL.Uniform({ name: 'uUpdatePhrase', value: UPDATE_PHRASE_VEC, type: 'int' }),
        aTexIndex
      }
    });

    swapTextureAfterDraw(vecUpdateGeo, vecSampler, frameBuffer);
    swapTextureAfterDraw(posUpdateGeo, posSampler, frameBuffer);
    this._drawGeometry = new Flip.GL.Mesh({
      primitive: WebGLRenderingContext.POINTS,
      binder: {
        aTexIndex,
        aPointSize: new Flip.GL.Attribute({ name: 'aPointSize', data: new Float32Array(0) }),
        aPointColor: new Flip.GL.Attribute({ name: 'aPointColor', data: new Float32Array(0) }),
        uPointOpacity: new Flip.GL.Uniform({ name: 'uPointOpacity', value: 1 })
      },
      beforeDraw(gl, state){
        frameBuffer.unbind(gl);
        posSampler.bind(gl, state);
        vecSampler.bind(gl, state);
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      }
    });
  }

  setPoints(points: Array<PointWithVel>): RainRender {
    return this.setEncodedPoints(encodePoints(points));
  }

  setEncodedPoints(arg: EncodedPoints): RainRender {
    let { width, height }=arg;
    this._posSampler.source = {
      width, height, data: arg.pos, format: WebGLRenderingContext.RGB
    };
    this._vecSampler.source = {
      width, height, data: arg.vec, format: WebGLRenderingContext.RGB
    };
    this._framebuffer.width = width * SAMPLER_DATA_POINT_SIZE;
    this._framebuffer.height = height * SAMPLER_DATA_POINT_SIZE;
    this._texIndexBuffer.data = arg.index;
    this._pointCount
      = this._drawGeometry.drawCount
      = this._posUpdateGeometry.drawCount
      = this._vecUpdateGeometry.drawCount
      = arg.count;
    this._drawGeometry.binder['aPointColor'].data = arg.color;
    this._drawGeometry.binder['aPointSize'].data = arg.size;
    return this;
  }
}
export function encodePoints(points: Array<PointWithVel>): EncodedPoints {
  let particleCount = points.length;
  let [width, height]=parseSqrt(particleCount);
  let posBufferData = new Float32Array(width * height * 3);
  let vecBufferData = new Float32Array(width * height * 3);
  let colorBufferData = new Float32Array(width * height * 4);
  let texIndexData = new Float32Array(width * height * 2);
  let pointSizeData = new Float32Array(width * height);

  for (let pointIndex = 0, posBufferIndex = 0, vecBufferIndex = 0, colorBufferIndex = 0, texIndex = 0; pointIndex < particleCount; pointIndex++) {
    let point = points[pointIndex];
    let colorComponents = point.color ? parseColor(point.color) : randomColor();

    posBufferData[posBufferIndex++] = mapColorVal(point.x || 0);
    posBufferData[posBufferIndex++] = mapColorVal(point.y || 0);
    posBufferData[posBufferIndex++] = mapColorVal(point.z || 0);

    vecBufferData[vecBufferIndex++] = mapColorVal(point.vx || 0);
    vecBufferData[vecBufferIndex++] = mapColorVal(point.vy || 0);
    vecBufferData[vecBufferIndex++] = mapColorVal(point.vz || 0);

    colorBufferData[colorBufferIndex++] = colorComponents[0];
    colorBufferData[colorBufferIndex++] = colorComponents[1];
    colorBufferData[colorBufferIndex++] = colorComponents[2];
    colorBufferData[colorBufferIndex++] = colorComponents[3];

    pointSizeData[pointIndex] = point.size;
    let x = pointIndex % width, y = (pointIndex - x) / width;
    texIndexData[texIndex++] = x / width + 1 / (width * 2);
    texIndexData[texIndex++] = y / height + 1 / (height * 2);
  }
  return {
    pos: posBufferData,
    vec: vecBufferData,
    color: colorBufferData,
    index: texIndexData,
    count: particleCount,
    size: pointSizeData,
    width,
    height
  }
}
export function swapTextureAfterDraw(geometry, sampler, frameBuffer) {
  geometry.beforeDraw = function (gl, state) {
    gl.viewport(0, 0, frameBuffer._w, frameBuffer._h);
    frameBuffer.bind(gl, state);
  };
  geometry.afterDraw = function (gl, state) {
    //swap buffer
    let tempTexture = sampler.texture;
    sampler.texture = frameBuffer.texture;
    frameBuffer.texture = tempTexture;
    frameBuffer.shouldCheckComplete = false;
    sampler.source = null;
    sampler.bind(gl, state);
  }
}
export function mapColorVal(number) {
  return +( number + 1.0) / 2.0;
}
export function createFloatSampler(name, source) {

  return new Flip.GL.Sampler2D({
    dataFormat: WebGLRenderingContext.FLOAT,
    flipY: false,
    name,
    textureParam: {
      TEXTURE_MAG_FILTER: WebGLRenderingContext.NEAREST,
      TEXTURE_MIN_FILTER: WebGLRenderingContext.NEAREST
    },
    source: source || null
  })
}