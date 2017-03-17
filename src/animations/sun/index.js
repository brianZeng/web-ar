/**
 * Created by brian on 12/10/2016.
 */
import { VertexSunDrawer, VertexSunDrawerConstructor } from './VertexSunDrawer';
import { VertexSunLightAnimateParam } from './VertexSunDrawer';
import { HSVtoRGB } from '../../util/color';
import { mapRange } from '../../util/math';
export { VertexSunDrawer };
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
    lensFlares: [
      {
        radius: 0.16,
        distance: 0,
        color: LENS_FLARE_COLOR
      },
      {
        radius: 0.06,
        distance: 0.4,
        color: LENS_FLARE_COLOR
      },
      {
        radius: 0.12,
        distance: 0.8,
        color: LENS_FLARE_COLOR
      },
      {
        radius: 0.2,
        distance: 1.6,
        color: LENS_FLARE_COLOR
      }
    ],
    triangleCount: 180
  }
};
export function getVertexSunDrawer(arg: VertexSunDrawerConstructor = {}): VertexSunDrawer {
  let cfg = {
    camera: Object.assign({}, DEF_CONFIG.camera, arg.camera),
    sunlight: Object.assign({}, DEF_CONFIG.sunlight, arg.sunlight)
  };
  return new VertexSunDrawer(cfg);
}
const SUN_COLOR_H0 = 19 / 360, SUN_COLOR_S0 = .28, SUN_COLOR_V0 = 1;
const SUN_COLOR_H1 = 19 / 360, SUN_COLOR_S1 = .07, SUN_COLOR_V1 = 1;

export function getVertexSunDrawerAnimateParam(percent: number = 0): VertexSunLightAnimateParam {
  let cp = (percent > 0.5 ? (1.0 - percent) : percent) * 2;
  let color = HSVtoRGB(
    mapRange(SUN_COLOR_H0, SUN_COLOR_H1, cp),
    mapRange(SUN_COLOR_S0, SUN_COLOR_S1, cp),
    mapRange(SUN_COLOR_V0, SUN_COLOR_V1, cp)
  );
  return {
    lightTargetHeight: -.5,
    lightTargetRadius: 3,
    rotateRadius: 2.2,
    percent,
    color
  }
}