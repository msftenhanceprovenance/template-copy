var Template = require('./src/template');

module.exports = t;
t.Template = Template;

function t (argv, opts) {
  argv = Array.isArray(argv) ? argv
    : typeof argv === 'string' ? argv.split()
    : process.argv.slice(2);

  return new Template(argv, opts);
};
