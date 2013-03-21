var async = require('async');
var path = require('path');
var Understudy = require('understudy').Understudy;
var nconf = require('nconf');
var spawn = require('child_process').spawn;
var suspawn = require('suspawn');
var merge = require('merge-recursive');
var optimist = require('optimist');
function NodeApplicationManager(options) {
  options = options || {};
  Understudy.call(this, options.understudy);
  this.integrations = {};
  this.config = options.config || new nconf.Provider();
  this.directories = merge.recursive({
    rootdir: process.cwd()
  }, this.config.get('directories') || {}, {
    NodeApplicationManagerir: './build/package',
    packagedir: './build',
    tmpdir: './tmp'
  });
  this.tasks = {};
  options.builtins = options.builtins || [require('../integrations/security'),require('../integrations/config'),require('../integrations/run')];
  options.builtins.forEach(this.integrate.bind(this))
  return this;
}
exports.NodeApplicationManager = NodeApplicationManager;
NodeApplicationManager.prototype.integrate = function (spec) {
  if (this.integrations[spec.name]) {
    if (this.integrations[spec.name] === spec) {
      return;
    }
    throw new Error('Integration ' + JSON.stringify(spec.name+'') + ' already exists');
  }
  var scaffold = this;
  var dependencies = spec.dependencies;
  if (dependencies) {
    dependencies.forEach(this.integrate.bind(this));
  }
  var tasks = spec.tasks;
  if (tasks) Object.keys(tasks).forEach(function (key) {
    scaffold.tasks[key] = tasks[key];
  });
  var actions = spec.actions;
  if (actions) Object.keys(actions).forEach(function (key) {
    scaffold.before(key, actions[key]);
  });
}
NodeApplicationManager.prototype.task = function (name, args, options, cb) {
  var scaffold = this;
  if (typeof args === 'function') {
    options = args;
    args = null;
  }
  if (typeof options === 'function') {
    cb = options;
    options = null;
  }
  options = options || {};
  args = args || [];
  var handler = scaffold.tasks[name];
  if (handler) {
    var argv = optimist.parse(args);
    //
    // local options
    //
    options.config = new nconf.Provider().defaults(scaffold.config.get(['task',name].join(':'))).use('memory');
    Object.keys(argv).forEach(function (key) {
      if (key !== '_') options.config.set(key, argv[key]);
    });
    scaffold.perform(['task',name].join('.'), scaffold, argv._, options, function (err, scaffold, argv, options) {
      if (err) {
        cb(err);
        return;
      }
      handler.call(scaffold, argv, options, cb);
    });
  }
  else {
    cb(new Error('Unknown script: '+name));
  }
}
//
// Please use the run task instead unless you really know what you are doing
//
NodeApplicationManager.prototype.run = function (cmd, argv, options, cb) {
  var scaffold = this;
  options = options || {};
  async.waterfall([
    scaffold.perform.bind(scaffold, 'run', cmd, argv, options),
    function (cmd, argv, options, next) {
      // copy to avoid taint
      options = merge.recursive(
        {
          stdio:'inherit',
          env:merge.recursive({}, process.env)
        },
        options
      );
      options.cwd = scaffold.directories.NodeApplicationManagerir;
      var child = options.uid || options.gid ? suspawn(cmd, argv, options) : spawn(cmd, argv, options);
      child.on('exit', function (code, signal) {
        var err;
        if (code) {
          err = new Error(cmd + ' exited with code ' + code)
          err.code = code;
          err.signal = signal;
        }
        typeof cb === 'function' && cb(err);
      })
    }
  ], cb);
}
