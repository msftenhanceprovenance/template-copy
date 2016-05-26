var Template = require('./lib/template');

module.exports = t;
t.Template = Template;

function t (opts) {
  return new Template(opts);
};
