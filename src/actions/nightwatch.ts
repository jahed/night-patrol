import _ from 'lodash'
import Path from 'path'
import { AnyAction } from 'redux'
import { ThunkAction } from 'redux-thunk'
import requireDir from 'require-dir'
import * as suitesParser from '../parsers/suitesParser'
import * as shell from '../shell'
import { NightPatrolState, Suites } from '../types'
import {
  addTestFailuresFromNightwatchOutput,
  clearTestFailures,
  clearTestFailuresForSuite,
  removeTestFailure
} from './testFailures'

export const Action = {
  SET_NIGHTWATCH_EXECUTABLE: '@@night-patrol/nightwatch/SET_NIGHTWATCH_EXECUTABLE',
  SET_NIGHTWATCH_CONFIG: '@@night-patrol/nightwatch/SET_NIGHTWATCH_CONFIG',
  SET_CURRENT_SUITE: '@@night-patrol/nightwatch/SET_CURRENT_SUITE',
  CLEAR_CURRENT_SUITE: '@@night-patrol/nightwatch/CLEAR_CURRENT_SUITE',
  SET_CURRENT_ENVIRONMENT: '@@night-patrol/nightwatch/SET_CURRENT_ENVIRONMENT',
  RUN_NIGHTWATCH_START: '@@night-patrol/nightwatch/RUN_NIGHTWATCH_START',
  RUN_NIGHTWATCH_SUCCESS: '@@night-patrol/nightwatch/RUN_NIGHTWATCH_SUCCESS',
  RUN_NIGHTWATCH_FAILURE: '@@night-patrol/nightwatch/RUN_NIGHTWATCH_FAILURE'
}

export const setNightwatchExecutable = ({ path }: { path: string }) => ({
  type: Action.SET_NIGHTWATCH_EXECUTABLE,
  payload: {
    executablePath: path
  }
})

const getSuites = (suiteDirectories: string[]): Suites => (
  suiteDirectories.reduce((suites: Suites, srcDir) => {
    const srcSuites = suitesParser.parse(requireDir(srcDir, { recurse: true }))
    Object.keys(srcSuites).forEach(srcSuiteName => {
      const suiteName = Path.relative(
        process.cwd(),
        Path.resolve(srcDir, srcSuiteName)
      )
      suites[suiteName] = srcSuites[srcSuiteName]
    })
    return suites
  }, {})
)

export const setNightwatchConfig = ({ path: configPath }: { path: string }) => {
  const config = require(configPath)
  const environments = config.test_settings

  if (_.isEmpty(environments)) {
    throw new Error('Provided Nightwatch Config has no environments (config.test_settings).')
  }

  const currentEnvironment = environments.default
    ? 'default'
    : Object.keys(environments)[0]

  const suiteDirectories = (
    Array.isArray(config.src_folders)
      ? config.src_folders
      : [config.src_folders]
  ).map((dir: string) => Path.resolve(dir))

  return {
    type: Action.SET_NIGHTWATCH_CONFIG,
    payload: {
      configPath,
      suiteDirectories,
      suites: getSuites(suiteDirectories),
      environments,
      currentEnvironment
    }
  }
}

export const setCurrentSuite = ({ suite }: { suite: string }) => ({
  type: Action.SET_CURRENT_SUITE,
  payload: {
    currentSuite: suite
  }
})

export const clearCurrentSuite = () => ({
  type: Action.CLEAR_CURRENT_SUITE
})

export const setCurrentEnvironment = ({ environment }: { environment: string }) => ({
  type: Action.SET_CURRENT_ENVIRONMENT,
  payload: {
    currentEnvironment: environment
  }
})

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

export type RunNightWatchAction = ThunkAction<Promise<void>, NightPatrolState, any, AnyAction>

export const runNightWatch = ({ suite, testname }: { suite?: string, testname?: string }): RunNightWatchAction => (
  (dispatch, getState) => {
    const {
      nightwatch: {
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

    return shell.exec(shell.createCommandString(executablePath, nightWatchArgs))
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

export const runFailedTestByName = (name: string): RunNightWatchAction => (
  (dispatch, getState) => {
    const lastFailedTest = getState().testFailures[name]
    return dispatch(runNightWatch({
      suite: lastFailedTest.suiteName,
      testname: lastFailedTest.testName
    }))
  }
)
