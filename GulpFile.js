/**
 * Created by brian on 7/20/16.
 */
"use strict";
let watchify = require('gulp-watchify');
let gulp = require('gulp');
let less = require('gulp-less');
let rename = require('gulp-rename');
let bundleCollapse = require('bundle-collapser/plugin');
let exec = require('child_process').exec;
gulp.task('js', buildScript({
  src: 'src/*.js',
  dest: 'build/js',
  rename: false,
  watch: true
}));
function buildScript(options) {
  return watchify(function (watchify) {
    let bundle = gulp.src(options.src)
      .pipe(watchify({
        watch: !!options.watch,
        plugin: [bundleCollapse],
        setup(bundle){
          process.env.BABEL_ENV = options.babel || 'development';
          bundle.transform('babelify');
          bundle.transform('browserify-css', { autoInject: false, minify: true });
          (options.ignore || []).forEach(i => bundle.ignore(i));
          forEach(options.alias, (relative, name) => bundle.require(relative, {
            expose: name,
            basedir: process.cwd()
          }))
        }
      }));
    if (options.rename !== false) {
      bundle.pipe(rename(options.dest)).pipe(gulp.dest('./'));
    }
    else {
      bundle.pipe(gulp.dest(options.dest));
    }
    return bundle;
  })
}

function forEach(object, callback, thisObj) {
  if (typeof object === 'object') {
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
