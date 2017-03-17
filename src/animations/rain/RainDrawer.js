import { RainRender, UPDATE_PHRASE_POS, UPDATE_PHRASE_VEC, PointWithVel } from './RainRender';
import * as shader from './shader';
import { GLDrawer } from '../base/GLDrawer';
import { ANIMATION_RAIN } from '../base/const';
export class RainDrawer extends GLDrawer {
  updateScene: Flip.GL.Scene;
  drawScene: Flip.GL.Scene;
  currentRainRender: RainRender;
  lastUpdateTime: number;
  frameTimeRatio: number;
  pointCountPerThousandPixel: number;
  rainPointSizeRange: number[];

  get type() {
    return ANIMATION_RAIN;
  }

  set rainEffectIntensity(val: number) {
    this.drawScene.binder['uDiscardThreshold'].value = +val;
  }

  get rainEffectIntensity(): number {
    return this.drawScene.binder['uDiscardThreshold'].value;
  }

  classConfigureArgument() {
    return {
      define: {
        DRAW_RAIN: 1
      }
    }
  }

  createScenes(arg) {
    let cfg = this.classConfigureArgument();
    let drawScene = new Flip.GL.Scene({
      fragShader: shader.DRAW_FRAGE_SHADER,
      vertexShader: shader.DRAW_VERTEX_SHADER,
      define: cfg.define
    });
    drawScene.addBinder(drawScene.buildBinder({
      uPointWidth: 0.01,
      uPointSizeScale: 1,
      uDiscardThreshold: 1,
      uViewProjectionMatrix: new Flip.GL.Matrix4(),
      blend(gl){
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      }
    }));
    let updateScene = new Flip.GL.Scene({
      fragShader: shader.UPDATE_FRAGE_SHADER,
      vertexShader: shader.UPDATE_VERTEX_SHADER,
      define: cfg.define
    });
    updateScene.addBinder(updateScene.buildBinder({
      uTimeDelta: [0, 0],
      uAcceleration: [0, 0, 0],
      uResistance: [0, 0, 0],
      uVecRange: [0, 0, 0, 0],
      uNoise: null,
      uTexRandom(){
        return [Math.random(), Math.random()]
      }
    }));
    this.updateScene = updateScene;
    this.drawScene = drawScene;
    this.frameTimeRatio = 100;
    this.pointCountPerThousandPixel = 500;
    return [updateScene, drawScene];
  }

  update(e) {
    super.update(e);
    if (this.frameTimeRatio) {
      let now = Date.now();
      let lastUpdateTime = this.lastUpdateTime || now;
      let timeDelta = now - lastUpdateTime;
      if (this.rainEffectIntensity > 0 && timeDelta > 15) {
        timeDelta = Math.min(timeDelta, 100 / 3);
        let frameTime = timeDelta / this.frameTimeRatio;
        this.setFrameTime(frameTime, frameTime);
        this.invalid();
      }
      this.lastUpdateTime = now;
    }
  }

  setPoints(points: PointWithVel[]): RainRender {
    let rainRender = new RainRender();
    rainRender.setPoints(points);
    this.updateScene.add(rainRender._vecUpdateGeometry);
    this.updateScene.add(rainRender._posUpdateGeometry);
    this.drawScene.add(rainRender._drawGeometry);
    return this.currentRainRender = rainRender;
  }

  viewportResize(viewport) {
    let rainRender = this.currentRainRender;
    let pointCount = Math.round(viewport.displayWidth / 1000 * this.pointCountPerThousandPixel);
    if (rainRender) {
      //rainRender._framebuffer._buffered = false;
      rainRender.drawCount = Math.min(rainRender.maxDrawCount, pointCount);
    }

  }

  setFrameTime(movement, acceleration): RainDrawer {
    return this.setVecUniform(this.updateScene, 'uTimeDelta', {
      [UPDATE_PHRASE_POS]: movement,
      [UPDATE_PHRASE_VEC]: acceleration
    });
  }

  setResistance(x, y, z): RainDrawer {
    return this.setVecUniform(this.updateScene, 'uResistance', [x, y, z]);
  }

  setNoiseSource(img) {
    this.updateScene.binder['uNoise'].source = img;
    this.invalid();
  }

  setVecRange(xMin, xMax, yMin, yMax): RainDrawer {
    return this.setVecUniform(this.updateScene, 'uVecRange', [xMin, xMax, yMin, yMax]);
  }

  setAcceleration(vx, vy, vz): RainDrawer {
    return this.setVecUniform(this.updateScene, 'uAcceleration', [vx, vy, vz]);
  }
}
