'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const strip = require('strip-ansi');

const isObject = function (value) {
  const type = typeof value;
  return !!value && (type === 'object' || type === 'function');
};

const isArray = Array.isArray;

const util = {

  walkDir(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
      const filePath = path.join(currentDirPath, name);
      let stat;
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

    file(path) {
      let fileShort = String(path).split('/');
      fileShort = fileShort[fileShort.length - 1];
      fileShort = fileShort.split('\\');
      fileShort = fileShort[fileShort.length - 1];
      return fileShort;
    }

  },

  colorize(file) {
    const audio = ['aac', 'au', 'flac', 'mid', 'midi', 'mka', 'mp3', 'mpc', 'ogg', 'ra', 'wav', 'axa', 'oga', 'spx', 'xspf'];
    const archive = ['tar', 'tgz', 'arj', 'taz', 'lzh', 'lzma', 'tlz', 'txz', 'zip', 'z', 'Z', 'dz', 'gz', 'lz', 'xz', 'bz2', 'bz', 'tbz', 'tbz2', 'tz', 'deb', 'rpm', 'jar', 'rar', 'ace', 'zoo', 'cpio', '7z', 'rz'];
    const images = ['jpg', 'jpeg', 'gif', 'bmp', 'pbm', 'pgm', 'ppm', 'tga', 'xbm', 'xpm', 'tif', 'tiff', 'png', 'svg', 'svgz', 'mng', 'pcx', 'mov', 'mpg', 'mpeg', 'm2v', 'mkv', 'ogm', 'mp4', 'm4v', 'mp4v', 'vob', 'qt', 'nuv', 'wmv', 'asf', 'rm', 'rmvb', 'flc', 'avi', 'fli', 'flv', 'gl', 'dl', 'xcf', 'xwd', 'yuv', 'cgm', 'emf', 'axv', 'anx', 'ogv', 'ogx'];

    let extension = String(file).toLowerCase().trim().split('.');
    extension = extension[extension.length - 1];

    let colored = strip(file);
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

    modeToRWX(mode) {
      const octal = this.modeToOctal(mode);
      const rwx = this.octalToRWX(octal);
      return rwx;
    },

    modeToOctal(mode) {
      const octal = `0${ (mode & 0o777).toString(8) }`;
      return octal;
    },

    octalToRWX(octal) {
      const list = this.listing;
      const a = list[String(octal).charAt(1)];
      const b = list[String(octal).charAt(2)];
      const c = list[String(octal).charAt(3)];
      return a + b + c;
    }
  }
};

const ls = {

  exec(paths, options) {
    const self = this;
    paths = paths || ['.'];
    paths = !isArray(paths) ? [paths] : paths;
    options = options || {};
    try {
      const results = [];
      for (let i = 0; i < paths.length; ++i) {
        const result = ls.execDir(paths[i], options);
        results.push(result);
      }
      const stdout = ls.formatAll(results, options);
      return stdout;
    } catch (e) {
      /* istanbul ignore next */
      return ls.error.call(self, e);
    }
  },

  error(e) {
    /* istanbul ignore next */
    return e;
  },

  execDir(path, options) {
    const files = [];
    let rawFiles = [];

    function pushFile(file, data) {
      rawFiles.push({
        file,
        data
      });
    }

    // Add in implied current and parent dirs.
    pushFile('.', fs.statSync('.'));
    pushFile('..', fs.statSync('..'));

    // Walk the passed in directory,
    // pushing the results into `rawFiles`.
    util.walkDir(path, pushFile);

    rawFiles = rawFiles.sort(function (a, b) {
      const aFileName = util.path.file(a.file).trim().toLowerCase().replace(/\W/g, '');
      const bFileName = util.path.file(b.file).trim().toLowerCase().replace(/\W/g, '');
      return aFileName > bFileName ? 1 : aFileName < bFileName ? -1 : 0;
    });

    for (let i = 0; i < rawFiles.length; ++i) {
      const file = rawFiles[i].file;
      const data = rawFiles[i].data;
      const fileShort = util.path.file(file);
      const dotted = fileShort && fileShort.charAt(0) === '.';
      const implied = fileShort === '..' || fileShort === '.';
      const permissions = util.permissions.modeToRWX(data.mode);

      let fileName = fileShort;

      // If --classify, add '/' to end of folders.
      fileName = options.classify && data.isDirectory() ? `${ fileName }/` : fileName;

      // If getting --directory, give full path.
      fileName = options.directory && file === '.' ? path : fileName;

      // Color the files based on $LS_COLORS
      fileName = data.isFile() ? util.colorize(fileName) : fileName;

      // If not already colored and is executable,
      // make it green
      const colored = strip(fileName) !== fileName;
      if (String(permissions).indexOf('x') > -1 && !colored && data.isFile()) {
        fileName = chalk.green(fileName);
      }

      // Make directories cyan.
      fileName = data.isDirectory() ? chalk.cyan(fileName) : fileName;

      const include = options.directory && file !== '.' ? false : !dotted ? true : dotted && options.all ? true : dotted && !implied && options.almostall ? true : options.directory && file === '.' ? true : false;

      if (include) {
        files.push(fileName);
      }
    }

    return {
      path,
      results: files
    };
  },

  formatAll(results) {
    return results[0].results;
  }
};

module.exports = {

  data(string) {
    const parts = String(string || '').split('/');
    parts.pop();
    let prefix = parts.join('/');
    prefix = String(prefix).trim() === '' ? '.' : prefix;
    const res = ls.exec.call(this, [prefix], { almostall: true, classify: true });
    if (isObject(res) && res.message) {
      // System bell.
      console.log('\u0007');
      return [];
    }
    return res;
  },

  exec: ls.exec
};