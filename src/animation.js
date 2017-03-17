/**
 * Created by brian on 15/03/2017.
 */
import { AnimationManager, ANIMATION_STAR } from './animations/index';

let mng = new AnimationManager();
Flip.instance.add(mng.pipeline);
document.body.appendChild(mng.pipeline.canvas);
mng.pipeline.init();
mng.transitionAnimationAsync(ANIMATION_STAR);

