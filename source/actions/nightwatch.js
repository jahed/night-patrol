import Path from 'path'

export const Action = {
    SET_NIGHTWATCH_EXECUTABLE: '@@night-patrol/nightwatch/SET_NIGHTWATCH_EXECUTABLE',
    SET_NIGHTWATCH_CONFIG: '@@night-patrol/nightwatch/SET_NIGHTWATCH_CONFIG'
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

    return {
        type: Action.SET_NIGHTWATCH_CONFIG,
        payload: {
            configPath: path,
            suitesRoot: Path.resolve(config.src_folders),
            environments: config.test_settings
        }
    }
}
