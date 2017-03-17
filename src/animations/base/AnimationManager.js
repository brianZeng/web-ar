/**
 * Created by brian on 17/03/2017.
 */
import  type { GLDrawer } from './GLDrawer';
import { getMoonDrawer, MoonDrawer } from '../moon';
import { getRainDrawer, RainDrawer } from '../rain';
import { getSnowDrawer, SnowDrawer } from '../snow';
import { getVertexSunDrawer, VertexSunDrawer, getVertexSunDrawerAnimateParam } from '../sun';
import { getStarDrawer, StarDrawer } from '../star';
import { mapRange } from '../../util/math';
import { GLRenderPipeline, CANVAS_DISPLAY_MODE_FULL_SCREEN } from './GLRenderPipeline';
import {
  ANIMATION_SUN,
  ANIMATION_MOON,
  ANIMATION_SNOW,
  ANIMATION_STAR,
  ANIMATION_NONE,
  ANIMATION_RAIN,
  AnimationType
} from './const';
const Promise = Flip.Promise;
const ANIMATION_TYPES = [ANIMATION_NONE, ANIMATION_SUN, ANIMATION_STAR, ANIMATION_SNOW, ANIMATION_RAIN, ANIMATION_MOON];
const MOON_ROTATE_PERCENT = 0.65;
export class AnimationManager {
  pipeline: GLRenderPipeline;

  constructor() {
    this.pipeline = new GLRenderPipeline({
      canvas: document.createElement('canvas'),
      display: CANVAS_DISPLAY_MODE_FULL_SCREEN
    });
    this.animations = {};
    this._currentAnimations = [];
    this.transioning = false;
  }

  transitionAnimationAsync(type: AnimationType): Promise {
    if (this.transioning) {
      return Promise.reject()
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
      }
      else {
        fadeIns.push(ani);
      }
    }
    let fadeOuts = currentAnimations.filter(ani => ani);
    return Promise.all([
      Promise.all(fadeIns.map(ani => this.fadeAnimationAsync(ani, true))),
      Promise.all(fadeOuts.map(ani => this.fadeAnimationAsync(ani, false)))
    ]).then(() => {
      this._currentAnimations = targetAnimations;
      fadeOuts.forEach(a => a.disabled = true);
      this.transioning = false;
    })
  }

  fadeAnimationAsync(animation: GLDrawer|AnimationType, fadeIn) {
    if (Number.isInteger(animation)) {
      animation = this.getAnimation(animation);
    }
    if (animation.type == ANIMATION_SUN) {
      return this.fadeSunAsync(animation, fadeIn);
    } else if (animation.type == ANIMATION_RAIN || animation.type == ANIMATION_SNOW) {
      return this.fadeRainAsync(animation, fadeIn);
    } else if (animation.type == ANIMATION_MOON) {
      return this.fadeMoonAsync(animation, fadeIn);
    } else if (animation.type == ANIMATION_STAR) {
      return this.fadeStarAsync(animation, fadeIn);
    }
    return Promise.resolve();
  }

  fadeStarAsync(animation: StarDrawer, fadeIn): Promise {
    return Flip.animate({
      duration: .7,
      ease: Flip.EASE.sineInOut,
      onUpdate(){
        animation.opacity = fadeIn ? this.percent : 1 - this.percent;
      }
    }).promise
  }

  fadeMoonAsync(animation: MoonDrawer, fadeIn): Promise {
    let duration, ease;
    if (fadeIn) {
      duration = 2.7;
      ease = Flip.EASE.sineInOut;
    }
    else {
      duration = 2;
      ease = Flip.EASE.quartIn;
    }
    return Flip.animate({
      duration, ease,
      onUpdate(){
        let p = fadeIn ? (1 - MOON_ROTATE_PERCENT * this.percent) : mapRange(1 - MOON_ROTATE_PERCENT, 0, this.percent);
        animation.position = animation.calRotatePos(Math.PI * p);
      }
    }).promise;
  }

  fadeRainAsync(animation: RainDrawer, fadeIn): Promise {
    let duration = fadeIn ? 2.7 : .7;
    return Flip.animate({
      duration,
      onUpdate(){
        animation.rainEffectIntensity = fadeIn ? this.percent : 1 - this.percent;
      }
    }).promise
  }

  fadeSunAsync(animation: VertexSunDrawer, fadeIn): Promise {
    if (fadeIn) {
      animation.setSunColor({ a: 1 });
      animation.sunlightRotateParam = [0, 0];
      let startTimeRatio = 0;
      let totalRotateRatio = 0.7;
      return Flip.animate({
        duration: Math.abs(totalRotateRatio) * 8,
        ease: Flip.EASE.sineInOut,
        onUpdate() {
          let { percent }= this;
          changeSunByDayPercent(animation, percent * totalRotateRatio + startTimeRatio);
        }
      }).promise;
    }
    else {
      return Flip.animate({
        duration: .7,
        ease: Flip.EASE.sineInOut,
        onUpdate(){
          let opacity = 1 - this.percent;
          animation.lensFlaresIntensity = opacity;
          animation.setSunColor({ a: opacity });
        }
      }).promise
    }
  }

  getAnimation(type: AnimationType): GLDrawer {
    let animation: GLDrawer = this.animations[type];
    if (!animation) {
      if (type == ANIMATION_MOON) {
        animation = getMoonDrawer(0);
      }
      else if (type == ANIMATION_RAIN) {
        animation = getRainDrawer();
      }
      else if (type == ANIMATION_SNOW) {
        animation = getSnowDrawer();
      }
      else if (type == ANIMATION_SUN) {
        animation = getVertexSunDrawer();
      }
      else if (type == ANIMATION_STAR) {
        animation = getStarDrawer();
      }
      else {
        animation = new GLDrawer();
      }
      this.animations[type] = animation;
      animation.disabled = true;
      this.pipeline.addDrawer(animation);
    }
    return animation;
  }
}
function changeSunByDayPercent(sunDrawer, percent) {
  sunDrawer.rotatePositionAndDirection(getVertexSunDrawerAnimateParam(percent));
  sunDrawer.lensFlaresIntensity = mapRange(0, 0.3, Math.sin(Math.PI * percent));
  sunDrawer.invalid();
}