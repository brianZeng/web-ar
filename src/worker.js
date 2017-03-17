/**
 * Created by brian on 14/03/2017.
 */
import * as net from './net/index';
import * as msg from './util/msg';
let global;

setTimeout(function () {
  global = this;
  this.postMessage({ type: msg.MSG_EVENT_WORKER_READY });
  this.onmessage = function (e) {
    let type = e.data.type;
    let handle = handler[type];
    if (handle) {
      let ret = handle(e.data.data);
      if (!(ret instanceof Promise)) {
        ret = Promise.resolve(ret)
      }
      ret.then(function (data) {
        global.postMessage({ type, data, success: true });
      });
    }
  };

}, 0);
let handler = {};
function re(type, handler) {
  handler[type] = handler;
}


