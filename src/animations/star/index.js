/**
 * Created by brian on 15/03/2017.
 */
/**
 * Created by brian on 08/11/2016.
 */
import { StarDrawer, Star } from './StarDrawer';
import { SpottedStringDrawer } from './SpottedStringDrawer';
export { StarDrawer };
export type { Star };
let defaultSpottedStringDrawer = new SpottedStringDrawer({
  fontFamily:'Microsoft Yahei,Times New Roman, Georgia, Serif'
});
export function getStarDrawer(): StarDrawer {
  let starDrawer = new StarDrawer({
    camera: {
      position: [0, 0, 0],
      lookAt: [0, 0, 1],
      perspective: [Math.PI / 8, 1, -1, -5]
    },
    shinningDuration: 6,
    dragMultiplier: 1 / 20
  });
  let randomPoints = starDrawer.randomPoints({
    sizeRange: [2, 10],
    posMin: [-5, 0.8, -5],
    posMax: [5, 1, 5],
    count: 320,
    posEase: Flip.EASE.sineOut,
    sizeEase: Flip.EASE.quartInOut
  });
  let UCStarts: Star[] = defaultSpottedStringDrawer.getPointFromText('Web AR', { normalize: true, gap: 3 }).map(p => ({
    pos: [1. - p.x, p.y, 2.0],
    radius: 6,
    color: [1, 1, 0]
  }));
  starDrawer.setStars(randomPoints.concat(UCStarts));
  return starDrawer;
}