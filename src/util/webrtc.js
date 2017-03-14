/**
 * Created by brian on 03/03/2017.
 */
export function getCameraVideoOfSizeAsync(size: ?number[]): Promise<HTMLVideoElement> {
  if (!size) {
    size = [DEF_VIDEO_WIDTH, DEF_VIDEO_HEIGHT];
  }
  return new Promise((res, rej) => {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: size[0],
        height: size[1]
      }
    }).then(stream => {
      let video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      video.addEventListener('canplay', function h() {
        res({ video, size });
        video.removeEventListener('canplay', h);
      });
    }, rej);
  });
}
export const DEF_VIDEO_WIDTH = 640, DEF_VIDEO_HEIGHT = 480;
