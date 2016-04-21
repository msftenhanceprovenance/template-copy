var fs = require('fs');
var debug = require('debug')('t:register');
var path = require('path');
var action = require('./action');
var context = require('./context');
var help = require('./help');
var parseDescription = require('./parse-description');
var parseHelp = require('parse-help');

module.exports = register;
register.directory = directory;

// Main register function. Needs a vorpal instance, the base directory to work
// from, and the template file to register.
function register(vorpal, dir, opts, file) {
  if (!file) return;
  debug('register', file);

  // Check actual file
  var stat = fs.statSync(file);
  var content = stat.isFile() && fs.readFileSync(file, 'utf8');
  if (!content) return;

  var { ext, filename, namespace, name } = parse(file, dir);

  // Create command instance
  var cmdInstance = Object.create(context);
  cmdInstance.help = help.bind(null, vorpal);

  // Parse options from template content
  //
  // TODO: lib/parse-options.js and deal with edge case
  var options = parseHelp(content
    .replace(/^(\/\/|<!--)/gim, '')
    .replace(/(\*\/|-->)$/gim, '')
    .split(/\r?\n/).slice(0, 10)
    .join('\n')
  );

  // Parse description from template content
  var description = parseDescription(content, file);

  // Actually create and register the vorpal command
  debug('Creating vorpal command %s - %s', name, description || '');
  var cmd = vorpal.command(name, description || '');

  // Default option for all commands
  cmd.option('-o, --output [file]', 'Specify file output');

  // Register each parsed option to vorpal
  Object.keys(options.flags).forEach(function(key) {
    var flag = options.flags[key]
    cmd.option(
      (flag.alias ? '-' + flag.alias + ', ' : '') +
      '--' + key, flag.description
    );
  });

  // Create command instance
  var cmdInstance = Object.create(context);
  cmdInstance.help = help.bind(null, vorpal);

  // Build up and register the "action" function
  var fn = action.bind(cmdInstance, file, {
    filename: filename,
    namespace: namespace,
    options: cmdOptions(cmd.options, opts)
  });

  cmd.action(fn);

  // Return cmd object with name and action handler, for direct use outside of
  // vorpal context
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

// Directory registering function.
//
// Operates on a whole directory to process any files in it in batch.
//
// TODO:
//
// - parse command options from templates in appdir
// - parse description from appdir (might be an helpfile, or a help.txt)
function directory(vorpal, dir, opts, appdir) {
  debug('Register %s directory', appdir);
  var { ext, filename, namespace, name } = parse(appdir, dir);

  // Actually create and register the vorpal command
  debug('Creating vorpal command %s - %s', name, '');
  var cmd = vorpal.command(name,'Template directory for ' + name);

  // Create command instance
  var cmdInstance = Object.create(context);
  cmdInstance.help = help.bind(null, vorpal);

  // Build up and register the "action" function
  debug('Action %s file (%s)', appdir, filename);
  var fn = action.bind(cmdInstance, appdir, {
    filename: filename,
    namespace: namespace,
    options: cmdOptions(cmd.options, opts)
  });

  cmd.action(fn);

  // Return cmd object with name and action handler, for direct use outside of
  // vorpal context
  return {
    name: name,
    action: function(options, done) {
      action.call(cmdInstance, appdir, {
        filename: filename,
        namespace: namespace,
        options: cmdOptions(cmd.options, opts)
      }, done);
    }
  };
}

// Helpers

function cmdOptions(original, opts) {
  var allowed = original.map(function(opt) {
    return [opt.long.replace('--', ''), opt.short.replace('-', '')];
  }).reduce(function(a, b) {
    return a.concat(b);
  }, []);

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

// Parse a file path and returns:
//
// - filename: cleanup from cwd, etc.
// - namespace: first part of file path
// - name: generator name
// - ext: filename extension
function parse(file, dir) {
  var filename = file.replace(dir + '/', '');
  var nsext = path.extname(namespace);
  var ext = path.extname(file);

  var parts = filename.split('/');
  var namespace = parts.shift();
  var name = parts.join(':');

  // parts is now empty, it means we deal with first lvl template
  if (!parts.length) {
    name = namespace.replace(/^\./, '');
  }

  // cleanup name from extension
  name = name.replace(ext, '');

  // if "default" file, register as "ext" (ex. default.js gets registered as
  // js)
  if (name === 'default' && ext) {
    namespace = ext.slice(1);
  }

  // not dealing with default template but namespace had an extension, we deal
  // with a first lvl tpl.
  //
  // Otherwise, prefix it with "namespace:"
  if (nsext && namespace !== 'default') {
    name = namespace;
  } else {
    name = namespace + ':' + name;
  }

  // prevent special appdir from showing up as "foo:app" but just "foo".
  if (/\:app$/.test(name)) {
    name = name.replace(/\:app$/, '');
  }

  return {
    ext: ext,
    filename: filename,
    namespace: namespace,
    name: name
  };
}
