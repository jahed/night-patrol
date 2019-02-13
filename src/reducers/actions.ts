import { Reducer } from 'redux'
import { ActionsState } from '../types'

const initialState = {}

const actions: Reducer<ActionsState> = (state = initialState, action) => ({
  ...state,
  [new Date().toISOString()]: action
})

export default actions
