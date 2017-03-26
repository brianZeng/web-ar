/**
 * Created by brian on 14/03/2017.
 */
import { MoonDrawer } from './MoonDrawer';
import { mapRange } from '../../util/math';
export type { MoonDrawer };
export function getMoonDrawer(parse): MoonDrawer {
  let drawer = new MoonDrawer();
  drawer.moonColor = [254 / 255, 248 / 255, 200 / 255];
  drawer.shadowByMoonPhrase(parse || 0.1, mapShadowX);
  return drawer;
}
function mapShadowX(x) {
  // x near to 0 cases aliasing
  let mul = x < 0 ? -1 : 1;
  return mapRange(0.3, 1, Math.abs(x)) * mul;
}