//
// Some basic security for user / group permissions (not sufficient on Windows)
//
exports.name = 'security';
exports.schema = {
  properties: {
    uid: {
      type: 'string',
      description: 'the user to associate with this scaffold'
    },
    gid: {
      type: 'string',
      description: 'the group to associate with this scaffold'
    },
    insecure: {
      type: 'boolean',
      description: 'if the user and group should not be set for this instance'
    },
    precomputed: {
      type: 'boolean',
      description: 'if there is no need to check the user and group id before running'
    }
  }
}
exports.actions = {
  //
  // When locking down, change fs attributes appropriately
  //
  'task.checkout.lockdown': function secure(scaffold, next) {
    //
    // for consistency only
    //
    if (scaffold.config.get('task:security:insecure')) {
      next(null, scaffold);
      return;
    }
    var uid = scaffold.config.get('task:security:uid') || process.getuid();
    var gid = scaffold.config.get('task:security:gid') || process.getgid();
    uidNumber(uid, gid, function (err, uid, gid) {
      if (err) {
        next(err);
        return;
      }
      chmodr(scaffold.directories.rootdir, uid, gid, function (err) {
        next(err, scaffold);
      });
    });
  },
  //
  // When programs run, run as the proper user/group
  //
  run: function secure(cmd, args, options, next) {
    var security = options.integrations && options.integrations.security;
    if (!security) {
      next(null, cmd, args, options);
      return;
    }
    var insecure =  security.insecure || scaffold.config.get('task:security:insecure');
    if (insecure) {
      next(null, cmd, args, options);
      return;
    }
    if (security.precomputed) {
      options.uid = security.uid;
      options.gid = security.gid;
      next(null, cmd, args, options);
      return;
    }
    var scaffold = this;
    var uid = security.uid || scaffold.config.get('task:security:uid');
    var gid = security.gid || scaffold.config.get('task:security:gid');
    uidNumber(uid, gid, function (err, uid, gid) {
      if (err) {
        next(err);
        return;
      }
      options.uid = uid;
      options.gid = gid;
      next(null, cmd, args, options);
    });
  }
}