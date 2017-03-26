/**
 * Created by brian on 21/03/2017.
 */
import { WaveStage } from './animations/wave/WaveStage';
import { loadImageAsync } from './util/image';
import { init } from './util/setup';
const images = [
  'http://img03.taobaocdn.com/tfscom/TB1zWcAPVXXXXcyXVXXxKNpFXXX.jpeg',
  'http://img01.taobaocdn.com:80/tfscom/TB1wXlFLXXXXXXdXVXXxKNpFXXX.jpeg'
];
let WAVE_STRENGTH = 0.1;
let WAVE_RADIUS = 0.04;

Promise.all(images.map(loadImageAsync)).then(function (imgs) {
  let wave = new WaveStage({
    waveSpeed: 8
  });
  wave.setBackground(imgs[0], imgs[1]);
  init({
    fullScreen: true,
    drawers: [wave]
  });
  wave.addDrop({
    center: [.5, .5],
    radius: WAVE_RADIUS,
    strength: WAVE_STRENGTH
  });
});
