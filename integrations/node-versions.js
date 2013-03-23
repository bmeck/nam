//
// Some basic security for user / group permissions (not sufficient on Windows)
//
var semver = require('semver');
var child_process = require('child_process');
var path = require('path');
exports.name = 'node-versions';
exports.actions = {
  //
  // When prepping for real use, bootstrap in the appropriate files
  //
  'task.checkout.scaffold': function secure(scaffold, options, next) {
    var pkg = require(path.join(scaffold.directories.moduledir, 'package.json'));
    //
    // Guess what people thought engine was supposed to be
    //
    var engine =
      pkg.engines && pkg.engines.node ||
      pkg.engine && pkg.engine.node ||
      pkg.engines ||
      pkg.engine;
    
    child_process.exec('give remote-ls', function (err, stdout, stderr) {
      if (err) {
        next(err, scaffold, options);
        return;
      }
      var remote_versions = stdout.split(/\r?\n/g).map(function (x) {
        return x.replace(/^v/,'');
      });
      function finish (err) {
        next(err, scaffold, options);
      }
      var resolved_engine = engine ? semver.maxSatisfying(remote_versions, engine) : semver.maxSatisfying(remote_versions.filter(function (x) {
        return /\d+\.\d+[02468]\.\d+/.test(x);
      }), '*');
      if (!resolved_engine) {
        next(new Error('Unknown node version '+engine), scaffold, options);
        return;
      }
      child_process.spawn('give', ['install', 'v'+resolved_engine], {
        stdio: 'inherit',
        env:{
          NODE_PREFIX: scaffold.directories.rootdir,
          PATH: process.env.PATH
        }
      }).on('exit', function (code) {
        if (code) {
          finish(new Error('Could not install node version '+resolved_engine+' installer exited with code '+code));
          return;
        }
        finish(null);
      }).on('error', finish);
    });
  }
}