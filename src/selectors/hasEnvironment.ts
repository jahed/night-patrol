import { createSelector, ParametricSelector } from 'reselect'
import { State } from '../types'

const hasEnvironment: ParametricSelector<State, string, boolean> = createSelector(
  state => state.config.environments,
  (_: State, envName: string) => envName,
  (environments, envName) => environments[envName] || false
)

export {
  hasEnvironment
}
