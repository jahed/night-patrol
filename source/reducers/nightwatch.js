import { Action } from '../actions/nightwatch'

const initialState = {}

export default function nightwatch(state = initialState, action) {
    switch (action.type) {
        case Action.SET_NIGHTWATCH_EXECUTABLE: {
            return {
                ...state,
                executablePath: action.payload.executablePath
            }
        }
        case Action.SET_NIGHTWATCH_CONFIG: {
            return {
                ...state,
                configPath: action.payload.configPath,
                suiteDirectories: action.payload.suiteDirectories,
                suites: action.payload.suites,
                environments: action.payload.environments,
                currentEnvironment: action.payload.currentEnvironment,
                currentSuite: null
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
                currentSuite: null
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
