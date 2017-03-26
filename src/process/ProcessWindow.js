/**
 * Created by brian on 26/03/2017.
 */
export class ProcessWindow {
  passThreshold: number;
  accumulateThreshold: number;

  constructor() {
    this.accumulateThreshold = 5;
    this.passThreshold = 0.8;
    this._currentIndex = -1;
    this._accumulation = 0;
  }

  get currentIndex() {
    if (this._accumulation > this.accumulateThreshold) {
      return this._currentIndex;
    }
    return -1;
  }

  push(d: number[]) {
    d = Array.from(d);
    let max = Math.max.apply(Math, d);
    if (max > this.passThreshold) {
      let maxIndex = d.indexOf(max);
      if (this._currentIndex == maxIndex) {
        this._accumulation++;
      }
      else {
        this._accumulation = 0;
        this._currentIndex = maxIndex;
      }
    }
    else {
      this._currentIndex = -1;
    }
  }
}