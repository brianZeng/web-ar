/**
 * Created by brian on 06/03/2017.
 */
declare var Flip: Flip;
const DEF_VERTEX_SHADER = (name) => `
precision mediump float;

attribute vec2 aQuad;
varying vec2 ${name};
uniform bool uFlipXCoord;
uniform mat3 uFilterRegionTransform;

void main(){
   vec3 pos = uFilterRegionTransform * vec3(aQuad,1.0);
   vec2 texIndex = pos.xy /2. +.5;
   if(uFlipXCoord)
    texIndex.x = 1. - texIndex.x;
   ${name} = texIndex;
   gl_Position = vec4(pos.xy,0.0,1.0);
}
`;
const DEF_FRAGMENT_SHADER = (texcoordName, program) => `
precision mediump float;

varying vec2 ${texcoordName};

${program}
`;
const COPY_PROGRAM = `
uniform sampler2D uSampler;

void main(){
  gl_FragColor = texture2D(uSampler,vTexIndex);
}
`;
export type GLFilterConstructor={
  program:string;
  texCoordName:?string;
  name:string;
  binder:?Object;
  define:?Object;
  framebuffer:?Flip.GL.FrameBuffer|Object;
}
export class GLFilter extends Flip.GL.Scene {
  target: GLFilter|null;
  fbo: Flip.GL.FrameBuffer;

  constructor(arg: GLFilterConstructor) {
    let texcoordName = arg.texCoordName || 'vTexIndex';
    super({
      vertexShader: DEF_VERTEX_SHADER(texcoordName),
      fragShader: DEF_FRAGMENT_SHADER(texcoordName, arg.program || COPY_PROGRAM),
      define: arg.define,
      name: arg.name
    });
    this.addBinder(this.buildBinder(arg.binder));
    this.addBinder(this.buildBinder({
      aQuad: [-1, -1, 1, -1, -1, 1, 1, 1],
      uFlipXCoord: false,
      uFilterRegionTransform: new Flip.Mat3(),
      uSampler:null
    }));
    let fb;
    if (arg.framebuffer instanceof Flip.GL.FrameBuffer) {
      fb = arg.framebuffer;
    }
    else {
      fb = new Flip.GL.FrameBuffer(arg.framebuffer || { name: 'filter-fbo' })
    }
    this.fbo = fb;
    this.createMeshes(arg).forEach(mesh => {
      if (!(mesh instanceof Flip.GL.Mesh)) {
        mesh = new Flip.GL.Mesh(Object.assign(mesh, {
          drawCount: 4,
          primitive: Flip.GL.TRIANGLE_STRIP
        }))
      }
      this.add(mesh);
    });
  }

  transformFilterRegion(mat: Flip.Mat3) {
    this.binder['uFilterRegionTransform'].value = mat.clone();
    this.invalid();
  }

  createMeshes() {
    return [{}];
  }

  setSource(source, name, dynamic) {
    let sampler = this.binder[name];

    sampler.data = source;
    sampler.dynamicSource = dynamic;
    this.invalid();
  }

  getTargetFBOOwner() {
    return this;
  }

  setTarget(target: GLFilter, samplerName: string) {
    let fbo = this.fbo;
    if (this.target) {
      this.target.removeBinder(this._targetBinder)
    }
    if (!samplerName) {
      samplerName = 'uSampler';
    }
    let sampler = this._targetBinder = fbo.createSampler2D(samplerName, false);
    sampler.name = samplerName;
    this.target = target;
    let owner = this.getTargetFBOOwner();
    target ? owner.addBinder(fbo) : owner.removeBinder(fbo);
    target.removeBinder(samplerName);
    target.addBinder(sampler);
  }

  get sourceBinder() {
    return this.binder['uSampler'];
  }

  set source(v) {
    let binder = this.sourceBinder;
    binder.source = v;
    let isVideo = v instanceof HTMLVideoElement;
    binder.dynamicSource = isVideo;
    this.binder['uFlipXCoord'].value = isVideo;
  }

  dispose(e) {
    super.dispose(e);
    this.fbo.dispose(e);
  }

}