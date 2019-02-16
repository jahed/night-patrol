import { Reducer } from 'redux'
import { Action } from '../actions/config'
import { getDefaultConfig } from '../config/getDefaultConfig'
import { Config } from '../types'

const config: Reducer<Config> = (state = getDefaultConfig(), action) => {
  switch (action.type) {
    case Action.SET_CONFIG: {
      return {
        name: action.payload.name,
        version: action.payload.version,
        description: action.payload.description,
        homepage: action.payload.homepage,
        repository: action.payload.repository,
        configPath: action.payload.configPath,
        executablePath: action.payload.executablePath,
        suiteDirectories: action.payload.suiteDirectories,
        suites: action.payload.suites,
        environments: action.payload.environments,
        currentEnvironment: action.payload.currentEnvironment,
        currentSuite: action.payload.currentSuite,
        error: action.payload.error
      }
    }
    case Action.SET_CURRENT_SUITE: {
      return {
        ...state,
        currentSuite: action.payload.currentSuite
      }
    }
    case Action.CLEAR_CURRENT_SUITE: {
      return {
        ...state,
        currentSuite: undefined
      }
    }
    case Action.SET_CURRENT_ENVIRONMENT: {
      return {
        ...state,
        currentEnvironment: action.payload.currentEnvironment
      }
    }
    default: {
      return state
    }
  }
}

export default config
