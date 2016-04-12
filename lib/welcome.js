var chalk = require('chalk');

var debug = require('debug')('t:welcome');
var log = require('./log');
var figlet = require('figlet');

var fonts = figlet.fontsSync();

var styles = [
 'green',
 'yellow',
 'blue',
 'magenta',
 'cyan',
 'gray'
];

module.exports = welcome;

function welcome(cmd) {

  var fts = fonts.filter(function(font) {
    if (font === 'Small Isometric1') return;
    if (font === 'Small Tengwar') return;
    if (font === 'Small Poison') return;
    return /^(JS|Small|Doom|Soft|Basic)/.test(font);
  });

  var font = fts[Math.floor(Math.random() * fts.length)];

  var color = styles[Math.floor(Math.random() * styles.length)];

  console.error(chalk[color](figlet.textSync('t ' + cmd, {
    font: font,
    horizontalLayout: 'default',
    verticalLayout: 'default'
  })));

  console.error();
}
