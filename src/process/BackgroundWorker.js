/**
 * Created by brian on 22/03/2017.
 */
import { MSG_EVENT_WORKER_READY } from './worker-msg';
export class BackgroundWorker {
  ready: boolean;
  busy: boolean;

  constructor(src) {
    let worker = this._worker = new Worker(src);
    let handler = this._handler = {};
    this.busy = false;
    this.ready = false;
    let self = this;
    worker.onmessage = function (e) {
      let msg = e.data;
      let type = msg.type;
      if (type == MSG_EVENT_WORKER_READY) {
        self.ready = true;
      }
      let handle = handler[msg.type];
      if (handle) {
        handle[msg.success ? 0 : 1](msg.data);
      }
      self.busy = false;
    };
    worker.onerror = function (e) {
      self.busy = false;
      console.error('worker error:', e);
    };
  }

  postMessage(type, data, transfer) {
    if (!this.busy && this.ready) {
      this._worker.postMessage({ type, data }, transfer || []);
      this.busy = false;
    }
  }

  onmessage(type, onsuccess, onFail) {
    this._handler[type] = [onsuccess || noop, onFail || noop];
  }
}
function noop() {

}