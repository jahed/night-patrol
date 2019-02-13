import { combineReducers, Reducer } from 'redux'
import { NightPatrolState } from '../types'
import nightwatch from './nightwatch'
import testFailures from './testFailures'
import actions from './actions'

const reducer: Reducer<NightPatrolState> = combineReducers({
  nightwatch,
  testFailures,
  actions
})

export default reducer
