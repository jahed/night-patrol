import { createSelector, Selector } from 'reselect'
import { State } from '../types'

const getTestFailures: Selector<State, string[]> = createSelector(
  state => state.testFailures,
  testFailures => Object.keys(testFailures)
)

export {
  getTestFailures
}
