process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 't';

var start = Date.now();

var debug = require('debug')('t');
var vorpal = require('vorpal')();

var log = require('./lib/log');
var logerr = log.logerr;
var help = require('./lib/help');
var lookup = require('./lib/lookup');
var register = require('./lib/register');

var opts = require('minimist')(process.argv.slice(2), {
  alias: {
    h: 'help',
    o: 'output'
  }
});

var args = opts._;
var cmd = args[0];


var delimiter = 't>';
vorpal.delimiter(delimiter);
vorpal.ui.parent = vorpal;

var loadDirs = [
  './templates',
  './.templates',
  '~/.config/templates',
  '~/.vim/templates'
];

var cmds = [];
lookup(loadDirs).forEach(function(dir) {
  cmds = dir.files.map(register.bind(null, vorpal, dir, opts));
});

if (opts.help || cmd === 'help') {
  return console.log(help(vorpal, args.slice(1)));
}

var registered = cmds.find(function(item) {
  return item.name === cmd;
});

if (registered) {
  return registered.action({}, function(err) {
    if (err) return logerr(err.stack);

    var time = Date.now() - start;
    log('\n%s completed in %ds', cmd, time / 1000);
  });
}

if (!args.length) vorpal.show();
else logerr('%s:bold generator not found', cmd);
