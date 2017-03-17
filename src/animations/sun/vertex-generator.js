/**
 * Created by brian on 12/10/2016.
 */
export const DEFAULT_SECTION_COUNT = 160;
export function generateCircleTriangleFanData(triangleCount: number = DEFAULT_SECTION_COUNT, radius: number = 1, aspect: number = 1): Float32Array {
  let z = 0;
  let count = triangleCount - 2;
  let data = new Float32Array(triangleCount * 4);
  data[0] = data[1] = 0;
  data[2] = z;
  data[3] = 1;
  for (let i = 0, dataIndex = 4, angle = Math.PI * 2 / count; i <= count; i++) {
    let rotate = angle * i;
    data[dataIndex++] = Math.cos(rotate) * radius;
    data[dataIndex++] = Math.sin(rotate) * radius * aspect;
    data[dataIndex++] = z;
    data[dataIndex++] = 0;
  }
  return data;
}