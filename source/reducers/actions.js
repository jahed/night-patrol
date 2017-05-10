const initialState = {}

export default function actions(state = initialState, action) {
    return {
        ...state,
        [new Date().toISOString()]: action
    }
}
