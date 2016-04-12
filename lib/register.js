var fs = require('fs');
var path = require('path');
var debug = require('debug')('t:register');
var action = require('./action');
var context = require('./context');
var help = require('./help');
var parseDescription = require('./parse-description');

module.exports = function register(vorpal, dir, opts, file) {
  var filename = file.replace(dir.dir + '/', '');
  var expanded = file.replace(process.env.HOME, '~');
  var ext = path.extname(file);

  var parts = filename.split('/');
  var namespace = parts.shift();
  var name = parts.join(':');

  var stat = fs.statSync(file);
  var content = stat.isFile() && fs.readFileSync(file, 'utf8');
  var description = parseDescription(content, file);

  var nsext = path.extname(namespace);

  if (!parts.length) name = namespace.replace(/^\./, '');

  name = name.replace(ext, '');
  if (name === 'default' && ext) {
    namespace = ext.slice(1);
  }

  if (nsext && namespace !== 'default') {
    name = namespace;
  } else {
    name = namespace + ':' + name;
  }

  if (/\:app$/.test(name)) {
    name = name.replace(/\:app$/, '');
  }

  var cmdInstance = Object.create(context);
  cmdInstance.help = help.bind(null, vorpal);

  var cmd = vorpal
    .command(name, description || '')
    .option('-o, --output [file]', 'Specify file output')
    .option('-n, --name [name]', 'A name, maybe');

  var fn = action.bind(cmdInstance, file, {
    filename: filename,
    namespace: namespace,
    options: cmdOptions(cmd.options, opts)
  });

  cmd.action(fn);

  return {
    name: name,
    action: function(options, done) {
      action.call(cmdInstance, file, {
        filename: filename,
        namespace: namespace,
        options: cmdOptions(cmd.options, opts)
      }, done);
    }
  };
}

function cmdOptions(original, opts) {
  var allowed = original.map(function(opt) {
    return [opt.long.replace('--', ''), opt.short.replace('-', '')];
  }).reduce(function(a, b) {
    return a.concat(b);
  });

  return Object.keys(opts).map(function(key) {
    if (key === '_') return {};
    return { key: key, value: opts[key] };
  }).filter(function(entry) {
    return allowed.indexOf(entry.key) !== -1;
  }).reduce(function(a, b) {
    a[b.key] = b.value;
    return a;
  }, {});
}
