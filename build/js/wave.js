(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GLDrawer = undefined;

var _const = require(3);

class GLDrawer extends Flip.GL.Stage {

  viewportResize(v) {}

  get type() {
    return _const.ANIMATION_NONE;
  }
}
exports.GLDrawer = GLDrawer; /**
                              * Created by brian on 16/03/2017.
                              */

},{"3":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GLRenderPipeline = exports.CANVAS_DISPLAY_MODE_FULL_CONTENT_SCROLL = exports.CANVAS_DISPLAY_MODE_ORIGIN = exports.CANVAS_DISPLAY_MODE_FULL_SCREEN = undefined;

var _viewport = require(8);

const CANVAS_DISPLAY_MODE_FULL_SCREEN = exports.CANVAS_DISPLAY_MODE_FULL_SCREEN = 'full-screen'; /**
                                                                                                  * Created by brian on 16/03/2017.
                                                                                                  */
const CANVAS_DISPLAY_MODE_ORIGIN = exports.CANVAS_DISPLAY_MODE_ORIGIN = 'origin';
const CANVAS_DISPLAY_MODE_FULL_CONTENT_SCROLL = exports.CANVAS_DISPLAY_MODE_FULL_CONTENT_SCROLL = 'full-scroll';
class GLRenderPipeline extends Flip.GL.Task {
  constructor(arg) {
    super(arg);
    this.dpi = arg.dpi || _viewport.defaultDPI;
    this.canvas = arg.canvas;
    this.viewport = this.getCanvasViewport();
    this.canvasDisplayMode = arg.display || CANVAS_DISPLAY_MODE_FULL_SCREEN;
    this.drawers = [];
  }

  init(arg) {
    super.init(arg);
  }

  addDrawer(drawer) {
    if (this.add(drawer)) {
      drawer.parentPipeline = this;
      this.drawers.push(drawer);
      drawer.viewportResize(this.viewport);
    }
    return this;
  }

  update(e) {
    if (!this.disabled) {
      super.update(e);
      let parentViewport = this.getCanvasParentViewport();
      if (!(0, _viewport.viewportEquals)(this.parentViewport, parentViewport)) {
        this.alignCanvas();
        this.parentViewport = parentViewport;
      }
      let viewport = this.getCanvasViewport();
      if (!(0, _viewport.viewportEquals)(this.viewport, viewport)) {
        this.onViewportResize(viewport, e.gl);
      }
      this.drawers.forEach(drawer => !drawer.disabled && drawer.update(e));
    }
  }

  onViewportResize(viewport, gl) {
    this.viewport = viewport;
    if (gl) {
      gl.viewport(0, 0, viewport.width, viewport.height);
    }
    this.drawers.forEach(drawer => {
      drawer.viewportResize(viewport);
      drawer.invalid();
    });
  }

  getCanvasParentViewport() {
    let p = this.canvas.parentElement;
    if (p) {
      let isScrollSize = this.canvasDisplayMode == CANVAS_DISPLAY_MODE_FULL_CONTENT_SCROLL;
      let width = isScrollSize ? p.scrollWidth : p.clientWidth;
      let height = isScrollSize ? p.scrollHeight : p.clientHeight;
      return (0, _viewport.createViewport)(width, height, this.dpi);
    }
    return (0, _viewport.createViewport)(0, 0, this.dpi);
  }

  alignCanvas() {
    let extendScroll = this.canvasDisplayMode == CANVAS_DISPLAY_MODE_FULL_CONTENT_SCROLL;
    if (this.canvasDisplayMode == CANVAS_DISPLAY_MODE_FULL_SCREEN || extendScroll) {
      (0, _viewport.alignCanvas)(this.canvas, { extendScroll });
    }
  }

  getCanvasViewport() {
    let cvs = this.canvas;
    return (0, _viewport.createViewport)(cvs.width, cvs.height, this.dpi);
  }
}
exports.GLRenderPipeline = GLRenderPipeline;

},{"8":8}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Created by brian on 17/03/2017.
 */
const ANIMATION_NONE = exports.ANIMATION_NONE = 0;
const ANIMATION_SNOW = exports.ANIMATION_SNOW = 1;
const ANIMATION_STAR = exports.ANIMATION_STAR = 1 << 1;
const ANIMATION_MOON = exports.ANIMATION_MOON = 1 << 2;
const ANIMATION_SUN = exports.ANIMATION_SUN = 1 << 3;
const ANIMATION_RAIN = exports.ANIMATION_RAIN = 1 << 4;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WaveStage = undefined;

var _shader = require(5);

var shader = _interopRequireWildcard(_shader);

var _GLDrawer = require(1);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Created by brian on 04/02/2017.
 */
const TEX_DATA_FORMAT = Flip.GL.FLOAT;
class WaveStage extends _GLDrawer.GLDrawer {

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
      beforeDraw(gl, state) {
        waterSampler.bind(gl, state);
        framebuffer.bind(gl, state);
      },
      afterDraw(gl, state) {
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

  addDrop(drop) {
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
      beforeDraw(gl, state) {
        waterSampler.bind(gl, state);
        framebuffer.bind(gl, state);
      },
      afterDraw(gl, state) {
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
      onUpdate() {
        self.backgroundTransitionPercent = this.percent;
      },
      onEnd() {
        self.setBackground(img1, img1);
      }
    }).promise;
  }

  setBackground(image0, image1) {
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
exports.WaveStage = WaveStage;
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
  });
}

},{"1":1,"5":5}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Created by brian on 04/02/2017.
 */
const QUAD_VERTEX_SHADER = exports.QUAD_VERTEX_SHADER = `
precision mediump float;
attribute vec2 aQuad;
varying vec2 vTexCoord;
void main(){
  vTexCoord = aQuad/2. + .5;
  gl_Position = vec4(aQuad, 0.0, 1.0);
}
`;
const DROP_FRAG_SHADER = exports.DROP_FRAG_SHADER = `
precision mediump float;

const float PI = 3.141592653589793;
varying vec2 vTexCoord;
uniform sampler2D uWater;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uStrength;
uniform float uAspectRatio;

void main() {
  vec4 info = texture2D(uWater, vTexCoord);
  vec2 dis = vTexCoord - uCenter;
  dis.y /= uAspectRatio; 
  float drop = max(0.0, 1.0 - length(dis) / uRadius);
  drop = 1. - cos(drop * PI);
  info.r += drop * uStrength;
  info.b = 1. * drop;
  gl_FragColor = info;
}
`;
//(height,vel)
const UPDATE_FRAG_SHADER = exports.UPDATE_FRAG_SHADER = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uWater;
uniform vec2 uTexSize;
uniform float uWaveSpeed;
uniform float uAspectRatio;

void main() {
  vec4 info = texture2D(uWater,vTexCoord);
  vec2 delta = 1./uTexSize;
  /* calculate average neighbor height */
  vec2 dx = vec2(delta.x * uWaveSpeed, 0.0);
  vec2 dy = vec2(0.0, delta.y * uWaveSpeed * uAspectRatio);
  vec3 vw = texture2D(uWater, vTexCoord - dx).rgb;
  vec3 ve = texture2D(uWater, vTexCoord + dx).rgb;
  vec3 vn = texture2D(uWater, vTexCoord - dy).rgb;
  vec3 vs = texture2D(uWater, vTexCoord + dy).rgb;
  vec3 average = (vw+ve+vn+vs) * 0.25;
  
  /* change the velocity to move toward the average */
  info.g += (average.r - info.r) * 2.0;
  /* attenuate the velocity a little so waves do not last forever */
  info.g *= 0.99;
  /* move the vertex along the velocity */
  info.r += info.g;
  
  gl_FragColor = info;
}
`;
const VISUALIZE_FRAG_SHADER = exports.VISUALIZE_FRAG_SHADER = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uWater;

void main(){
  vec4 info = texture2D(uWater,vTexCoord);
  gl_FragColor = vec4(vec3(info.r),1.0);
}
`;

const REFRACT_FRAG_SHADER = exports.REFRACT_FRAG_SHADER = `
precision mediump float;
varying vec2 vTexCoord;

uniform sampler2D uBackground0;
uniform sampler2D uBackground1;
uniform float uBgTransparent;
uniform sampler2D uWater;
uniform float uWaveSpeed;
uniform vec2 uTexSize;
uniform float uAspectRatio;

vec3 getPoint3D(sampler2D tex,vec2 coord);
void main(){
  vec3 p0 = getPoint3D(uWater,vTexCoord);
  vec3 p1 = getPoint3D(uWater,vTexCoord + vec2(0.,1./uTexSize.y * uWaveSpeed * uAspectRatio));
  vec3 p2 = getPoint3D(uWater,vTexCoord + vec2(1./uTexSize.x * uWaveSpeed,0.));
  vec3 n = normalize(cross(p0-p1,p0-p2));
  vec3 light = vec3(0.,0.,-1.);
  vec3 r = refract(light,n,0.8);
  float k = r.z ==0.?0.:- p0.z /r.z;
  vec3 pos = p0 + k * r;
  gl_FragColor = texture2D(uBackground1,pos.xy) * uBgTransparent + (1.-uBgTransparent) * texture2D(uBackground0,pos.xy);
}

vec3 getPoint3D(sampler2D tex,vec2 coord){
  float height = texture2D(tex,coord).r;
  return vec3(coord,height);
}

`;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadImageAsync = loadImageAsync;
/**
 * Created by brian on 21/03/2017.
 */
function loadImageAsync(img) {
  if (typeof img === "string") {
    let src = img;
    img = new Image();
    img.src = src;
    img.crossOrigin = '*';
  }
  if (img.complete) {
    return Promise.resolve(img);
  }
  return new Promise((res, rej) => {
    img.addEventListener('load', () => res(img));
    img.addEventListener('error', rej);
  });
}

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.setGLCanvasSize = setGLCanvasSize;

var _GLRenderPipeline = require(2);

let task; /**
           * Created by brian on 13/03/2017.
           */
function init({ fullScreen, drawers, renders }) {
  const canvas = Flip.$('#gl-cvs');
  task = new _GLRenderPipeline.GLRenderPipeline({
    name: 'test-gl',
    canvas,
    display: fullScreen ? _GLRenderPipeline.CANVAS_DISPLAY_MODE_FULL_SCREEN : _GLRenderPipeline.CANVAS_DISPLAY_MODE_ORIGIN,
    clear: Flip.GL.COLOR_BUFFER_BIT
  });
  task.init({ preserveDrawingBuffer: true });
  if (renders) {
    renders.forEach(r => task.add(r));
  }
  Flip.instance.add(task);
  drawers.forEach(d => task.addDrawer(d));
}
function setGLCanvasSize(width, height) {
  let cvs = Flip.$('#gl-cvs');
  cvs.width = width;
  cvs.height = height;
}

},{"2":2}],8:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createViewport = createViewport;
exports.viewportEquals = viewportEquals;
exports.alignCanvas = alignCanvas;
let defaultDPI = exports.defaultDPI = global.devicePixelRatio || 1; /**
                                                                     * Created by brian on 8/15/16.
                                                                     */
function createViewport(width, height, dpi) {
  width = Math.ceil(width);
  height = Math.ceil(height);
  let aspectRatio = width / height;
  dpi = dpi || defaultDPI;
  return Object.freeze({
    width: +width,
    height: +height,
    aspectRatio,
    displayWidth: Math.ceil(width / dpi),
    displayHeight: Math.ceil(height / dpi)
  });
}
function viewportEquals(v1, v2) {
  return v1 && v2 && v1.width === v2.width && v1.height === v2.height;
}
function alignCanvas(canvas, { element = document.documentElement, dpi = defaultDPI, extendScroll } = {}) {
  let style = canvas.style;
  let width = element.clientWidth;
  let height = element.clientHeight;
  canvas.width = width * dpi;
  canvas.height = height * dpi;
  style.width = width + 'px';
  style.height = height + 'px';
  if (extendScroll) {
    style.position = 'fixed';
    style.left = 0;
    style.top = 0;
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
'use strict';

var _WaveStage = require(4);

var _image = require(6);

var _setup = require(7);

const images = ['http://img03.taobaocdn.com/tfscom/TB1zWcAPVXXXXcyXVXXxKNpFXXX.jpeg', 'http://img01.taobaocdn.com:80/tfscom/TB1wXlFLXXXXXXdXVXXxKNpFXXX.jpeg']; /**
                                                                                                                                                                 * Created by brian on 21/03/2017.
                                                                                                                                                                 */

let WAVE_STRENGTH = 0.1;
let WAVE_RADIUS = 0.04;

Promise.all(images.map(_image.loadImageAsync)).then(function (imgs) {
  let wave = new _WaveStage.WaveStage({
    waveSpeed: 8
  });
  wave.setBackground(imgs[0], imgs[1]);
  (0, _setup.init)({
    fullScreen: true,
    drawers: [wave]
  });
  wave.addDrop({
    center: [.5, .5],
    radius: WAVE_RADIUS,
    strength: WAVE_STRENGTH
  });
});

},{"4":4,"6":6,"7":7}]},{},[9]);
