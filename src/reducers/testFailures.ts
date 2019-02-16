import { omitBy } from 'lodash'
import { Reducer } from 'redux'
import { Action as ConfigActionType } from '../actions/config'
import { ActionType } from '../actions/testFailures'
import { TestFailuresBySuite } from '../types'

const initialState = {}

const testFailures: Reducer<TestFailuresBySuite> = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.ADD_TEST_FAILURES: {
      return {
        ...state,
        ...action.payload.testFailures
      }
    }
    case ActionType.CLEAR_TEST_FAILURES_FOR_SUITE: {
      return omitBy(state, failure => (
        failure.suiteName === action.payload.suiteName
      ))
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
    case ConfigActionType.SET_CONFIG: {
      return action.payload.error
        ? state
        : omitBy(state, failure => (
          !action.payload.suites[failure.suiteName]
        ))
    }
    default: {
      return state
    }
  }
}

export default testFailures
