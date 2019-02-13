import { createSelector, ParametricSelector } from 'reselect'
import { State } from '../types'

const getTestCases: ParametricSelector<State, string, string[]> = createSelector(
  state => state.config.suites,
  (_: State, suiteName: string) => suiteName,
  (suites, suiteName) => suites[suiteName]
)

export {
  getTestCases
}
