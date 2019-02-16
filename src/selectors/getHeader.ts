import chalk from 'chalk'
import { createSelector, Selector } from 'reselect'
import { State } from '../types'
import { header } from '../utils/header'

const getHeader: Selector<State, string> = createSelector(
  state => state.config.name,
  state => state.config.version,
  state => state.config.description,
  (name, version, description) => {
    const displayName = name.split('-').map(s => s.toUpperCase()).join(' ')
    return chalk.cyan(header({
      title: `${displayName} v${version}`,
      subtitle: description
    }))
  }
)

export {
  getHeader
}
