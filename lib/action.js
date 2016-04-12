var fs = require('fs');
var find = require('./lookup').find;
var path = require('path');
var hbs = require('handlebars');

module.exports = function action(file, opts, done) {
  var stat = fs.statSync(file);
  var content = stat.isFile() && fs.readFileSync(file, 'utf8');

  this.log('Loading generator from %s:green\n', file);

  if (!content && stat.isDirectory()) return renderDir.call(this, file, done);

  render.call(this, content, done);
}

function render(content, done) {
  var tpl = hbs.compile(content);
  var placeholders = content.match(/{{([^}]+}})/g);
  if (!placeholders) return render(tpl, placeholders);

  placeholders = placeholders.map(function(p) {
    return p.replace(/{{\s*/, '').replace(/\s*}}/, '');
  });

  var questions = placeholders.map(function(p) {
    return {
      type: 'input',
      message: p,
      name: p
    }
  });

  this.prompt(questions, function(answers) {
    var body = tpl(answers);
    console.log(body);
    done();
  }.bind(this));
}

function renderDir(file, done) {
  var filename = file.replace();
  this.log.create(file + ':white');
  var files = find(file);

}
