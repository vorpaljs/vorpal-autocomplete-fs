'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var strip = require('strip-ansi');
var isObject = function isObject(value) {
  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
  return !!value && (type === 'object' || type === 'function');
};

var isArray = Array.isArray;

var util = {
  walkDir: function walkDir(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
      var filePath = path.join(currentDirPath, name);
      var stat = undefined;
      try {
        stat = fs.statSync(filePath);
        if (stat.isFile() || stat.isDirectory()) {
          callback(filePath, stat);
        }
      } catch (e) {
        // .. if we can't read the file, forget
        // about it for now.
      }
    });
  },

  path: {
    file: function file(path) {
      var fileShort = String(path).split('/');
      fileShort = fileShort[fileShort.length - 1];
      fileShort = fileShort.split('\\');
      fileShort = fileShort[fileShort.length - 1];
      return fileShort;
    }
  },

  colorize: function colorize(file) {
    var audio = ['aac', 'au', 'flac', 'mid', 'midi', 'mka', 'mp3', 'mpc', 'ogg', 'ra', 'wav', 'axa', 'oga', 'spx', 'xspf'];
    var archive = ['tar', 'tgz', 'arj', 'taz', 'lzh', 'lzma', 'tlz', 'txz', 'zip', 'z', 'Z', 'dz', 'gz', 'lz', 'xz', 'bz2', 'bz', 'tbz', 'tbz2', 'tz', 'deb', 'rpm', 'jar', 'rar', 'ace', 'zoo', 'cpio', '7z', 'rz'];
    var images = ['jpg', 'jpeg', 'gif', 'bmp', 'pbm', 'pgm', 'ppm', 'tga', 'xbm', 'xpm', 'tif', 'tiff', 'png', 'svg', 'svgz', 'mng', 'pcx', 'mov', 'mpg', 'mpeg', 'm2v', 'mkv', 'ogm', 'mp4', 'm4v', 'mp4v', 'vob', 'qt', 'nuv', 'wmv', 'asf', 'rm', 'rmvb', 'flc', 'avi', 'fli', 'flv', 'gl', 'dl', 'xcf', 'xwd', 'yuv', 'cgm', 'emf', 'axv', 'anx', 'ogv', 'ogx'];

    var extension = String(file).toLowerCase().trim().split('.');
    extension = extension[extension.length - 1];

    var colored = strip(file);
    colored = audio.indexOf(extension) > -1 ? chalk.cyan(file) : archive.indexOf(extension) > -1 ? chalk.red(file) : images.indexOf(extension) > -1 ? chalk.magenta(file) : colored;

    return colored;
  },

  permissions: {

    listing: {
      0: '---',
      1: '--x',
      2: '-w-',
      3: '-wx',
      4: 'r--',
      5: 'r-x',
      6: 'rw-',
      7: 'rwx'
    },

    modeToRWX: function modeToRWX(mode) {
      var octal = this.modeToOctal(mode);
      var rwx = this.octalToRWX(octal);
      return rwx;
    },
    modeToOctal: function modeToOctal(mode) {
      var octal = '0' + (mode & 511).toString(8);
      return octal;
    },
    octalToRWX: function octalToRWX(octal) {
      var list = this.listing;
      var a = list[String(octal).charAt(1)];
      var b = list[String(octal).charAt(2)];
      var c = list[String(octal).charAt(3)];
      return a + b + c;
    }
  }
};

var ls = {
  exec: function exec(paths, options) {
    var self = this;
    paths = paths || ['.'];
    paths = !isArray(paths) ? [paths] : paths;
    options = options || {};
    try {
      var results = [];
      for (var i = 0; i < paths.length; ++i) {
        var result = ls.execDir(paths[i], options);
        results.push(result);
      }
      var stdout = ls.formatAll(results, options);
      return stdout;
    } catch (e) {
      /* istanbul ignore next */
      return ls.error.call(self, e);
    }
  },
  error: function error(e) {
    /* istanbul ignore next */
    return e;
  },
  execDir: function execDir(path, options) {
    var files = [];
    var rawFiles = [];

    function pushFile(file, data) {
      rawFiles.push({
        file: file,
        data: data
      });
    }

    // Add in implied current and parent dirs.
    pushFile('.', fs.statSync('.'));
    pushFile('..', fs.statSync('..'));

    // Walk the passed in directory,
    // pushing the results into `rawFiles`.
    util.walkDir(path, pushFile);

    rawFiles = rawFiles.sort(function (a, b) {
      var aFileName = util.path.file(a.file).trim().toLowerCase().replace(/\W/g, '');
      var bFileName = util.path.file(b.file).trim().toLowerCase().replace(/\W/g, '');
      return aFileName > bFileName ? 1 : aFileName < bFileName ? -1 : 0;
    });

    for (var i = 0; i < rawFiles.length; ++i) {
      var file = rawFiles[i].file;
      var data = rawFiles[i].data;
      var fileShort = util.path.file(file);
      var dotted = fileShort && fileShort.charAt(0) === '.';
      var implied = fileShort === '..' || fileShort === '.';
      var permissions = util.permissions.modeToRWX(data.mode);

      var fileName = fileShort;

      // If --classify, add '/' to end of folders.
      fileName = options.classify && data.isDirectory() ? fileName + '/' : fileName;

      // If getting --directory, give full path.
      fileName = options.directory && file === '.' ? path : fileName;

      // Color the files based on $LS_COLORS
      fileName = data.isFile() ? util.colorize(fileName) : fileName;

      // If not already colored and is executable,
      // make it green
      var colored = strip(fileName) !== fileName;
      if (String(permissions).indexOf('x') > -1 && !colored && data.isFile()) {
        fileName = chalk.green(fileName);
      }

      // Make directories cyan.
      fileName = data.isDirectory() ? chalk.cyan(fileName) : fileName;

      var include = options.directory && file !== '.' && !data.isDirectory() ? false : !dotted ? true : dotted && options.all ? true : dotted && !implied && options.almostall ? true : options.directory && file === '.' ? true : false;

      if (include) {
        files.push(fileName);
      }
    }

    return {
      path: path,
      results: files
    };
  },
  formatAll: function formatAll(results) {
    return results[0].results;
  }
};

function Exp(options) {
  var self = this;
  this.options = options;

  this.data = function (string) {
    var parts = String(string || '').split('/');
    parts.pop();
    var prefix = parts.join('/');
    prefix = String(prefix).trim() === '' ? '.' : prefix;
    var opts = {
      almostall: true,
      classify: true
    };
    if (self.options && self.options.directory === true) {
      opts.directory = true;
    }
    var res = ls.exec.call(this, [prefix], opts);
    if (isObject(res) && res.message) {
      // System bell.
      console.log('\u0007');
      return [];
    }
    return res;
  };
  this.exec = ls.exec;
}

module.exports = function (options) {
  options = options || {};
  var obj = new Exp(options);
  return obj;
};