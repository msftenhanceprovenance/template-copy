var start = Date.now();
var logSymbols = require('log-symbols');
var chalk = require('chalk');

var debug = require('debug')('t');
var vorpal = require('vorpal')();

var Logger = require('./lib/action-logger');
var log = require('./lib/log');
var logerr = log.logerr;
var help = require('./lib/help');
var lookup = require('./lib/lookup');
var register = require('./lib/register');
var welcome = require('./lib/welcome');

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

var loadDirs = process.env.T_LOAD_DIRS ? process.env.T_LOAD_DIRS.split(' ') : [
  './templates',
  './.templates',
  '~/.config/templates',
  '~/.vim/templates'
];

var cmds = [];

var repl = vorpal
  .command('repl', 'Enter REPL mode')
  .action(vorpal.show.bind(vorpal));

repl.name = 'repl';
repl.action = vorpal.show.bind(vorpal);
cmds.push(repl);

lookup(loadDirs).forEach(function(dir) {
  cmds = cmds.concat(dir.files.map(register.bind(null, vorpal, dir.dir, opts)));

  Object.keys(dir.appdirs).forEach(function(appdir) {
    cmds.push(register.directory(vorpal, dir.dir, opts, appdir));
  });
});


if (opts.help || cmd === 'help' || !args.length) {
  console.log(help(vorpal, args.slice(1), loadDirs));
  process.exit(0);
}

var registered = cmds.find(function(item) {
  if (!item) return;
  return item.name === cmd;
});

if (!registered) {
  logerr('%s:bold generator not found', cmd);
  process.exit(1);
}

welcome(cmd);

registered.action({}, function(err, opts) {
  if (err) return logerr(err.stack);

  var time = Date.now() - start;
  var msg = '(%s generator sucesfully run in):green %ds:bold';
  var logger = new Logger();
  logger.ok(msg, cmd, time / 1000);
});
