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
                suitesRoot: action.payload.suitesRoot,
                environments: action.payload.environments
            }
        }
        default: {
            return state
        }
    }
}
