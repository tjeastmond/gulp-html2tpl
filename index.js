var async, gutil, path, through, _;

gutil = require('gulp-util');
through = require('through');
path = require('path');
async = require('async');
_ = require('underscore');


function last_directory(filepath) {
  return filepath.split(path.sep).pop();
}
// a recursive solution would be cleaner
function collect_subfolders(options, file) {
  var names = [];
  // breaks after 4 levels of nesting
  var _paths = ["../", "../../", "../../../", "../../../../"];
  for(var i=0, len=_paths.length; i<len; i++) {
    var currpath = path.resolve(file.path, _paths[i]);
    if(currpath !== options.basepath) {
      names.push(last_directory(currpath));
    } else break;
  }
  return names;
}
/**
  build the string to print into filename (templates.js)

  templates['my_template'] = ...
  tempplates['my_folder']['my_template'] = ...
*/
function get_compiled_format(options, file, val) {
  var str = options.varName;
  var dirname = path.dirname(file.path);
  var data, names;
  names = collect_subfolders(options, file);
  if(options.subfolders && names.length) {
    str += "['" + names.join("']['") + "']";
  }
  str += ("['" + file.name + "'] = " + val + ";");
  return str;
}

module.exports = function(filename, opts) {
  var clean, compile, 
      contents, endStream, escapeContent, 
      first, options, templates;
  templates = [];
  first = null;
  options = _.extend({
    varName: 'templates',
    basepath:'/',
    precompile: true,
    subfolders:false
  }, opts);
  clean = function(string) {
    return string.replace(/\n|\t/gi, '');
  };
  escapeContent = function(string) {
    return clean(string.replace(/"/gi, "\\\""));
  };
  compile = function(callback) {
    var compiled = ["var " + options.varName + " = {};"];
    var subfolders = {};
    function makeString(file, done) {
      
      var val;
      var sfolders = collect_subfolders(options, file);
      var key = "['" + sfolders.join("']['") + "']";
      if(!subfolders[key] && sfolders.length) {
        subfolders[key] = sfolders;
        compiled.push(options.varName + key + " = {};");
      }
      
      val = options.precompile === true ? clean(_.template(file.content, opts).source) : escapeContent(file.content);
      compiled.push( get_compiled_format( options, file, val)  );
      return done(null);
    };
    return async.each(templates, makeString, function(error) {
      return callback(null, compiled.join("\n"));
    });
  };
  contents = function(file) {
    if(file.isNull()) {
      return true;
    }
    if(file.isStream()) {
      return this.emit('error', new gutil.PluginError('gulp-html2obj', 'Steaming not supported'));
    }
    if(file != null) {
      first = file;
    }
    return templates.push({
      name: path.basename(file.path, path.extname(file.path)),
      path:file.path,
      content: file.contents.toString('utf-8')
    });
  };
  endStream = function() {
    if(templates.length === 0) {
      this.emit('end');
    }
    return compile((function(_this) {
      return function(error, content) {
        var newFile = new gutil.File({
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
