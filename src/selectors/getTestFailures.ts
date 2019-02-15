import { createSelector, Selector } from 'reselect'
import { State, TestFailuresBySuite } from '../types'

const getTestFailures: Selector<State, TestFailuresBySuite> = createSelector(
  state => state.testFailures,
  testFailures => testFailures
)

export {
  getTestFailures
}
