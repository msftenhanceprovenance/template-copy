
var chalk = require('chalk');
var util = require('util');
var events = require('events');
var logSymbols = require('log-symbols');
var log = require('./log');

// padding step
var step = '  ';
var padding = ' ';

// color -> status mappings
var colors = {
  skip: 'yellow',
  force: 'yellow',
  create: 'green',
  invoke: 'bold',
  conflict: 'red',
  identical: 'cyan',
  info: 'gray'
};

function pad(status) {
  var max = 'identical'.length;
  var delta = max - status.length;
  return delta ? new Array(delta + 1).join(' ') + status : status;
}

module.exports = Logger;

function Logger() {
	// var args = Array.prototype.slice.call(arguments, 1);
	this.on('up', function () {
		padding = padding + step;
	});

	this.on('down', function () {
		padding = padding.replace(step, '');
	});
}

Object.assign(Logger.prototype, events.EventEmitter.prototype);

Object.keys(colors).forEach(function (status) {
	Logger.prototype[status] = function (str) {
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
	this.write(logSymbols.success + ' ' + util.format.apply(util, arguments) + '\n');
	return this;
};

Logger.prototype.error = function () {
	this.write(logSymbols.error + ' ' + util.format.apply(util, arguments) + '\n');
	return this;
};

Logger.colors = colors;
