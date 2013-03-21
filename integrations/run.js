//
// Add `run` task with basic options,
// Should add in rootdir paths as apt
//
var path = require('path');
exports.name = 'run';
exports.tasks = {
  run: function (args, options, cb) {
    var scaffold = this;
    var cmd = args.shift();
    var env = options.env || {};
    var toAddPath = path.join(scaffold.directories.rootdir, 'bin');
    var toAddLibPath = path.join(scaffold.directories.rootdir, 'lib');
    var toAddIncludePath = path.join(scaffold.directories.rootdir, 'include');
    function resolveDir(dirpath) {
      return path.resolve(scaffold.directories.rootdir, dirpath);
    }
    var separator = process.platform === 'win32' ? ';' : ':';
    function addStringToEnv(name, str) {
      var base = env[name] || process.env[name] || '';
      env[name] = (base ? base + separator : '') + str;
    }
    switch (process.platform) {
      case "win32":
        addStringToEnv('PATH', toAddPath);
        addStringToEnv('PATH', toAddLibPath);
        addStringToEnv('LIB', toAddLibPath);
        addStringToEnv('LIBPATH', toAddLibPath);
        addStringToEnv('INCLUDE', toAddIncludePath);
        env.USERPROFILE = resolveDir(scaffold.directories.moduledir);
        env.TMP = resolveDir(scaffold.directories.tmpdir);
        break;
      default:
        addStringToEnv('PATH', toAddPath);
        addStringToEnv('LD_LIBRARY_PATH', toAddLibPath);
        addStringToEnv('LIBRARY_PATH', toAddLibPath);
        // AIX
        addStringToEnv('LIBPATH', toAddLibPath);
        addStringToEnv('CPATH', toAddIncludePath);
        env.HOME = resolveDir(scaffold.directories.moduledir);
        env.TMP = resolveDir(scaffold.directories.tmpdir);
    }
    options.env = env;
    scaffold.perform('task.run.lockdown', cmd, args, options, function (err, cmd, args, options) {
      if (err) {
        cb(err);
        return;
      }
      scaffold.run(cmd, args, options, cb);
    });
  }
}