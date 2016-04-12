var fs = require('mz/fs');
var find = require('./lookup').find;
var path = require('path');
var hbs = require('handlebars');
var log = require('./log');

var _ = require('lodash');

var start = Date.now();

module.exports = function action(file, opts, done) {
  start = Date.now();
  var stat = fs.statSync(file);
  var content = stat.isFile() && fs.readFileSync(file, 'utf8');

  var end = function(err, opts) {
    if (err) return done(err);
    var msg = '%s (Generated in):green %dms:bold';
    var padding = this.log.padding() + Array(this.log.max()).join(' ');
    this.log(msg, padding, Date.now() - start);
    this.log();
    done(null, opts);
  }.bind(this);

  if (!content && stat.isDirectory()) {
    return renderDir.call(this, file, opts, end);
  }

  render.call(this, content, opts, end);
}

function render(content, opts, done) {
  var tpl = hbs.compile(content);
  var placeholders = content.match(/{{([^}]+}})/g);
  if (!placeholders) return render(tpl, placeholders);

  placeholders = _.uniq(placeholders.map(function(p) {
    return p.replace(/{{\s*/, '').replace(/\s*}}/, '');
  }));

  var questions = placeholders.map(function(p) {
    return {
      type: 'input',
      message: p,
      name: p,
      default: opts.options[p]
    }
  });

  if (!opts.options.output) questions.push({
    type: 'input',
    message: 'Path to generate',
    name: 'output',
    default: './'
  });

  this.prompt(questions, function(answers) {
    this.log().t('(Generating in %s):white', output);
    var data = Object.assign({}, opts.options, answers);
    var output = data.output;

    opts.options.output = answers.output;

    placeholders.forEach(function(p) {
      data[p] = opts.options[p] || p;
    }, this);

    var fileoutput = parseOutput(content, data);
    output = fileoutput ? path.join(output, fileoutput) : output;

    if (!fs.existsSync(path.dirname(output))) {
      this.log.mkdir(path.dirname(output));
      fs.mkdir(path.dirname(output));
    }

    this.log.file(output);
    fs.writeFile(output, tpl(data))
      .catch(done)
      .then(function() {
        done(null, opts);
      });

  }.bind(this));
}

function renderDir(file, opts, done) {
  var filename = file.replace();
  var options = opts.options;

  this.log.info('(Running ' + opts.filename.replace(/\//g, ':') + '):bold');
  var files = find(file);

  Object.assign(opts, {
    dir: file
  });

  if (options.output) return renderFiles.call(this, files, opts, done);

  var questions = [{
    type: 'input',
    message: 'Path to generate',
    name: 'output',
    default: './'
  }];

  this.prompt(questions, function(answers) {
    var output = answers.output;
    this.log.t('(Generating in %s):white', output);
    Object.assign(opts.options, answers);
    renderFiles.call(this, files, opts, done);
  }.bind(this));
}

function renderFiles(files, opts, done) {
  var output = opts.options.output;
  output = path.resolve(output);
  output = output.replace(process.env.HOME, '~');

  var promises = files.map(function(file) {
    var filename = file.replace(opts.dir + '/', '');
    var outfile = path.join(output, filename);
    var srcfile = path.join(opts.dir, filename);

    outfile = outfile.replace('~', process.env.HOME)
    var dirname = path.dirname(outfile);

    if (!fs.existsSync(dirname)) {
      this.log.mkdir(dirname);
      fs.mkdirSync(dirname);
    }

    this.log.file(outfile)

    return fs.readFile(srcfile, 'utf8').then(function(content) {
      var tpl = hbs.compile(content);
      var placeholders = content.match(/{{([^}]+}})/g);

      placeholders = placeholders.map(function(p) {
        return p.replace(/{{\s*/, '').replace(/\s*}}/, '');
      });

      // TODO: prompt here for undefined variables
      var data = Object.assign({}, opts.options);
      placeholders.forEach(function(p) {
        data[p] = opts.options[p] || p;
      }, this);

      return fs.writeFile(outfile, tpl(data));
    }.bind(this));
  }, this);

  Promise.all(promises).catch(log.logerr).then(function() {
    done(null, opts);
  });
}

function parseOutput(content, data) {
  var body = hbs.compile(content)(data);
  var matches = body.match(/\/\/\s+output:\s*(.+)/);

  if (!matches) return;

  return matches[1];
}
