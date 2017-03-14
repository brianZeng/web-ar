/**
 * Created by brian on 13/03/2017.
 */
const task = new Flip.GL.Task({
  name: 'test-gl'
});

export function init(fullScreen) {
  let cvs = task.canvas = Flip.$('#gl-cvs');
  if (fullScreen) {
    resize();
    window.addEventListener('resize', resize)
  }
  task.init({ preserveDrawingBuffer: true });
  Flip.instance.add(task);
  function resize() {
    cvs.width = document.documentElement.clientWidth;
    cvs.height = document.documentElement.clientHeight;
  }
}
export function setGLCanvasSize(width, height) {
  let cvs = Flip.$('#gl-cvs');
  cvs.width = width;
  cvs.height = height;
}
export function addScenes() {
  for (let i = 0; i < arguments.length; i++) {
    let scene = arguments[i];
    task.add(scene);
  }
}
export function createRenderTask(canvas, name): Flip.GL.Task {
  let task = new Flip.GL.Task({ name, canvas });
  task.init();
  Flip(function () {
    Flip.instance.add(task);
  });
  return task;
}