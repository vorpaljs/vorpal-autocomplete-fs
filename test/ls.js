const assert = require("assert");
const should = require('should');
const strip = require('strip-ansi');
const util = require('./util/util');
const ls = require('./../dist/index')
const os = require('os');

const expected = {
  rootDirFlat: 'a.txt  b.tgz  c.exe  d.json  e.gif  f.jpg  g  sub\n',
  rootDirFlatAll: '.  ..  a.txt  b.tgz  c.exe  d.json  e.gif  f.jpg  g  .hidden  sub\n',
  rootDirFlatHidden: 'a.txt  b.tgz  c.exe  d.json  e.gif  f.jpg  g  .hidden  sub\n',
  rootDirFlatReversed: 'a.txt  b.tgz  c.exe  d.json  e.gif  f.jpg  g  sub\n',
  rootDirFlatClassified: 'a.txt  b.tgz  c.exe  d.json  e.gif  f.jpg  g  sub/\n',
  rootDirFlatThinWidth: 'a.txt\nb.tgz\nc.exe\nd.json\ne.gif\nf.jpg\ng\nsub\n',
  rootDirFlatQuotes: '"a.txt"  "b.tgz"  "c.exe"  "d.json"  "e.gif"  "f.jpg"  "g"  "sub"\n',
  rootDirFlatByFileSize: 'sub  g  f.jpg  b.tgz  e.gif  d.json  c.exe  a.txt\n',
  subDirFlat: 'a.txt  b.tgz  c.exe  d.json  e.gif  f.jpg  g\n'
}

describe('ls', function() {

  before(function(done) {
    util.writeSampleDir(function() {
      process.chdir('./testing/');
      done();
    });
  });

  after(function() {
    process.chdir('..');
    util.deleteSampleDir();
  });

  describe('directory listings', function(){

    it('should exist', function() {
      should.exist(ls);
    });

    it('should have an exec function', function() {
      should.exist(ls.exec);
    });

    it('should list current dir as default', function() {
      var res = ls.exec();
      strip(res.join('  ') + '\n').should.equal(expected.rootDirFlat);
    });

    it('should list a sub directory', function() {
      var res = ls.exec('./sub');
      strip(res.join('  ') + '\n').should.equal(expected.subDirFlat);
    });

    it('should list a parent directory', function() {
      process.chdir('./sub/');
      var res = ls.exec('..');
      strip(res.join('  ') + '\n').should.equal(expected.rootDirFlat);
      process.chdir('..');
    });

  });

  describe('file display', function(){

    it('should list hidden files with --almost-all', function() {
      var res = ls.exec('.', { almostall: true });
      strip(res.join('  ') + '\n').should.equal(expected.rootDirFlatHidden);
    });

    it('should list hidden and implied files with --all', function() {
      var res = ls.exec('.', { all: true });
      strip(res.join('  ') + '\n').should.equal(expected.rootDirFlatAll);
    });

    it('should list append "/" to folders with --classify', function() {
      var res = ls.exec('.', { classify: true });
      strip(res.join('  ') + '\n').should.equal(expected.rootDirFlatClassified);
    });

  });

});
