/**
 * Created by brian on 10/03/2017.
 */
declare var Flip: Flip;
import { OpeningFilter } from './filters/OpeningFilter';
import { SobelEdgeFilter } from './filters/SobelEdgeFilter';
import { GLFilter } from './filters/GLFilter';
export type ProcessFrame={
  x:number;
  y:number;
  size:number;
}
export class VideoStage extends Flip.GL.Stage {

  createScenes() {
    let edgeFilter = new SobelEdgeFilter({ name: 'edge', threshold: 0.6 });
    let processFilter = new OpeningFilter({ name: 'process' });
    let copyFilter = new GLFilter({ name: 'origin' });
    edgeFilter.setTarget(processFilter);
    return [copyFilter, edgeFilter, processFilter];
  }

  get processFrame(): ProcessFrame {
    return this._processFrame;
  }

  set processFrame(frame: ProcessFrame) {
    let size = this._size;
    let transform = new Flip.Mat3();
    if (size && frame) {
      transform.translate(frame.x, frame.y).scale(frame.size / size[0], frame.size / size[1]);
    }
    this.getScene('edge').transformFilterRegion(transform);
    this.getScene('process').transformFilterRegion(transform);
    this._processFrame = frame;
  }

  set source(s) {
    this.getScene('edge').source = s;
    this.getScene('origin').source = s;
  }

  set size(s) {
    let size = [+s[0], +s[1]];
    this.getScene('edge').size = size;
    this.getScene('process').size = size;
    this._size = size;
    this.processFrame = this.processFrame;
  }

  captureFrame(gl: WebGLRenderingContext, frame: ?ProcessFrame): ImageData {
    frame = frame || this.processFrame;
    let cx = gl.drawingBufferWidth * (frame.x / 2 + .5);
    let cy = gl.drawingBufferHeight * (frame.y / 2 + .5);
    let size = frame.size;
    let half = size / 2;
    let data = new Uint8Array(size * size * 4);
    gl.readPixels(cx - half, cy - half, size, size, gl.RGBA, gl.UNSIGNED_BYTE, data);
    return new ImageData(new Uint8ClampedArray(data), size, size);
  }
}
