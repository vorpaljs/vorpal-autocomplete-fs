'use strict';

const vorpal = require('vorpal')();
const grep = require('./../dist/grep');
const chalk = require('chalk');

vorpal
  .delimiter(`${chalk.grey(`${chalk.blue(`grep example`)}:`)}`)
  .use(grep)
  .show();

vorpal.exec('grep cats ./test/fixtures/a.txt').then(function () {
  return vorpal.exec('grep cats ./fixturesandsoon**');
}).then(function () {
  return vorpal.exec('grep "14" ./test/fixtures/*.* --include \'*.md\' ');
}).catch(function (e) {
  vorpal.log(e);
});
