/**
 * Created by brian on 08/11/2016.
 */
const defaultFontFamily = 'Avenir, Helvetica Neue, Helvetica, Arial, sans-serif';
export type Point={
  x:number;
  y:number;
  radius:number;
}
export type VisualPointsConfig={
  gap:number;
  pointRadius:number;
  normalize:boolean;
};
export class SpottedStringDrawer {
  textColor: any;
  fontFamily: string;
  text: string;
  fontSize: number;
  canvas: HTMLCanvasElement;

  constructor({ textColor = '#fff', fontSize = 160, fontFamily = defaultFontFamily, canvas }={}) {
    this.textColor = textColor;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.canvas = canvas || document.createElement('canvas');
  }

  get ctx(): CanvasRenderingContext2D {
    return this.canvas.getContext('2d');
  }

  getPointFromText(text: string, cfg: VisualPointsConfig): Point[] {
    let { ctx, canvas }=this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawText(text);
    return this.getVisualPoints(cfg);
  }

  drawText(text) {
    let { fontSize, fontFamily, ctx, canvas }=this, fs;
    ctx.font = getFontString(fontSize, fontFamily);
    fs = Math.min(fontSize,
      (canvas.width / ctx.measureText(text).width) * 0.8 * fontSize,
      (canvas.height / fontSize) * (isNumber(text) ? 1 : 0.8) * fontSize);
    ctx.font = getFontString(fs, fontFamily);
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.textColor;
    ctx.fillText(text, canvas.width / 2, 0, canvas.width);
  }

  getVisualPoints(cfg: VisualPointsConfig = {}): Array<Point> {
    let gap = cfg.gap || 6;
    let radius = cfg.pointRadius || 2;
    let { ctx, canvas }=this;
    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height),
      pixels = imgData.data,
      points = [],
      lineWidth = imgData.width;
    let normalize = cfg.normalize;
    let totalWidth = cfg.normalize ? canvas.width : 1;
    let totalHeight = cfg.normalize ? canvas.height : 1;
    for (let pixel = 0, plen = pixels.length, x = 0, y = 0; pixel < plen; pixel += 4 * gap) {
      if (pixels[pixel + 3] > 0) {

        let point = {
          x: normalize ? (x + gap) / totalWidth : (x + gap),
          y: normalize ? 1 - (y + gap) / totalHeight : (y + gap),
          radius
        };
        points.push(point);
      }
      x += gap;
      if (x >= lineWidth) {
        x = 0;
        y += gap;
        pixel += gap * 4 * lineWidth;
      }
    }
    return points;
  }
}
function getFontString(size, family) {
  return `bold ${size}px "${family}"`
}
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}