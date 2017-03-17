export function random(min, max, easeFunc: (n: number)=>number): number {
  let r = Math.random();
  if (easeFunc) {
    r = easeFunc(r);
  }
  return r * (max - min) + min;
}
export function parseSqrt(num): number[] {
  let sqrt = Math.sqrt(num), x = Math.ceil(sqrt), y = Math.floor(sqrt);
  return x * y >= num ? [x, y] : [x, y + 1]
}
export function mapRange(from: number, to: number, percent: number): number {
  return from + (to - from) * percent;
}
export function vec3RotateX(a, b, c) {
  var p = [], r = [];
  let out = [];
  //Translate point to the origin
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];

  //perform rotation
  r[0] = p[0];
  r[1] = p[1] * Math.cos(c) - p[2] * Math.sin(c);
  r[2] = p[1] * Math.sin(c) + p[2] * Math.cos(c);

  //translate to correct position
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];

  return out;
}
export function vec3RotateY(a, b, c) {
  var p = [], r = [];
  let out = [];
  //Translate point to the origin
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];

  //perform rotation
  r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c);

  //translate to correct position
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];

  return out;
}
