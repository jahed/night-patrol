import Path from 'path'
import _ from 'lodash'
import * as shell from '../shell'
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

export function setNightwatchExecutable({ path }) {
    return {
        type: Action.SET_NIGHTWATCH_EXECUTABLE,
        payload: {
            executablePath: path
        }
    }
}

export function setNightwatchConfig({ path }) {
    // eslint-disable-next-line import/no-dynamic-require,global-require
    const config = require(path)
    const environments = config.test_settings

    if (_.isEmpty(environments)) {
        throw new Error('Provided Nightwatch Config has no environments (config.test_settings).')
    }

    const initialEnvironment = environments.default
        ? 'default'
        : Object.keys(environments)[0]

    return {
        type: Action.SET_NIGHTWATCH_CONFIG,
        payload: {
            configPath: path,
            suitesRoot: Path.resolve(config.src_folders),
            environments: environments,
            currentEnvironment: initialEnvironment
        }
    }
}

export function setCurrentSuite({ suite }) {
    return {
        type: Action.SET_CURRENT_SUITE,
        payload: {
            currentSuite: suite
        }
    }
}

export function clearCurrentSuite() {
    return {
        type: Action.CLEAR_CURRENT_SUITE
    }
}

export function setCurrentEnvironment({ environment }) {
    return {
        type: Action.SET_CURRENT_ENVIRONMENT,
        payload: {
            currentEnvironment: environment
        }
    }
}

function runNightWatchStart(nightWatchArgs) {
    return {
        type: Action.RUN_NIGHTWATCH_START,
        payload: nightWatchArgs
    }
}

function runNightWatchSuccess() {
    return {
        type: Action.RUN_NIGHTWATCH_SUCCESS
    }
}

function runNightWatchFailure() {
    return {
        type: Action.RUN_NIGHTWATCH_FAILURE
    }
}

export function runNightWatch({ suite, testname }) {
    return (dispatch, getState) => {
        const {
            nightwatch: {
                configPath,
                suitesRoot,
                executablePath,
                currentEnvironment
            }
        } = getState()

        const nightWatchArgs = {
            config: configPath,
            env: currentEnvironment
        }

        if (suite) {
            nightWatchArgs.test = Path.resolve(suitesRoot, `${suite}.js`)
        }

        if (testname) {
            nightWatchArgs.testcase = testname
        }

        dispatch(runNightWatchStart(nightWatchArgs))

        return shell.exec(shell.createCommandString(executablePath, nightWatchArgs))
            .then(() => {
                if (testname) {
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
                dispatch(addTestFailuresFromNightwatchOutput({ stdout }))
                dispatch(runNightWatchFailure())
            })
    }
}

export function runFailedTestByName(name) {
    return (dispatch, getState) => {
        const lastFailedTest = getState().testFailures[name]
        return dispatch(runNightWatch({
            suite: lastFailedTest.suiteName,
            testname: lastFailedTest.testName
        }))
    }
}
