import { combineReducers, Reducer } from 'redux'
import { State } from '../types'
import config from './config'
import testFailures from './testFailures'
import actions from './actions'

const reducer: Reducer<State> = combineReducers({
  config,
  testFailures,
  actions
})

export default reducer
