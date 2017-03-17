/**
 * Created by brian on 12/10/2016.
 */
import { SHAPE_SOLID, SHAPE_TRANSPARENT } from './shader';
import { CircleShapeConstructor, CircleShape } from './CircleShape';
export { CircleShapeConstructor };
export const Vec = Flip.GL.Vec;
const { vecAdd, vecDot, vecNormalize }=Vec;

export type VertexSunLightConstructor={
  lightDirection: number[];
  position: number[];
  radius:number;
  color:number[];
  lensFlares:CircleShapeConstructor[];
  triangleCount:number;
};
export class VertexSunLight {
  lensFlares: CircleShape[];
  geometry: CircleShape;
  color: number[];
  triangleCount: number;

  get position(): number[] {
    return this._position;
  }

  get lightDirection(): number[] {
    return this._lightDir;
  }

  constructor(arg: VertexSunLightConstructor) {
    this.lensFlares = [];
    this.position = arg.position;
    this.lightDirection = arg.lightDirection;
    this.triangleCount = arg.triangleCount;
    this.geometry = this.createCircle({
      shape: SHAPE_SOLID,
      radius: arg.radius,
      color: arg.color || [1, 1, 1, 1],
      position: this.position,
      distance: 0
    });
    (arg.lensFlares || []).forEach(l => this.addLensFlare(l));
  }

  addLensFlare(lensFlare: CircleShapeConstructor): VertexSunLight {
    let position = vecAdd(this.position, vecDot(this.lightDirection, lensFlare.distance));
    let circle = this.createCircle({
      position,
      radius: lensFlare.radius,
      distance: lensFlare.distance,
      shape: SHAPE_TRANSPARENT,
      color: lensFlare.color
    });
    this.lensFlares.push(circle);
    return this;
  }

  createCircle(arg: CircleShapeConstructor): CircleShape {
    let circle = new CircleShape(Object.assign({ triangleCount: this.triangleCount }, arg));
    circle.addBinder(new Flip.GL.Uniform({
      value: circle.shape,
      name: 'uDrawMode'
    }));
    circle.addBinder(new Flip.GL.Uniform({
      name: 'uModelTransform',
      value: () => circle.modelMatrix
    }));
    if (arg.color) {
      circle.addBinder(new Flip.GL.Uniform({ name: 'uPointColor', value: new Vec(arg.color) }))
    }
    return circle;
  }

  resetLensFlare() {
    if (this._needResetLensFlares) {
      let dir = this.lightDirection;
      let pos = this.position;
      this.geometry.position = pos;
      this.lensFlares.forEach(shape => shape.position = vecAdd(pos, vecDot(dir, shape.distanceToCenter)));
      this._needResetLensFlares = false;
    }
  }

  needResetLensFlares() {
    this._needResetLensFlares = true;
  }

  set position(v: number[]) {
    if (v) {
      this._position = new Vec(v);
      this.needResetLensFlares();
    }
  }

  set lightDirection(v: number[]) {
    if (v) {
      this._lightDir = vecNormalize(new Vec(v));
      this.needResetLensFlares();
    }
  }
}