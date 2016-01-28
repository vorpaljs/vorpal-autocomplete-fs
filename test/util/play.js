'use strict';

var vorpal = require('vorpal')();
var autocomplete = require('./../../dist/index');

vorpal.show();

vorpal.command('foo [files...]').autocomplete(autocomplete);
