export function forEach(object, callback, thisObj) {
  if (isObj(object)) {
    if (thisObj === void 0) {
      thisObj = object;
    }
    if (object instanceof Array || object.hasOwnProperty('length')) {
      for (let i = 0, len = object.length; i < len; i++) {
        callback.call(thisObj, object[i], i);
      }
    } else {
      for (let name in object) {
        if (object.hasOwnProperty(name)) {
          callback.call(thisObj, object[name], name)
        }
      }
    }
  }
  return object;
}

export function isFunc(any) {
  return typeof any === 'function';
}
export function isObj(any) {
  return any && (typeof any === 'object');
}
export function isStr(any) {
  return typeof any === "string";
}
export function noop() {
}
