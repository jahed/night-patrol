import chalk from 'chalk'
import { createSelector, Selector } from 'reselect'
import { header } from '../header'
import { State } from '../types'

const getHeader: Selector<State, string> = createSelector(
  state => state.config.version,
  version => {
    return chalk.cyan(header({
      heading: `NIGHT PATROL v${version}`,
      body: 'Remember, you will need to restart the session to refresh the autocomplete.'
    }))
  }
)

export {
  getHeader
}
