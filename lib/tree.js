
var chalk = require('chalk');
var log = require('./log');
var path = require('path');
var tree = require('dir-tree-creator');

module.exports = tree;

tree.show = function(dir, done) {
  return tree(path.resolve(dir), dir, null, function(output) {
    log('');
    output.split(/\r?\n/).forEach(function(line) {
      log(chalk.gray(line));
    });

    done();
  });
};
