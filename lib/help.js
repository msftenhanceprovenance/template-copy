

module.exports = function _help(vorpal, args, loadDirs) {
  vorpal.commands = vorpal.commands.sort(function(a, b) {
    return a._name > b._name ? 1 : -1;
  });

  var cmd = args[0] && vorpal.commands.find(function(cmd) {
    return cmd._name === args[0];
  });

  if (cmd) return cmd.helpInformation();

  var help = vorpal._commandHelp.apply(vorpal, args);
  // help = help.replace(/\s+Commands.+/, '');
  help = help.replace(/\s+exit.+/, '');
  help = help.replace(/\s+help.+/, '');
  return prefix(args, loadDirs) + help;
}

function prefix(args, loadDirs) {
  var msg = !args.length ? '\n  $ t <command> [options]\n' :
    '\n  $ t ' + args[0] + ' [options]\n';

  msg += '\n    Templates are loaded from a predefined set of directories,';
  msg += '\n    configurable via the T_LOAD_DIRS environment variable :\n';
  msg += '\n      - ' + loadDirs.join('\n      - ');
  msg += '\n\n    Ex: T_LOAD_DIRS="./.templates ~/.dotfiles/templates ~/.local/templates" t';
  msg += '\n';

  msg += '\n    Standard Handlebars templates, any placeholder variables `{{ variable }}`';
  msg += '\n    not found in the command line options is prompted automatically.\n';
  msg += '\n    The optional front comment can be used to specify CLI [options],';
  msg += '\n    define an output location or a custom description for the command.'

  msg += '\n';
  msg += '\n    Running `t` without arguments enters Vorpal REPL mode, exposing';
  msg += '\n    the same commands and options.';


  msg += '\n';

  return msg;
}
