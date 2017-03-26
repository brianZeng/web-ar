/**
 * Created by brian on 04/02/2017.
 */
import  * as shader from './shader';
import { GLDrawer } from '../base/GLDrawer';
declare var Flip: Flip;
export type Drop={
  center:number[];
  radius:number;
  strength:number;
}
const TEX_DATA_FORMAT = Flip.GL.FLOAT;
export class WaveStage extends GLDrawer {
  _clock: Flip.Clock;

  createScenes(arg) {
    let uWaveSpeed = arg.waveSpeed || 1;
    let uAspectRatio = arg.aspectRatio || 1;
    this._clock = new Flip.Clock({ duration: 90, delegate: this });
    let waterSampler = this.waterSampler = createFloatSampler('uWater', {
      width: 1,
      height: 1,
      data: new Float32Array(4)
    });
    let framebuffer = this.frambuffer = new Flip.GL.FrameBuffer({ dataFormat: TEX_DATA_FORMAT });
    let dropScene = new Flip.GL.Scene({
      name: 'drop',
      vertexShader: shader.QUAD_VERTEX_SHADER,
      fragShader: shader.DROP_FRAG_SHADER
    });
    dropScene.addBinder(dropScene.buildBinder({
      aQuad: new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      uAspectRatio
    }));

    let updateScene = new Flip.GL.Scene({
      name: 'update',
      vertexShader: shader.QUAD_VERTEX_SHADER,
      fragShader: shader.UPDATE_FRAG_SHADER
    });
    updateScene.addBinder(updateScene.buildBinder({
      uTexSize: [0, 0],
      uWaveSpeed,
      uAspectRatio,
      aQuad: new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    }));
    updateScene.add(new Flip.GL.Mesh({
      drawCount: 4,
      primitive: Flip.GL.TRIANGLE_STRIP,
      beforeDraw(gl, state){
        waterSampler.bind(gl, state);
        framebuffer.bind(gl, state);
      },
      afterDraw(gl, state){
        switchSampler2DTextureWithFBO(waterSampler, framebuffer);
        framebuffer.unbind(gl);
      }
    }));

    let refractScene = new Flip.GL.Scene({
      name: 'refract',
      vertexShader: shader.QUAD_VERTEX_SHADER,
      fragShader: shader.REFRACT_FRAG_SHADER
    });
    refractScene.addBinder(refractScene.buildBinder({
      uTexSize: [0, 0],
      uBackground0: null,
      uBackground1: null,
      uBgTransparent: 0,
      uWaveSpeed,
      uAspectRatio,
      [waterSampler.name]: waterSampler
    }));
    refractScene.add(new Flip.GL.Mesh({
      drawCount: 4,
      primitive: Flip.GL.TRIANGLE_STRIP
    }));
    return [dropScene, updateScene, refractScene];
  }

  onClockUpdate() {
    this.invalid();
  }

  update(e) {
    super.update(e);
    this._clock.update(e);
  }

  addDrop(drop: Drop) {
    let dropScene = this.getScene('drop');
    let waterSampler = this.waterSampler;
    let framebuffer = this.frambuffer;
    dropScene.add(new Flip.GL.Mesh({
      drawCount: 4,
      primitive: Flip.GL.TRIANGLE_STRIP,
      binder: dropScene.buildBinder({
        uCenter: drop.center,
        uRadius: drop.radius,
        uStrength: drop.strength
      }),
      beforeDraw(gl, state){
        waterSampler.bind(gl, state);
        framebuffer.bind(gl, state);
      },
      afterDraw(gl, state){
        switchSampler2DTextureWithFBO(waterSampler, framebuffer);
        framebuffer.unbind(gl);
        dropScene.remove(this);
      }
    }));
    this._clock.restart();
  }

  transitionBackgroundAsync(img0, img1, duration = .7) {
    this.setBackground(img0, img1);
    let self = this;
    return Flip.animate({
      duration,
      onUpdate(){
        self.backgroundTransitionPercent = this.percent;
      },
      onEnd(){
        self.setBackground(img1, img1);
      }
    }).promise;
  }

  setBackground(image0: HTMLImageElement, image1: HTMLImageElement) {
    let scene = this.getScene('refract');
    scene.binder['uBackground0'].source = image0;
    scene.binder['uTexSize'].value = [image0.width, image0.height];
    if (image1) {
      scene.binder['uBackground1'].source = image1;
    }
    this.setVecUniform('update', 'uTexSize', [image0.width, image0.height]);
  }

  set backgroundTransitionPercent(v) {
    this.getScene('refract').binder['uBgTransparent'].value = v;
    this.invalid();
  }

  set aspectRatio(v) {
    this.setVecUniform('update', 'uAspectRatio', +v);
    this.setVecUniform('drop', 'uAspectRatio', +v);
  }

  set waveSpeed(v) {
    this.setVecUniform('update', 'uWaveSpeed', +v);
    this.setVecUniform('refract', 'uWaveSpeed', +v);
  }
}
function switchSampler2DTextureWithFBO(sampler, fb) {
  let t = fb.texture;
  fb.texture = sampler.texture;
  sampler.texture = t;
  sampler.source = null;
}
function createFloatSampler(name, source) {
  return new Flip.GL.Sampler2D({
    dataFormat: TEX_DATA_FORMAT,
    //flipY: false,
    name,
    source: source || null
  })
}