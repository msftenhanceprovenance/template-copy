
var fs = require('mz/fs');
var autocomplete = require('vorpal/dist/autocomplete');
var Logger = require('./action-logger');

var context = module.exports;

var logger = new Logger();

context.log = logger.write.bind(logger);
Object.keys(Logger.colors).concat(['emit', 'max', 'ok', 'error', 'padding']).forEach(function(method) {
  context.log[method] = logger[method].bind(logger);
});

new Logger();
context.prompt = require('inquirer').createPromptModule();
context.match = autocomplete.match;

var methods = [
  'mkdir',
  'read:readFile',
  'write:writeFile',
  'exists',
  'unlink',
  'rmdir',
  'readdir'
];

methods.forEach(function(m) {
  var parts = m.split(':');
  var key = parts[0];
  var value = parts[1] || key;

  context[key] = fs[value];
});
