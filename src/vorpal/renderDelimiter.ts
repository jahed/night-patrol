import Vorpal from 'vorpal'

const renderDelimiter = (vorpal: Vorpal, delimiter: string) => {
  vorpal.delimiter(delimiter) // Future delimiters
  vorpal.ui.delimiter(delimiter) // Current delimiter
}

export {
  renderDelimiter
}
