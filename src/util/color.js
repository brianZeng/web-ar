/**
 * Created by brian on 8/15/16.
 */
export const COLORS: Array<number[]> = ('f44336,e91e63,9c27b0,673ab7,3f51b5,2196f3,03a9f4,cccccc,' +
'00bcd4,009688,4caf50,8bc34a,cddc39,ffeb3b,ffc107,ff9800,ff5722,795548,9e9e9e,607d8b').split(',')
  .map(s => parseColor('#' + s));
export function randomColorText() {
  let index = Math.round(Math.random() * (COLORS.length - 1));
  let components = COLORS[index];
  return `rgb(${toNumber(0)},${toNumber(1)},${toNumber(2)})`;
  function toNumber(i) {
    return Math.round(components[i] * 255);
  }
}
export function randomColor(): Float32Array {
  let index = Math.round(Math.random() * (COLORS.length - 1));
  return normalizeColor(COLORS[index])
}
export function parseColor(arg: string): Float32Array {
  let components = parseColorText(arg);
  return normalizeColor(components);
}
function normalizeColor(color: number[]): Float32Array {
  let a;
  if (color.length == 3) {
    a = 1;
  }
  else {
    a = color[3];
  }
  return new Float32Array([color[0] / 255, color[1] / 255, color[2] / 255, a])
}
function parseColorText(text: string): number[] {
  if (/^rgba?\(([\d,\.]+)\)/.test(text)) {
    return RegExp.$1.split(',').map(s => +s);
  }
  if (text[0] == '#') {
    let valTex = text.substr(1);
    if (valTex.length == 3) {
      return valTex.match(/[a-f\d]/g).map(s => parseInt(s + s, 16));
    }
    else if (valTex.length == 6) {
      return valTex.match(/[a-f\d]{2}/g).map(s => parseInt(s, 16));
    }
  }
  throw Error('invalid color text:' + text);
}
export function HSVtoRGB(h, s, v) {
  let r, g, b, i, f, p, q, t;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v, g = t, b = p;
      break;
    case 1:
      r = q, g = v, b = p;
      break;
    case 2:
      r = p, g = v, b = t;
      break;
    case 3:
      r = p, g = q, b = v;
      break;
    case 4:
      r = t, g = p, b = v;
      break;
    case 5:
      r = v, g = p, b = q;
      break;
  }
  return [r, g, b, 1];
}
export function RGBtoHSV(r, g, b) {
  let max = Math.max(r, g, b), min = Math.min(r, g, b),
    d = max - min,
    h,
    s = (max === 0 ? 0 : d / max),
    v = max / 255;

  switch (max) {
    case min:
      h = 0;
      break;
    case r:
      h = (g - b) + d * (g < b ? 6 : 0);
      h /= 6 * d;
      break;
    case g:
      h = (b - r) + d * 2;
      h /= 6 * d;
      break;
    case b:
      h = (r - g) + d * 4;
      h /= 6 * d;
      break;
  }

  return [h, s, v];
}