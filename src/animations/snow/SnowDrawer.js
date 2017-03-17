/**
 * Created by brian on 8/20/16.
 */
import { RainDrawer } from '../rain/RainDrawer';
import { ANIMATION_SNOW } from '../base/const';
export class SnowDrawer extends RainDrawer {
  classConfigureArgument() {
    return {
      define: {
        DRAW_SNOW: 1
      }
    }
  }

  get type() {
    return ANIMATION_SNOW;
  }

  onDrag(events) {
    let evt: PointEvent = events[0];
    let dragVec = evt.accumulatedX / (evt.timeStamp - evt.startTime);
    if (Math.abs(dragVec) > 0.5) {
      this.setAcceleration(this.getDragAcceleration(dragVec));
      setTimeout(() => this.setAcceleration(0), 1000);
    }
  }

  getDragAcceleration(v: number) {
    return v > 0 ? 0.01 : -0.01;
  }
}