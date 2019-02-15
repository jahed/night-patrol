import * as failureParser from '../parsers/failureParser'
import { Suites, TestFailuresBySuite } from '../types'

export const ActionType = {
  ADD_TEST_FAILURES: '@@night-patrol/testFailures/ADD_TEST_FAILURES',
  CLEAR_TEST_FAILURES: '@@night-patrol/testFailures/CLEAR_TEST_FAILURES',
  REMOVE_TEST_FAILURE: '@@night-patrol/testFailures/REMOVE_TEST_FAILURE',
  CLEAR_TEST_FAILURES_FOR_SUITE: '@@night-patrol/testFailures/CLEAR_TEST_FAILURES_FOR_SUITE'
}

export const addTestFailures = ({ testFailures }: { testFailures: TestFailuresBySuite }) => ({
  type: ActionType.ADD_TEST_FAILURES,
  payload: {
    testFailures
  }
})

export const addTestFailuresFromNightwatchOutput = ({ suites, stdout }: { suites: Suites, stdout: string }) => (
  addTestFailures({
    testFailures: failureParser.parse({ suites, stdout })
  })
)

export const clearTestFailures = () => ({
  type: ActionType.CLEAR_TEST_FAILURES
})

export const removeTestFailure = ({ suiteName, testName }: { suiteName: string, testName: string }) => ({
  type: ActionType.REMOVE_TEST_FAILURE,
  payload: {
    suiteName,
    testName
  }
})

export const clearTestFailuresForSuite = ({ suiteName }: { suiteName: string }) => ({
  type: ActionType.CLEAR_TEST_FAILURES_FOR_SUITE,
  payload: {
    suiteName
  }
})
