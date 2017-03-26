(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _animations = require(6);

Object.keys(_animations).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _animations[key];
    }
  });
});
exports.isTransitioning = isTransitioning;
exports.transitionAnimationAsync = transitionAnimationAsync;

var _index = require(6);

var _WaveStage = require(26);

var _image = require(29);

/**
 * Created by brian on 15/03/2017.
 */
const BG_IMGS = {
  night: Flip.$('img.night'),
  snow: Flip.$('img.snow'),
  sun: Flip.$('img.sun'),
  rain: Flip.$('img.rain'),
  none: Flip.$('img.none')
};
let wave = new _WaveStage.WaveStage({ waveSpeed: 8 });
let mng = new _index.AnimationManager();
let currentImg;
mng.pipeline.addDrawer(wave);
(0, _image.loadImageAsync)(BG_IMGS.none).then(init);
function init(img) {
  Flip.instance.add(mng.pipeline);
  document.body.appendChild(mng.pipeline.canvas);
  mng.pipeline.init();
  wave.setBackground(currentImg = img, img);
  Flip.$('.weather-selection').addEventListener('click', e => {
    let target = e.target;
    let classList = target.classList;
    if (classList.contains('icon') && !mng.transioning) {
      let cur = Flip.$('.icon.current');
      if (cur) {
        cur.classList.remove('current');
      }
      classList.add('current');
      transitionAnimationAsync(target.getAttribute('class'));
    }
  });
}
let transitioning;
function isTransitioning() {
  return transitioning;
}
function transitionAnimationAsync(type) {
  if (!transitioning) {
    let nextAnimation = _index.ANIMATION_NONE;
    let nextBG = BG_IMGS.none;
    if (type.indexOf('snow') > -1) {
      nextAnimation |= _index.ANIMATION_SNOW;
      nextBG = BG_IMGS.snow;
    } else if (type.indexOf('rain') > -1) {
      nextAnimation |= _index.ANIMATION_RAIN;
      nextBG = BG_IMGS.rain;
    } else if (type.indexOf('sun') > -1) {
      nextAnimation |= _index.ANIMATION_SUN;
      nextBG = BG_IMGS.sun;
    } else if (type.indexOf('moon') > -1) {
      nextAnimation |= _index.ANIMATION_MOON | _index.ANIMATION_STAR;
      nextBG = BG_IMGS.night;
    }
    transitioning = true;
    return backgroundTransitionAsync(nextBG).then(() => mng.transitionAnimationAsync(nextAnimation)).then(() => transitioning = false);
  }
  return Promise.reject('transitioning');
}
function backgroundTransitionAsync(src) {
  if (src !== currentImg.src) {
    let nextImg;
    return (0, _image.loadImageAsync)(src).then(function (img) {
      return wave.transitionBackgroundAsync(currentImg, nextImg = img);
    }).then(() => currentImg = nextImg);
  }
  return Promise.resolve(currentImg);
}

},{"26":26,"29":29,"6":6}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnimationManager = undefined;

var _moon = require(8);

var _rain = require(12);

var _snow = require(15);

var _sun = require(23);

var _star = require(18);

var _math = require(30);

var _GLRenderPipeline = require(4);

var _const = require(5);

const Promise = Flip.Promise; /**
                               * Created by brian on 17/03/2017.
                               */

const ANIMATION_TYPES = [_const.ANIMATION_NONE, _const.ANIMATION_SUN, _const.ANIMATION_STAR, _const.ANIMATION_SNOW, _const.ANIMATION_RAIN, _const.ANIMATION_MOON];
const MOON_ROTATE_PERCENT = 0.65;
class AnimationManager {

  constructor() {
    this.pipeline = new _GLRenderPipeline.GLRenderPipeline({
      canvas: document.createElement('canvas'),
      display: _GLRenderPipeline.CANVAS_DISPLAY_MODE_FULL_SCREEN
    });
    this.animations = {};
    this._currentAnimations = [];
    this.transioning = false;
  }

  transitionAnimationAsync(type) {
    if (this.transioning) {
      return Promise.reject();
    }
    this.transioning = true;
    let targetAnimations = ANIMATION_TYPES.filter(flag => flag & type).map(type => this.getAnimation(type));
    let currentAnimations = this._currentAnimations.slice();
    let fadeIns = [];
    for (let i = 0; i < targetAnimations.length; i++) {
      let ani = targetAnimations[i];
      let index = currentAnimations.indexOf(ani);
      ani.disabled = false;
      if (ani > -1) {
        currentAnimations[index] = null;
      } else {
        fadeIns.push(ani);
      }
    }
    let fadeOuts = currentAnimations.filter(ani => ani);
    return Promise.all([Promise.all(fadeIns.map(ani => this.fadeAnimationAsync(ani, true))), Promise.all(fadeOuts.map(ani => this.fadeAnimationAsync(ani, false)))]).then(() => {
      this._currentAnimations = targetAnimations;
      fadeOuts.forEach(a => a.disabled = true);
      this.transioning = false;
    });
  }

  fadeAnimationAsync(animation, fadeIn) {
    if (Number.isInteger(animation)) {
      animation = this.getAnimation(animation);
    }
    if (animation.type == _const.ANIMATION_SUN) {
      return this.fadeSunAsync(animation, fadeIn);
    } else if (animation.type == _const.ANIMATION_RAIN || animation.type == _const.ANIMATION_SNOW) {
      return this.fadeRainAsync(animation, fadeIn);
    } else if (animation.type == _const.ANIMATION_MOON) {
      return this.fadeMoonAsync(animation, fadeIn);
    } else if (animation.type == _const.ANIMATION_STAR) {
      return this.fadeStarAsync(animation, fadeIn);
    }
    return Promise.resolve();
  }

  fadeStarAsync(animation, fadeIn) {
    return Flip.animate({
      duration: .7,
      ease: Flip.EASE.sineInOut,
      onUpdate() {
        animation.opacity = fadeIn ? this.percent : 1 - this.percent;
      }
    }).promise;
  }

  fadeMoonAsync(animation, fadeIn) {
    let duration, ease;
    if (fadeIn) {
      duration = 2.7;
      ease = Flip.EASE.sineInOut;
    } else {
      duration = 2;
      ease = Flip.EASE.quartIn;
    }
    return Flip.animate({
      duration, ease,
      onUpdate() {
        let p = fadeIn ? 1 - MOON_ROTATE_PERCENT * this.percent : (0, _math.mapRange)(1 - MOON_ROTATE_PERCENT, 0, this.percent);
        animation.position = animation.calRotatePos(Math.PI * p);
      }
    }).promise;
  }

  fadeRainAsync(animation, fadeIn) {
    let duration = fadeIn ? 2.7 : .7;
    return Flip.animate({
      duration,
      onUpdate() {
        animation.rainEffectIntensity = fadeIn ? this.percent : 1 - this.percent;
      }
    }).promise;
  }

  fadeSunAsync(animation, fadeIn) {
    if (fadeIn) {
      animation.setSunColor({ a: 1 });
      animation.sunlightRotateParam = [0, 0];
      let startTimeRatio = 0;
      let totalRotateRatio = 0.7;
      return Flip.animate({
        duration: Math.abs(totalRotateRatio) * 8,
        ease: Flip.EASE.sineInOut,
        onUpdate() {
          let { percent } = this;
          changeSunByDayPercent(animation, percent * totalRotateRatio + startTimeRatio);
        }
      }).promise;
    } else {
      return Flip.animate({
        duration: .7,
        ease: Flip.EASE.sineInOut,
        onUpdate() {
          let opacity = 1 - this.percent;
          animation.lensFlaresIntensity = opacity;
          animation.setSunColor({ a: opacity });
        }
      }).promise;
    }
  }

  getAnimation(type) {
    let animation = this.animations[type];
    if (!animation) {
      if (type == _const.ANIMATION_MOON) {
        animation = (0, _moon.getMoonDrawer)(0);
      } else if (type == _const.ANIMATION_RAIN) {
        animation = (0, _rain.getRainDrawer)();
      } else if (type == _const.ANIMATION_SNOW) {
        animation = (0, _snow.getSnowDrawer)();
      } else if (type == _const.ANIMATION_SUN) {
        animation = (0, _sun.getVertexSunDrawer)();
      } else if (type == _const.ANIMATION_STAR) {
        animation = (0, _star.getStarDrawer)();
      } else {
        animation = new GLDrawer();
      }
      this.animations[type] = animation;
      animation.disabled = true;
      this.pipeline.addDrawer(animation);
    }
    return animation;
  }
}
exports.AnimationManager = AnimationManager;
function changeSunByDayPercent(sunDrawer, percent) {
  sunDrawer.rotatePositionAndDirection((0, _sun.getVertexSunDrawerAnimateParam)(percent));
  sunDrawer.lensFlaresIntensity = (0, _math.mapRange)(0, 0.3, Math.sin(Math.PI * percent));
  sunDrawer.invalid();
}

},{"12":12,"15":15,"18":18,"23":23,"30":30,"4":4,"5":5,"8":8}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GLDrawer = undefined;

var _const = require(5);

class GLDrawer extends Flip.GL.Stage {

  viewportResize(v) {}

  get type() {
    return _const.ANIMATION_NONE;
  }
}
exports.GLDrawer = GLDrawer; /**
                              * Created by brian on 16/03/2017.
                              */

},{"5":5}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GLRenderPipeline = exports.CANVAS_DISPLAY_MODE_FULL_CONTENT_SCROLL = exports.CANVAS_DISPLAY_MODE_ORIGIN = exports.CANVAS_DISPLAY_MODE_FULL_SCREEN = undefined;

var _viewport = require(33);

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

},{"33":33}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _const = require(5);

Object.keys(_const).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _const[key];
    }
  });
});

var _AnimationManager = require(2);

Object.keys(_AnimationManager).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _AnimationManager[key];
    }
  });
});

},{"2":2,"5":5}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MoonDrawer = undefined;

var _shader = require(9);

var _math = require(30);

var _utils = require(32);

var _GLDrawer = require(3);

var _const = require(5);

const SHADOW_DRAW_INTERSECT = 1; /**
                                  * Created by brian on 9/8/16.
                                  */

const SHADOW_DRAW_EXCLUDE = 2;

class MoonDrawer extends _GLDrawer.GLDrawer {

  createScenes(arg) {
    let pointSize = 128;
    let scene = new Flip.GL.Scene({
      fragShader: _shader.frag_shader,
      vertexShader: _shader.vertex_shader,
      name: 'main'
    });
    scene.addBinder(scene.buildBinder({
      aPos: new Float32Array([0, 0]),
      uPointSize: pointSize,
      uShadowDraw: SHADOW_DRAW_EXCLUDE,
      uShadowX: 0,
      uPointColor: [1, 1, 1, 1],
      blend(gl) {
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
    let showPercent = phrase > 0.5 ? (0, _math.mapRange)(1, 0, (phrase - 0.5) / .5) : (0, _math.mapRange)(1, 0, (0.5 - phrase) / .5);
    if (showPercent > 0.5) {
      drawMode = SHADOW_DRAW_INTERSECT;
    } else {
      drawMode = SHADOW_DRAW_EXCLUDE;
    }
    let shadowX = (0, _math.mapRange)(1, -1, showPercent);
    if ((0, _utils.isFunc)(mapShadowX)) {
      shadowX = mapShadowX(shadowX);
    }
    this.setVecUniform(this.scene, 'uShadowX', shadowX);
    this.setVecUniform(this.scene, 'uShadowDraw', drawMode);
  }

  calRotatePos(rotate) {
    return [Math.cos(rotate) * 1.1, Math.sin(rotate) * .8];
  }

  set moonColor(components) {
    this.setVecUniform(this.scene, 'uPointColor', components);
  }

  get position() {
    let data = this.scene.binder['aPos'].data;
    return [data[0], data[1]];
  }

  set position(pos) {
    this.scene.binder['aPos'].data = new Float32Array(pos);
    this.invalid();
  }

  get type() {
    return _const.ANIMATION_MOON;
  }
}
exports.MoonDrawer = MoonDrawer;
function createPointsGeometry() {
  return new Flip.GL.Mesh({
    primitive: Flip.GL.POINTS,
    drawCount: 1
  });
}

},{"3":3,"30":30,"32":32,"5":5,"9":9}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMoonDrawer = getMoonDrawer;

var _MoonDrawer = require(7);

var _math = require(30);

/**
 * Created by brian on 14/03/2017.
 */
function getMoonDrawer(parse) {
  let drawer = new _MoonDrawer.MoonDrawer();
  drawer.moonColor = [254 / 255, 248 / 255, 200 / 255];
  drawer.shadowByMoonPhrase(parse || 0.1, mapShadowX);
  return drawer;
}
function mapShadowX(x) {
  // x near to 0 cases aliasing
  let mul = x < 0 ? -1 : 1;
  return (0, _math.mapRange)(0.3, 1, Math.abs(x)) * mul;
}

},{"30":30,"7":7}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Created by brian on 9/8/16.
 */
const vertex_shader = exports.vertex_shader = `
attribute vec2 aPos;

uniform float uPointSize;

void main(){
  gl_Position= vec4(aPos,0.0,1.0);
  gl_PointSize= uPointSize;
}
`;
const frag_shader = exports.frag_shader = `
precision mediump float;

const int SHADOW_DRAW_INTERSECT = 1;
const int SHADOW_DRAW_EXCLUDE = 2;
const float cBlurRadius = 0.06;
uniform float uShadowX;
uniform int uShadowDraw;
uniform vec4 uPointColor;

void main(){
  vec2 pos =(gl_PointCoord.xy - 0.5) * 2.0 * 1.1;
  vec4 pointColor = uPointColor;
  float radius = length(pos);
  if(radius > 1.0+ cBlurRadius){
    discard;
  }
  float alpha = 1.0 - smoothstep(1.0,1.0 + cBlurRadius,radius);
  float m = uShadowX;
  float x = pos.x;
  float y = pos.y;
  float r = (x*x)/(m*m) + y*y;
  if(uShadowDraw == SHADOW_DRAW_EXCLUDE){
    if(x < 0.0){ discard; }
    if(r < 1.0){
      alpha = smoothstep(1.0 - cBlurRadius * 2.0,1.0,r);
    }
  }
  else if(uShadowDraw == SHADOW_DRAW_INTERSECT){
    if(x < 0.0 && r >= 1.0 - cBlurRadius * 2.0){
       alpha = 1.0 - smoothstep(1.0,1.0 + cBlurRadius * 2.0 ,r);
    }
  }
 
  gl_FragColor = pointColor * alpha ;
}
`;
const debug_vertex_shader = exports.debug_vertex_shader = `
#ifdef GL_ES
precision mediump float;
#endif

attribute vec2 aQuad;
varying vec2 vTexIndex;

void main(){
  vTexIndex= aQuad;
  gl_Position = vec4(aQuad * 2.0 -1.0, 0.0, 1.0);
}
`;
const debug_frag_shader = exports.debug_frag_shader = `
precision mediump float;

uniform vec2 uTexSize;
uniform sampler2D uSampler;

varying vec2 vTexIndex;

const float SIGMA = 6.2;
const vec2 uBlurDirection = vec2(0.001, 0.001);
const int BLUR_RADIUS = 32;

vec4 incrementalGauss1D(sampler2D s,vec2 size,vec2 origin,vec2 direction);

void main(){
  vec2 texSize = 1.0 / uTexSize;
  vec2 texIndex= vTexIndex;
 
  vec4 blurColor=incrementalGauss1D(uSampler,texSize,texIndex,uBlurDirection);
  gl_FragColor= vec4(blurColor.rgb,texture2D(uSampler,texIndex).a);
  //gl_FragColor= texture2D(uSampler,texIndex);
}

vec4 incrementalGauss1D(
	sampler2D srcTex, 
	vec2 srcTexelSize, 
	vec2 origin,
	vec2 direction
) {

	if (BLUR_RADIUS == 0)
		return texture2D(srcTex, origin);
	
	float sig2 = SIGMA * SIGMA;
	const float TWO_PI	= 6.2831853071795;
	const float E			= 2.7182818284590;
		
//	set up incremental counter:
	vec3 gaussInc;
	gaussInc.x = 1.0 / (sqrt(TWO_PI) * SIGMA);
	gaussInc.y = exp(-0.5 / sig2);
	gaussInc.z = gaussInc.y * gaussInc.y;
	
//	accumulate results:
	vec4 result = texture2D(srcTex, origin) * gaussInc.x;	
	for (int i = 1; i < BLUR_RADIUS/2; ++i) {
		gaussInc.xy *= gaussInc.yz;
		
		vec2 offset = float(i) * direction * srcTexelSize;
		result += texture2D(srcTex, origin - offset) * gaussInc.x;
		result += texture2D(srcTex, origin + offset) * gaussInc.x;
	}
	
	return result;
}
`;

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RainDrawer = undefined;

var _RainRender = require(11);

var _shader = require(13);

var shader = _interopRequireWildcard(_shader);

var _GLDrawer = require(3);

var _const = require(5);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class RainDrawer extends _GLDrawer.GLDrawer {

  get type() {
    return _const.ANIMATION_RAIN;
  }

  set rainEffectIntensity(val) {
    this.drawScene.binder['uDiscardThreshold'].value = +val;
  }

  get rainEffectIntensity() {
    return this.drawScene.binder['uDiscardThreshold'].value;
  }

  classConfigureArgument() {
    return {
      define: {
        DRAW_RAIN: 1
      }
    };
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
      blend(gl) {
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
      uTexRandom() {
        return [Math.random(), Math.random()];
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

  setPoints(points) {
    let rainRender = new _RainRender.RainRender();
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

  setFrameTime(movement, acceleration) {
    return this.setVecUniform(this.updateScene, 'uTimeDelta', {
      [_RainRender.UPDATE_PHRASE_POS]: movement,
      [_RainRender.UPDATE_PHRASE_VEC]: acceleration
    });
  }

  setResistance(x, y, z) {
    return this.setVecUniform(this.updateScene, 'uResistance', [x, y, z]);
  }

  setNoiseSource(img) {
    this.updateScene.binder['uNoise'].source = img;
    this.invalid();
  }

  setVecRange(xMin, xMax, yMin, yMax) {
    return this.setVecUniform(this.updateScene, 'uVecRange', [xMin, xMax, yMin, yMax]);
  }

  setAcceleration(vx, vy, vz) {
    return this.setVecUniform(this.updateScene, 'uAcceleration', [vx, vy, vz]);
  }
}
exports.RainDrawer = RainDrawer;

},{"11":11,"13":13,"3":3,"5":5}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RainRender = exports.UPDATE_PHRASE_VEC = exports.UPDATE_PHRASE_POS = undefined;
exports.encodePoints = encodePoints;
exports.swapTextureAfterDraw = swapTextureAfterDraw;
exports.mapColorVal = mapColorVal;
exports.createFloatSampler = createFloatSampler;

var _math = require(30);

var _color = require(28);

const UPDATE_PHRASE_POS = exports.UPDATE_PHRASE_POS = 0,
      UPDATE_PHRASE_VEC = exports.UPDATE_PHRASE_VEC = 1;
const SAMPLER_DATA_POINT_SIZE = 2;
class RainRender {

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
      dataFormat: Flip.GL.FLOAT,
      textureParam: {
        TEXTURE_MAG_FILTER: Flip.GL.NEAREST,
        TEXTURE_MIN_FILTER: Flip.GL.NEAREST
      }
    });
    let aTexIndex = new Flip.GL.Attribute({ name: 'aTexIndex', data: texIndexBuffer });
    let posUpdateGeo = this._posUpdateGeometry = new Flip.GL.Mesh({
      primitive: Flip.GL.POINTS,
      binder: {
        [posSampler.name]: posSampler,
        [vecSampler.name]: vecSampler,
        uUpdatePhrase: new Flip.GL.Uniform({ name: 'uUpdatePhrase', value: UPDATE_PHRASE_POS, type: 'int' }),
        aTexIndex
      }
    });
    let vecUpdateGeo = this._vecUpdateGeometry = new Flip.GL.Mesh({
      primitive: Flip.GL.POINTS,
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
      primitive: Flip.GL.POINTS,
      binder: {
        aTexIndex,
        aPointSize: new Flip.GL.Attribute({ name: 'aPointSize', data: new Float32Array(0) }),
        aPointColor: new Flip.GL.Attribute({ name: 'aPointColor', data: new Float32Array(0) }),
        uPointOpacity: new Flip.GL.Uniform({ name: 'uPointOpacity', value: 1 })
      },
      beforeDraw(gl, state) {
        frameBuffer.unbind(gl);
        posSampler.bind(gl, state);
        vecSampler.bind(gl, state);
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      }
    });
  }

  setPoints(points) {
    return this.setEncodedPoints(encodePoints(points));
  }

  setEncodedPoints(arg) {
    let { width, height } = arg;
    this._posSampler.source = {
      width, height, data: arg.pos, format: Flip.GL.RGB
    };
    this._vecSampler.source = {
      width, height, data: arg.vec, format: Flip.GL.RGB
    };
    this._framebuffer.width = width * SAMPLER_DATA_POINT_SIZE;
    this._framebuffer.height = height * SAMPLER_DATA_POINT_SIZE;
    this._texIndexBuffer.data = arg.index;
    this._pointCount = this._drawGeometry.drawCount = this._posUpdateGeometry.drawCount = this._vecUpdateGeometry.drawCount = arg.count;
    this._drawGeometry.binder['aPointColor'].data = arg.color;
    this._drawGeometry.binder['aPointSize'].data = arg.size;
    return this;
  }
}
exports.RainRender = RainRender;
function encodePoints(points) {
  let particleCount = points.length;
  let [width, height] = (0, _math.parseSqrt)(particleCount);
  let posBufferData = new Float32Array(width * height * 3);
  let vecBufferData = new Float32Array(width * height * 3);
  let colorBufferData = new Float32Array(width * height * 4);
  let texIndexData = new Float32Array(width * height * 2);
  let pointSizeData = new Float32Array(width * height);

  for (let pointIndex = 0, posBufferIndex = 0, vecBufferIndex = 0, colorBufferIndex = 0, texIndex = 0; pointIndex < particleCount; pointIndex++) {
    let point = points[pointIndex];
    let colorComponents = point.color ? (0, _color.parseColor)(point.color) : (0, _color.randomColor)();

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
    let x = pointIndex % width,
        y = (pointIndex - x) / width;
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
  };
}
function swapTextureAfterDraw(geometry, sampler, frameBuffer) {
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
  };
}
function mapColorVal(number) {
  return +(number + 1.0) / 2.0;
}
function createFloatSampler(name, source) {

  return new Flip.GL.Sampler2D({
    dataFormat: Flip.GL.FLOAT,
    flipY: false,
    name,
    textureParam: {
      TEXTURE_MAG_FILTER: Flip.GL.NEAREST,
      TEXTURE_MIN_FILTER: Flip.GL.NEAREST
    },
    source: source || null
  });
}

},{"28":28,"30":30}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultRainConfiguration = exports.RainDrawer = undefined;
exports.getRainDrawer = getRainDrawer;
exports.configRainDrawer = configRainDrawer;

var _RainDrawer = require(10);

var _noise = require(31);

var _math = require(30);

exports.RainDrawer = _RainDrawer.RainDrawer; /**
                                              * Created by brian on 8/20/16.
                                              */

const DPI = window.devicePixelRatio || 1;
const defaultRainConfiguration = exports.defaultRainConfiguration = {
  acceleration: [0, -.1],
  frameTimeRatio: 200,
  resistance: [0, .18, 0],
  vxRange: [-0.06, -.006],
  vyRange: [-0.4, 0],
  sizeRange: [16 * DPI, 32 * DPI],
  pointCountPerThousandPixel: 96
};
function getRainDrawer(param) {
  let drawer = new _RainDrawer.RainDrawer();
  return configRainDrawer(drawer);
}
function configRainDrawer(drawer, param) {
  let cfg = Object.assign({ sizeEasing: Flip.EASE.quadInOut }, defaultRainConfiguration, param);
  drawer.setAcceleration.apply(drawer, cfg.acceleration);
  drawer.setResistance.apply(drawer, cfg.resistance);
  drawer.setNoiseSource(param && param.noiseData || (0, _noise.randomNoiseData)({ min: 0, max: 255 }));
  drawer.setVecRange(cfg.vxRange[0], cfg.vxRange[1], cfg.vyRange[0], cfg.vyRange[1]);
  let maxPointCount = Math.ceil(screen.availWidth / 1000) * cfg.pointCountPerThousandPixel;
  drawer.setPoints(randomRain(maxPointCount, cfg));
  drawer.pointCountPerThousandPixel = cfg.pointCountPerThousandPixel;
  drawer.frameTimeRatio = cfg.frameTimeRatio;
  return drawer;
}
function randomRain(count, { vxRange, vyRange, sizeRange, sizeEasing }) {
  let arr = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      y: (0, _math.random)(-1, 1),
      x: (0, _math.random)(-1, 1),
      z: 0,
      color: `rgba(232,232,232,${(0, _math.random)(0.2, 0.9).toFixed(1)})`,
      vx: (0, _math.random)(vxRange[0], vxRange[1]),
      vy: (0, _math.random)(vyRange[0], vyRange[1]),
      vz: 0,
      size: (0, _math.random)(sizeRange[0], sizeRange[1], sizeEasing || Flip.EASE.linear)
    });
  }
  return arr;
}

},{"10":10,"30":30,"31":31}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const UPDATE_VERTEX_SHADER = exports.UPDATE_VERTEX_SHADER = `
precision mediump float;

attribute vec2 aTexIndex;
varying vec2 vTexIndex;
const float SAMPLER_DATA_POINT_SIZE = 2.0;

void main(){
  vTexIndex = aTexIndex;
  gl_Position = vec4(aTexIndex * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize= SAMPLER_DATA_POINT_SIZE;
}
`;
const UPDATE_FRAGE_SHADER = exports.UPDATE_FRAGE_SHADER = `
precision mediump float;

uniform sampler2D uVecBuffer;
uniform sampler2D uPosBuffer;
uniform sampler2D uNoise;
uniform vec2 uTimeDelta;
uniform int uUpdatePhrase;
uniform vec3 uAcceleration;
uniform vec3 uResistance;
uniform vec2 uTexRandom;
uniform vec4 uVecRange;
varying vec2 vTexIndex;

const int UPDATE_PHRASE_POS= 0;
const int UPDATE_PHRASE_VEC= 1;
const float BOUNCE_DECREASE= 2.0/3.0;

bool outOfBound(vec2 pos);
vec2 interpolateVecRange(vec4 range,vec2 p);
void main(){
  vec3 curVec = texture2D(uVecBuffer,vTexIndex).xyz * 2.0 - 1.0;
  vec3 curPos = texture2D(uPosBuffer,vTexIndex).xyz * 2.0 - 1.0;
  vec3 _output;
  if(uUpdatePhrase == UPDATE_PHRASE_POS){
    if(outOfBound(curPos.xy)){
      vec4 noise = texture2D(uNoise,fract(vTexIndex + uTexRandom + curVec.xy));
      float x =(fract(noise.x * 6.282) -0.5) * 3.0;
      _output=vec3(x, 1.0, _output.z);
    }
    else{
      _output = curPos + curVec * uTimeDelta[UPDATE_PHRASE_POS];
    }
  }
  else if(uUpdatePhrase == UPDATE_PHRASE_VEC){
    vec3 resistance = uResistance * curVec;
    _output = curVec + (uAcceleration - resistance) * uTimeDelta[UPDATE_PHRASE_VEC];
    if(outOfBound(curPos.xy)){
        vec2 noise = texture2D(uNoise,fract(vTexIndex+ uTexRandom * 4.0)).xy;
        _output.xy = interpolateVecRange(uVecRange,vec2(noise.y));
    }
  }
  gl_FragColor = vec4(( _output  + 1.0 ) / 2.0 ,1.0);
}
bool outOfBound(vec2 pos){
  if(pos.y<= -1.0 || pos.x >= 2.0 || pos.x <= -2.0){
    return true;
  }
  return false;
}
vec2 interpolateVecRange(vec4 range,vec2 p){
  return vec2(range[0] + p[0] * range[1] ,range[2] + p[1] * range[3]);
}
`;
const DRAW_VERTEX_SHADER = exports.DRAW_VERTEX_SHADER = `
precision mediump float;

uniform sampler2D uPosBuffer;
uniform mat4 uViewProjectionMatrix;
uniform float uPointSizeScale;

attribute vec2 aTexIndex;
attribute float aPointSize;
attribute vec4 aPointColor;

varying vec4 vPointColor;

#ifdef DRAW_RAIN
uniform sampler2D uVecBuffer;
varying float vPointVelRatio;
#endif

void main(){
  vec3 pos = (texture2D(uPosBuffer,aTexIndex).xyz) * 2.0 - 1.0;
 
  gl_Position = uViewProjectionMatrix * vec4(pos,1.0);
  
  gl_PointSize = aPointSize * uPointSizeScale;
#ifdef DRAW_SNOW
  float y = (gl_Position.y +1.0)/2.0;
  vPointColor = aPointColor * pow(y,0.2);
#else
  vPointColor = aPointColor;
#endif
  
#ifdef DRAW_RAIN
   vec2 vel = (texture2D(uVecBuffer,aTexIndex).xy * 2.0) -1.0;
   if(vel.x !=0.0){
     vPointVelRatio = -vel.y / vel.x;
   }
   else{
     vPointVelRatio = 0.0;
   }
#endif
}
`;
const DRAW_FRAGE_SHADER = exports.DRAW_FRAGE_SHADER = `
precision mediump float;

#ifdef DRAW_RAIN
varying float vPointVelRatio;
#endif

varying vec4 vPointColor;
uniform float uPointOpacity;
uniform float uPointWidth;
uniform float uDiscardThreshold;

void main(){
  float a=1.0;
  if(vPointColor.a > uDiscardThreshold){
    discard;
  }
#ifdef DRAW_RAIN
    float x = gl_PointCoord.x;
    float y = gl_PointCoord.y;
    float LINE_X_END = 0.5 + uPointWidth /0.5;
    float LINE_X_START = 0.5 - uPointWidth /0.5;
    if(vPointVelRatio !=0.0){
      float k=y/vPointVelRatio;
      if( k > (x - LINE_X_START) || k < (x - LINE_X_END)){
        discard;
      }
      else{
         a = (y*(1.0+vPointVelRatio*vPointVelRatio))/(LINE_X_START * (1.0+vPointVelRatio*vPointVelRatio));
         a = smoothstep(0.0,1.0,a)*0.7;
      }   
    }
    else{
      if(x < LINE_X_START || x > LINE_X_END)
        discard;
      //else 
        //a= y /1.0;
    }
#endif
#ifdef DRAW_SNOW
    float radius =length(gl_PointCoord - 0.5);
    if(radius > 0.5){
      discard;
    }
    a = clamp((radius -0.2)/(0.5-0.2),0.0,1.0);
    a = pow(clamp(1.0 - a, 0.0 ,1.0),0.7);
#endif
  
  gl_FragColor= vPointColor * uPointOpacity * a;
}

`;

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SnowDrawer = undefined;

var _RainDrawer = require(10);

var _const = require(5);

/**
 * Created by brian on 8/20/16.
 */
class SnowDrawer extends _RainDrawer.RainDrawer {
  classConfigureArgument() {
    return {
      define: {
        DRAW_SNOW: 1
      }
    };
  }

  get type() {
    return _const.ANIMATION_SNOW;
  }

  onDrag(events) {
    let evt = events[0];
    let dragVec = evt.accumulatedX / (evt.timeStamp - evt.startTime);
    if (Math.abs(dragVec) > 0.5) {
      this.setAcceleration(this.getDragAcceleration(dragVec));
      setTimeout(() => this.setAcceleration(0), 1000);
    }
  }

  getDragAcceleration(v) {
    return v > 0 ? 0.01 : -0.01;
  }
}
exports.SnowDrawer = SnowDrawer;

},{"10":10,"5":5}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultSnowConfiguration = exports.SnowDrawer = undefined;
exports.getSnowDrawer = getSnowDrawer;

var _rain = require(12);

var _SnowDrawer = require(14);

exports.SnowDrawer = _SnowDrawer.SnowDrawer;

const DPI = window.devicePixelRatio || 1;
const defaultSnowConfiguration = exports.defaultSnowConfiguration = Object.assign({}, _rain.defaultRainConfiguration, {
  pointCountPerThousandPixel: 180,
  resistance: [0.2 / DPI, 5.6 / DPI, 0],
  vxRange: [-0.02 * DPI, 0.02 * DPI],
  vyRange: [-0.04, 0],
  sizeRange: [2 * DPI, 8 * DPI]
});
function getSnowDrawer(configuration) {
  let drawer = new _SnowDrawer.SnowDrawer();
  let config = Object.assign(defaultSnowConfiguration, { sizeEasing: Flip.EASE.quartIn }, configuration);
  return (0, _rain.configRainDrawer)(drawer, config);
}

},{"12":12,"14":14}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Created by brian on 08/11/2016.
 */
const defaultFontFamily = 'Avenir, Helvetica Neue, Helvetica, Arial, sans-serif';
class SpottedStringDrawer {

  constructor({ textColor = '#fff', fontSize = 160, fontFamily = defaultFontFamily, canvas } = {}) {
    this.textColor = textColor;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.canvas = canvas || document.createElement('canvas');
  }

  get ctx() {
    return this.canvas.getContext('2d');
  }

  getPointFromText(text, cfg) {
    let { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawText(text);
    return this.getVisualPoints(cfg);
  }

  drawText(text) {
    let { fontSize, fontFamily, ctx, canvas } = this,
        fs;
    ctx.font = getFontString(fontSize, fontFamily);
    fs = Math.min(fontSize, canvas.width / ctx.measureText(text).width * 0.8 * fontSize, canvas.height / fontSize * (isNumber(text) ? 1 : 0.8) * fontSize);
    ctx.font = getFontString(fs, fontFamily);
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.textColor;
    ctx.fillText(text, canvas.width / 2, 0, canvas.width);
  }

  getVisualPoints(cfg = {}) {
    let gap = cfg.gap || 6;
    let radius = cfg.pointRadius || 2;
    let { ctx, canvas } = this;
    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height),
        pixels = imgData.data,
        points = [],
        lineWidth = imgData.width;
    let normalize = cfg.normalize;
    let totalWidth = cfg.normalize ? canvas.width : 1;
    let totalHeight = cfg.normalize ? canvas.height : 1;
    for (let pixel = 0, plen = pixels.length, x = 0, y = 0; pixel < plen; pixel += 4 * gap) {
      if (pixels[pixel + 3] > 0) {

        let point = {
          x: normalize ? (x + gap) / totalWidth : x + gap,
          y: normalize ? 1 - (y + gap) / totalHeight : y + gap,
          radius
        };
        points.push(point);
      }
      x += gap;
      if (x >= lineWidth) {
        x = 0;
        y += gap;
        pixel += gap * 4 * lineWidth;
      }
    }
    return points;
  }
}
exports.SpottedStringDrawer = SpottedStringDrawer;
function getFontString(size, family) {
  return `bold ${size}px "${family}"`;
}
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StarDrawer = undefined;

var _shader = require(19);

var shader = _interopRequireWildcard(_shader);

var _utils = require(32);

var _color = require(28);

var _noise = require(31);

var _math = require(30);

var _GLDrawer = require(3);

var _const = require(5);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class StarDrawer extends _GLDrawer.GLDrawer {

  get type() {
    return _const.ANIMATION_STAR;
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
    let cameraOptions = arg.camera || {};
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
      uNoise: (0, _noise.randomNoiseData)({ easeFunc: Flip.EASE.sineInOut }),
      aPoint: new Float32Array(0),
      aPointColor: new Float32Array(0),
      blend(gl) {
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

  reset() {
    this.rotateByY(0);
    return this;
  }

  rotateByY(angle) {
    this.scene.binder['uWorldTransform'].value = new Flip.GL.Matrix4().rotate(angle / 180 * Math.PI, [0, 1, 0]);
    this.invalid();
  }

  setStars(stars) {
    let count = stars.length;
    let pointBuffer = new Float32Array(4 * count);
    let colorBuffer = new Float32Array(3 * count);
    let pointBufferIndex = 0,
        colorBufferIndex = 0;
    for (let i = 0; i < stars.length; i++) {
      let star = stars[i];
      let pos = star.pos;
      let color = (0, _utils.isStr)(star.color) ? (0, _color.parseColor)(star.color) : star.color;
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

  randomPoints(arg) {
    let stars = [];
    let [s0, s1] = arg.sizeRange;
    let [x0, y0, z0] = arg.posMin;
    let [x1, y1, z1] = arg.posMax;
    let posEase = arg.posEase;
    let sizeEase = arg.sizeEase;
    let color = arg.color || [1, 1, 1];
    for (let i = 0; i < arg.count; i++) {
      let x = (0, _math.random)(x0, x1, posEase);
      let y = (0, _math.random)(y0, y1, posEase);
      let z = (0, _math.random)(z0, z1, posEase);
      stars.push({
        pos: [x, y, z],
        color,
        radius: (0, _math.random)(s0, s1, sizeEase)
      });
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
exports.StarDrawer = StarDrawer; /**
                                  * Created by brian on 03/11/2016.
                                  */

const COLOR_WHITE = [1, 1, 1];

},{"19":19,"28":28,"3":3,"30":30,"31":31,"32":32,"5":5}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StarDrawer = undefined;
exports.getStarDrawer = getStarDrawer;

var _StarDrawer = require(17);

var _SpottedStringDrawer = require(16);

/**
 * Created by brian on 15/03/2017.
 */
/**
 * Created by brian on 08/11/2016.
 */
exports.StarDrawer = _StarDrawer.StarDrawer;

let defaultSpottedStringDrawer = new _SpottedStringDrawer.SpottedStringDrawer({
  fontFamily: 'Microsoft Yahei,Times New Roman, Georgia, Serif'
});
function getStarDrawer() {
  let starDrawer = new _StarDrawer.StarDrawer({
    camera: {
      position: [0, 0, 0],
      lookAt: [0, 0, 1],
      perspective: [Math.PI / 8, 1, -1, -5]
    },
    shinningDuration: 6,
    dragMultiplier: 1 / 20
  });
  let randomPoints = starDrawer.randomPoints({
    sizeRange: [6, 18],
    posMin: [-5, 0.8, -5],
    posMax: [5, 1, 5],
    count: 320,
    posEase: Flip.EASE.sineOut,
    sizeEase: Flip.EASE.quartInOut
  });
  let UCStarts = defaultSpottedStringDrawer.getPointFromText('Web AR', { normalize: true, gap: 3 }).map(p => ({
    pos: [1. - p.x, p.y, 2.0],
    radius: 6,
    color: [1, 1, 0]
  }));
  starDrawer.setStars(randomPoints.concat(UCStarts));
  return starDrawer;
}

},{"16":16,"17":17}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Created by brian on 03/11/2016.
 */
const VERTEX_SHADER = exports.VERTEX_SHADER = `
precision mediump float;

attribute vec4 aPoint;
attribute vec3 aPointColor;

uniform mat4 uViewProjection;
uniform mat4 uWorldTransform;

varying vec3 vPointColor;
varying vec2 vNoiseIndex;

void main(){
  vec4 pos = vec4(aPoint.xyz,1.0);
  vPointColor = aPointColor;
  gl_Position = pos * uWorldTransform * uViewProjection;
  gl_PointSize = aPoint.w;
  vNoiseIndex = pos.xy;
}
`;
const FRAG_SHADER = exports.FRAG_SHADER = `
precision mediump float;

const float BASE_ALPHA = 0.2;
const float SHINNING_ALPHA = 0.8;

varying vec3 vPointColor;
varying vec2 vNoiseIndex;

uniform vec2 uShinningRadius;
uniform sampler2D uNoise;
uniform float uOffset;
uniform float uGlobalOpacity;
float shanningOffset();

void main(){
  vec2 pos = (gl_PointCoord.xy - 0.5) * 2.0;
  float len = length(pos);
  if(len >1.0){
    discard;
  }
  float alpha = (1.0 - smoothstep(0.0,1.0,len)) * BASE_ALPHA;
  float shanningRadius = uShinningRadius[0] + shanningOffset() * uShinningRadius[1];
  alpha += (1.0 - smoothstep(0.0,shanningRadius,len)) * SHINNING_ALPHA;
  gl_FragColor = vec4(vPointColor,alpha * uGlobalOpacity);
}
float shanningOffset(){
  float noise = length(texture2D(uNoise,vNoiseIndex));
  float timeOffset = uOffset;
  return abs(sin((noise+timeOffset) * 3.14159));
}
`;

},{}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CircleShape = undefined;

var _shader = require(24);

var _vertexGenerator = require(25);

/**
 * Created by brian on 12/10/2016.
 */
const Vec = Flip.GL.Vec;

const DEF_CONSTRUCTOR = {
  radius: 0.3,
  position: [0, 0, 0],
  shape: _shader.SHAPE_TRANSPARENT
};
class CircleShape extends Flip.GL.Mesh {

  constructor(arg) {
    super({
      primitive: Flip.GL.TRIANGLE_FAN,
      drawCount: arg.triangleCount || _vertexGenerator.DEFAULT_SECTION_COUNT
    });
    this.radius = arg.radius || DEF_CONSTRUCTOR.radius;
    this.position = arg.position || DEF_CONSTRUCTOR.position;
    this.shape = arg.shape || DEF_CONSTRUCTOR.shape;
    this.distanceToCenter = arg.distance;
  }

  get modelMatrix() {
    let radius = this.radius;
    return Flip.GL.Matrix4.fromTranslate.apply(null, this.position).scale(radius, radius, radius);
  }

  get radius() {
    return this._radius;
  }

  set radius(v) {
    if (this.radius !== +v) {
      this._radius = +v;
      this.invalid();
    }
  }

  get position() {
    return this._pos;
  }

  set position(v) {
    if (v) {
      this._pos = new Vec(v);
      this.invalid();
    }
  }
}
exports.CircleShape = CircleShape;

},{"24":24,"25":25}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VertexSunDrawer = undefined;

var _shader = require(24);

var _vertexGenerator = require(25);

var _VertexSunLight = require(22);

var _math = require(30);

var _GLDrawer = require(3);

var _const = require(5);

/**
 * Created by brian on 12/10/2016.
 */
class VertexSunDrawer extends _GLDrawer.GLDrawer {

  get type() {
    return _const.ANIMATION_SUN;
  }

  get lensFlaresIntensity() {
    return this.scene.binder['uLensFlareOpacity'].value;
  }

  set lensFlaresIntensity(v) {
    this.scene.binder['uLensFlareOpacity'].value = v;
  }

  createScenes(arg) {
    let scene = new Flip.GL.Scene({
      vertexShader: _shader.VERTEX_SHADER,
      fragShader: _shader.FRAG_SHADER,
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
    this.triangleCount = arg.sunlight.triangleCount || _vertexGenerator.DEFAULT_SECTION_COUNT;
    scene.addBinder(scene.buildBinder({
      aVertex: (0, _vertexGenerator.generateCircleTriangleFanData)(this.triangleCount, 1),
      uLensFlareOpacity: 1,
      blend(gl) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      }
    }));
    scene.addBinder(camera);
    let sunlight = this.sunlight = new _VertexSunLight.VertexSunLight(arg.sunlight);
    sunlight.lensFlares.forEach(l => scene.add(l));
    scene.add(sunlight.geometry);
    this.sunlightRotateParam = [0, 0];
    return [this.scene = scene];
  }

  viewportResize(viewport) {
    this.scene.binder['aVertex'].data = (0, _vertexGenerator.generateCircleTriangleFanData)(this.triangleCount, 1, viewport.aspectRatio);
  }

  setSunColor(component) {
    this.setVecUniform(this.sunlight.geometry, 'uPointColor', component);
  }

  addLensFlare(lensFlare) {
    let lens = this.sunlight.addLensFlare(lensFlare);
    this.scene.add(lens);
    this.invalid();
    return this;
  }

  rotatePositionAndDirection(arg) {
    let rotate = Math.PI * (1 - arg.percent);
    let targetRotate = Math.PI * arg.percent;
    let sun = this.sunlight;
    let sunZ = sun.position[2];
    let targetPos = [Math.cos(targetRotate) * arg.lightTargetRadius, arg.lightTargetHeight || 0, Math.sin(targetRotate) * arg.lightTargetRadius];
    let sunTopPos = rotateInXYSurface(arg.rotateRadius, Math.PI / 2, sunZ);
    sun.lightDirection = _VertexSunLight.Vec.vecMix(targetPos, 1, sunTopPos, -1);
    sun.position = rotateInXYSurface(arg.rotateRadius, rotate, sunZ);
    this.setSunColor(arg.color);
    this.invalid();
  }

  restoreLightDirection() {
    let param = this.sunlightRotateParam;
    return this.rotateLightDirection(-param[0], -param[1]);
  }

  rotateLightDirection(horizontal, vertical) {
    let sun = this.sunlight;
    let dir = sun.lightDirection,
        pos = sun.position;
    let [dx, dy] = this.sunlightRotateParam;
    let nx = dx + horizontal;
    let ny = dy + vertical;
    let changed;

    if (inRange(-80, 80, nx)) {
      dir = (0, _math.vec3RotateY)(dir, pos, horizontal * Math.PI / 180);
      this.sunlightRotateParam[0] = nx;
      changed = true;
    }
    if (inRange(0, 10, ny)) {
      dir = (0, _math.vec3RotateX)(dir, pos, vertical * Math.PI / 180);
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
exports.VertexSunDrawer = VertexSunDrawer;
function inRange(min, max, v) {
  return v > min && v < max;
}
function rotateInXYSurface(radius, rotation, z) {
  return [Math.cos(rotation) * radius, Math.sin(rotation) * radius, z];
}

},{"22":22,"24":24,"25":25,"3":3,"30":30,"5":5}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VertexSunLight = exports.Vec = exports.CircleShapeConstructor = undefined;

var _shader = require(24);

var _CircleShape = require(20);

/**
 * Created by brian on 12/10/2016.
 */
exports.CircleShapeConstructor = _CircleShape.CircleShapeConstructor;
const Vec = exports.Vec = Flip.GL.Vec;
const { vecAdd, vecDot, vecNormalize } = Vec;

class VertexSunLight {

  get position() {
    return this._position;
  }

  get lightDirection() {
    return this._lightDir;
  }

  constructor(arg) {
    this.lensFlares = [];
    this.position = arg.position;
    this.lightDirection = arg.lightDirection;
    this.triangleCount = arg.triangleCount;
    this.geometry = this.createCircle({
      shape: _shader.SHAPE_SOLID,
      radius: arg.radius,
      color: arg.color || [1, 1, 1, 1],
      position: this.position,
      distance: 0
    });
    (arg.lensFlares || []).forEach(l => this.addLensFlare(l));
  }

  addLensFlare(lensFlare) {
    let position = vecAdd(this.position, vecDot(this.lightDirection, lensFlare.distance));
    let circle = this.createCircle({
      position,
      radius: lensFlare.radius,
      distance: lensFlare.distance,
      shape: _shader.SHAPE_TRANSPARENT,
      color: lensFlare.color
    });
    this.lensFlares.push(circle);
    return this;
  }

  createCircle(arg) {
    let circle = new _CircleShape.CircleShape(Object.assign({ triangleCount: this.triangleCount }, arg));
    circle.addBinder(new Flip.GL.Uniform({
      value: circle.shape,
      name: 'uDrawMode'
    }));
    circle.addBinder(new Flip.GL.Uniform({
      name: 'uModelTransform',
      value: () => circle.modelMatrix
    }));
    if (arg.color) {
      circle.addBinder(new Flip.GL.Uniform({ name: 'uPointColor', value: new Vec(arg.color) }));
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

  set position(v) {
    if (v) {
      this._position = new Vec(v);
      this.needResetLensFlares();
    }
  }

  set lightDirection(v) {
    if (v) {
      this._lightDir = vecNormalize(new Vec(v));
      this.needResetLensFlares();
    }
  }
}
exports.VertexSunLight = VertexSunLight;

},{"20":20,"24":24}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VertexSunDrawer = undefined;
exports.getVertexSunDrawer = getVertexSunDrawer;
exports.getVertexSunDrawerAnimateParam = getVertexSunDrawerAnimateParam;

var _VertexSunDrawer = require(21);

var _color = require(28);

var _math = require(30);

/**
 * Created by brian on 12/10/2016.
 */
exports.VertexSunDrawer = _VertexSunDrawer.VertexSunDrawer;

const LENS_FLARE_COLOR = [250 / 255, 244 / 255, 232 / 255, 1];
const DEF_CONFIG = {
  camera: {
    position: [0, -.2, 3],
    lookAt: [0, 0, 0],
    up: [0, 1, 0],
    perspective: [Math.PI / 3, 1, 1, 10]
  },
  sunlight: {
    position: [-2.4, 0, -0.9],
    color: [250 / 255, 244 / 255, 232 / 255, 1],
    lightDirection: [0.8, -0.56, 0.24],
    radius: 0.1,
    lensFlares: [{
      radius: 0.16,
      distance: 0,
      color: LENS_FLARE_COLOR
    }, {
      radius: 0.06,
      distance: 0.4,
      color: LENS_FLARE_COLOR
    }, {
      radius: 0.12,
      distance: 0.8,
      color: LENS_FLARE_COLOR
    }, {
      radius: 0.2,
      distance: 1.6,
      color: LENS_FLARE_COLOR
    }],
    triangleCount: 180
  }
};
function getVertexSunDrawer(arg = {}) {
  let cfg = {
    camera: Object.assign({}, DEF_CONFIG.camera, arg.camera),
    sunlight: Object.assign({}, DEF_CONFIG.sunlight, arg.sunlight)
  };
  return new _VertexSunDrawer.VertexSunDrawer(cfg);
}
const SUN_COLOR_H0 = 19 / 360,
      SUN_COLOR_S0 = .28,
      SUN_COLOR_V0 = 1;
const SUN_COLOR_H1 = 19 / 360,
      SUN_COLOR_S1 = .07,
      SUN_COLOR_V1 = 1;

function getVertexSunDrawerAnimateParam(percent = 0) {
  let cp = (percent > 0.5 ? 1.0 - percent : percent) * 2;
  let color = (0, _color.HSVtoRGB)((0, _math.mapRange)(SUN_COLOR_H0, SUN_COLOR_H1, cp), (0, _math.mapRange)(SUN_COLOR_S0, SUN_COLOR_S1, cp), (0, _math.mapRange)(SUN_COLOR_V0, SUN_COLOR_V1, cp));
  return {
    lightTargetHeight: -.5,
    lightTargetRadius: 3,
    rotateRadius: 2.2,
    percent,
    color
  };
}

},{"21":21,"28":28,"30":30}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Created by brian on 12/10/2016.
 */
const SHAPE_TRANSPARENT = exports.SHAPE_TRANSPARENT = '2',
      SHAPE_SOLID = exports.SHAPE_SOLID = '1';

const VERTEX_SHADER = exports.VERTEX_SHADER = `
precision mediump float;

attribute vec4 aVertex;
uniform mat4 uModelTransform;
uniform mat4 uViewProjection;
varying float vRadius;

void main(){
  gl_Position = uViewProjection * uModelTransform * vec4(aVertex.xyz,1.0);
  vRadius = aVertex.w;
}
`;
const FRAG_SHADER = exports.FRAG_SHADER = `
precision mediump float;

const int DRAW_TRANSPARENT = ${SHAPE_TRANSPARENT};
const int DRAW_SOLID = ${SHAPE_SOLID};

varying float vRadius;
uniform vec4 uPointColor;
uniform int uDrawMode;
uniform float uLensFlareOpacity;
void main(){
  vec4 dest;
  if(uDrawMode == DRAW_TRANSPARENT){
    float r = smoothstep(0.0,1.0,vRadius);
    dest = vec4(uPointColor.rgb, r * uLensFlareOpacity * uPointColor.a);
  }
  else if(uDrawMode == DRAW_SOLID){
    dest = vec4(uPointColor.rgb, uPointColor.a);
  }
  else{
    discard;
  }
  gl_FragColor = dest;
}`;

},{}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateCircleTriangleFanData = generateCircleTriangleFanData;
/**
 * Created by brian on 12/10/2016.
 */
const DEFAULT_SECTION_COUNT = exports.DEFAULT_SECTION_COUNT = 160;
function generateCircleTriangleFanData(triangleCount = DEFAULT_SECTION_COUNT, radius = 1, aspect = 1) {
  let z = 0;
  let count = triangleCount - 2;
  let data = new Float32Array(triangleCount * 4);
  data[0] = data[1] = 0;
  data[2] = z;
  data[3] = 1;
  for (let i = 0, dataIndex = 4, angle = Math.PI * 2 / count; i <= count; i++) {
    let rotate = angle * i;
    data[dataIndex++] = Math.cos(rotate) * radius;
    data[dataIndex++] = Math.sin(rotate) * radius * aspect;
    data[dataIndex++] = z;
    data[dataIndex++] = 0;
  }
  return data;
}

},{}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WaveStage = undefined;

var _shader = require(27);

var shader = _interopRequireWildcard(_shader);

var _GLDrawer = require(3);

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

},{"27":27,"3":3}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.randomColorText = randomColorText;
exports.randomColor = randomColor;
exports.parseColor = parseColor;
exports.HSVtoRGB = HSVtoRGB;
exports.RGBtoHSV = RGBtoHSV;
/**
 * Created by brian on 8/15/16.
 */
const COLORS = exports.COLORS = ('f44336,e91e63,9c27b0,673ab7,3f51b5,2196f3,03a9f4,cccccc,' + '00bcd4,009688,4caf50,8bc34a,cddc39,ffeb3b,ffc107,ff9800,ff5722,795548,9e9e9e,607d8b').split(',').map(s => parseColor('#' + s));
function randomColorText() {
  let index = Math.round(Math.random() * (COLORS.length - 1));
  let components = COLORS[index];
  return `rgb(${toNumber(0)},${toNumber(1)},${toNumber(2)})`;
  function toNumber(i) {
    return Math.round(components[i] * 255);
  }
}
function randomColor() {
  let index = Math.round(Math.random() * (COLORS.length - 1));
  return normalizeColor(COLORS[index]);
}
function parseColor(arg) {
  let components = parseColorText(arg);
  return normalizeColor(components);
}
function normalizeColor(color) {
  let a;
  if (color.length == 3) {
    a = 1;
  } else {
    a = color[3];
  }
  return new Float32Array([color[0] / 255, color[1] / 255, color[2] / 255, a]);
}
function parseColorText(text) {
  if (/^rgba?\(([\d,\.]+)\)/.test(text)) {
    return RegExp.$1.split(',').map(s => +s);
  }
  if (text[0] == '#') {
    let valTex = text.substr(1);
    if (valTex.length == 3) {
      return valTex.match(/[a-f\d]/g).map(s => parseInt(s + s, 16));
    } else if (valTex.length == 6) {
      return valTex.match(/[a-f\d]{2}/g).map(s => parseInt(s, 16));
    }
  }
  throw Error('invalid color text:' + text);
}
function HSVtoRGB(h, s, v) {
  let r, g, b, i, f, p, q, t;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v, g = t, b = p;
      break;
    case 1:
      r = q, g = v, b = p;
      break;
    case 2:
      r = p, g = v, b = t;
      break;
    case 3:
      r = p, g = q, b = v;
      break;
    case 4:
      r = t, g = p, b = v;
      break;
    case 5:
      r = v, g = p, b = q;
      break;
  }
  return [r, g, b, 1];
}
function RGBtoHSV(r, g, b) {
  let max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      d = max - min,
      h,
      s = max === 0 ? 0 : d / max,
      v = max / 255;

  switch (max) {
    case min:
      h = 0;
      break;
    case r:
      h = g - b + d * (g < b ? 6 : 0);
      h /= 6 * d;
      break;
    case g:
      h = b - r + d * 2;
      h /= 6 * d;
      break;
    case b:
      h = r - g + d * 4;
      h /= 6 * d;
      break;
  }

  return [h, s, v];
}

},{}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.random = random;
exports.parseSqrt = parseSqrt;
exports.mapRange = mapRange;
exports.vec3RotateX = vec3RotateX;
exports.vec3RotateY = vec3RotateY;
function random(min, max, easeFunc) {
  let r = Math.random();
  if (easeFunc) {
    r = easeFunc(r);
  }
  return r * (max - min) + min;
}
function parseSqrt(num) {
  let sqrt = Math.sqrt(num),
      x = Math.ceil(sqrt),
      y = Math.floor(sqrt);
  return x * y >= num ? [x, y] : [x, y + 1];
}
function mapRange(from, to, percent) {
  return from + (to - from) * percent;
}
function vec3RotateX(a, b, c) {
  var p = [],
      r = [];
  let out = [];
  //Translate point to the origin
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];

  //perform rotation
  r[0] = p[0];
  r[1] = p[1] * Math.cos(c) - p[2] * Math.sin(c);
  r[2] = p[1] * Math.sin(c) + p[2] * Math.cos(c);

  //translate to correct position
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];

  return out;
}
function vec3RotateY(a, b, c) {
  var p = [],
      r = [];
  let out = [];
  //Translate point to the origin
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];

  //perform rotation
  r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c);

  //translate to correct position
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];

  return out;
}

},{}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.randomNoiseData = randomNoiseData;

var _math = require(30);

function randomNoiseData({ easeFunc, format, size = 256, min = 0, max = 1 } = {}) {
  let dataPerChannel;
  switch (format) {
    case Flip.GL.LUMINANCE:
    case Flip.GL.ALPHA:
      dataPerChannel = 1;
      break;
    case Flip.GL.RGB:
      dataPerChannel = 3;
      break;
    case Flip.GL.RGBA:
      dataPerChannel = 4;
      break;
    default:
      format = Flip.GL.LUMINANCE;
      dataPerChannel = 1;
      break;
  }
  let data = new Uint8Array(dataPerChannel * size * size);
  for (let i = 0, len = data.length; i < len; i++) {
    data[i] = (0, _math.random)(min, max, easeFunc) * 255;
  }
  return {
    format, data, width: size, height: size
  };
} /**
   * Created by brian on 8/15/16.
   */

},{"30":30}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.forEach = forEach;
exports.isFunc = isFunc;
exports.isObj = isObj;
exports.isStr = isStr;
exports.noop = noop;
function forEach(object, callback, thisObj) {
  if (isObj(object)) {
    if (thisObj === void 0) {
      thisObj = object;
    }
    if (object instanceof Array || object.hasOwnProperty('length')) {
      for (let i = 0, len = object.length; i < len; i++) {
        callback.call(thisObj, object[i], i);
      }
    } else {
      for (let name in object) {
        if (object.hasOwnProperty(name)) {
          callback.call(thisObj, object[name], name);
        }
      }
    }
  }
  return object;
}

function isFunc(any) {
  return typeof any === 'function';
}
function isObj(any) {
  return any && typeof any === 'object';
}
function isStr(any) {
  return typeof any === "string";
}
function noop() {}

},{}],33:[function(require,module,exports){
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
},{}]},{},[1]);
