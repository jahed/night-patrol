import _ from 'lodash'
import Path from 'path'
import { ConfigOptions, Config } from '../types'
import { ensureArray } from '../utils/ensureArray'
import { getDefaultConfig } from './getDefaultConfig'
import { getSuites } from './getSuites'

const createConfig = (options: ConfigOptions = {}): Config => {
  const config = getDefaultConfig()

  if (options.configPath) {
    config.configPath = Path.resolve(options.configPath)
  }

  if (options.executablePath) {
    config.executablePath = Path.resolve(options.executablePath)
  }

  const nightwatchConfig = require(config.configPath)

  if (nightwatchConfig.test_settings) {
    config.environments = Object.keys(nightwatchConfig.test_settings)
      .reduce((acc: { [key: string]: true }, next) => {
        acc[next] = true
        return acc
      }, {})
  }

  if (_.isEmpty(config.environments)) {
    throw new Error('Provided Nightwatch Config has no environments (config.test_settings).')
  }

  if (!config.environments[config.currentEnvironment]) {
    config.currentEnvironment = Object.keys(config.environments)[0]
  }

  config.suiteDirectories = ensureArray(nightwatchConfig.src_folders)
    .map((dir: string) => Path.resolve(dir))

  config.suites = getSuites(config.suiteDirectories)

  return config
}

export {
  createConfig
}
