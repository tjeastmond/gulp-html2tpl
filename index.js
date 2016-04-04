var async, gutil, path, through, _;

gutil = require('gulp-util');

through = require('through');

path = require('path');

async = require('async');

_ = require('underscore');

module.exports = function(filename, opts) {
  var clean, compile, contents, endStream, escapeContent, first, options, templates;
  templates = [];
  first = null;
  options = _.extend({
    varName: 'templates',
    precompile: true
  }, opts);
  clean = function(string) {
    return string.replace(/\n|\t/gi, '');
  };
  escapeContent = function(string) {
    return clean(string.replace(/"/gi, "\\\""));
  };
  compile = function(callback) {
    var compiled, makeString;
    compiled = ["var " + options.varName + " = {};"];
    makeString = function(file, done) {
      var val;
      val = options.precompile === true ? clean(_.template(file.content, opts).source) : escapeContent(file.content);
      compiled.push(options.varName + ("['" + file.name + "'] = " + val + ";"));
      return done(null);
    };
    return async.each(templates, makeString, function(error) {
      return callback(null, compiled.join("\n"));
    });
  };
  contents = function(file) {
    if (file.isNull()) {
      return true;
    }
    if (file.isStream()) {
      return this.emit('error', new gutil.PluginError('gulp-html2obj', 'Steaming not supported'));
    }
    if (file != null) {
      first = file;
    }
    return templates.push({
      name: path.basename(file.path, path.extname(file.path)),
      content: file.contents.toString('utf-8')
    });
  };
  endStream = function() {
    if (templates.length === 0) {
      this.emit('end');
    }
    return compile((function(_this) {
      return function(error, content) {
        var newFile;
        newFile = new gutil.File({
          cwd: first.cwd,
          base: first.base,
          path: path.join(first.base, filename),
          contents: new Buffer(content)
        });
        _this.emit('data', newFile);
        return _this.emit('end');
      };
    })(this));
  };
  return through(contents, endStream);
};
