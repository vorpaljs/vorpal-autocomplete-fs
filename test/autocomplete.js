var assert = require("assert");
var _ = require('lodash');
var should = require('should');
var autocomplete = require('./../dist/index')
var Vorpal = require('vorpal');
var vorpal = Vorpal();

vorpal.show();

describe('autocomplete', function() {

  it('should register without throwing', function() {
    (function () {
      vorpal.command('bar [files...]')
        .autocomplete(autocomplete({directory: true}));
    }).should.not.throw();
    (function () {
      vorpal.command('foo [files...]')
        .autocomplete(autocomplete());
    }).should.not.throw();
  });

  it('should autocomplete a given method', function() {
    _.set(vorpal.ui, '_activePrompt.screen.rl.cursor', 7);
    vorpal.session.getAutocomplete('foo pac', function (err, res) {
      res.should.equal('foo package.json ');
    })
  });

  it('should do nothing on first tab', function() {
    _.set(vorpal.ui, '_activePrompt.screen.rl.cursor', 4);
    vorpal.session.getAutocomplete('foo ', function (err, res) {
      (res === undefined).should.be.true;
    })
  });

  it('should list contents on second tab', function() {
    vorpal.session.getAutocomplete('foo ', function (err, res) {
      res.should.be.instanceOf(Array);
    })
  });

  it('should give a system bell on an invalid item', function() {
    _.set(vorpal.ui, '_activePrompt.screen.rl.cursor', 13);
    vorpal.session.getAutocomplete('foo ./asdfed/', function (err, res) {
      (res === undefined).should.be.true;
    })
  });

});
