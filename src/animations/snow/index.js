import { defaultRainConfiguration, configRainDrawer } from '../rain';
import type { RainDrawerConfiguration } from '../rain';
import { SnowDrawer } from './SnowDrawer';
export { SnowDrawer };
const DPI = window.devicePixelRatio || 1;
export const defaultSnowConfiguration: RainDrawerConfiguration = Object.assign({}, defaultRainConfiguration, {
  pointCountPerThousandPixel: 180,
  resistance: [0.2 / DPI, 5.6 / DPI, 0],
  vxRange: [-0.02 * DPI, 0.02 * DPI],
  vyRange: [-0.04, 0],
  sizeRange: [2 * DPI, 8 * DPI]
});
export function getSnowDrawer(configuration?: RainDrawerConfiguration): SnowDrawer {
  let drawer = new SnowDrawer();
  let config = Object.assign(defaultSnowConfiguration, { sizeEasing: Flip.EASE.quartIn }, configuration);
  return configRainDrawer(drawer, config);
}