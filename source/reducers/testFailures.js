import _ from 'lodash'
import { Action } from '../actions/testFailures'

const initialState = {}

export default function testFailures(state = initialState, action) {
    switch (action.type) {
        case Action.ADD_TEST_FAILURES: {
            return {
                ...state,
                ...action.payload.testFailures
            }
        }
        case Action.CLEAR_TEST_FAILURES_FOR_SUITE: {
            return _.omitBy(state, failure => failure.suiteName === action.payload.suiteName)
        }
        case Action.REMOVE_TEST_FAILURE: {
            return _.omitBy(state, failure => failure.suiteName === action.payload.suiteName
                && failure.testName === action.payload.testName
            )
        }
        case Action.CLEAR_TEST_FAILURES: {
            return initialState
        }
        default: {
            return state
        }
    }
}
