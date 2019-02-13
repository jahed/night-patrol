import { createSelector, Selector } from 'reselect'
import { State } from '../types'

const getHistoryKey: Selector<State, string> = createSelector(
  state => state.config.name,
  state => state.config.version,
  (name, version) => [name, version].join('-')
)

export {
  getHistoryKey
}
