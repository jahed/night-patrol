import { combineReducers } from 'redux'
import nightwatch from './nightwatch'
import testFailures from './testFailures'
import actions from './actions'

export default combineReducers({
    nightwatch,
    testFailures,
    actions
})
