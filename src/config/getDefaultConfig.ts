import path from 'path'
import { Config } from '../types'

export const getDefaultConfig = (): Config => ({
  configPath: path.resolve('./nightwatch.config.js'),
  executablePath: path.resolve('./node_modules/.bin/nightwatch'),
  environments: {},
  currentEnvironment: 'default',
  suiteDirectories: [],
  suites: {},
  currentSuite: undefined
})
