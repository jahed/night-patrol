import Path from 'path'
import { AnyAction } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { State } from '../types'
import {
  addTestFailuresFromNightwatchOutput,
  clearTestFailures,
  clearTestFailuresForSuite,
  removeTestFailure
} from './testFailures'
import { exec } from '../shell/exec'
import { command } from '../shell/command'

export const Action = {
  RUN_NIGHTWATCH_START: '@@night-patrol/nightwatch/RUN_NIGHTWATCH_START',
  RUN_NIGHTWATCH_SUCCESS: '@@night-patrol/nightwatch/RUN_NIGHTWATCH_SUCCESS',
  RUN_NIGHTWATCH_FAILURE: '@@night-patrol/nightwatch/RUN_NIGHTWATCH_FAILURE'
}

export type NightWatchArgs = {
  config: string,
  env: string,
  test?: string,
  testcase?: string
}

const runNightWatchStart = (nightWatchArgs: NightWatchArgs) => ({
  type: Action.RUN_NIGHTWATCH_START,
  payload: nightWatchArgs
})

const runNightWatchSuccess = () => ({
  type: Action.RUN_NIGHTWATCH_SUCCESS
})

const runNightWatchFailure = () => ({
  type: Action.RUN_NIGHTWATCH_FAILURE
})

export type RunTests = ThunkAction<Promise<void>, State, any, AnyAction>

export const runTests = ({ suite, testname }: { suite?: string, testname?: string }): RunTests => (
  (dispatch, getState) => {
    const {
      config: {
        configPath,
        executablePath,
        currentEnvironment,
        suites
      }
    } = getState()

    const nightWatchArgs: NightWatchArgs = {
      config: configPath,
      env: currentEnvironment
    }

    if (suite) {
      nightWatchArgs.test = Path.resolve(`${suite}.js`)
    }

    if (testname) {
      nightWatchArgs.testcase = testname
    }

    dispatch(runNightWatchStart(nightWatchArgs))

    return exec(command(executablePath, nightWatchArgs))
      .then(() => {
        if (suite && testname) {
          return dispatch(removeTestFailure({
            suiteName: suite,
            testName: testname
          }))
        }

        if (suite) {
          return dispatch(clearTestFailuresForSuite({ suiteName: suite }))
        }

        return dispatch(clearTestFailures())
      })
      .then(() => {
        dispatch(runNightWatchSuccess())
      })
      .catch(({ stdout }) => {
        dispatch(addTestFailuresFromNightwatchOutput({ suites, stdout }))
        dispatch(runNightWatchFailure())
      })
  }
)

export const runFailedTestByName = (name: string): RunTests => (
  (dispatch, getState) => {
    const lastFailedTest = getState().testFailures[name]
    return dispatch(runTests({
      suite: lastFailedTest.suiteName,
      testname: lastFailedTest.testName
    }))
  }
)
