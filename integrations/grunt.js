//
// Add `grunt` task with basic options
// Should npm install first due to peerDeps possibilities
//
exports.name = 'grunt';
exports.dependencies = [
  require('tract-npm')
];
exports.tasks = {
  grunt: function (args, options, cb) {
    var scaffold = this;
    scaffold.run('npm', ['install'], options, function (err) {
      if (err) {
        typeof cb === 'function' && cb(err);
        return;
      }
      scaffold.run('grunt', args, options, cb);
    });
  }
}