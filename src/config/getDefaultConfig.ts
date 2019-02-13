import path from 'path'
import { Config } from '../types'
import { readPackageJSON } from '../utils/readPackageJSON'

export const getDefaultConfig = (): Config => {
  const packageJson = readPackageJSON()
  return {
    name: packageJson.name,
    version: packageJson.version,
    configPath: path.resolve('./nightwatch.config.js'),
    executablePath: path.resolve('./node_modules/.bin/nightwatch'),
    environments: {},
    currentEnvironment: 'default',
    suiteDirectories: [],
    suites: {},
    currentSuite: undefined
  }
}
