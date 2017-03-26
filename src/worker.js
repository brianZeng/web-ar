/**
 * Created by brian on 14/03/2017.
 */
import * as net from './net/index';
import type { NeuralNetConstructor } from './net/NeuralNet';
import { MSG_EVENT_INIT_NET, MSG_EVENT_PREDICT, MSG_EVENT_WORKER_READY } from './process/worker-msg';
let net_json = require('./net/net.json');
let global;
let handler = {};
re(MSG_EVENT_INIT_NET, function (arg: NeuralNetConstructor) {
  if (!arg) {
    arg = { json: net_json };
  }
  return net.setup(arg);
});
re(MSG_EVENT_PREDICT, function (imageData: ImageData) {
  let w = net.predict(imageData).w;
  return Array.from(w);
});
setTimeout(function () {
  global = this;
  this.postMessage({ type: MSG_EVENT_WORKER_READY, success: true });
  this.onmessage = function (e) {
    let type = e.data.type;
    let handle = handler[type];
    if (handle) {
      new Promise(function (resolve, reject) {
        try {
          resolve(handle(e.data.data))
        }
        catch (ex) {
          reject(ex)
        }
      }).then(function (data) {
        global.postMessage({ type, data, success: true });
      }, function (error) {
        global.postMessage({ type, data: { message: error.message }, success: false });
      });
    }
  };

}, 0);

function re(type, hand) {
  handler[type] = hand;
}


