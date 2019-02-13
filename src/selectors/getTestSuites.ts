import { createSelector, Selector } from 'reselect'
import { State } from '../types'

const getTestSuites: Selector<State, string[]> = createSelector(
  state => state.config.suites,
  suites => Object.keys(suites)
)

export {
  getTestSuites
}
