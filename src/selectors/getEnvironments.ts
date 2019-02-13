import { createSelector, Selector } from 'reselect'
import { State } from '../types'

const getEnvironments: Selector<State, string[]> = createSelector(
  state => state.config.environments,
  environments => Object.keys(environments)
)

export {
  getEnvironments
}
