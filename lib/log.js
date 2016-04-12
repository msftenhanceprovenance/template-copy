
var logSymbols = require('log-symbols');

var delimiter = 't> ';
var chalk = require('chalk');

module.exports = log;
log.logerr = logerr;

log.actionLogger = require('./action-logger');

function logerr(msg) {
  msg = msg instanceof Error ? msg.stack : msg;
  var args = Array.prototype.slice.call(arguments, 1);
  var str = format(msg);
  out(chalk.red(str), args);
}

function log(msg) {
  msg = msg || '';
  var args = Array.prototype.slice.call(arguments, 1);
  var str = format(msg);
  out(str, args);
}

function out(str, args) {
  var cargs = [chalk.grey.bold(delimiter) + ' ' + str];
  cargs = cargs.concat(args);
  console.error.apply(console, cargs);
}

function format(msg) {
  msg = msg.replace(/\(([^\)]+)\):(\w+)/g, function(whole, match, color) {
    return chalk[color] ? chalk[color](match) : match;
  });

  msg = msg.replace(/([^\s]+):(\w+)/g, function(whole, match, color) {
    return chalk[color] ? chalk[color](match) : match;
  });

  return msg;
}
