var fs = require('fs');
var glob = require('glob');
var path = require('path');

var handlers = {};

handlers.js = function(content, filename) {
  var description = content.split(/\r?\n/)[0];

  var reg = /^\/\//;
  description = reg.test(description) ? description.replace(reg, '') : '';
  return description;
};

handlers.html = function(content, filename) {
  var description = content.split(/\r?\n/)[0];
  var reg = /<!--(.+)-->/;

  var comment = reg.test(description) ? description.match(reg)[1] : '';

  return comment || '';
};

handlers.md = handlers.markdown = handlers.mkd = handlers.html;

handlers.json = function(content, filename) {
  var data = require(path.resolve(filename));
  return 'Generates a JSON file (' + Object.keys(data).map(function(key, i) {
    return (i === 0 ? '' : ' ') +
      (key.length > 5 ? key.slice(0, 5) + '…' : key);
  }) + ')';
};

handlers.dir = function(filename) {
  var usage = path.join(filename, 'USAGE');
  var desc = fs.existsSync(usage) && fs.readFileSync(usage, 'utf8');

  if (!desc) {
    var files = glob.sync(path.join(filename, '**'), { nodir: true });
    desc = 'Generates '  + files.map(function(file) {
      return file.replace(filename + '/', '');
    }).join(', ');
  }

  return desc;
};

module.exports = parse;
parse.handlers = handlers;

function parse(content, filename) {
  var reg = /^\/\//;
  var ext = path.extname(filename).slice(1);

  if (!content) return handlers.dir(filename);
  if (handlers[ext]) return handlers[ext](content, filename);
};
