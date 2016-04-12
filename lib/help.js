

module.exports = function _help(vorpal, args) {
  vorpal.commands = vorpal.commands.sort(function(a, b) {
    return a._name > b._name ? 1 : -1;
  });

  var cmd = args[0] && vorpal.commands.find(function(cmd) {
    return cmd._name === args[0];
  });

  if (cmd) return cmd.helpInformation();

  var help = vorpal._commandHelp.apply(vorpal, args);
  help = help.replace(/\s+Commands.+/, '');
  help = help.replace(/\s+exit.+/, '');
  help = help.replace(/\s+help.+/, '');
  return prefix(args) + help;
}

function prefix(args) {
  if (!args.length) return '\n    $ t <command> [options]\n';
  return '\n    $ t ' + args[0] + ' [options]\n';
}
