/**
 * Created by brian on 12/10/2016.
 */
import { SHAPE_SOLID, SHAPE_TRANSPARENT } from './shader';
import { DEFAULT_SECTION_COUNT } from './vertex-generator';

const Vec = Flip.GL.Vec;
export type CircleShapeConstructor={
  radius:number;
  position:number[];
  color:number[];
  shape: SHAPE_SOLID|SHAPE_TRANSPARENT;
  distance?:number;
  triangleCount:number;
};
const DEF_CONSTRUCTOR: CircleShapeConstructor = {
  radius: 0.3,
  position: [0, 0, 0],
  shape: SHAPE_TRANSPARENT
};
export class CircleShape extends Flip.GL.Mesh {
  shape: SHAPE_SOLID|SHAPE_TRANSPARENT;
  distanceToCenter: ?number;

  constructor(arg: CircleShapeConstructor) {
    super({
      primitive: Flip.GL.TRIANGLE_FAN,
      drawCount: arg.triangleCount || DEFAULT_SECTION_COUNT
    });
    this.radius = arg.radius || DEF_CONSTRUCTOR.radius;
    this.position = arg.position || DEF_CONSTRUCTOR.position;
    this.shape = arg.shape || DEF_CONSTRUCTOR.shape;
    this.distanceToCenter = arg.distance;
  }

  get modelMatrix(): Flip.GL.Matrix4 {
    let radius = this.radius;
    return Flip.GL.Matrix4.fromTranslate.apply(null, this.position).scale(radius, radius, radius);
  }

  get radius(): number {
    return this._radius;
  }

  set radius(v: number) {
    if (this.radius !== +v) {
      this._radius = +v;
      this.invalid();
    }
  }

  get position(): number[] {
    return this._pos;
  }

  set position(v: number[]) {
    if (v) {
      this._pos = new Vec(v);
      this.invalid();
    }
  }
}
