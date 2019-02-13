import { Reducer } from 'redux'
import { Action } from '../actions/nightwatch'
import { getDefaultNightwatchExec } from '../helpers/nightwatchHelper'
import { NightwatchState } from '../types'

const initialState = {
  configPath: 'nightwatch.config.js',
  executablePath: getDefaultNightwatchExec(),
  environments: {},
  currentEnvironment: 'default',
  suites: {},
  currentSuite: undefined
}

const nightwatch: Reducer<NightwatchState> = (state = initialState, action) => {
  switch (action.type) {
    case Action.SET_NIGHTWATCH_CONFIG: {
      return {
        ...state,
        configPath: action.payload.configPath,
        executablePath: action.payload.executablePath,
        suiteDirectories: action.payload.suiteDirectories,
        suites: action.payload.suites,
        environments: action.payload.environments,
        currentEnvironment: action.payload.currentEnvironment,
        currentSuite: undefined
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

export default nightwatch
