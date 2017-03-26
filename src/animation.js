/**
 * Created by brian on 15/03/2017.
 */
import {
  AnimationManager,
  ANIMATION_STAR,
  ANIMATION_MOON,
  ANIMATION_SNOW,
  ANIMATION_RAIN,
  ANIMATION_SUN,
  ANIMATION_NONE
} from './animations/index';
export * from'./animations';
import { WaveStage } from './animations/wave/WaveStage';
import { loadImageAsync } from './util/image';
const BG_IMGS = {
  night: Flip.$('img.night'),
  snow: Flip.$('img.snow'),
  sun: Flip.$('img.sun'),
  rain: Flip.$('img.rain'),
  none: Flip.$('img.none')
};
let wave = new WaveStage({ waveSpeed: 8 });
let mng = new AnimationManager();
let currentImg: HTMLImageElement;
mng.pipeline.addDrawer(wave);
loadImageAsync(BG_IMGS.none).then(init);
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
export function isTransitioning(): boolean {
  return transitioning;
}
export function transitionAnimationAsync(type: string) {
  if (!transitioning) {
    let nextAnimation = ANIMATION_NONE;
    let nextBG = BG_IMGS.none;
    if (type.indexOf('snow') > -1) {
      nextAnimation |= ANIMATION_SNOW;
      nextBG = BG_IMGS.snow;
    }
    else if (type.indexOf('rain') > -1) {
      nextAnimation |= ANIMATION_RAIN;
      nextBG = BG_IMGS.rain;
    }
    else if (type.indexOf('sun') > -1) {
      nextAnimation |= ANIMATION_SUN;
      nextBG = BG_IMGS.sun;
    }
    else if (type.indexOf('moon') > -1) {
      nextAnimation |= ANIMATION_MOON | ANIMATION_STAR;
      nextBG = BG_IMGS.night;
    }
    transitioning = true;
    return backgroundTransitionAsync(nextBG).then(() => mng.transitionAnimationAsync(nextAnimation)).then(() => transitioning = false);
  }
  return Promise.reject('transitioning');
}
function backgroundTransitionAsync(src): Promise {
  if (src !== currentImg.src) {
    let nextImg;
    return loadImageAsync(src).then(function (img) {
      return wave.transitionBackgroundAsync(currentImg, nextImg = img);
    }).then(() => currentImg = nextImg)
  }
  return Promise.resolve(currentImg);
}


