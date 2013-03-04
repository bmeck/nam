//
// Add `npm` task with basic options
//
var getNPMSpawnOptions = require('npm-script').getSpawnOptions;
exports.name = 'npm';
exports.dependencies = [require('tract-run')];
exports.tasks = {
  npm: function (args, options, cb) {
    var scaffold = this;
    var lifecycle = args[0];
    getNPMSpawnOptions(scaffold.directories.moduledir, lifecycle, {
      defaultScript: {
        start: 'node server.js',
        preinstall: process.platform !== 'win32'
          ? '[ -f wscript] && (node-waf clean || true; node-waf configure build)'
          : 'IF EXIST wscript (node-waf clean || true; node-waf configure build)'
      }[lifecycle],
      env: {
        PATH: options.env.PATH || process.env.PATH
      }
    }, function (err, spawnOptions) {
      if (err) {
        cb(err);
        return;
      }
      var argv = spawnOptions[1];
      argv.unshift(spawnOptions[0]);
      spawnOptions.unshift('run');
      scaffold.task.apply(scaffold, spawnOptions.concat(cb));
    });
  }
}