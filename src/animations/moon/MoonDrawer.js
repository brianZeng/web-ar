/**
 * Created by brian on 9/8/16.
 */
import { frag_shader, vertex_shader } from './shader';
import { mapRange } from '../../util/math';
import { isFunc } from '../../util/utils';
import { GLDrawer } from '../base/GLDrawer';
import { ANIMATION_MOON } from '../base/const';
const SHADOW_DRAW_INTERSECT = 1;
const SHADOW_DRAW_EXCLUDE = 2;

export class MoonDrawer extends GLDrawer {
  scene: Flip.GL.Scene;

  createScenes(arg) {
    let pointSize = 128;
    let scene = new Flip.GL.Scene({
      fragShader: frag_shader,
      vertexShader: vertex_shader,
      name: 'main'
    });
    scene.addBinder(scene.buildBinder({
      aPos: new Float32Array([0, 0]),
      uPointSize: pointSize,
      uShadowDraw: SHADOW_DRAW_EXCLUDE,
      uShadowX: 0,
      uPointColor: [1, 1, 1, 1],
      blend(gl){
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }
    }));
    scene.add(createPointsGeometry());
    return [this.scene = scene];
  }

  shadowByMoonPhrase(phrase, mapShadowX) {
    let drawMode;
    //let showPercent = phrase;
    let showPercent = phrase > 0.5 ? mapRange(1, 0, (phrase - 0.5) / .5) : mapRange(1, 0, (0.5 - phrase) / .5);
    if (showPercent > 0.5) {
      drawMode = SHADOW_DRAW_INTERSECT;
    }
    else {
      drawMode = SHADOW_DRAW_EXCLUDE;
    }
    let shadowX = mapRange(1, -1, showPercent);
    if (isFunc(mapShadowX)) {
      shadowX = mapShadowX(shadowX);
    }
    this.setVecUniform(this.scene, 'uShadowX', shadowX);
    this.setVecUniform(this.scene, 'uShadowDraw', drawMode);
  }

  calRotatePos(rotate: number): number[] {
    return [Math.cos(rotate) * 1.1, Math.sin(rotate) * .8]
  }

  set moonColor(components: number[]) {
    this.setVecUniform(this.scene, 'uPointColor', components);
  }

  get position(): number[] {
    let data = this.scene.binder['aPos'].data;
    return [data[0], data[1]];
  }

  set position(pos: number[]) {
    this.scene.binder['aPos'].data = new Float32Array(pos);
    this.invalid();
  }

  get type() {
    return ANIMATION_MOON;
  }
}
function createPointsGeometry() {
  return new Flip.GL.Mesh({
    primitive: Flip.GL.POINTS,
    drawCount: 1
  })
}