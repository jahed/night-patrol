import Vorpal from 'vorpal'

const GLOBAL_COMMANDS = {
  help: true,
  exit: true
}

const clearCommands = (vorpal: Vorpal) => {
  vorpal.commands
    .filter(command => !(command._name in GLOBAL_COMMANDS))
    .forEach(command => command.remove())
}

export {
  clearCommands
}
