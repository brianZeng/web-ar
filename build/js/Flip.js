(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() : typeof define === 'function' && define.amd ? define(factory) : factory();
})(undefined, function () {
  'use strict';

  const hasOwnProperty = Object.prototype.hasOwnProperty;
  function forEach(object, callback, thisObj) {
    if (isObj(object)) {
      if (thisObj === void 0) {
        thisObj = object;
      }
      if (object instanceof Array || 'length' in object) {
        let arr = Array.prototype.slice.call(object);
        arr.forEach(callback, thisObj);
      } else {
        for (let name in object) {
          if (hasOwnProperty.call(object, name)) {
            callback.call(thisObj, object[name], name);
          }
        }
      }
    }
    return object;
  }

  function isFunc(any) {
    return typeof any === 'function';
  }
  function isObj(any) {
    return typeof any === 'object' && any;
  }
  function isStr(any) {
    return typeof any === "string";
  }

  /**
   * Created by brian on 8/21/16.
   */
  function arrAdd(array, item) {
    if (array.indexOf(item) == -1) {
      array.push(item);
      return true;
    }
    return false;
  }

  function arrRemove(array, item) {
    var i = array.indexOf(item);
    if (i >= 0) {
      array.splice(i, 1);
      return true;
    }
    return false;
  }

  /**
   * Created by brian on 8/21/16.
   */
  class EventEmitter {

    on(eventName, handler, once = false) {
      addEventListener(this, eventName, handler, once);
      return this;
    }

    once(eventName, handler) {
      return this.on(eventName, handler, true);
    }

    off(eventName, handler) {
      removeEventListener(this, eventName, handler);
      return this;
    }

    emit(eventName, args, thisObj) {
      emitEvent(this, eventName, args, thisObj);
      return this;
    }

  }
  function addEventListener(obj, evtName, handler, once) {
    if (typeof evtName == "string" && evtName && isFunc(handler)) {
      var cbs, hs;
      if (!obj.hasOwnProperty('__callbacks')) {
        obj.__callbacks = {};
      }
      cbs = obj.__callbacks;
      if (!(hs = cbs[evtName])) {
        hs = cbs[evtName] = [];
      }
      return arrAdd(hs, once ? warpOnceFunc(handler) : handler);
    }
    return false;
  }
  function emitEvent(obj, evtName, argArray, thisObj) {
    var callbacks, handlers;
    if (!obj.hasOwnProperty('__callbacks') || !(handlers = (callbacks = obj.__callbacks)[evtName])) {
      return false;
    }
    if (!argArray) {
      argArray = [];
    } else if (!(argArray instanceof Array)) {
      argArray = [argArray];
    }
    if (thisObj === undefined) {
      thisObj = obj;
    }
    return callbacks[evtName] = handlers.reduce(function (next, call) {
      if (isFunc(call) && call.apply(thisObj, argArray) !== -1) {
        next.push(call);
      }
      return next;
    }, []);
  }
  function removeEventListener(obj, evtName, handler) {
    var cbs, hs, i;
    if (evtName === undefined) {
      obj.__callbacks = {};
    } else if ((cbs = obj.__callbacks) && (hs = cbs[evtName]) && hs) {
      if (handler) {
        if ((i = hs.indexOf(handler)) > -1) {
          hs[i] = null;
        }
      } else {
        cbs[evtName] = [];
      }
    }
    return obj;
  }
  function warpOnceFunc(func) {
    return function () {
      func.apply(this, arguments);
      return -1;
    };
  }

  /**
   * Created by brian on 02/12/2016.
   */
  const INVALID_KEY = createPrivateMemberName('isInvalid');

  const DISABLED_KEY$1 = createPrivateMemberName('disabled');
  function setDisposed(target) {
    target[DISABLED_KEY$1] = true;
  }
  function getDisposed(target) {
    return target ? target[DISABLED_KEY$1] : false;
  }
  function createPrivateMemberName(name) {
    return isFunc(window.Symbol) ? Symbol(name) : `_${name}`;
  }
  function isInvalid(obj) {
    return obj && obj[INVALID_KEY];
  }
  function setInvalid(obj, invalid) {
    if (obj) {
      obj[INVALID_KEY] = invalid;
    }
  }

  /**
   * Created by brian on 8/21/16.
   */
  const DISABLED_KEY = createPrivateMemberName('disabled');
  class PureRender {
    update(e) {}

    render(e) {}

    dispose(e) {}
  }
  /**
   * @memberOf Flip
   */
  class Render extends EventEmitter {

    constructor(arg) {
      super();
      if (arg && arg.name) {
        this.name = arg.name;
      }
      this.invalid();
    }

    get parent() {
      return this._parent;
    }

    set parent(parent) {
      if (!parent || !this._parent) {
        this._parent = parent;
      } else if (parent != this._parent) {
        throw Error('explicitly remove render parent before add another');
      }
    }

    update(e) {}

    invalid() {
      if (this.parent) {
        this.parent.invalid();
      }
      setInvalid(this, true);
    }

    render(e) {
      setInvalid(this, false);
    }

    dispose(e) {
      setDisposed(this);
    }

    removeFromParent() {
      if (this.parent) {
        return this.parent.removeChild(this);
      }
      return false;
    }

    get disabled() {
      return this[DISABLED_KEY];
    }

    get disposed() {
      return getDisposed(this);
    }

    set disabled(v) {
      if (this.disabled != v) {
        this[DISABLED_KEY] = v;
        this.invalid();
      }
    }
  }
  function isRender(obj) {
    return obj instanceof PureRender || obj instanceof Render;
  }

  /**
   * Created by brian on 8/28/16.
   */
  const _hasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwnProperty$1(obj, key) {
    return _hasOwnProperty.call(obj, key);
  }
  function makeOptions(opt, defaults) {
    let ret = Object.create(null);
    opt = isObj(opt) ? opt : {};
    forEach(defaults, (defaultValue, key) => ret[key] = hasOwnProperty$1(opt, key) ? opt[key] : defaultValue);
    return ret;
  }
  function objAssign(target) {
    if (!target) {
      throw Error('target is not object');
    }
    for (let i = 0; i < arguments.length; i++) {
      let source = arguments[i];
      clonePropertiesFrom(target, source);
    }
    return target;
  }
  function objFind(obj, test) {
    if (isObj(obj)) {
      for (let key in obj) {
        if (_hasOwnProperty.call(obj, key)) {
          let val = obj[key];
          if (test.call(obj, val, key)) {
            return val;
          }
        }
      }
    }
  }
  function clonePropertiesFrom(source, target) {
    forEach(target, (val, key) => source[key] = val);
  }

  /**
   * Created by brian on 8/28/16.
   */
  function capitalizeString(str) {
    if (!str) {
      return '';
    }
    return str[0].toUpperCase() + str.substring(1);
  }
  function stringTemplate(stringTemplate) {
    var arg = arguments,
        r;
    return stringTemplate.replace(/\$\{(\d+)}/g, function ($i, i) {
      return (r = arg[i]) == undefined ? $i : formatNum(r);
    });
  }
  function formatNum(value) {
    return isNaN(value) ? value + '' : Number(value).toFixed(5).replace(/\.0+$/, '');
  }

  const slice = Array.prototype.slice;
  function $$(slt, ele) {
    return slice.apply((ele || document).querySelectorAll(slt));
  }
  /**
   * @memberOf Flip
   */
  function $(slt, ele) {
    return (ele || document).querySelector(slt);
  }
  function createElement(tagName, attributes, innerHTML) {
    let ele = document.createElement(tagName);
    forEach(attributes, function (val, name) {
      ele.setAttribute(name, val);
    });
    if (isStr(innerHTML)) {
      ele.innerHTML = innerHTML;
    }
    return ele;
  }

  /**
   * Created by brian on 14/10/2016.
   */
  const requestAnimationFrame = func => {
    window.requestAnimationFrame(func);
  };

  /**
   * Created by brian on 8/28/16.
   */

  /**
   * Created by brian on 8/28/16.
   */
  const EVENT_INIT = 'init';
  const EVENT_ITERATE = 'iterate';
  const EVENT_REVERSE = 'reverse';
  const EVENT_START = 'start';
  const EVENT_HOLD = 'hold';
  const EVENT_PAUSE = 'pause';
  const EVENT_RESUME = 'resume';
  const EVENT_CANCEL = 'cancel';
  const EVENT_UPDATE = 'update';
  const EVENT_END = 'end';
  const EVENT_RENDER_START = 'renderStart';
  const EVENT_RENDER_END = 'renderEnd';
  const EVENT_FRAME_START = 'frameStart';
  const EVENT_FRAME_END = 'frameEnd';

  /**
   * Created by brian on 16/10/2016.
   */
  class TreeRender extends Render {

    constructor(arg) {
      super(arg);
      this.children = [];
      this._disposableItems = [];
      this.parent = null;
    }

    add(child) {
      return this.addChild(child);
    }

    remove(child) {
      return this.removeChild(child);
    }

    addChild(child) {
      if (isRender(child)) {
        if (getDisposed(child)) {
          throw Error('disposed child should not be added again');
        }
        if (arrAdd(this.children, child)) {
          child.parent = this;
          this.invalid();
          return true;
        }
      }
      return false;
    }

    removeChild(child) {
      if (child.parent === this) {
        arrRemove(this.children, child);
        child.parent = null;
        arrAdd(this._disposableItems, child);
        this.invalid();
        return true;
      }
      return false;
    }

    findChild(find, recursive) {
      let children = this.children;
      let target = children.find(find);
      if (!target && recursive) {
        for (let i = 0; i < children.length; i++) {
          let child = children[i];
          if (child instanceof TreeRender) {
            let target = child.findChild(find, true);
            if (isRender(target)) {
              break;
            } else {
              target = null;
            }
          }
        }
      }
      return target;
    }

    dispose(e) {
      super.dispose(e);
      this.children.forEach(c => c.dispose(e));
      this.disposeRemovedItems(e);
    }

    disposeRemovedItems(e) {
      if (this._disposableItems.length) {
        this._disposableItems.forEach(c => c.dispose(e));
        this._disposableItems = [];
        this.invalid();
      }
    }

    render(state) {
      super.render(state);
      this.beforeRenderChildren(state);
      this.renderChildren(state);
      this.afterRenderChildren(state);
    }

    beforeRenderChildren(state) {}

    afterRenderChildren(state) {}

    update(e) {
      super.update(e);
      this.updateSelf(e);
      this.updateChildren(e);
    }

    updateSelf(e) {}

    updateChildren(e) {
      forEach(this.children, function (child) {
        if (isRender(child) && !child.disabled) {
          child.update(e);
        }
      });
    }

    renderChildren(state) {
      forEach(this.children, function (renderable) {
        if (isRender(renderable) && !renderable.disabled) {
          renderable.render(state);
        }
      });
    }

    invalid() {
      super.invalid();
      if (this.parent) {
        this.parent.invalid();
      }
    }
  }

  /**
   * Created by brian on 8/28/16.
   */
  const TICKS_PER_SECOND = 1000;
  class TimeLine extends EventEmitter {

    constructor() {
      super();
      this.last = this.now = this._stopTime = 0;
      this._startTime = this._lastStop = Date.now();
      this.ticksPerSecond = TICKS_PER_SECOND;
      this._isStop = true;
    }

    stop() {
      if (!this._isStop) {
        this._isStop = true;
        this._lastStop = Date.now();
        return true;
      }
    }

    start() {
      if (this._isStop) {
        this._isStop = false;
        this._stopTime += Date.now() - this._lastStop;
        return true;
      }
    }

    tick() {
      if (!this._isStop) {
        this.last = this.now;
        this.now = Date.now() - this._startTime - this._stopTime;
        return true;
      }
    }

    get advancedTimeInterval() {
      return this.now - this.last;
    }
  }

  /**
   * Created by brian on 8/21/16.
   */
  class RenderTask extends TreeRender {

    constructor(arg) {
      super();
      this.name = arg.name;
      this.timeLine = new TimeLine();
      this.clocks = [];
    }

    init() {
      this.timeLine.start();
    }

    addClock(clock) {
      return arrAdd(this.clocks, clock);
    }

    removeClock(clock) {
      return arrRemove(this.clocks, clock);
    }

    render(state) {
      this.emit(EVENT_RENDER_START, [state]);
      super.render(state);
      this.emit(EVENT_RENDER_END, [state]);
    }

    update(e) {
      this.timeLine.tick();
      if (this.clocks.length) {
        this.clocks.slice().forEach(c => c.update(e));
      }
      this.disposeRemovedItems(e);
      forEach(this.children, function recursive(renderable) {
        if (isRender(renderable) && !renderable.disabled) {
          if (!renderable.disabled) {
            renderable.update(e);
            forEach(renderable.children, recursive);
          }
        }
      });
      this.emit(EVENT_UPDATE, [e]);
    }

    invalid() {
      super.invalid();
      if (this.global) {
        this.global.invalid();
      }
    }
  }

  /**
   * Created by brian on 14/10/2016.
   */
  class RenderApplication {

    renderGlobalInitialized(global) {}

    setupRenderState(state) {}

    applyRenderState(state) {}

    removeFromGlobal(global) {}

  }

  const RENDER_STATE_PHRASE_UPDATE = 'update'; /**
                                                       * Created by brian on 8/28/16.
                                                       */

  const RENDER_STATE_PHRASE_IDLE = 'idle';
  const RENDER_STATE_PHRASE_RENDER = 'render';
  const RENDER_STATE_PHRASE_APPLY = 'apply';
  class RenderState {

    get timeLine() {
      let task = this.task;
      return task ? task.timeLine : null;
    }

    constructor({ task, global }) {
      this.task = task;
      this.global = global;
      this.phrase = RENDER_STATE_PHRASE_IDLE;
    }

    willDisposeClock(clock) {
      this.task.removeClock(clock);
    }

    willDispose(any) {}

    dispose() {}
  }

  /**
   * Created by brian on 14/10/2016.
   */
  class RenderGlobal extends EventEmitter {

    constructor() {
      super();
      this._tasks = {};
      this.defaultTaskName = 'default';
      this.applications = this.getRenderApplications();
    }

    init() {
      let loop = () => {
        renderGlobal(this);
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
      this.applications.forEach(a => a.renderGlobalInitialized(this));
      this.initiated = true;
      this.init = () => {
        console.warn('Don not all init() more than once');
        return this;
      };
      return this;
    }

    getRenderApplications() {
      return [];
    }

    add(renderModel) {
      if (isObj(renderModel) && renderModel.global) {
        throw Error('item not an object or belongs to other global', renderModel.global);
      }
      if (renderModel instanceof RenderTask) {
        this._tasks[renderModel.name] = renderModel;
        renderModel.global = this;
        renderModel.init();
        this.invalid();
        return true;
      } else if (renderModel instanceof Render) {
        return this.defaultTask.add(renderModel);
      } else if (renderModel instanceof RenderApplication) {
        if (arrAdd(this.applications, renderModel)) {
          renderModel.global = this;
          if (this.initiated) {
            renderModel.renderGlobalInitialized(this);
          }
          this.invalid();
          return true;
        }
      }
      return false;
    }

    remove(renderModel) {
      if (!isObj(renderModel) || renderModel.global != this) {
        throw Error('only remove added item');
      }
      if (renderModel instanceof RenderApplication) {
        if (arrRemove(this.applications, renderModel)) {
          renderModel.global = null;
          renderModel.removeFromGlobal(this);
          this.invalid();
          return true;
        }
      }
    }

    update(e) {
      e.phrase = RENDER_STATE_PHRASE_UPDATE;
      this.applications.forEach(app => app.setupRenderState(e));
      forEach(this._tasks, task => {
        if (!task.disabled) {
          e.task = task;
          task.update(e);
        }
      });
      e.task = null;
      e.phrase = RENDER_STATE_PHRASE_IDLE;
    }

    render(e) {
      e.phrase = RENDER_STATE_PHRASE_RENDER;
      forEach(this._tasks, task => {
        if (!task.disabled) {
          e.task = task;
          task.render(e);
        }
      });
      e.task = null;
      e.phrase = RENDER_STATE_PHRASE_IDLE;
    }

    invalid() {
      setInvalid(this, true);
    }

    createRenderState() {
      return new RenderState({ global: this });
    }

    applyRenderState(state) {
      state.phrase = RENDER_STATE_PHRASE_APPLY;
      this.applications.forEach(app => app.applyRenderState(state));
      state.phrase = RENDER_STATE_PHRASE_IDLE;
    }

    get defaultTask() {
      let taskName = this.defaultTaskName;
      let task = this._tasks[taskName];
      if (!task) {
        this.add(task = new RenderTask({ name: taskName }));
      }
      return task;
    }
  }
  function renderGlobal(model) {
    let state = model.createRenderState();
    model.emit(EVENT_FRAME_START, [state]);
    model.update(state);
    if (isInvalid(model)) {
      model.emit(EVENT_RENDER_START, [state]);
      model.render(state);
      model.applyRenderState(state);
      model.emit(EVENT_RENDER_END, [state]);
      setInvalid(model, false);
    }
    model.emit(EVENT_FRAME_END, [state]);
    state.dispose();
  }

  /**
   * Created by brian on 18/11/2016.
   */
  function updateStyleSheetWithDiffResult(sheet, diff, ids) {
    //replace
    let nextIds = ids.slice();
    forEach(diff.replace, (style, id) => {
      let index = nextIds.indexOf(id);
      if (index !== -1) {
        sheet.deleteRule(index);
        sheet.insertRule(style, index);
      } else {
        throw Error('replace id not found');
      }
    });
    //add
    forEach(diff.add, (style, id) => {
      sheet.insertRule(style, nextIds.length);
      if (!arrAdd(nextIds, id)) {
        throw Error('add id fail');
      }
    });
    //remove
    forEach(diff.remove, id => {
      let index = nextIds.indexOf(id);
      if (arrRemove(nextIds, id)) {
        sheet.deleteRule(index);
      } else {
        throw Error('remove id fail');
      }
    });
    return nextIds;
  }
  function diffCSSResultMap(pre, next) {
    let addMap = {};
    let replaceMap = {};
    let removeKeys = Object.getOwnPropertyNames(pre);
    forEach(next, (text, key) => {
      if (pre.hasOwnProperty(key)) {
        if (pre[key] != text) {
          replaceMap[key] = text;
        }
      } else {
        addMap[key] = text;
      }
      arrRemove(removeKeys, key);
    });
    return {
      add: addMap,
      replace: replaceMap,
      remove: removeKeys
    };
  }

  /**
   * Created by brian on 14/10/2016.
   */
  class CSSRenderApplication extends RenderApplication {

    constructor() {
      super();
      this._persistElement = createElement('style', { 'data-flip': 'persist' });
      this._frameElement = createElement('style', { 'data-flip': 'frame' });
      this._lastCSSResult = {};
      this._lastCSSIds = [];
      this._persistIndies = [];
    }

    applyRenderState(state) {
      let diff = diffCSSResultMap(this._lastCSSResult, state.cssResults);
      this._lastCSSIds = updateStyleSheetWithDiffResult(this._frameElement.sheet, diff, this._lastCSSIds);
      this._lastCSSResult = objAssign({}, state.cssResults);
      state.persistStyleTexts.forEach(text => this.applyCSSText(text));
    }

    applyCSSText(cssText) {
      let styleSheet = this._persistElement.sheet;
      let index = -1;
      let self = this;
      if (isValidString(cssText)) {
        let reusableIndies = this._persistIndies;
        if (reusableIndies.length) {
          index = reusableIndies.pop();
          styleSheet.deleteRule(index);
        } else {
          index = styleSheet.cssRules.length;
        }
        index = reusableIndies.length ? reusableIndies.pop() : styleSheet.cssRules.length;
        styleSheet.insertRule(cssText, index);
      }
      return function cancel() {
        if (index > -1) {
          styleSheet.deleteRule(index);
          styleSheet.insertRule('*{}', index);
          self._persistIndies.push(index);
        }
        self = styleSheet = null;
      };
    }

    setupRenderState(state) {
      state.cssResults = {};
      state.persistStyleTexts = [];
    }

    renderGlobalInitialized(global) {
      if (!this.elementAppended) {
        let head = document.head;
        head.appendChild(this._persistElement);
        head.appendChild(this._frameElement);
        this.elementAppended = true;
      }
    }
  }

  function isValidString(str) {
    return str && typeof str === "string";
  }

  /**
   * Created by brian on 16/11/2016.
   */
  const instance = new RenderGlobal();
  const instanceCSSRenderApplication = new CSSRenderApplication();
  instance.add(instanceCSSRenderApplication);

  /**
   * Created by brian on 8/28/16.
   */
  const EASE = {
    linear(t) {
      return t;
    },
    zeroStep(t) {
      return t <= 0 ? 0 : 1;
    },
    halfStep(t) {
      return t < .5 ? 0 : 1;
    },
    oneStep(t) {
      return t >= 1 ? 1 : 0;
    },
    random() {
      return Math.random();
    },
    randomLimit(t) {
      return Math.random() * t;
    }
  };
  const pow = Math.pow;
  const PI = Math.PI;
  const IN_OUT_FUNCS = {
    back: function (t) {
      return t * t * (3 * t - 2);
    },
    elastic: function (t) {
      return t === 0 || t === 1 ? t : -pow(2, 8 * (t - 1)) * Math.sin(((t - 1) * 80 - 7.5) * PI / 15);
    },
    sine: function (t) {
      return 1 - Math.cos(t * PI / 2);
    },
    circ: function (t) {
      return 1 - Math.sqrt(1 - t * t);
    },
    cubic: function (t) {
      return t * t * t;
    },
    expo: function (t) {
      return t == 0 ? 0 : pow(2, 10 * (t - 1));
    },
    quad: function (t) {
      return t * t;
    },
    quart: function (t) {
      return pow(t, 4);
    },
    quint: function (t) {
      return pow(t, 5);
    },
    bounce: function (t) {
      var pow2,
          bounce = 4;
      while (t < ((pow2 = pow(2, --bounce)) - 1) / 11);
      return 1 / pow(4, 3 - bounce) - 7.5625 * pow((pow2 * 3 - 2) / 22 - t, 2);
    }
  };
  forEach(IN_OUT_FUNCS, function (func, name) {
    var easeIn = func;
    EASE[name + 'In'] = easeIn;
    EASE[name + 'Out'] = function (t) {
      return 1 - easeIn(1 - t);
    };
    EASE[name + 'InOut'] = function (t) {
      return t < 0.5 ? easeIn(t * 2) / 2 : 1 - easeIn(t * -2 + 2) / 2;
    };
  });

  /**
   * Created by brian on 8/28/16.
   */
  const CLOCK_STATUS_IDLE = 0;
  const CLOCK_STATUS_PAUSED = 1;
  const CLOCK_STATUS_ACTIVE = 2;
  const CLOCK_STATUS_DELAYING = 3;
  const CLOCK_STATUS_HOLDING = 4;
  const CLOCK_STATUS_ENDED = 5;
  const CLOCK_STATUS_UNKNOWN = 6;
  const CLOCK_STATUS_STARTED = 7;
  const CLOCK_STATUS_CANCELED = 8;

  class Clock extends EventEmitter {

    constructor(arg) {
      super();
      let options = makeOptions(arg, DEFAULT_CLOCK_CONSTRUCTOR);
      clonePropertiesFrom(this, options);
      this.reset();
    }

    get started() {
      return this._startTime !== -1;
    }

    get paused() {
      return this._status == CLOCK_STATUS_PAUSED;
    }

    get reversing() {
      return this.d == 0;
    }

    start() {
      if (this._status == CLOCK_STATUS_IDLE) {
        this._status = CLOCK_STATUS_STARTED;
        return true;
      }
      return false;
    }

    restart() {
      return this.reset().start();
    }

    reset() {
      this._status = CLOCK_STATUS_IDLE;
      this.d = 1;
      this.i = this.iteration;
      this.current = this._endTime = this._initTime = this._activeTime = this._startTime = this._holdTime = this._pausedTime = 0;
      return this;
    }

    pause() {
      if (this._status !== CLOCK_STATUS_PAUSED) {
        this._lastStatus = this._status;
        this._status = CLOCK_STATUS_PAUSED;
        this._pausedTime = 0;
        this.triggerEventWithDelegate(EVENT_PAUSE);
        return true;
      }
      return false;
    }

    resume() {
      if (this._status == CLOCK_STATUS_PAUSED) {
        this._status = this._lastStatus;
        this._lastStatus = CLOCK_STATUS_PAUSED;
        this.triggerEventWithDelegate(EVENT_RESUME);
        return true;
      }
      return false;
    }

    cancel() {
      if (this._status !== CLOCK_STATUS_CANCELED) {
        this._status = CLOCK_STATUS_CANCELED;
        this.triggerEventWithDelegate(EVENT_CANCEL);
        return true;
      }
      return false;
    }

    dispose() {
      this.off();
    }

    update(state) {
      let status = this._status;
      if (status == CLOCK_STATUS_CANCELED || status == CLOCK_STATUS_ENDED) {
        return state.willDisposeClock(this);
      } else {
        return _updateClock(this, state);
      }
    }

    triggerEventWithDelegate(event, e) {
      this.emit(event, [e]);
      if (this.delegate) {
        let func = this.delegate['onClock' + capitalizeString(event)];
        if (isFunc(func)) {
          func.apply(this.delegate, [this, e]);
        }
      }
    }
  }
  function _updateClock(clock, state) {
    let timeLine = state.timeLine,
        now = timeLine.now,
        ot = clock._t;
    switch (clock._status) {
      case CLOCK_STATUS_STARTED:
        clock._initTime = now;
        clock._status = CLOCK_STATUS_DELAYING;
        clock.current = 0;
        clock.triggerEventWithDelegate(EVENT_INIT, state);
        _updateClock(clock, state);
        return true;
      case CLOCK_STATUS_DELAYING:
        if (now >= clock._initTime + clock._pausedTime + clock.delay * timeLine.ticksPerSecond) {
          clock._status = CLOCK_STATUS_ACTIVE;
          clock._activeTime = clock._startTime = now;
          clock.current = 0;
          clock.triggerEventWithDelegate(EVENT_START, state);
          if (!clock.paused) {
            _updateClock(clock, state);
          }
          return true;
        }
        return false;
      case CLOCK_STATUS_PAUSED:
        if (clock._lastStatus == CLOCK_STATUS_HOLDING) {
          clock._holdTime += timeLine.advancedTimeInterval;
        } else {
          clock._pausedTime += timeLine.advancedTimeInterval;
        }
        return false;
      case CLOCK_STATUS_ACTIVE:
        let dur = (now - clock._activeTime - clock._pausedTime) / timeLine.ticksPerSecond;
        let t = clock.d ? dur / clock.duration : 1 - dur / clock.duration;
        if (ot === t) {
          return false;
        }
        clock.current = clock.ease(clock._t = clamp(0, 1, t));
        clock.triggerEventWithDelegate(EVENT_UPDATE, state);
        if (!clock.silent) {
          state.task.invalid();
        }
        if (t > 1 || t < 0) {
          clock._status = CLOCK_STATUS_UNKNOWN;
          _updateClock(clock, state);
        }
        return true;
      case CLOCK_STATUS_UNKNOWN:
        if (ot >= 1) {
          if (clock.reverse) {
            clock.d = 0;
            reactiveClock(clock, now);
            clock.triggerEventWithDelegate(EVENT_REVERSE, state);
          } else {
            return iterateClock(clock, now, state);
          }
        } else if (clock.reverse) {
          clock.d = 1;
          return iterateClock(clock, now, state);
        } else {
          throw Error('impossible state t=0,autoReverse=false');
        }
        return false;
      case CLOCK_STATUS_HOLDING:
        if (now >= clock._holdTime + clock.hold * timeLine.ticksPerSecond) {
          clock._status = CLOCK_STATUS_ENDED;
          clock._endTime = now;
          state.willDisposeClock(clock);
          clock.triggerEventWithDelegate(EVENT_END, state);
          return true;
        }
        return false;
      default:
        return false;
    }
  }
  function iterateClock(clock, now, state) {
    if (clock.i > 1 || clock.infinite) {
      clock.i--;
      clock.current = 0;
      reactiveClock(clock, now);
      clock.triggerEventWithDelegate(EVENT_ITERATE, state);
    } else {
      clock.i = 0;
      clock._holdTime = now;
      clock._status = CLOCK_STATUS_HOLDING;
      clock.triggerEventWithDelegate(EVENT_HOLD, state);
      return _updateClock(clock, state) || true;
    }
  }
  function reactiveClock(clock, now) {
    clock._status = CLOCK_STATUS_ACTIVE;
    clock._activeTime = now;
  }
  const DEFAULT_CLOCK_CONSTRUCTOR = Object.freeze({
    duration: 1,
    ease: EASE.linear,
    infinite: false,
    iteration: 1,
    silent: true,
    reverse: false,
    delay: 0,
    hold: 0,
    delegate: 0
  });
  function clamp(min, max, val) {
    if (val < min) {
      return min;
    } else if (val > max) {
      return max;
    }
    return val;
  }

  /**
   * Created by 柏子 on 2015/1/29.
   */
  let syncEnqueue = true;
  let throwOut;
  function enqueue(callback) {
    if (throwOut) {
      throw Error('force quit');
    }
    syncEnqueue ? callback() : setTimeout(callback, 0);
  }
  function Thenable(opt) {
    if (!(this instanceof Thenable)) {
      return new Thenable(opt);
    }
    this.then = opt.then;
    this.get = opt.get;
  }
  function waitAnimation(something) {
    if (something instanceof Animation) {
      return something.promise;
    } else if (something instanceof Array) {
      let animations = [];
      if (something.every(obj => {
        if (obj instanceof Animation) {
          animations.push(obj.promise);
          return true;
        }
      })) {
        return promiseAll(animations);
      }
    }
    return something;
  }
  function resolvePromise(future) {
    if (likePromise(future)) {
      return future;
    }
    return new Thenable({
      then: function resolved(callback) {
        try {
          return resolvePromise(waitAnimation(callback(future)));
        } catch (ex) {
          return rejectPromise(ex);
        }
      },
      get: function (proName) {
        return proName ? future[proName] : future;
      }
    });
  }
  function rejectPromise(reason) {
    if (likePromise(reason)) {
      return reason;
    }
    return new Thenable({
      then: function rejected(callback, errorback) {
        try {
          return resolvePromise(errorback(reason));
        } catch (ex) {
          return rejectPromise(ex);
        }
      },
      get: function (pro) {
        return pro ? reason[pro] : reason;
      }
    });
  }

  /**
   * @memberOf Flip
   * @param {function} resolver
   * @returns {Thenable}
   * @constructor
   */
  function Promise(resolver) {
    if (!(this instanceof Promise)) {
      return new Promise(resolver);
    }
    let resolvedPromise,
        pending = [],
        ahead = [],
        resolved;
    if (typeof resolver === "function") {
      resolver(resolve, reject);
    } else {
      throw Error('Promise resolver undefined is not a function');
    }
    function resolve(future) {
      try {
        receive(future);
      } catch (ex) {
        receive(undefined, ex);
      }
    }

    function reject(reason) {
      receive(undefined, reason || new Error(''));
    }

    function receive(future, reason) {
      if (!resolved) {
        resolvedPromise = reason == undefined ? resolvePromise(future) : rejectPromise(reason);
        resolved = true;
        for (let i = 0, len = pending.length; i < len; i++) {
          enqueue(function (args, con) {
            return function () {
              let ret = resolvedPromise.then.apply(resolvedPromise, args);
              if (con) {
                ret.then.apply(ret, con);
              }
            };
          }(pending[i], ahead[i]));
        }
        pending = ahead = undefined;
      }
    }

    function next(resolve, reject) {
      ahead.push([resolve, reject]);
    }

    return new Thenable({
      then: function (thenable, errorBack) {
        let handler = [ensureThenable(thenable, function (v) {
          return v;
        }), ensureThenable(errorBack, function (e) {
          throw e;
        })];
        if (resolvedPromise) {
          if (throwOut) {
            throw Error('force quit');
          }
          return warpPromiseValue(resolvedPromise.then.apply(resolvedPromise, handler));
        } else {
          pending.push(handler);
          return new Promise(function (resolve, reject) {
            next(resolve, reject);
          });
        }
      },
      get: function (proname) {
        return resolvedPromise ? resolvedPromise.get(proname) : undefined;
      }
    });
  }
  function ensureThenable(obj, def) {
    let t = typeof obj;
    if (t === "object") {
      return function () {
        return obj;
      };
    } else if (t === "function") {
      return obj;
    }
    return def;
  }
  function likePromise(obj) {
    return obj instanceof Thenable || isObj(obj) && isFunc(obj.then) && !(obj instanceof Animation);
  }
  function promiseRace(promises) {
    return new Promise(function (_res, _rej) {
      let hasResult;
      promises.forEach(function (promise) {
        promise.then(resolve, reject);
      });
      function resolve(e) {
        if (!hasResult) {
          _res(e);
          hasResult = true;
        }
      }

      function reject(e) {
        if (!hasResult) {
          _rej(e);
          hasResult = true;
        }
      }
    });
  }
  function promiseAll(promises) {
    return new Promise(function (resolve, reject) {
      let fail,
          num,
          r = new Array(num = promises.length);
      if (!promises.length) {
        return resolve(r);
      }
      promises.forEach(function (promise, i) {
        promise.then(function (pre) {
          check(pre, i);
        }, function (err) {
          check(err, i, true);
        });
      });
      function check(value, i, error) {
        r[i] = value;
        if (error) {
          fail = true;
        }
        if (num == 1) {
          fail ? reject(r) : resolve(r);
        } else {
          num--;
        }
      }
    });
  }
  /**
   * @memberOf Flip.Promise
   * @param {Array<Flip.Promise>}
   * @returns {Flip.Promise}
   */
  Promise.race = promiseRace;
  /**
   * continue when all promises finished
   * @memberof Flip.Promise
   * @param {Array<Flip.Promise>}
   * @returns Flip.Promise
   */
  Promise.all = promiseAll;
  /**
   * @memberof Flip.Promise
   * @returns {{resolve:function,reject:function,promise:Flip.Promise}}
   */
  Promise.defer = function () {
    let defer = {};

    defer.promise = new Promise(function (resolver, rejector) {
      defer.resolve = resolver;
      defer.reject = rejector;
    });
    return defer;
  };
  Promise.resolve = function (any) {
    return any && isFunc(any.then) ? digestThenable(any) : warpPromiseValue(any);
  };
  Promise.reject = function (reason) {
    return Promise(function (resolve, reject) {
      reject(reason);
    });
  };
  Promise.digest = digestThenable;
  Promise.option = function (opt) {
    if (opt) {
      syncEnqueue = !!opt.sync;
    }
  };

  function digestThenable(thenable) {
    return Promise(function (resolve, reject) {
      thenable.then(resolve, reject);
    });
  }

  function warpPromiseValue(any) {
    return Promise(function (resolve) {
      resolve(any);
    });
  }

  class RenderUtil {
    renderWithAnimation(animation, e) {}

    updateWithAnimation(animation, e) {}
  } /**
     * Created by brian on 17/10/2016.
     */

  const ANIMATION_FILL_MODE_REMOVE = 'remove';
  const ANIMATION_FILL_MODE_KEEP = 'keep';

  /**
   * @alias Flip.Animation
   */
  class Animation extends Render {

    constructor(options) {
      super();
      let clock = this._clock = new Clock(makeOptions(options, DEFAULT_CLOCK_CONSTRUCTOR));
      clock.delegate = this;
      this.fillMode = options.fillMode || ANIMATION_FILL_MODE_REMOVE;
      this._paramCallbacks = {};
      this.params = {};
      this.renderUtils = [];
      this.init();
      this.configOptions(options);
    }

    configOptions(options) {
      this.setVariables(options.variables);
      this.setDelegateHandlers(options);
      forEach(options.once, (func, evt) => this.once(evt, func, true));
      forEach(options.on, (func, evt) => this.on(evt, func));
    }

    get promise() {
      if (!this._deferred) {
        this._deferred = Promise.defer();
      }
      return this._deferred.promise;
    }

    init() {
      this._ended = this._canceled = false;
      return this.invalid();
    }

    start() {
      return this.clock.start();
    }

    pause() {
      return this.clock.pause();
    }

    resume() {
      return this.clock.resume();
    }

    cancel() {
      if (!this.canceled) {
        this._canceled = true;
        this.removeFromParent();
        this.emit(EVENT_CANCEL);
        if (this._deferred) {
          this._deferred.reject(this);
        }
        return true;
      }
      return false;
    }

    onClockUpdate(clock, e) {
      this.params = this.updateVariable(clock.current);
      this.invalid();
      this.emit(EVENT_UPDATE, [e, this]);
    }

    onClockEnd(clock, e) {
      if (this.fillMode == ANIMATION_FILL_MODE_REMOVE) {
        this.removeFromParent(true);
      }
      if (this._deferred) {
        this._deferred.resolve(this);
      }
      this.emit(EVENT_END, [e, this]);
    }

    updateVariable(percent) {
      let ret = {};
      if (isNaN(percent)) {
        percent = this.percent;
      }
      forEach(this._paramCallbacks, (func, key) => ret[key] = func.call(this, percent));
      return ret;
    }

    setDelegateHandlers(map) {
      forEach(map, (func, key) => ANIMATION_HANDLER_NAMES.indexOf(key) > -1 && this.setDelegateHandler(key, func));
      return this;
    }

    setDelegateHandler(name, handler) {
      let delegateMethodName = /^on/.test(name) ? name : `on${capitalizeString(name)}`;
      if (ANIMATION_HANDLER_NAMES.indexOf(name) > -1) {
        let evtName = name.replace(/^on/, '').toLowerCase();
        this.on(evtName, handler);
      } else if (IS_DEV_ENV) {
        console.warn(`Animation delegate name:${delegateMethodName} is not added`);
      }
      return false;
    }

    update(e) {
      super.update(e);
      this.clock.update(e);
      this.renderUtils.forEach(c => c.updateWithAnimation(this, e));
    }

    addRenderUtil(util) {
      if (util instanceof RenderUtil) {
        if (arrAdd(this.renderUtils, util)) {
          this.invalid();
          return true;
        }
      }
    }

    render(e) {
      super.render(e);
      forEach(this.renderUtils, util => util.renderWithAnimation(this, e));
    }

    dispose(e) {
      super.dispose(e);
      this.off();
      this.clock.dispose();
    }

    setVariables(map) {
      forEach(map, (val, key) => this.setVariable(key, val));
      return this;
    }

    setVariable(key, value) {
      let range;
      if (!isNaN(value)) {
        range = () => +value;
      } else if (value instanceof Array) {
        let min = +value[0],
            dis = +value[1] - min;
        range = p => min + dis * p;
      } else if (isFunc(value)) {
        range = value;
      } else {
        throw Error('value should be number or function');
      }
      this._paramCallbacks[key] = range;
      return this;
    }

    isClock(status) {
      return this.clock._status == status;
    }
  }
  Object.defineProperties(Animation.prototype, {
    clock: {
      get() {
        return this._clock;
      }
    },
    percent: {
      get() {
        return this._clock.current || 0;
      }
    },
    canceled: {
      get() {
        return this._canceled;
      }
    },
    ended: {
      get() {
        return this.clock._status == CLOCK_STATUS_ENDED;
      }
    }
  });
  const ANIMATION_HANDLER_NAMES = ['onUpdate', 'onEnd'];
  [['Init', EVENT_INIT], ['Iterate', EVENT_ITERATE], ['Reverse', EVENT_REVERSE], ['Start', EVENT_START], ['Hold', EVENT_HOLD], ['Pause', EVENT_PAUSE], ['Resume', EVENT_RESUME]].forEach(([methodName, evtName]) => {
    const delegateMethodName = 'on' + methodName;
    Animation.prototype['onClock' + methodName] = function triggerEvent(clock, e) {
      this.emit(evtName, [e, this]);
    };
    ANIMATION_HANDLER_NAMES.push(delegateMethodName);
  });

  /**
   * Created by brian on 16/10/2016.
   */
  let defaultPrefixes;
  let cssPrivateKeyPrefix = '$$';
  let cssPropertyKeys;
  let cssPrivateKeys = [];
  class CSSProxy {

    constructor(source) {
      this.$merge(source);
      this.$invalid = true;
    }

    $withPrefix(key, value, prefixes) {
      (prefixes || defaultPrefixes).forEach(prefix => this[normalizeCSSKey(prefix + key)] = value);
      return this;
    }

    $merge(obj) {
      if (isObj(obj) && obj !== this) {
        forEach(obj, (value, key) => this[key] = value);
      }
      return this;
    }

    $styleText(selector, separator) {
      return combineStyleText(selector, this.$toCachedCssString(separator));
    }

    $toCachedCssString(reset) {
      if (this.$invalid) {
        this.$cachedCssString = this.$toSafeCssString();
        this.$invalid = !!reset;
      }
      return this.$cachedCssString;
    }

    $toSafeCssString(separator) {
      var rules = [];
      forEach(this, function (val, key) {
        var i = cssPrivateKeys.indexOf(key);
        if (i > -1 && val !== void 0) {
          rules.push(cssPropertyKeys[i] + ':' + formatNum(val));
        }
      });
      return rules.join(';' + (separator || ''));
    }

    toString() {
      return this.$toSafeCssString();
    }

  }

  function combineStyleText(selector, body) {
    return selector + '{' + body + '}';
  }
  function normalizeCSSKey(cssKey) {
    return cssKey.replace(/^-/, '').replace(/-([a-z])/g, function (str, char) {
      return char.toUpperCase();
    });
  }
  (function () {
    if (isFunc(window.CSS2Properties)) {
      cssPropertyKeys = Object.getOwnPropertyNames(CSS2Properties.prototype).filter(key => key.indexOf('-') == -1);
    } else {
      cssPropertyKeys = Object.getOwnPropertyNames(document.documentElement.style);
    }
    cssPropertyKeys = cssPropertyKeys.map(function (key) {
      var privateKey = cssPrivateKeyPrefix + key,
          capitalizedKey = capitalizeString(key),
          camelKey = key[0].toLowerCase() + key.substring(1),
          lowerCaseKey = toLowerCssKey(key);
      cssPrivateKeys.push(privateKey);
      registerProperty(CSSProxy.prototype, [key, lowerCaseKey, capitalizedKey, camelKey], {
        get: getter,
        set: setter
      });
      function getter() {
        return this[privateKey];
      }

      function setter(val) {
        var v = castInvalidValue(val);
        if (v != this[privateKey]) {
          this.$invalid = true;
          this[privateKey] = v;
        }
      }

      return lowerCaseKey;
    });
    defaultPrefixes = ['-moz-', '-ms-', '-webkit-', '-o-', ''].filter(function (prefix) {
      var key = prefix.replace(/^-/, '');
      return cssPropertyKeys.some(function (proKey) {
        return proKey.indexOf(key) == 0 || proKey.indexOf(prefix) == 0;
      });
    });
    CSSProxy.prototype.$template = stringTemplate;
    function castInvalidValue(val) {
      var type = typeof val;
      return type == 'string' || type == 'number' ? val : void 0;
    }

    function registerProperty(target, keys, define) {
      keys.forEach(function (key) {
        Object.defineProperty(target, key, define);
      });
    }

    function toLowerCssKey(key) {
      var prefix = /^(webkit|moz|o|ms)[A-Z]/.test(key) ? '-' : '';
      return prefix + key.replace(/[A-Z]/g, function (str) {
        return '-' + str.toLowerCase();
      });
    }
  })();

  /**
   * Created by brian on 14/10/2016.
   */
  /**
   * @memberOf Flip
   */
  class Mat3 {

    constructor(arrayOrX1, y1, dx, x2, y2, dy) {
      var eles;
      if (arrayOrX1 == undefined) {
        eles = [1, 0, 0, 0, 1, 0, 0, 0, 1];
      } else if (y1 == undefined) {
        eles = arrayOrX1;
      } else {
        eles = [arrayOrX1, y1, 0, x2, y2, dx, dy, 1];
      }
      this.elements = new Float32Array(eles);
    }

    clone() {
      return new Mat3(this.elements);
    }

    translate(x, y, z) {
      return multiplyMat(this, [1, 0, 0, 0, 1, 0, x || 0, y || 0, defaultIfNaN(z, 1)]);
    }

    flip(angle, horizontal, ratio) {
      var sinA = sin(angle),
          cosA = cos(angle);
      ratio = ratio || .6;
      return multiplyMat(this, horizontal ? [1, 0, 0, -sinA * ratio, cosA, 0, 0, 0, 1] : [cosA, sinA * ratio, 0, 0, 1, 0, 0, 0, 1]);
    }

    rotate(angle) {
      return this.rotateZ(angle);
    }

    rotateX(angle) {
      var sina = sin(angle),
          cosa = cos(angle);
      return multiplyMat(this, [1, 0, 0, 0, cosa, sina, 0, -sina, cosa]);
    }

    rotateY(angle) {
      var sina = sin(angle),
          cosa = cos(angle);
      return multiplyMat(this, [cosa, 0, -sina, 0, 1, 0, sina, 0, cosa]);
    }

    rotateZ(angle) {
      var sina = sin(angle),
          cosa = cos(angle);
      return multiplyMat(this, [cosa, sina, 0, -sina, cosa, 0, 0, 0, 1]);
    }

    transform(m11, m12, m21, m22, dx, dy) {
      return multiplyMat(this, [m11, m21, 0, m12, m22, 0, dx || 0, dy || 0, 1]);
    }

    skew(angle) {
      return multiplyMat(this, [1, tan(angle), 0, tan(angle || 0), 1, 0, 0, 0, 1]);
    }

    scale(x, y) {
      return multiplyMat(this, [defaultIfNaN(x, 1), 0, 0, 0, defaultIfNaN(y, 1), 0, 0, 0, 1]);
    }

    print() {
      var e = this.elements,
          ret = [];
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) ret.push(e[j + i * 3].toFixed(2));
        ret.push('\n');
      }
      return ret.join(' ');
    }

    setElement(col, row, value) {
      this.elements[col * 3 + row] = value;
      return this;
    }

    obliqueProject(rV, rH) {
      rH = rH || 0;
      rV = rV || 0;
      var s = 1 / tan(rV),
          sSin = sin(rH) * s,
          sCos = cos(rH) * s;
      return multiplyMat(this, [1, 0, 0, 0, 1, 0, sCos, sSin, 0], 1);
    }

    applyContext2D(ctx) {
      let eles = this.elements;
      ctx.transform(eles[0], eles[1], eles[2], eles[3], eles[4], eles[5]);
      return this;
    }

    toString() {
      return 'matrix(' + map2DArray(this.elements).join(',') + ')';
    }

    axonProject(rotationX, rotationY) {
      rotationX = rotationX || 0;
      rotationY = rotationY || 0;
      var cosX = cos(rotationX),
          sinX = sin(rotationX),
          cosY = cos(rotationY),
          sinY = sin(rotationY);
      return multiplyMat(this, [cosY, sinX * sinY, 0, 0, cosX, 0, sinY, -cosY * sinX, 0], 1);
    }

    concat(matOrArray) {
      var other = matOrArray instanceof Mat3 ? matOrArray.elements : matOrArray;
      return multiplyMat(this, other);
    }
  }
  function multiplyMat(mat, other, reverse) {
    var a = other,
        b = mat.elements,
        out = b;
    if (reverse) {
      b = other;
      a = out = mat.elements;
    } else {
      a = other;
      b = out = mat.elements;
    }
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a10 = a[3],
        a11 = a[4],
        a12 = a[5],
        a20 = a[6],
        a21 = a[7],
        a22 = a[8],
        b00 = b[0],
        b01 = b[1],
        b02 = b[2],
        b10 = b[3],
        b11 = b[4],
        b12 = b[5],
        b20 = b[6],
        b21 = b[7],
        b22 = b[8];

    out[0] = a00 * b00 + a01 * b10 + a02 * b20;
    out[1] = a00 * b01 + a01 * b11 + a02 * b21;
    out[2] = a00 * b02 + a01 * b12 + a02 * b22;

    out[3] = a10 * b00 + a11 * b10 + a12 * b20;
    out[4] = a10 * b01 + a11 * b11 + a12 * b21;
    out[5] = a10 * b02 + a11 * b12 + a12 * b22;

    out[6] = a20 * b00 + a21 * b10 + a22 * b20;
    out[7] = a20 * b01 + a21 * b11 + a22 * b21;
    out[8] = a20 * b02 + a21 * b12 + a22 * b22;
    return mat;
  }
  const sin = Math.sin;
  const cos = Math.cos;
  const tan = Math.tan;
  const MAP_SEQ = [0, 1, 3, 4, 6, 7];
  function map2DArray(eles) {
    return MAP_SEQ.map(function (i) {
      return getFloat(eles[i]);
    });
  }
  function getFloat(d) {
    return (+d).toFixed(5);
  }
  function defaultIfNaN(v, def) {
    var ret = +v;
    return isNaN(ret) ? def : ret;
  }

  /**
   * Created by brian on 14/10/2016.
   */
  class CSSRenderUtil extends RenderUtil {

    constructor({ selector, id }) {
      super();
      this.selector = selector || '';
      this.id = id || generateID();
      this._cssCallbacks = [];
      this._transformCallbacks = [];
      this._lastCSSResult = Object.create(null);
    }

    renderWithAnimation(animation, renderState) {
      let CSSResult = this._lastCSSResult = this.mapCSSResult(this.renderAnimationWithCSSRenderState(animation, renderState));
      objAssign(renderState.cssResults, CSSResult);
    }

    mapCSSResult(results) {
      let ret = Object.create(null);
      let id = this.id;
      results.forEach((val, index) => ret[`${id}:${index}`] = val);
      return ret;
    }

    updateWithAnimation(animation, e) {
      if (this._lastCSSResult) {
        objAssign(e.cssResults, this._lastCSSResult);
      }
    }

    renderAnimationWithCSSRenderState(animation, renderState) {
      if (isObj(renderState.cssResults)) {
        return this.renderCSSResults(animation.params, animation);
      } else {
        throw Error('CSSResults property is missing,forget to set CSSRender application?');
      }
    }

    renderCSSResults(params, thisObj) {
      let baseSel = this.selector;
      let ret = [];
      forEach(this._cssCallbacks, pair => {
        let cssProxy = new CSSProxy();
        let maybeResult = pair.callback.call(thisObj, cssProxy, params);
        if (maybeResult !== cssProxy && isObj(maybeResult)) {
          cssProxy.$merge(maybeResult);
        }
        addCSSText(baseSel, pair.selector, cssProxy, ret);
      });
      forEach(this._transformCallbacks, pair => {
        let mat = new Mat3();
        let maybeMat = pair.callback.call(thisObj, mat, params);
        if (maybeMat instanceof Mat3) {
          mat = maybeMat;
        }
        let cssProxy = new CSSProxy();
        cssProxy.$withPrefix('transform', mat.toString());
        addCSSText(baseSel, pair.selector, cssProxy, ret);
      });
      return ret;
    }

    transform(selector, func) {
      let callback;
      if (arguments.length == 1) {
        func = selector;
        selector = '';
      }
      if (func instanceof Mat3) {
        callback = () => func;
      } else if (isFunc(func)) {
        callback = func;
      } else {
        throw Error('transform callback type error');
      }
      if (callback) {
        this._transformCallbacks.push({ selector, callback });
      }
      return this;
    }

    css(selector, func) {
      let callback;
      if (arguments.length == 1) {
        func = selector;
        selector = '';
      }
      if (isObj(func)) {
        callback = proxy => proxy.$merge(func);
      } else if (isFunc(func)) {
        callback = func;
      } else {
        throw Error('css callback type error');
      }
      if (callback) {
        this._cssCallbacks.push({ selector, callback });
      }
      return this;
    }

  }
  CSSRenderUtil.prototype.type = 'CSSRenderUtil';
  let seed = 1;
  function generateID() {
    return 'CSSUtil' + seed++;
  }
  function addCSSText(baseSel, childSel, cssProxy, target) {
    let selector = childSel ? `${baseSel} ${childSel.replace(/&/g, baseSel)}` : baseSel;
    let CSSText = cssProxy.$styleText(selector);
    if (CSSText && selector) {
      if (target.indexOf(CSSText) == -1) {
        target.push(CSSText);
        return true;
      }
    }
  }

  /**
   * Created by brian on 16/11/2016.
   */
  function animate(options) {
    let animation = new Animation(options);
    if (!options.manualStart) {
      animation.start();
    }
    let renderTask = options.renderTask || instance.defaultTask;
    renderTask.addChild(animation);
    if ('css' in options || 'transform' in options) {
      let cssRenderUtils = new CSSRenderUtil({ selector: options.selector });
      if (isFunc(options.css)) {
        cssRenderUtils.css(options.css);
      } else {
        forEach(options.css, (cb, selector) => cssRenderUtils.css(selector, cb));
      }
      if (isFunc(options.transform)) {
        cssRenderUtils.transform(options.transform);
      } else {
        forEach(options.transform, (cb, selector) => cssRenderUtils.transform(selector, cb));
      }
      animation.addRenderUtil(cssRenderUtils);
    }

    return animation;
  }

  /**
   * Created by brian on 14/10/2016.
   */

  /**
   * Created by brian on 17/11/2016.
   */

  /**
   * Created by brian on 8/21/16.
   */
  let readyFuncs = [];

  function Flip(arg) {
    if (isFunc(arg)) {
      if (readyFuncs) {
        readyFuncs.push(arg);
      } else {
        arg(Flip);
      }
    } else if (isObj(arg)) {
      animate(arg);
    }
  }

  if (typeof window === "object") {
    if (document.readyState !== 'loading') {
      setTimeout(ready, 0);
    }
    document.addEventListener('DOMContentLoaded', ready);
    if (typeof exports === "object") {
      exports = Flip;
    }
    window.Flip = Flip;
  }

  function ready() {
    let funcs = readyFuncs;
    instance.init();
    readyFuncs = null;
    funcs.forEach(callback => callback(Flip));
  }
  Object.defineProperties(Flip, {
    ready: {
      get() {
        return readyFuncs == null;
      }
    }
  });

  var lib = Object.freeze({
    instance: instance,
    animate: animate,
    Flip: Flip,
    EASE: EASE,
    Mat3: Mat3,
    $: $,
    $$: $$,
    forEach: forEach,
    Promise: Promise,
    PureRender: PureRender,
    Render: Render,
    isRender: isRender,
    RenderTask: RenderTask,
    RenderGlobal: RenderGlobal,
    RENDER_STATE_PHRASE_UPDATE: RENDER_STATE_PHRASE_UPDATE,
    RENDER_STATE_PHRASE_IDLE: RENDER_STATE_PHRASE_IDLE,
    RENDER_STATE_PHRASE_RENDER: RENDER_STATE_PHRASE_RENDER,
    RENDER_STATE_PHRASE_APPLY: RENDER_STATE_PHRASE_APPLY,
    RenderState: RenderState,
    TimeLine: TimeLine,
    CLOCK_STATUS_IDLE: CLOCK_STATUS_IDLE,
    CLOCK_STATUS_PAUSED: CLOCK_STATUS_PAUSED,
    CLOCK_STATUS_ACTIVE: CLOCK_STATUS_ACTIVE,
    CLOCK_STATUS_DELAYING: CLOCK_STATUS_DELAYING,
    CLOCK_STATUS_HOLDING: CLOCK_STATUS_HOLDING,
    CLOCK_STATUS_ENDED: CLOCK_STATUS_ENDED,
    CLOCK_STATUS_UNKNOWN: CLOCK_STATUS_UNKNOWN,
    CLOCK_STATUS_STARTED: CLOCK_STATUS_STARTED,
    CLOCK_STATUS_CANCELED: CLOCK_STATUS_CANCELED,
    Clock: Clock,
    DEFAULT_CLOCK_CONSTRUCTOR: DEFAULT_CLOCK_CONSTRUCTOR,
    TreeRender: TreeRender,
    ANIMATION_FILL_MODE_REMOVE: ANIMATION_FILL_MODE_REMOVE,
    ANIMATION_FILL_MODE_KEEP: ANIMATION_FILL_MODE_KEEP,
    Animation: Animation,
    RenderUtil: RenderUtil,
    CSSRenderApplication: CSSRenderApplication,
    CSSProxy: CSSProxy,
    combineStyleText: combineStyleText,
    CSSRenderUtil: CSSRenderUtil
  });

  /**
   * Created by brian on 02/12/2016.
   */
  const WebGL_CONST = {};

  (function () {
    copyConst(WebGLRenderingContext);
    copyConst(WebGLRenderingContext.prototype);
    function copyConst(source) {
      for (let name in source) {
        if (/^[A-Z_\d]+$/.test(name)) {
          WebGL_CONST[name] = source[name];
        }
      }
    }

    WebGL_CONST.HALF_FLOAT_OES = 36193;
  })();

  /**
   * Created by brian on 02/12/2016.
   */
  const EPSILON = 0.000001;
  /**
   * Matrix is mutable which means any operation will replace the whole element array
   * @param {Float32Array|Matrix4|Array|null} arrayOrMat4
   * @property {Float32Array} elements
   * @returns {Matrix4}
   * @constructor
   */
  function Matrix4(arrayOrMat4) {
    if (!(this instanceof Matrix4)) {
      return new Matrix4(arrayOrMat4);
    }
    let elements;
    if (arrayOrMat4 instanceof Array) {
      elements = new Float32Array(arrayOrMat4);
    } else if (arrayOrMat4 instanceof Matrix4) {
      elements = new Float32Array(arrayOrMat4.elements);
    } else if (arrayOrMat4 && arrayOrMat4.buffer instanceof ArrayBuffer) {
      elements = new Float32Array(arrayOrMat4);
    } else {
      elements = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }
    this.elements = elements;
  }
  Matrix4.prototype = {
    clone: function () {
      return new Matrix4(this);
    },
    translate: function (x, y, z) {
      this.elements = translateMatrix4(new Float32Array(16), this.elements, [x, y, z]);
      return this;
    },
    scale: function (x, y, z) {
      this.elements = scaleMatrix4(new Float32Array(16), this.elements, [x, y, z]);
      return this;
    },
    rotate: function (rad, axis) {
      this.elements = rotateMatrix4(new Float32Array(16), this.elements, rad, axis);
      return this;
    },
    concat: function (matrix) {
      this.elements = concatMatrix4(new Float32Array(16), this.elements, matrix.elements);
      return this;
    },
    perspective: function (fovy, aspect, near, far) {
      this.elements = concatMatrix4(new Float32Array(16), this.elements, matrix4Perspective(new Float32Array(16), fovy, aspect, near, far));
      return this;
    },
    lookAt: function (eye, center, up) {
      this.elements = concatMatrix4(new Float32Array(16), this.elements, matrix4LookAt(new Float32Array(16), eye, center, up));
      return this;
    },
    toString: function (fix) {
      let a = this.elements,
          str = '';
      fix = fix || 3;
      for (let i = 0, index; i < 4; i++) {
        str += a[index = i * 4].toFixed(fix) + '\t' + a[index + 1].toFixed(fix) + '\t' + a[index + 2].toFixed(fix) + '\t' + a[index + 3].toFixed(fix) + '\n';
      }
      return str;
    },
    concatVec4: function (x, y, z, w) {
      return vec4ConcatMat4([], [+x, +y, +z, isNaN(w) ? 1 : +w], this.elements);
    }
  };
  Matrix4.fromFrustum = function (left, right, bottom, top, near, far) {
    let elements = new Float32Array(16);
    matrix4Frustum(elements, left, right, bottom, top, near, far);
    return new Matrix4(elements);
  };
  Matrix4.fromPerspective = function (fovy, aspect, near, far) {
    let elements = new Float32Array(16);
    matrix4Perspective(elements, fovy, aspect, near, far);
    return new Matrix4(elements);
  };
  Matrix4.fromLookAt = function (eye, center, up) {
    let elements = new Float32Array(16);
    matrix4LookAt(elements, eye, center, up);
    return new Matrix4(elements);
  };
  Matrix4.fromScale = function (x, y, z) {
    let mat = new Matrix4(),
        elements = mat.elements;
    scaleMatrix4(elements, elements, [x, y, z]);
    return mat;
  };
  Matrix4.fromTranslate = function (x, y, z) {
    let mat = new Matrix4(),
        elements = mat.elements;
    translateMatrix4(elements, elements, [x, y, z]);
    return mat;
  };
  Matrix4.fromConcat = function (a, b) {
    let mat = new Matrix4(),
        elements = mat.elements;
    concatMatrix4(elements, a.elements, b.elements);
    return mat;
  };
  Matrix4.fromRotate = function (rad, axis) {
    let mat = new Matrix4(),
        elements = mat.elements;
    rotateMatrix4(elements, elements, rad, axis);
    return mat;
  };
  function matrix4LookAt(out, eye, center, up) {
    let x0,
        x1,
        x2,
        y0,
        y1,
        y2,
        z0,
        z1,
        z2,
        len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1].forEach(function (number, i) {
        out[i] = number;
      });
      return out;
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
      x0 = 0;
      x1 = 0;
      x2 = 0;
    } else {
      len = 1 / len;
      x0 *= len;
      x1 *= len;
      x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
      y0 = 0;
      y1 = 0;
      y2 = 0;
    } else {
      len = 1 / len;
      y0 *= len;
      y1 *= len;
      y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;

    return out;
  }
  function matrix4Frustum(out, left, right, bottom, top, near, far) {
    let rl = 1 / (right - left),
        tb = 1 / (top - bottom),
        nf = 1 / (near - far);
    out[0] = near * 2 * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = near * 2 * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = far * near * 2 * nf;
    out[15] = 0;
    return out;
  }
  function matrix4Perspective(out, fovy, aspect, near, far) {
    let f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = 2 * far * near * nf;
    out[15] = 0;
    return out;
  }

  function rotateMatrix4(out, a, rad, axis) {
    let x = axis[0],
        y = axis[1],
        z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s,
        c,
        t,
        a00,
        a01,
        a02,
        a03,
        a10,
        a11,
        a12,
        a13,
        a20,
        a21,
        a22,
        a23,
        b00,
        b01,
        b02,
        b10,
        b11,
        b12,
        b20,
        b21,
        b22;

    if (Math.abs(len) < EPSILON) {
      return null;
    }

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c;
    b01 = y * x * t + z * s;
    b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;
    b11 = y * y * t + c;
    b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;
    b21 = y * z * t - x * s;
    b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) {
      // If the source and destination differ, copy the unchanged last row
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }
    return out;
  }
  function scaleMatrix4(out, a, v) {
    let x = v[0],
        y = v[1],
        z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
  }
  function translateMatrix4(out, a, v) {
    let x = v[0],
        y = v[1],
        z = v[2],
        a00,
        a01,
        a02,
        a03,
        a10,
        a11,
        a12,
        a13,
        a20,
        a21,
        a22,
        a23;

    if (a === out) {
      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
      a00 = a[0];
      a01 = a[1];
      a02 = a[2];
      a03 = a[3];
      a10 = a[4];
      a11 = a[5];
      a12 = a[6];
      a13 = a[7];
      a20 = a[8];
      a21 = a[9];
      a22 = a[10];
      a23 = a[11];

      out[0] = a00;
      out[1] = a01;
      out[2] = a02;
      out[3] = a03;
      out[4] = a10;
      out[5] = a11;
      out[6] = a12;
      out[7] = a13;
      out[8] = a20;
      out[9] = a21;
      out[10] = a22;
      out[11] = a23;

      out[12] = a00 * x + a10 * y + a20 * z + a[12];
      out[13] = a01 * x + a11 * y + a21 * z + a[13];
      out[14] = a02 * x + a12 * y + a22 * z + a[14];
      out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
  }
  function concatMatrix4(out, a, b) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11],
        a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];

    // Cache only the current line of the second matrix
    let b0 = b[0],
        b1 = b[1],
        b2 = b[2],
        b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
  }
  function vec4ConcatMat4(out, a, m) {
    let x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
  }

  /**
   * Created by brian on 02/12/2016.
   */
  class GLVec {

    constructor(vec) {
      if (vec instanceof GLVec) {
        this.elements = new Float32Array(vec.elements);
      } else {
        this.elements = new Float32Array(vec);
      }
    }

    get length() {
      return this.elements.length;
    }

    clone() {
      return new GLVec(this.elements);
    }

    vecDot(vecOrNumber) {
      let v = vecDot(this, vecOrNumber);
      this.elements = new Float32Array(v.elements);
      return v;
    }

    vecLength() {
      return vecLength(this);
    }

    vecAdd(vec) {
      let v = vecAdd(this, vec);
      this.elements = new Float32Array(v.elements);
      return v;
    }

    vecNormalize() {
      let v = vecNormalize(this);
      this.elements = new Float32Array(v.elements);
      return v;
    }

    /**
     * set selected components returns a new GLVec instance
     *  vec.set({x:3,z:1});
     *  vec.set(3,null,1);
     * @param componentsOrx
     */
    set(componentsOrx) {
      let vec = this.clone();
      if (isObj(componentsOrx)) {
        forEach(componentsOrx, function (val, key) {
          vec[key] = val;
        });
      } else {
        for (let i = 0, len = this.length; i < len; i++) {
          let num = arguments[i];
          if (!isNaN(num)) {
            vec.elements[i] = num;
          }
        }
      }
      return vec;
    }
  }

  GLVec.vecDot = vecDot;

  GLVec.vecMix = vecMix;

  GLVec.vecAdd = vecAdd;

  GLVec.vecLength = vecLength;

  GLVec.vecNormalize = vecNormalize;

  function vecMix(vec1, p1, vec2, p2) {
    let length = vec1.length;
    if (length !== vec2.length) {
      throw Error('dot vec of different dimensions');
    }
    let ret = [];
    for (let i = 0; i < length; i++) {
      ret[i] = p1 * vec1[i] + p2 * vec2[i];
    }
    return new GLVec(ret);
  }
  function vecDot(vec1, vec2) {
    if (typeof vec2 === "number") {
      return vecScale(vec1, vec2);
    }
    let length = vec1.length;
    if (length !== vec2.length) {
      throw Error('dot vec of different dimensions');
    }
    let ret = [];
    for (let i = 0; i < length; i++) {
      ret[i] = vec1[i] * vec2[i];
    }
    return new GLVec(ret);
  }
  function vecScale(vec, scale) {
    let ret = [];
    for (let i = 0; i < vec.length; i++) {
      ret[i] = vec[i] * scale;
    }
    return new GLVec(ret);
  }
  function vecAdd(vec1, vec2) {
    let length = vec1.length;
    if (length !== vec2.length) {
      throw Error('add vec of different dimensions');
    }
    let ret = [];
    for (let i = 0; i < length; i++) {
      ret[i] = vec2[i] + vec1[i];
    }
    return new GLVec(ret);
  }
  function vecLength(vec) {
    let sum = 0;
    for (let i = 0, len = vec.length; i < len; i++) {
      let num = vec[i];
      sum += num * num;
    }
    return Math.sqrt(sum);
  }
  function vecNormalize(vec) {
    let vLen = vecLength(vec);
    if (vLen == 0) {
      return new GLVec(vec.length);
    }
    let ret = [];
    for (let i = 0; i < vec.length; i++) {
      ret[i] = vec[i] / vLen;
    }
    return new GLVec(ret);
  }
  /*
   like a gl vec, vec component can be accessed by index or name
   var vec=new GLVec([1,2,3,4]);
   vec.x    // 1
   vec[1]  //2
   vec.b  //3
   vec.w == vec.a == vec[3] == 4
   */
  ['0,0', 'x,0', 'r,0', '1,1', 'y,1', 'g,1', '2,2', 'z,2', 'b,2', '3,3', 'w,3', 'a,3'].forEach(function (def) {
    let components = def.split(','),
        index = +components[1],
        name = components[0];
    Object.defineProperty(GLVec.prototype, name, {
      get: function () {
        return this.elements[index];
      },
      set: function (val) {
        this.elements[index] = +val;
      }
    });
  });

  /**
   * Created by brian on 02/12/2016.
   */
  const mapSeed = {};
  function nextUid(type) {
    if (!mapSeed.hasOwnProperty(type)) {
      mapSeed[type] = 1;
    }
    return mapSeed[type]++;
  }

  /**
   * Created by brian on 02/12/2016.
   */
  class GLBinder {

    constructor(arg) {
      if (!isObj(arg)) {
        arg = {};
      }
      this.name = arg.name || nextUid(this.constructor.name);
      if (isFunc(arg.bind)) {
        this.bind = arg.bind;
      }

      if (isObj(arg.controller) && isFunc(arg.controller.invalid)) {
        this.controllers = [arg.controller];
      } else {
        this.controllers = [];
      }
    }

    get disposed() {
      return getDisposed(this);
    }

    get canDispose() {
      return this.controllers.length == 0;
    }

    addController(ctrl) {
      arrAdd(this.controllers, ctrl);
    }

    removeController(ctrl) {
      arrRemove(this.controllers, ctrl);
    }

    bind(gl, state) {}

    invalid() {
      this.controllers.forEach(c => c.invalid());
    }

    dispose(state) {
      setDisposed(this);
    }

    update() {}

  }
  GLBinder.prototype.constructor = GLBinder;

  /**
   * Created by brian on 02/12/2016.
   */
  const GLHANDLE_KEY = createPrivateMemberName('glHandle');
  const BUFFERED_KEY = createPrivateMemberName('buffered');
  const DATA_KEY = createPrivateMemberName('data');
  class GLResource extends GLBinder {

    bind(gl, state) {
      this.checkGLHandle(gl);
      this.bindResource(gl, state);
      this.checkBufferData(gl, state);
    }

    update(state) {}

    checkBufferData(gl, state) {
      if (!this[BUFFERED_KEY]) {
        this.bufferData(gl, state);
        this[BUFFERED_KEY] = true;
      }
    }

    checkGLHandle(gl) {
      if (!this.glHandle) {
        let handle = this[GLHANDLE_KEY] = this.createGLHandle(gl);
        this.disposeGLHandle = () => {
          this.deleteGLHandle(gl, handle);
          this[GLHANDLE_KEY] = null;
        };
      }
    }

    createGLHandle(gl) {}

    disposeGLHandle() {
      this.resetResource();
    }

    deleteGLHandle(gl, handle) {}

    bindResource(gl, state) {}

    bufferData(gl) {}

    dispose(state) {
      this.disposeGLHandle();
      super.dispose(state);
    }

    get glHandle() {
      return this[GLHANDLE_KEY];
    }

    get dataInvalid() {
      return !this[BUFFERED_KEY];
    }

    set data(d) {
      if (d != this[DATA_KEY]) {
        this[DATA_KEY] = this.convertValidData(d);
        this.resetResource();
      }
    }

    get data() {
      return this[DATA_KEY];
    }

    convertValidData(data) {}

    resetResource() {
      this[BUFFERED_KEY] = false;
      this.invalid();
    }

  }
  GLResource.prototype.constructor = GLResource;

  /**
   * Created by brian on 02/12/2016.
   */
  class GLBuffer extends GLResource {

    constructor(arg) {
      super(arg);
      if (!isObj(arg)) {
        arg = {};
      }
      this._type = arg.type == WebGL_CONST.ELEMENT_ARRAY_BUFFER ? WebGL_CONST.ELEMENT_ARRAY_BUFFER : WebGL_CONST.ARRAY_BUFFER;
      this.data = arg.data;
      this.usage = arg.usage || WebGL_CONST.STATIC_DRAW;
    }

    createGLHandle(gl) {
      return gl.createBuffer();
    }

    deleteGLHandle(gl, handler) {
      gl.deleteBuffer(handler);
    }

    get length() {
      return this._data ? this._data.length : 0;
    }

    convertValidData(arr) {
      if (arr) {
        let type = this._type;
        if (arr instanceof Array) {
          if (type == WebGL_CONST.ARRAY_BUFFER) {
            return new Float32Array(arr);
          } else if (type == WebGL_CONST.ELEMENT_ARRAY_BUFFER) {
            return new Uint16Array(arr);
          }
        } else if (isTypedArray(arr)) {
          if (type == WebGL_CONST.ARRAY_BUFFER) {
            return arr;
          } else if (type == WebGL_CONST.ELEMENT_ARRAY_BUFFER && arr instanceof Uint16Array) {
            return arr;
          }
        }
      }
      throw Error('invalid data type for GLBuffer');
    }

    bufferData(gl) {
      gl.bufferData(this._type, this.data, this.usage);
    }

    bindResource(gl, e) {
      gl.bindBuffer(this._type, this.glHandle);
    }
  }
  function isTypedArray(arr) {
    return arr && arr.buffer instanceof ArrayBuffer;
  }
  GLBuffer.prototype.constructor = GLBuffer;

  /**
   * Created by brian on 02/12/2016.
   */
  let GET_HALF_FLOAT_LINEAR;
  let GET_FLOAT_LINEAR;
  /**
   * @alias Flip.GL.Texture
   */
  class GLTexture extends GLResource {

    constructor(arg) {
      super();
      if (!isObj(arg)) {
        arg = {};
      }
      this._type = arg.type || WebGL_CONST.TEXTURE_2D;
      this.dataFormat = arg.dataFormat || WebGL_CONST.UNSIGNED_BYTE;
    }

    createGLHandle(gl) {
      if (this.dataFormat == WebGL_CONST.FLOAT && !gl.getExtension('OES_texture_float')) {
        throw Error('float texture is not support');
      } else if (this.dataFormat == WebGL_CONST.HALF_FLOAT_OES && !gl.getExtension('OES_texture_half_float')) {
        throw Error('half float texture is not support');
      }
      return gl.createTexture();
    }

    deleteGLHandle(gl, handle) {
      gl.deleteTexture(handle);
    }

    bindResource(gl, e) {
      gl.bindTexture(this._type, this.glHandle);
    }

    activeIndex(gl, index) {
      gl.activeTexture(gl.TEXTURE0 + index);
      this.bind(gl);
    }

    useTexParam(gl, param) {
      let targetTexture = this._type;
      let dataFormat = this.dataFormat;
      let method = dataFormat == WebGL_CONST.UNSIGNED_BYTE ? 'texParameteri' : 'texParameterf';
      ['TEXTURE_MAG_FILTER', 'TEXTURE_MIN_FILTER'].forEach(key => {
        if (param[key] == WebGL_CONST.LINEAR) {
          let errorMessage;
          if (dataFormat === WebGL_CONST.HALF_FLOAT_OES && !GET_HALF_FLOAT_LINEAR) {
            let ext = gl.getExtension('OES_texture_half_float_linear');
            GET_HALF_FLOAT_LINEAR = true;
            if (!ext) {
              errorMessage = 'half float texture linear filter is not support';
            }
          } else if (dataFormat === WebGL_CONST.FLOAT && !GET_FLOAT_LINEAR) {
            let ext = gl.getExtension("OES_texture_float_linear");
            if (!ext) {
              errorMessage = 'float texture linear filter is not support';
            }
            GET_FLOAT_LINEAR = true;
          }
          if (errorMessage) {
            console.warn(errorMessage);
          }
        }
        setParam(key);
      });
      ['TEXTURE_WRAP_S', 'TEXTURE_WRAP_T'].forEach(setParam);
      function setParam(key) {
        if (key in param) {
          gl[method](targetTexture, gl[key], param[key]);
        }
      }
    }
  }
  GLTexture.prototype.constructor = GLTexture;

  /**
   * Created by brian on 02/12/2016.
   */
  class GLMesh extends Render {

    constructor(arg) {
      super();
      this.binder = {};
      this.addBinder(arg.binder);
      this.primitive = isNaN(arg.primitive) ? WebGL_CONST.TRIANGLES : arg.primitive;
      if (isFunc(arg.beforeDraw)) {
        this.beforeDraw = arg.beforeDraw;
      }
      if (isFunc(arg.afterDraw)) {
        this.afterDraw = arg.afterDraw;
      }
      this.setDrawRange(arg.drawCount, arg.startIndex);
      this.invalid();
    }

    addBinder(binderOrFunc, name) {
      let binder;
      if (isFunc(binderOrFunc)) {
        binder = new GLBinder({ bind: binderOrFunc, controller: this, name });
      } else if (binderOrFunc instanceof GLBinder) {
        binder = binderOrFunc;
      } else if (arguments.length == 1 && isObj(binderOrFunc)) {
        let ret = false;
        forEach(binderOrFunc, (binder, name) => this.addBinder(binder, name) && (ret = true));
        return ret;
      } else if (arguments.length == 2) {
        this.binder[name] = binderOrFunc;
        return true;
      } else {
        return false;
      }
      if (getDisposed(binder)) {
        throw Error('binder disposed should not be added again');
      }
      name = binder.name;
      if (this.binder[name]) {
        throw Error(`binder named:${name} has been added`);
      }
      this.binder[name] = binder;
      binder.addController(this);
      return true;
    }

    removeBinder(binderOrFunc) {
      let binder;
      if (isFunc(binderOrFunc)) {
        binder = objFind(this.binder, c => c.bind == binderOrFunc);
      } else if (isStr(binderOrFunc)) {
        binder = this.binder[binderOrFunc];
      } else if (binderOrFunc instanceof GLBinder) {
        binder = binderOrFunc;
      }
      if (binder instanceof GLBinder && this.binder[binder.name] == binder) {
        delete this.binder[binder.name];
        binder.removeController(this);
        return true;
      }
      return false;
    }

    render(state) {
      super.render(state);
      let gl = state.gl;
      this.bind(gl, state);
      this.beforeDraw(gl, state);
      this.draw(gl, state);
      this.afterDraw(gl, state);
    }

    beforeDraw(gl, state) {}

    draw(gl, state) {
      let indexBuffer = this.indexBuffer;
      if (this.drawCount) {
        if (indexBuffer) {
          indexBuffer.bind(gl);
          gl.drawElements(this.primitive, this.drawCount, gl.UNSIGNED_SHORT, this.startIndex);
        } else {
          gl.drawArrays(this.primitive, this.startIndex, this.drawCount);
        }
      }
    }

    afterDraw(gl, state) {}

    bind(gl, state) {
      forEach(this.binder, (binder, name) => {
        if (binder instanceof GLBinder) {
          binder.bind(gl, state);
        } else {
          console.warn(`binder:${name} expect GLBinder`, binder);
        }
      });
    }

    update(state) {
      super.update(state);
      this.updateBinder(state);
    }

    updateBinder(state) {
      forEach(this.binder, b => b instanceof GLBinder && b.update(state));
    }

    disposeBinder(state) {
      forEach(this.binder, b => {
        this.removeBinder(b);
        if (b.canDispose) {
          b.dispose(state);
        }
      });
    }

    dispose(state) {
      this.disposeBinder(state);
      super.dispose(state);
    }

    setDrawRange(count, start) {
      this.startIndex = start || 0;
      this.drawCount = count;
    }

    setDrawIndexBuffer(buffer, count, start) {
      let indexBuffer = this.indexBuffer;
      if (indexBuffer && indexBuffer.removeController(this) && indexBuffer.canDispose) {
        indexBuffer.deleteGLHandle();
      }
      this.indexBuffer = buffer;
      this.drawCount = isNaN(count) ? count : buffer.length;
      this.startIndex = start || 0;
      buffer.addController(this);
    }
  }

  GLMesh.prototype.constructor = GLMesh;

  /**
   * Created by brian on 05/12/2016.
   */
  class GLRenderBuffer extends GLResource {
    createGLHandle(gl) {
      return gl.createRenderbuffer();
    }

    deleteGLHandle(gl, handle) {
      gl.deleteRenderbuffer(handle);
    }

    bindResource(gl, state) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.glHandle);
    }
  }
  GLRenderBuffer.prototype.constructor = GLRenderBuffer;

  /**
   * Created by brian on 05/12/2016.
   */
  const PRO_TEXTURE = createPrivateMemberName('texture');
  const PRO_TEXTURE_INDEX = createPrivateMemberName('textureIndex');
  /**
   * @alias Flip.GL.FrameBuffer
   */
  class GLFrameBuffer extends GLResource {
    constructor(arg) {
      super(arg);
      this._w = arg.width || 0;
      this._h = arg.height || 0;
      this._depthBuffer = arg.useDepthBuffer ? new GLRenderBuffer() : null;
      this.texture = arg.texture || new GLTexture({
        type: WebGL_CONST.TEXTURE_2D,
        dataFormat: arg.dataFormat || WebGL_CONST.UNSIGNED_BYTE
      });
      this.shouldCheckComplete = true;
      this.shouldClearTexture = true;
      this[PRO_TEXTURE_INDEX] = -1;
      this.textureParam = makeOptions(arg.textureParam, {
        TEXTURE_MAG_FILTER: WebGL_CONST.LINEAR,
        TEXTURE_MIN_FILTER: WebGL_CONST.LINEAR,
        TEXTURE_WRAP_S: WebGL_CONST.CLAMP_TO_EDGE,
        TEXTURE_WRAP_T: WebGL_CONST.CLAMP_TO_EDGE
      });
    }

    createGLHandle(gl) {
      return gl.createFramebuffer();
    }

    deleteGLHandle(gl) {}

    createSampler2D(name, keepBinding) {
      return new GLFrameBufferSampler2D({ name, framebuffer: this, keepFramebufferBinding: keepBinding });
    }

    bindResource(gl, state) {
      if (this[PRO_TEXTURE_INDEX] == -1) {
        this[PRO_TEXTURE_INDEX] = state.task.getFramebufferTextureIndex(this.name);
      }
      this.checkBufferData(gl, state);
      if (!this.dataInvalid) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.glHandle);
      }
    }

    unbind(gl) {
      if (gl.getParameter(gl.FRAMEBUFFER_BINDING) == this.glHandle) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        throw Error('framebuffer to unbind is not binding');
      }
    }

    bufferData(gl) {
      let w = this._w || gl.drawingBufferWidth;
      let h = this._h || gl.drawingBufferHeight;
      let texture = this.texture;
      this.bindTexture(gl, texture);
      texture.useTexParam(gl, this.textureParam);
      let dataFormat = texture.dataFormat;
      if (this.shouldClearTexture) {
        let format = WebGL_CONST.RGBA;
        gl.texImage2D(gl.TEXTURE_2D, 0, format, w, h, 0, format, dataFormat, null);
      }
      let depthBuffer = this._depthBuffer;
      if (depthBuffer) {
        this.bindDepthBuffer(gl, depthBuffer, w, h);
      }
      if (this.shouldCheckComplete && gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        let moreReason = '';
        if (dataFormat === WebGL_CONST.FLOAT || dataFormat === WebGL_CONST.HALF_FLOAT_OES) {
          moreReason = ` Not support render to ${dataFormat == WebGL_CONST.HALF_FLOAT_OES ? 'half ' : ''} float texture`;
        }
        throw Error('FrameBuffer failed' + moreReason);
      }
    }

    bindDepthBuffer(gl, depthBuffer, width, height) {
      if (depthBuffer instanceof GLRenderBuffer) {
        depthBuffer.bind(gl);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer.glHandle);
      } else {
        throw Error('invalid depth buffer');
      }
    }

    bindTexture(gl, texture) {
      if (texture instanceof GLTexture) {
        texture.activeIndex(gl, this[PRO_TEXTURE_INDEX]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.glHandle);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.glHandle, 0);
      } else {
        throw Error('invalid texture');
      }
    }

    set width(v) {
      v = parseInt(v);
      if (this._w !== v) {
        this._w = v;
        this.resetResource();
      }
    }

    set height(v) {
      v = parseInt(v);
      if (this._h !== v) {
        this._h = v;
        this.resetResource();
      }
    }

    set texture(tex) {
      if (this.texture != tex) {
        if (this.texture) {
          this.texture.removeController(this);
        }
        this[PRO_TEXTURE] = tex;
        if (tex instanceof GLTexture) {
          tex.addController(this);
        }
        this.resetResource();
      }
    }

    get texture() {
      return this[PRO_TEXTURE];
    }
  }
  GLFrameBuffer.prototype.constructor = GLFrameBuffer;
  class GLFrameBufferSampler2D extends GLResource {

    constructor(arg) {
      super(arg);
      this.framebuffer = arg.framebuffer;
      this.keepFramebufferBinding = arg.keepFramebufferBinding;
    }

    checkGLHandle(gl) {
      if (!this.framebuffer.texture.glHandle) {
        throw Error('frame buffer texture not initiated');
      }
    }

    bind(gl, state) {
      if (!this.keepFramebufferBinding) {
        let framebuffer = this.framebuffer;
        if (framebuffer && gl.getParameter(gl.FRAMEBUFFER_BINDING) === framebuffer.glHandle) {
          this.framebuffer.unbind(gl);
        }
      }
      state.scene.bindSamplerTexture(gl, this.name, this.framebuffer.texture);
    }
  }
  GLFrameBufferSampler2D.prototype.constructor = GLFrameBufferSampler2D;

  /**
   * Created by brian on 29/01/2017.
   */
  class GLComputeMesh extends GLMesh {

    constructor(arg) {
      super(arg);
      let fb = arg && arg.framebuffer;
      if (fb instanceof GLFrameBuffer) {
        this.framebuffer = fb;
      } else {
        this.framebuffer = new GLFrameBuffer(objAssign({ name: 'computeTarget' }, fb));
      }
      this.outputTexture = arg && arg.outputTexture ? arg.outputTexture : new GLTexture({ dataFormat: fb ? this.framebuffer.texture.dataFormat : 0 });
      this.computeOnce = false;
    }

    dispose(state) {
      super.dispose(state);
      this.framebuffer.dispose(state);
      this.outputTexture.dispose(state);
    }

    draw(gl, state) {
      let fb = this.framebuffer;
      let vo;
      if (fb._w && fb._h) {
        vo = gl.getParameter(gl.VIEWPORT);
        gl.viewport(0, 0, fb._w, fb._h);
      }
      fb.bind(gl, state);
      super.draw(gl, state);
      fb.unbind(gl);
      if (vo) {
        gl.viewport.apply(gl, vo);
      }
      let t1 = fb.texture;
      fb.texture = this.outputTexture;
      fb.shouldCheckComplete = false;
      this.outputTexture = t1;
      this.computeOnce = true;
    }

  }

  /**
   * Created by brian on 02/12/2016.
   */
  class GLRender extends TreeRender {

    constructor(arg) {
      super(arg);
      this.binder = {};
      if (isObj(arg) && isObj(arg.binder)) {
        this.addBinder(arg.binder);
      }
    }

    add(child) {
      if (child instanceof GLRender || child instanceof GLMesh) {
        return this.addChild(child);
      } else if (child instanceof GLBinder) {
        return this.addBinder(child);
      }
    }

    remove(child) {
      return this.removeChild(child);
    }

    updateSelf(state) {
      super.updateSelf(state);
      this.updateBinder(state);
    }

    beforeRenderChildren(state) {
      this.bind(state.gl, state);
    }

    dispose(state) {
      this.disposeBinder(state);
      super.dispose(state);
    }
  }
  ['addBinder', 'removeBinder', 'bind', 'disposeBinder', 'updateBinder'].forEach(key => {
    GLRender.prototype[key] = GLMesh.prototype[key];
  });

  /**
   * Created by brian on 17/10/2016.
   */
  function dictionarySet(target, key, value) {
    let arr = target[key];
    if (!arr) {
      target[key] = [value];
    } else if (arr.indexOf(value) == -1) {
      arr.push(value);
    } else {
      return false;
    }
    return true;
  }

  /**
   * Created by brian on 04/12/2016.
   */
  function createGLProgram(gl, vSource, fSource, define) {
    let program = gl.createProgram(),
        shader = gl.createShader(gl.FRAGMENT_SHADER),
        marco = '',
        error;
    forEach(define, function (val, key) {
      marco += '#define ' + key + ' ' + val + '\n';
    });
    gl.shaderSource(shader, marco + fSource);
    gl.compileShader(shader);
    let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      error = gl.getShaderInfoLog(shader);
      throw Error('fragment shader fail:\n' + prettyPrintError(error, marco + fSource));
    }
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
    shader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(shader, marco + vSource);
    gl.compileShader(shader);
    compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      error = gl.getShaderInfoLog(shader);
      throw Error('vertex shader fail:\n' + prettyPrintError(error, marco + vSource));
    }
    gl.attachShader(program, shader);
    gl.linkProgram(program);
    gl.deleteShader(shader);
    error = gl.getProgramInfoLog(program);
    if (error) {
      throw Error('program link fail:' + error);
    }
    return program;
  }
  function prettyPrintError(message, source) {
    let exp = /\d+:(\d+):(.*?)(\n|$)/g;
    let match;
    let dictionary = {};
    while (match = exp.exec(message)) {
      let line = match[1];
      let reason = match[2];
      dictionarySet(dictionary, line, `*** ERROR:${reason} ***`);
    }
    let lines = source.split('\n');
    let errorLines = [];
    forEach(dictionary, (reasons, line) => {
      let index = line - 1;
      errorLines.push(`${lines[index]}\nline:${index}:${reasons.join('\n')}\n`);
    });
    return errorLines.join('\n');
  }
  function getGLEntries(gl, program, def) {
    let attributes = {},
        uniforms = {};
    forEach(def.attributes, function (define, name) {
      let loc = gl.getAttribLocation(program, name);
      if (loc == -1 && !define.conditional) {
        console.warn('Fail to get attribute ' + name);
      } else {
        attributes[name] = new GLAttributeEntry(define.type, loc, name);
      }
    });
    forEach(def.uniforms, function (define, name) {
      if (!uniforms.hasOwnProperty(name)) {
        let loc = gl.getUniformLocation(program, name);
        if (loc == -1 && !define.conditional) {
          console.warn('Fail to get uniform ' + name);
        } else {
          uniforms[name] = new GLUniformEntry(define.type, loc, name);
        }
      }
    });
    return { uniforms, attributes };
  }
  function getGLProgramInfo(source) {
    const uniforms = {};
    const attributes = {};
    const exp = /(\buniform\b|\battribute\b|#if|#endif)/g;
    const defineExp = /(uniform|attribute)\s+(highp|mediump|lowp)?\s*\b([biu]?vec[234]|bool|u?int|float|sampler2D|samplerCube|mat[234])\b\s+\b(\w+)\b/;
    const whitespace = /([\s\t\r\n]+|\/\*.*?\*\/|\/\/.*?\n)/g;
    let match;
    let conditional = false;
    while (match = exp.exec(source)) {
      let pair = match[0];
      let startIndex = match.index;
      if (pair == 'uniform' || pair == 'attribute') {
        let statement = source.substring(startIndex, source.indexOf(';', startIndex)).replace(whitespace, ' ');
        let define = statement.match(defineExp);
        if (define) {
          let target = define[1] == 'uniform' ? uniforms : attributes;
          let name = define[4];
          target[name] = { name, type: define[3], conditional };
        }
      } else if (pair == '#endif') {
        conditional = false;
      } else if (pair == '#if') {
        conditional = true;
      }
    }
    return { uniforms, attributes };
  }
  class GLUniformEntry {

    constructor(type, location, name) {
      this.loc = location;
      this.name = name;
      this.type = type;
      this.setGLValue = GLUniformSetters[type];
      this._lastValue = 0;
    }

    use(gl, value, force) {
      let type = this.type;
      if (this.maybeInvalid(value, type) || force) {
        this.setGLValue(gl, value, this.loc);
        if (/(mat|vec)(2|3|4)/.test(type)) {
          this._lastValue = new Float32Array(this._lastRef = value.elements);
        } else {
          this._lastRef = null;
          this._lastValue = value;
        }
      }
    }

    maybeInvalid(val, type) {
      let last = this._lastValue;
      if (last) {
        if (/(mat|vec)(2|3|4)/.test(type)) {
          if (isObj(val) && val.elements) {
            let next = val.elements;
            let currentElements = last;
            if (next != this._lastRef) {
              return true;
            }
            for (let i = 0, len = currentElements.length; i < len; i++) {
              if (currentElements[i] !== next[i]) {
                return true;
              }
            }
            return false;
          }
        } else if (/float|int/.test(type)) {
          return val !== last;
        }
      }
      return true;
    }

    setGLValue(gl, value, loc) {}
  }
  const GLUniformSetters = GLUniformEntry.setter = {
    ivec4: function (gl, vec, loc) {
      gl.uniform4fv(loc, vec);
    },
    ivec3: function (gl, vec, loc) {
      gl.uniform3iv(loc, vec);
    },
    ivec2: function (gl, vec, loc) {
      gl.uniform2iv(loc, vec);
    },
    vec4: function (gl, vec, loc) {
      gl.uniform4fv(loc, vec.elements);
    },
    vec3: function (gl, vec, loc) {
      gl.uniform3fv(loc, vec.elements);
    },
    vec2: function (gl, vec, loc) {
      gl.uniform2fv(loc, vec.elements);
    },
    mat4: function (gl, mat, loc) {
      gl.uniformMatrix4fv(loc, false, mat.elements);
    },
    mat3: function (gl, mat, loc) {
      gl.uniformMatrix3fv(loc, false, mat.elements);
    },
    mat2: function (gl, mat, loc) {
      gl.uniformMatrix2fv(loc, false, mat.elements);
    },
    float: function (gl, f, loc) {
      gl.uniform1f(loc, f);
    },
    sampler2D: function (gl, index, loc) {
      gl.uniform1i(loc, index);
    },
    samplerCube: function (gl, index, loc) {
      gl.uniform1i(loc, index);
    },
    int: function (gl, i, loc) {
      gl.uniform1i(loc, i);
    },
    bool: function (gl, i, loc) {
      gl.uniform1i(loc, i ? 1 : 0);
    }
  };
  class GLAttributeEntry {

    constructor(type, loc, name) {
      let t = 1;
      if (/vec([234])/.test(type)) {
        t = +RegExp.$1;
      }
      this.size = t;
      this.loc = loc;
      this.name = name;
      let format = WebGL_CONST.FLOAT;
      if (/^(biu)/.test(type)) {
        let s = RegExp.$1;
        if (s == 'b') {
          format = WebGL_CONST.BOOL;
        } else if (s == 'i') {
          format = WebGL_CONST.INT;
        } else if (s == 'u') {
          format = WebGL_CONST.UNSIGNED_INT;
        }
      }
      this.textureFormat = format;
    }
  }

  /**
   * Created by brian on 04/12/2016.
   */
  class GLAttribute extends GLResource {

    constructor(arg) {
      super(arg);
      this.offset = arg.offset;
      this.stride = arg.stride;
      this.data = arg.data;
    }

    bindResource(gl, e) {
      let buffer = this.data;
      buffer.bind(gl, e);
      if (buffer.dataInvalid) {
        buffer.bufferData(gl, e);
      }
      let entry = e.glParam[this.name];
      gl.enableVertexAttribArray(entry.loc);
      gl.vertexAttribPointer(entry.loc, entry.size, entry.textureFormat, false, this.stride || 0, this.offset || 0);
    }

    dispose(state) {
      if (this.data.canDispose) {
        this.data.dispose(state);
      }
      super.dispose(state);
    }

    createGLHandle(gl) {
      this.data.createGLHandle(gl);
    }

    bufferData(gl) {
      this.data.bufferData(gl);
    }

    convertValidData(data) {
      let ret;
      if (data instanceof GLBuffer) {
        ret = data;
      } else if (isTypedArray(data) || data instanceof Array) {
        ret = new GLBuffer({ data, type: WebGL_CONST.ARRAY_BUFFER });
      } else {
        throw Error('invalid attribute data');
      }
      let buffer = this.data;
      if (buffer instanceof GLBuffer) {
        buffer.removeController(this);
      }
      ret.addController(this);
      return ret;
    }
  }

  /**
   * Created by brian on 04/12/2016.
   */
  const PRO_DYNAMIC = createPrivateMemberName('dynamic');
  const PRO_VALUE = createPrivateMemberName('value');
  /**
   * @alias Flip.GL.Uniform
   */
  class GLUniform extends GLBinder {

    constructor(opt) {
      if (!opt) {
        opt = {};
      }
      super(opt);
      this.type = opt.type;
      this.value = opt.value;
    }

    get dynamic() {
      return this[PRO_DYNAMIC];
    }

    getValue() {
      throw Error('no value provided for:' + this.name);
    }

    set value(v) {
      let dynamic = isFunc(v);
      if (dynamic) {
        this.getValue = v;
      } else {
        this[PRO_VALUE] = convertUniformValue(v, this.type);
      }
      this[PRO_DYNAMIC] = dynamic;
      setInvalid(this, true);
    }

    get value() {
      return this[PRO_DYNAMIC] ? convertUniformValue(this.getValue(), this.type) : this[PRO_VALUE];
    }

    bind(gl, state) {
      bindUniform(gl, state, this);
      setInvalid(this, false);
    }

    update(state) {
      super.update(state);
      if (isInvalid(this)) {
        state.task.invalid();
      }
    }
  }
  GLUniform.prototype.constructor = GLUniform;

  function convertUniformValue(value, type) {
    if (/vec(2|3|4)/.test(type)) {
      let num = +RegExp.$1;
      if (value instanceof GLVec) {
        return value.clone();
      } else if (value instanceof Array) {
        return new GLVec(value.slice(0, num));
      } else if (value instanceof Float32Array) {
        return new GLVec(value.subarray(0, num));
      }
      throw Error('cannot convert to vec' + num);
    } else if (/mat(2|3|4)/.test(type)) {
      return convertMat(value, +RegExp.$1);
    } else if (type == 'int') {
      return parseInt(value);
    } else if (type == 'float') {
      return +value;
    }
    return value;
  }
  function convertMat(mat, dimension) {
    let elements;
    let elementCount = dimension * dimension;
    if (mat instanceof Array) {
      elements = new Float32Array(mat);
    } else if (mat.elements) {
      if (!(mat.elements instanceof Float32Array)) {
        elements = new Float32Array(mat.elements);
      } else {
        elements = mat.elements;
      }
    }
    if (elements instanceof Float32Array) {
      if (elementCount != elements.length) {
        elements = elements.subarray(0, elementCount);
      }
    } else {
      throw Error('cannot convert to mat' + dimension);
    }
    return { elements, dimension };
  }
  function bindUniform(gl, state, uniform) {
    let entry = state.glParam[uniform.name];
    if (!entry) {
      throw Error(`no gl entry named:` + uniform.name);
    }
    entry.use(gl, uniform.value);
  }

  /**
   * Created by brian on 04/12/2016.
   */
  const TEXTURE_PRO = createPrivateMemberName('texture');
  /**
   * @alias Flip.GL.Sampler2D
   */
  class GLSampler2D extends GLResource {

    constructor(arg) {
      super(arg);
      this.flipY = arg.flipY !== false;
      this.textureFormat = WebGL_CONST.RGB;
      this.data = arg.data || arg.source;
      this.texture = arg.texture instanceof GLTexture ? arg.texture : new GLTexture({
        dataFormat: arg.dataFormat || WebGL_CONST.UNSIGNED_BYTE,
        type: WebGL_CONST.TEXTURE_2D
      });
      this.textureParam = makeOptions(arg.textureParam, {
        TEXTURE_MAG_FILTER: WebGL_CONST.LINEAR,
        TEXTURE_MIN_FILTER: WebGL_CONST.LINEAR,
        TEXTURE_WRAP_S: arg.textureRepeat ? WebGL_CONST.REPEAT : WebGL_CONST.CLAMP_TO_EDGE,
        TEXTURE_WRAP_T: arg.textureRepeat ? WebGL_CONST.REPEAT : WebGL_CONST.CLAMP_TO_EDGE
      });
      this.dynamicSource = arg.dynamicSource;
    }

    checkGLHandle(gl) {
      this.texture.checkGLHandle(gl);
    }

    update(state) {
      if (this.dynamicSource) {
        this.resetResource();
      }
    }

    bindResource(gl, state) {
      state.scene.bindSamplerTexture(gl, this.name, this.texture);
    }

    bufferData(gl) {
      let source = this.data;
      let tex = this.texture;
      if (source) {
        let format = this.textureFormat;
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.flipY);
        if (isCanvasLike(source) || isImageLike(source) || source instanceof HTMLVideoElement) {
          gl.texImage2D(gl.TEXTURE_2D, 0, format, format, tex.dataFormat, source);
        } else {
          gl.texImage2D(gl.TEXTURE_2D, 0, format, source.width, source.height, 0, format, tex.dataFormat, source.data);
        }
        tex.useTexParam(gl, this.textureParam);
      } else {
        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, null);
      }
    }

    dispose(state) {
      super.dispose(state);
      this.texture.removeController(this);
      if (this.texture.canDispose) {
        this.texture.dispose(state);
      }
    }

    convertValidData(source) {
      let format;
      if (isImageLike(source)) {
        if (!source.complete) {
          throw Error('image should be loaded before use');
        }
        format = WebGL_CONST.RGBA;
      } else if (isCanvasLike(source)) {
        format = WebGL_CONST.RGBA;
      } else if (source instanceof HTMLVideoElement) {
        format = WebGL_CONST.RGB;
      } else if (isObjectSource(source)) {
        format = source.format || WebGL_CONST.RGBA;
        if (source.dataFormat && source.dataFormat != this.texture.dataFormat) {
          throw Error(`source data format:${source.dataFormat} is not same as texture data format:${this.texture.dataFormat}`);
        }
      } else if (!source) {
        format = 0;
      } else {
        throw Error('invalid sampler2d source');
      }
      this.textureFormat = format;
      return source;
    }

    set texture(tex) {
      if (this.texture != tex) {
        if (this.texture) {
          this.texture.removeController(this);
        }
        this[TEXTURE_PRO] = tex;
        if (tex instanceof GLTexture) {
          tex.addController(this);
        }
        this.resetResource();
      }
    }

    get texture() {
      return this[TEXTURE_PRO];
    }

    set source(v) {
      this.data = v;
    }

    get source() {
      return this.data;
    }
  }
  GLSampler2D.prototype.constructor = GLSampler2D;
  function isSampler2DSource(obj) {
    return isImageLike(obj) || isCanvasLike(obj) || obj instanceof HTMLVideoElement || isObjectSource(obj);
  }
  function isObjectSource(source) {
    return isObj(source) && isObj(source.data) && +source.width && +source.height && source.data.buffer instanceof ArrayBuffer;
  }
  function isImageLike(source) {
    return source instanceof HTMLImageElement || source instanceof Image;
  }
  function isCanvasLike(source) {
    return source instanceof HTMLCanvasElement || source instanceof ImageData;
  }

  /**
   * Created by brian on 04/12/2016.
   */
  class GLScene extends GLRender {

    constructor(arg) {
      super(arg);
      this.program = null;
      this.fragShader = arg.fragShader;
      this.vertexShader = arg.vertexShader;
      this.define = objAssign({}, arg.define);
      this.glParam = {};
      this._samplerIndices = [];
      this.programInfo = getGLProgramInfo(this.vertexShader + '\n' + this.fragShader);
    }

    buildBinder(binder) {
      return buildBinder(this.programInfo, binder);
    }

    recursiveBuildBinder() {
      let pInfo = this.programInfo;
      buildRenderBinder(this);
      this.findChild(r => buildRenderBinder(r), true);
      function buildRenderBinder(render) {
        render.binder = objAssign(render.binder, buildBinder(pInfo, render.binder));
      }

      return this;
    }

    update(e) {
      if (!this.program) {
        let gl = e.gl;
        let program = this.program = createGLProgram(gl, this.vertexShader, this.fragShader, this.define);
        let entries = getGLEntries(gl, program, this.programInfo);
        this.glParam = objAssign({}, entries.uniforms, entries.attributes);
        forEach(entries.uniforms, (info, name) => /sampler/.test(info.type) && this._samplerIndices.push(name));
      }
      this.updateGLRenderState(e);
      super.update(e);
    }

    render(e) {
      let program = this.program;
      if (program) {
        e.gl.useProgram(program);
      }
      this.updateGLRenderState(e);
      super.render(e);
    }

    bindSamplerTexture(gl, samplerName, texture) {
      let textureIndex = this._samplerIndices.indexOf(samplerName);
      if (textureIndex > -1) {
        let entry = this.glParam[samplerName];
        texture.activeIndex(gl, textureIndex);
        entry.use(gl, textureIndex);
        return true;
      }
      return false;
    }

    updateSelf(e) {
      this.updateGLRenderState(e);
      super.updateSelf(e);
    }

    updateGLRenderState(state) {
      state.scene = this;
      state.glParam = this.glParam;
    }

  }
  function buildBinder(info, binder) {
    let ret = {};
    forEach(binder, (value, name) => {
      let converted = void 0;
      if (value instanceof GLBinder) {
        converted = value;
      } else {
        let def = info.uniforms[name];
        if (def) {
          let type = def.type;
          if (type == 'sampler2D') {
            if (isSampler2DSource(value) || !value) {
              converted = new GLSampler2D({ name, data: value });
            } else if (isFunc(value)) {
              converted = new GLBinder({ bind: value, name });
            } else if (isObj(value)) {
              converted = new GLSampler2D(objAssign({ name }, value));
            }
          } else if (type == 'samplerCube') {
            throw Error('not support');
          } else {
            converted = new GLUniform({ name: name, type, value });
          }
        } else if (info.attributes.hasOwnProperty(name)) {
          converted = new GLAttribute({ name, data: value });
        } else if (isFunc(value)) {
          converted = new GLBinder({ bind: value, name });
        }
      }
      if (converted instanceof GLBinder) {
        ret[name] = converted;
      }
    });

    return ret;
  }

  /**
   * Created by brian on 05/12/2016.
   */
  class GLRenderTask extends RenderTask {

    constructor(arg) {
      super(arg);
      this.canvas = arg.canvas;
      this._textureIndices = [];
      this._maxTextureIndex = 0;
      this.clear = arg.clear;
    }

    init(glOptions) {
      super.init();
      let gl = this.gl = this.canvas.getContext('webgl', glOptions) || this.canvas.getContext('experimental-webgl', glOptions);
      this._maxTextureIndex = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
      if (!gl) {
        console.error('webgl not support');
      }
      this.supportWebGL = !!gl;
    }

    render(state) {
      this.updateRenderState(state);
      if (this.clear) {
        state.gl.clear(this.clear);
      }
      super.render(state);
    }

    updateRenderState(state) {
      state.gl = this.gl;
      state.supportWebGL = this.supportWebGL;
    }

    update(state) {
      this.updateRenderState(state);
      super.update(state);
    }

    getFramebufferTextureIndex(name) {
      let index = this._textureIndices.indexOf(name);
      if (index == -1) {
        this._textureIndices.push(name);
        index = this._textureIndices.length - 1;
      }
      return this._maxTextureIndex - 1 - index;
    }

  }

  /**
   * Created by brian on 25/01/2017.
   */
  class GLStage extends GLRender {

    constructor(arg) {
      super(arg);
      this.sceneMap = {};
      let scenes = this.createScenes(arg || {});
      scenes.forEach(scene => {
        scene.recursiveBuildBinder();
        this.add(scene);
        this.sceneMap[scene.name] = scene;
      });
    }

    getScene(name) {
      return this.sceneMap[name];
    }

    createScenes(config) {
      return [];
    }

    setVecUniform(render, name, value) {
      if (isStr(render)) {
        render = this.getScene(render);
      }
      let uniform = render.binder[name];
      if (typeof value === "number") {
        uniform.value = value;
      } else if (isObj(value)) {
        let vec = uniform.value;
        uniform.value = value instanceof Array ? vec.set(value[0], value[1], value[2], value[3]) : vec.set(value);
      }
      return this.invalid();
    }
  }

  /**
   * Created by brian on 10/02/2017.
   */
  const floatView = new Float32Array(1);
  const int32View = new Int32Array(floatView.buffer);
  /**
   *
   * @memberOf Flip.GL
   * @param binary
   * @returns {number}
   */
  function decodeHalfFloat(binary) {
    let exponent = (binary & 0x7C00) >> 10;
    let fraction = binary & 0x03FF;
    return (binary >> 15 ? -1 : 1) * (exponent ? exponent === 0x1F ? fraction ? NaN : Infinity : Math.pow(2, exponent - 15) * (1 + fraction / 0x400) : 6.103515625e-5 * (fraction / 0x400));
  }
  /**
   * @memberOf Flip.GL
   * @param number
   * @returns {number}
   */
  function encodeHalfFloat(number) {
    floatView[0] = number;
    let fbits = int32View[0];
    let sign = fbits >> 16 & 0x8000; // sign only
    let val = (fbits & 0x7fffffff) + 0x1000; // rounded value

    if (val >= 0x47800000) {
      // might be or become NaN/Inf
      if ((fbits & 0x7fffffff) >= 0x47800000) {
        // is or must become NaN/Inf
        if (val < 0x7f800000) {
          // was value but too large
          return sign | 0x7c00; // make it +/-Inf
        }
        return sign | 0x7c00 | // remains +/-Inf or NaN
        (fbits & 0x007fffff) >> 13; // keep NaN (and Inf) bits
      }
      return sign | 0x7bff; // unrounded not quite Inf
    }
    if (val >= 0x38800000) {
      // remains normalized value
      return sign | val - 0x38000000 >> 13; // exp - 127 + 15
    }
    if (val < 0x33000000) {
      // too small for subnormal
      return sign; // becomes +/-0
    }
    val = (fbits & 0x7fffffff) >> 23; // tmp exp for subnormal calc
    return sign | (fbits & 0x7fffff | 0x800000) + ( // add subnormal bit
    0x800000 >>> val - 102) // round depending on cut off
    >> 126 - val; // div by 2^(1-(exp-127+15)) and >> 13 | exp=0
  }

  class GLCamera extends GLBinder {

    constructor(opt) {
      super(opt);
      this.viewMatrixUniformName = opt.viewMatrixUniformName;
      this.projectionMatrixUniformName = opt.projectionMatrixUniformName;
      this.viewProjectionMatrixUniformName = opt.viewProjectionMatrixUniformName;
      this.lookAt = opt.lookAt || [0, 0, 0];
      this.position = opt.position || [0, 0, 2];
      this.up = opt.up || [0, 1, 0];
      this.perspective = opt.perspective || [Math.PI / 6, 1, 1, 3];
    }

    bind(gl, state) {
      let vpEntry = state.glParam[this.viewProjectionMatrixUniformName];
      if (vpEntry) {
        vpEntry.use(gl, this.viewProjectionMatrix);
      } else {
        let vEntry = state.glParam[this.viewMatrixUniformName],
            pEntry = state.glParam[this.projectionMatrixUniformName];
        if (vEntry && pEntry) {
          vEntry.use(gl, this.viewMatrix);
          pEntry.use(gl, this.projectionMatrix);
        }
      }
    }

    get viewMatrix() {
      let mat = this._viewMatrix;
      if (!mat) {
        mat = Matrix4.fromLookAt(this.position, this.lookAt, this.up);
        this._viewMatrix = mat;
        this._vpMatrix = null;
      }
      return mat;
    }

    get projectionMatrix() {
      let mat = this._projectionMatrix;
      if (!mat) {
        mat = Matrix4.fromPerspective(this.fovy, this.aspect, this.zNear, this.zFar);
        this._projectionMatrix = mat;
        this._vpMatrix = null;
      }
      return mat;
    }

    get viewProjectionMatrix() {
      let mat = this._vpMatrix;
      if (!mat) {
        mat = this._vpMatrix = this.projectionMatrix.concat(this.viewMatrix);
      }
      return mat;
    }

    set position(vec) {
      this.posX = vec[0];
      this.posY = vec[1];
      this.posZ = vec[2];
    }

    get position() {
      return [this.posX, this.posY, this.posZ];
    }

    set lookAt(vec) {
      this.targetX = vec[0];
      this.targetY = vec[1];
      this.targetZ = vec[2];
    }

    get lookAt() {
      return [this._targetX, this._targetY, this._targetZ];
    }

    get up() {
      return [this._upX, this._upY, this._upZ];
    }

    set up(vec) {
      this.upX = vec[0];
      this.upY = vec[1];
      this.upZ = vec[2];
    }

    set perspective(val) {
      if (val instanceof Array) {
        this.setPerspective.apply(this, val);
      } else if (isObj(val)) {
        this.setPerspective(val.fovy, val.aspect, val.zNear || val.near, val.zFar || val.far);
      }
    }

    get perspective() {
      return [this._fovy, this._aspect, this._zNear, this._zFar];
    }

    get lookDirection() {
      return [this._targetX - this.posX, this._targetY - this.posY, this._targetZ - this.posZ];
    }

    setPerspective(fovy, aspect, near, far) {
      this.fovy = fovy;
      this.aspect = aspect;
      this.zNear = near;
      this.zFar = far;
      this.resetMatrix();
      return this;
    }

    resetMatrix() {
      this._projectionMatrix = null;
      this._viewMatrix = null;
      this._vpMatrix = null;
      this.invalid();
    }
  }

  let numberProperties = ['zNear', 'zFar', 'fovy', 'aspect', 'targetX', 'targetY', 'targetZ', 'posX', 'posY', 'posZ', 'upX', 'upY', 'upZ'];
  numberProperties.forEach(function (name) {
    defNumberProperty(GLCamera.prototype, name);
  });
  function defNumberProperty(obj, name) {
    let privateName = '_' + name;
    Object.defineProperty(obj, name, {
      get: function () {
        return this[privateName];
      },
      set: function (val) {
        if (isNaN(val)) {
          throw Error('property ' + name + ' value should be number');
        }
        if (val != this[privateName]) {
          this[privateName] = +val;
          this.resetMatrix();
          this.invalid();
        }
      }
    });
  }

  /**
   * Created by brian on 02/12/2016.
   */
  const GL = objAssign({
    Scene: GLScene,
    Task: GLRenderTask,
    Mesh: GLMesh,
    Sampler2D: GLSampler2D,
    Attribute: GLAttribute,
    FrameBuffer: GLFrameBuffer,
    Uniform: GLUniform,
    Texture: GLTexture,
    Render: GLRender,
    Buffer: GLBuffer,
    Binder: GLBinder,
    Vec: GLVec,
    Stage: GLStage,
    ComputeMesh: GLComputeMesh,
    Camera: GLCamera,
    decodeHalfFloat, encodeHalfFloat,
    Matrix4
  }, WebGL_CONST);

  /**
   * Created by brian on 02/12/2016.
   */
  Flip.GL = GL;
  objAssign(Flip, lib);
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
