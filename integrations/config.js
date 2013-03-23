//
// Add `grunt` task with basic options
// Should npm install first due to peerDeps possibilities
//
exports.name = 'grunt';
exports.tasks = {
  config: function (args, options, cb) {
    if (!args) {
      cb(new Error('config operation required'));
    }
    var operation = args.shift();
    var key = null;
    var value;
    switch (operation) {
      case 'get':
        key = args.shift();
      case 'list':
        console.dir(this.config.get(key));
        break;
      default:
        cb(new Error('unknown config operation '+JSON.stringify(operation)))
        return;
    }
    cb(null);
  }
}