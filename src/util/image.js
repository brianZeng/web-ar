/**
 * Created by brian on 21/03/2017.
 */
export function loadImageAsync(img: HTMLImageElement|string): Promise<HTMLImageElement> {
  if (typeof img === "string") {
    let src = img;
    img = new Image();
    img.src = src;
    img.crossOrigin='*';
  }
  if (img.complete) {
    return Promise.resolve(img);
  }
  return new Promise((res, rej) => {
    img.addEventListener('load', () => res(img));
    img.addEventListener('error', rej)
  })
}
