import { omitBy } from 'lodash'
import { Reducer } from 'redux'
import { ActionType } from '../actions/testFailures'
import { TestFailuresByName } from '../types'

const initialState = {}

const testFailures: Reducer<TestFailuresByName> = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.ADD_TEST_FAILURES: {
      return {
        ...state,
        ...action.payload.testFailures
      }
    }
    case ActionType.CLEAR_TEST_FAILURES_FOR_SUITE: {
      return omitBy(state, failure => failure.suiteName === action.payload.suiteName)
    }
    case ActionType.REMOVE_TEST_FAILURE: {
      return omitBy(state, failure => (
        failure.suiteName === action.payload.suiteName &&
        failure.testName === action.payload.testName
      ))
    }
    case ActionType.CLEAR_TEST_FAILURES: {
      return initialState
    }
    default: {
      return state
    }
  }
}

export default testFailures
