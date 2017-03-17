/**
 * Created by brian on 8/20/16.
 */
import { RainDrawer } from './RainDrawer';
import { randomNoiseData } from '../../util/noise';
import { random } from '../../util/math';
import type { PointWithVel } from './RainDrawer';
export { RainDrawer };
const DPI = window.devicePixelRatio || 1;
export type RainDrawerConfiguration={
  acceleration?:number[];
  frameTimeRatio?:number;
  resistance?:number[];
  points?:PointWithVel[];
  vyRange?:number[];
  vxRange?:number[];
  sizeRange:number[];
  vecRange:number[];
  noiseData?:Object;
  pointCountPerThousandPixel?:number;
  sizeEasing?:(t: number)=>number
};
export const defaultRainConfiguration: RainDrawerConfiguration = {
  acceleration: [0, -.1],
  frameTimeRatio: 200,
  resistance: [0, .18, 0],
  vxRange: [-0.06, -.006],
  vyRange: [-0.4, 0],
  sizeRange: [16 * DPI, 32 * DPI],
  pointCountPerThousandPixel: 96
};
export function getRainDrawer(param?: RainDrawerConfiguration): RainDrawer {
  let drawer = new RainDrawer();
  return configRainDrawer(drawer)
}
export function configRainDrawer(drawer: RainDrawer, param?: RainDrawerConfiguration): RainDrawer {
  let cfg: RainDrawerConfiguration = Object.assign({ sizeEasing: Flip.EASE.quadInOut }, defaultRainConfiguration, param);
  drawer.setAcceleration.apply(drawer, cfg.acceleration);
  drawer.setResistance.apply(drawer, cfg.resistance);
  drawer.setNoiseSource((param && param.noiseData) || randomNoiseData({ min: 0, max: 255 }));
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
      y: random(-1, 1),
      x: random(-1, 1),
      z: 0,
      color: `rgba(232,232,232,${random(0.2, 0.9).toFixed(1)})`,
      vx: random(vxRange[0], vxRange[1]),
      vy: random(vyRange[0], vyRange[1]),
      vz: 0,
      size: random(sizeRange[0], sizeRange[1], sizeEasing || Flip.EASE.linear)
    });
  }
  return arr;
}