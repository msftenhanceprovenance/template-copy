
var chalk = require('chalk');
var util = require('util');
var events = require('events');
var logSymbols = require('log-symbols');
var log = require('./log');

var step = '  ';
var padding = ' ';

var colors = {
  create: 'green',
  mkdir: 'cyan',
  file: 'green',
  info: 'gray',
  warn: 'yellow',
  error: 'red',
  t: 'cyan'
};

function pad(status) {
  var max = 'create'.length;
  var delta = max - status.length;
  return delta ? new Array(delta + 1).join(' ') + status : status;
}

module.exports = Logger;

function Logger() {
  var self = this;
  this.max = 'create'.length;
  return delta ? new Array(delta + 1).join(' ') + status : status;
}

module.exports = Logger;

function Logger() {
  var self = this;
  self._max = 'create'.length;
  self._padding = padding;
  this.on('up', function() {
    self._padding = padding = padding + step;
  });

  this.on('down', function() {
    self._padding = padding = padding.replace(step, '');
  });
}

Object.assign(Logger.prototype, events.EventEmitter.prototype);

Logger.prototype.padding = function() {
  return this._padding;
};

Logger.prototype.max = function() {
  return this._max;
};

Object.keys(colors).forEach(function(status) {
  Logger.prototype[status] = function(str) {
    var color = colors[status];
    var msg = chalk[color](pad(status));
    msg += padding;

    var args = Array.prototype.slice.call(arguments, 1);
    this.write.apply(this, [msg + str].concat(args));
    return this;
  };
});

Logger.prototype.write = function (msg) {
	var args = Array.prototype.slice.call(arguments, 1);
	log.apply(null, [msg].concat(args));
	return this;
};

Logger.prototype.writeln = function () {
	this.write.apply(this, arguments);
	return this;
};

Logger.prototype.ok = function () {
	this.write(logSymbols.success + ' ' + util.format.apply(util, arguments));
	return this;
};

Logger.prototype.error = function () {
	this.write(logSymbols.error + ' ' + util.format.apply(util, arguments));
	return this;
};

Logger.colors = colors;
