import Vorpal from 'vorpal'

const clearCommands = (vorpal: Vorpal) => {
  const GLOBAL_COMMANDS = ['help', 'exit']
  vorpal.commands
    .filter(command => !GLOBAL_COMMANDS.includes(command._name))
    .forEach(command => command.remove())
}

export {
  clearCommands
}
