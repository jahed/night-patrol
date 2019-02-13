import * as failureParser from '../parsers/failureParser'

export const Action = {
    ADD_TEST_FAILURES: '@@night-patrol/testFailures/ADD_TEST_FAILURES',
    CLEAR_TEST_FAILURES: '@@night-patrol/testFailures/CLEAR_TEST_FAILURES',
    REMOVE_TEST_FAILURE: '@@night-patrol/testFailures/REMOVE_TEST_FAILURE',
    CLEAR_TEST_FAILURES_FOR_SUITE: '@@night-patrol/testFailures/CLEAR_TEST_FAILURES_FOR_SUITE'
}

export function addTestFailures({ testFailures }) {
    return {
        type: Action.ADD_TEST_FAILURES,
        payload: {
            testFailures
        }
    }
}

export function addTestFailuresFromNightwatchOutput({ suites, stdout }) {
    return addTestFailures({
        testFailures: failureParser.parse({ suites, stdout })
    })
}

export function clearTestFailures() {
    return {
        type: Action.CLEAR_TEST_FAILURES
    }
}

export function removeTestFailure({ suiteName, testName }) {
    return {
        type: Action.REMOVE_TEST_FAILURE,
        payload: {
            suiteName,
            testName
        }
    }
}

export function clearTestFailuresForSuite({ suiteName }) {
    return {
        type: Action.CLEAR_TEST_FAILURES_FOR_SUITE,
        payload: {
            suiteName
        }
    }
}
