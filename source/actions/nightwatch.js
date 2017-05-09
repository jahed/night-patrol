import Path from 'path'
import _ from 'lodash'

export const Action = {
    SET_NIGHTWATCH_EXECUTABLE: '@@night-patrol/nightwatch/SET_NIGHTWATCH_EXECUTABLE',
    SET_NIGHTWATCH_CONFIG: '@@night-patrol/nightwatch/SET_NIGHTWATCH_CONFIG',
    SET_CURRENT_SUITE: '@@night-patrol/nightwatch/SET_CURRENT_SUITE',
    CLEAR_CURRENT_SUITE: '@@night-patrol/nightwatch/CLEAR_CURRENT_SUITE',
    SET_CURRENT_ENVIRONMENT: '@@night-patrol/nightwatch/SET_CURRENT_ENVIRONMENT'
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

    return {
        type: Action.SET_NIGHTWATCH_CONFIG,
        payload: {
            configPath: path,
            suitesRoot: Path.resolve(config.src_folders),
            environments,
            currentEnvironment: environments.default
                ? 'default'
                : Object.keys(environments)[0]
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
