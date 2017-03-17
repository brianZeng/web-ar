/**
 * Created by brian on 12/10/2016.
 */
import { VERTEX_SHADER, FRAG_SHADER } from './shader';
import { generateCircleTriangleFanData, DEFAULT_SECTION_COUNT } from './vertex-generator';
import { VertexSunLight, VertexSunLightConstructor, CircleShapeConstructor, Vec } from './VertexSunLight';
import { vec3RotateY, vec3RotateX } from '../../util/math';
import { GLDrawer } from '../base/GLDrawer';
import { ANIMATION_SUN } from '../base/const';
export type VertexSunDrawerConstructor={
  sunlight:VertexSunLightConstructor;
  camera:Flip.GL.Camera;
}
export type VertexSunLightAnimateParam={
  lightTargetHeight:number;
  lightTargetRadius:number;
  rotateRadius:number;
  percent:number;
  color:number[];
}
export class VertexSunDrawer extends GLDrawer {
  sunlight: VertexSunLight;
  sunlightRotateParam: number[];
  triangleCount: number;

  get type() {
    return ANIMATION_SUN;
  }

  get lensFlaresIntensity(): number {
    return this.scene.binder['uLensFlareOpacity'].value
  }

  set lensFlaresIntensity(v: number) {
    this.scene.binder['uLensFlareOpacity'].value = v;
  }

  createScenes(arg: VertexSunDrawerConstructor) {
    let scene = new Flip.GL.Scene({
      vertexShader: VERTEX_SHADER,
      fragShader: FRAG_SHADER,
      name: 'main'
    });
    let cameraOptions = arg.camera;
    let camera = this.camera = new Flip.GL.Camera({
      name: 'camera',
      viewProjectionMatrixUniformName: 'uViewProjection',
      position: cameraOptions.position,
      lookAt: cameraOptions.lookAt,
      perspective: cameraOptions.perspective || [Math.PI / 3, 1, 1, 10]
    });
    this.triangleCount = arg.sunlight.triangleCount || DEFAULT_SECTION_COUNT;
    scene.addBinder(scene.buildBinder({
      aVertex: generateCircleTriangleFanData(this.triangleCount, 1),
      uLensFlareOpacity: 1,
      blend(gl){
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      }
    }));
    scene.addBinder(camera);
    let sunlight = this.sunlight = new VertexSunLight(arg.sunlight);
    sunlight.lensFlares.forEach(l => scene.add(l));
    scene.add(sunlight.geometry);
    this.sunlightRotateParam = [0, 0];
    return [this.scene = scene];
  }

  viewportResize(viewport) {
    this.scene.binder['aVertex'].data = generateCircleTriangleFanData(this.triangleCount, 1, viewport.aspectRatio);
  }

  setSunColor(component) {
    this.setVecUniform(this.sunlight.geometry, 'uPointColor', component);
  }

  addLensFlare(lensFlare: CircleShapeConstructor): VertexSunDrawer {
    let lens = this.sunlight.addLensFlare(lensFlare);
    this.scene.add(lens);
    this.invalid();
    return this;
  }

  rotatePositionAndDirection(arg: VertexSunLightAnimateParam) {
    let rotate = Math.PI * (1 - arg.percent);
    let targetRotate = Math.PI * arg.percent;
    let sun = this.sunlight;
    let sunZ = sun.position[2];
    let targetPos = [Math.cos(targetRotate) * arg.lightTargetRadius, arg.lightTargetHeight || 0, Math.sin(targetRotate) * arg.lightTargetRadius];
    let sunTopPos = rotateInXYSurface(arg.rotateRadius, Math.PI / 2, sunZ);
    sun.lightDirection = Vec.vecMix(targetPos, 1, sunTopPos, -1);
    sun.position = rotateInXYSurface(arg.rotateRadius, rotate, sunZ);
    this.setSunColor(arg.color);
    this.invalid();
  }

  restoreLightDirection() {
    let param = this.sunlightRotateParam;
    return this.rotateLightDirection(-param[0], -param[1]);
  }

  rotateLightDirection(horizontal: number, vertical: number): number[] {
    let sun = this.sunlight;
    let dir = sun.lightDirection, pos = sun.position;
    let [dx, dy]=this.sunlightRotateParam;
    let nx = dx + horizontal;
    let ny = dy + vertical;
    let changed;

    if (inRange(-80, 80, nx)) {
      dir = vec3RotateY(dir, pos, horizontal * Math.PI / 180);
      this.sunlightRotateParam[0] = nx;
      changed = true;
    }
    if (inRange(0, 10, ny)) {
      dir = vec3RotateX(dir, pos, vertical * Math.PI / 180);
      this.sunlightRotateParam[1] = ny;
      changed = true;
    }
    if (changed) {
      sun.lightDirection = dir;
      this.invalid();
    }
  }

  update(e) {
    super.update(e);
    if (this.sunlight) {
      this.sunlight.resetLensFlare();
    }
  }
}
function inRange(min, max, v) {
  return v > min && v < max
}
function rotateInXYSurface(radius, rotation, z) {
  return [Math.cos(rotation) * radius, Math.sin(rotation) * radius, z];
}