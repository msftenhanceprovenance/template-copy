var fs = require('fs');
var glob = require('glob');
var path = require('path');

module.exports = lookup;
lookup.find = find;

function find(dir) {
  var files = glob.sync(path.join(dir, '/**'), {
    nodir: true
  });

  return files;
}

function lookup(loadDirs) {
  var dirs = loadDirs.map(function(dir) {
    dir = dir.replace(/^\.\//, '');
    dir = dir.replace('~', process.env.HOME);

    var files = lookup.find(dir);

    var appdirs = files.map(function(file) {
      file = file.replace(dir + '/', '');
      var parts = file.split('/');

      return parts.map(function(part, i) {
        if (part !== 'app') return {};
        var dirname = parts.slice(0, i + 1).join('/');
        return { file: path.join(dir, dirname), stat: fs.statSync(path.join(dir, dirname)) };
      }).filter(function(file) {
        if (!file) return;
        return file && file.stat && file.stat.isDirectory();
      });
    }).filter(function(dir) {
      return dir.length;
    }).reduce(function(a, b) {
      return a.concat(b);
    }, []).reduce(function(a, b) {
      a[b.file] = b.stat;
      return a;
    }, {});


    files = files.filter(function(file) {
      file = file.replace(dir + '/', '');
      var parts = file.split('/');

      var nok = !!parts.filter(function(part, i) {
        if (part !== 'app') return;

        var dirname = parts.slice(0, i + 1).join('/');
        return fs.statSync(path.join(dir, dirname)).isDirectory();
      }).length;

      return !nok;
    });

    return {
      dir: dir,
      files: files,
      appdirs: appdirs
    };
  }).filter(function(entry) {
    return entry.files.length;
  });

  return dirs;
}
