import { createConfig } from '../config/createConfig'
import { ConfigOptions } from '../types'

export const Action = {
  SET_CONFIG: '@@night-patrol/config/SET_CONFIG',
  SET_CURRENT_SUITE: '@@night-patrol/config/SET_CURRENT_SUITE',
  CLEAR_CURRENT_SUITE: '@@night-patrol/config/CLEAR_CURRENT_SUITE',
  SET_CURRENT_ENVIRONMENT: '@@night-patrol/config/SET_CURRENT_ENVIRONMENT'
}

export const setConfig = (options: ConfigOptions) => ({
  type: Action.SET_CONFIG,
  payload: createConfig(options)
})

export const setCurrentSuite = ({ suite }: { suite: string }) => ({
  type: Action.SET_CURRENT_SUITE,
  payload: {
    currentSuite: suite
  }
})

export const clearCurrentSuite = () => ({
  type: Action.CLEAR_CURRENT_SUITE
})

export const setCurrentEnvironment = ({ environment }: { environment: string }) => ({
  type: Action.SET_CURRENT_ENVIRONMENT,
  payload: {
    currentEnvironment: environment
  }
})
