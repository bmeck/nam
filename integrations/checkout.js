//
// Some basic scaffolding utilities
//
var async = require('async');
var checkout = require('checkout');
var path = require('path');
var mkdirp = require('mkdirp');
var merge = require('merge-recursive');
var url = require('url');
var optimist = require('optimist');
exports.name = 'checkout';
exports.schema = {
  properties: {
    repository: {
      type: 'object',
      description: 'checkout specification, destination will be overriden'
    }
  }
}
exports.tasks = {
  //
  // Properly skeleton out the module
  //
  checkout: function secure(args, options, next) {
    var scaffold = this;
    var repo = args.shift();
    if (typeof repo === 'string') {
      var original = repo;
      var parts = url.parse(repo);
      repo = {};
      var proto = parts.protocol;
      if (!proto) {
        next(new Error('Protocol required'));
        return;
      }
      proto = proto.slice(0, -1);
      repo.type = proto;
      if (proto === 'tar-stream') {
        if (!parts.host) {
          repo.stream = process.stdin;
        }
        else {
          repo.stream = fs.createReadStream(path.join(parts.host, parts.path));
        }
      }
      else if (proto === 'git') {
        repo.url = original;
      }
      else if (proto === 'directory') {
        repo.directory = path.resolve(scaffold.directories.rootdir, path.join(parts.host, parts.path));
      }
      options.config.set('repository', repo);
    }
    async.waterfall([
      mkdirs.bind(scaffold, options),
      download.bind(scaffold, options),
      prepare.bind(scaffold, options)
    ], next);
  }
}

function mkdirs(options, cb) {
  var scaffold = this;
  var directories = scaffold.directories;
  var tomake = Object.keys(directories);
  if (!options.config.get('empty')) {
    tomake = tomake.filter(function (dirname) {
      return dirname !== 'moduledir';
    });
  }
  async.forEach(tomake, function (dir, next) {
    mkdirp(path.resolve(directories.rootdir, directories[dir]), next);
  }, cb);
}
function download(options, cb) {
  var scaffold = this;
  var config = options.config.get('repository');
  if (!config) {
    if (options.config.get('empty')) {
      cb(null);
      return;
    }
    cb(new Error('Cannot checkout unknown repository'));
    return;
  }
  var repository = merge.recursive({}, config);
  repository.stream = config.stream;
  repository.destination = config.type !== 'tar-stream' ? scaffold.directories.moduledir : scaffold.directories.packagedir;
  checkout(repository, cb);
}
function prepare(options, cb) {
  var scaffold = this;
  async.series([
    scaffold.perform.bind(scaffold, 'task.checkout.scaffold', scaffold, options),
    scaffold.perform.bind(scaffold, 'task.checkout.lockdown', scaffold, options)
  ], cb);
}