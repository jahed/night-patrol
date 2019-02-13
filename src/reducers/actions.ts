import { Reducer } from 'redux'
import { ActionsLog } from '../types'

const initialState = {}

const actions: Reducer<ActionsLog> = (state = initialState, action) => ({
  ...state,
  [new Date().toISOString()]: action
})

export default actions
