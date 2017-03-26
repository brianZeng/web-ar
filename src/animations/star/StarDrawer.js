/**
 * Created by brian on 03/11/2016.
 */
import * as shader from './shader';
import { isStr } from '../../util/utils';
import { parseColor } from '../../util/color';
import { randomNoiseData } from '../../util/noise';
import { random } from '../../util/math';
import { GLDrawer } from '../base/GLDrawer';
export type Star={
  radius:number;
  pos:number[];
  color:number[]|string;
}

export type RandomPointsArg={
  count:number;
  sizeRange:number[];
  posMin:number[];
  posMax:number[];
  color:number[];
  posEase:Function;
  sizeEase:Function;
}
import { ANIMATION_STAR } from '../base/const';
export class StarDrawer extends GLDrawer {
  lightOffset: number;
  dragMultiplier: number;
  camera: Flip.GL.Camera;

  get type() {
    return ANIMATION_STAR;
  }

  createScenes(arg) {
    let scene = this.scene = new Flip.GL.Scene({
      fragShader: shader.FRAG_SHADER,
      vertexShader: shader.VERTEX_SHADER,
      name: 'main'
    });
    this.geometry = new Flip.GL.Mesh({
      primitive: Flip.GL.POINTS
    });
    let cameraOptions: Flip.GL.Camera = arg.camera || {};
    let camera = this.camera = new Flip.GL.Camera({
      position: cameraOptions.position || [0, 0, 0],
      lookAt: cameraOptions.lookAt || [0, 0, 1],
      perspective: cameraOptions.perspective || [Math.PI / 8, 1, 1, 5],
      viewProjectionMatrixUniformName: 'uViewProjection'
    });
    this.dragMultiplier = arg.dragMultiplier || 1 / 20;
    scene.addBinder(scene.buildBinder({
      uViewProjection: camera,
      uGlobalOpacity: 1,
      uWorldTransform: new Flip.GL.Matrix4(),
      uShinningRadius: [0.2, 0.4],
      uOffset: 0,
      uNoise: randomNoiseData({ easeFunc: Flip.EASE.sineInOut }),
      aPoint: new Float32Array(0),
      aPointColor: new Float32Array(0),
      blend(gl){
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      }
    }));
    scene.add(this.geometry);
    this._clock = new Flip.Clock({
      duration: arg.shinningDuration || 12,
      infinite: true,
      reverse: true
    });
    this._clock.start();
    return [scene];
  }

  update(e) {
    super.update(e);
    this._clock.update(e);
    this.lightOffset = this._clock.current * 4;
  }

  reset(): StarDrawer {
    this.rotateByY(0);
    return this;
  }

  rotateByY(angle) {
    this.scene.binder['uWorldTransform'].value = new Flip.GL.Matrix4().rotate(angle / 180 * Math.PI, [0, 1, 0]);
    this.invalid();
  }

  setStars(stars: Star[]) {
    let count = stars.length;
    let pointBuffer = new Float32Array(4 * count);
    let colorBuffer = new Float32Array(3 * count);
    let pointBufferIndex = 0, colorBufferIndex = 0;
    for (let i = 0; i < stars.length; i++) {
      let star = stars[i];
      let pos = star.pos;
      let color = isStr(star.color) ? parseColor(star.color) : star.color;
      if (!color) {
        color = COLOR_WHITE;
      }
      pointBuffer[pointBufferIndex++] = pos[0];
      pointBuffer[pointBufferIndex++] = pos[1];
      pointBuffer[pointBufferIndex++] = pos[2];
      pointBuffer[pointBufferIndex++] = Math.round(star.radius);
      colorBuffer[colorBufferIndex++] = color[0];
      colorBuffer[colorBufferIndex++] = color[1];
      colorBuffer[colorBufferIndex++] = color[2];
    }
    this.geometry.drawCount = count;
    this.scene.binder['aPoint'].data = pointBuffer;
    this.scene.binder['aPointColor'].data = colorBuffer;
    this.invalid();
  }

  viewportResize(viewport) {
    this.camera.aspect = viewport.aspectRatio;
  }

  randomPoints(arg: RandomPointsArg): Star[] {
    let stars = [];
    let [s0, s1]=arg.sizeRange;
    let [x0, y0, z0]=arg.posMin;
    let [x1, y1, z1]=arg.posMax;
    let posEase = arg.posEase;
    let sizeEase = arg.sizeEase;
    let color = arg.color || [1, 1, 1];
    for (let i = 0; i < arg.count; i++) {
      let x = random(x0, x1, posEase);
      let y = random(y0, y1, posEase);
      let z = random(z0, z1, posEase);
      stars.push({
        pos: [x, y, z],
        color,
        radius: random(s0, s1, sizeEase)
      })
    }
    return stars;
  }

  get opacity() {
    return this.scene.binder['uGlobalOpacity'].value;
  }

  set opacity(v) {
    this.scene.binder['uGlobalOpacity'].value = v;
    this.invalid();
  }

  get lightOffset() {
    return this.scene.binder['uOffset'].value;
  }

  set lightOffset(val) {
    if (this.lightOffset != val) {
      this.scene.binder['uOffset'].value = +val;
      this.invalid();
    }
  }
}
const COLOR_WHITE = [1, 1, 1];
