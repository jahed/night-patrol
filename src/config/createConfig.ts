import { isEmpty } from 'lodash'
import Path from 'path'
import { Config, ConfigOptions } from '../types'
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

  if (options.currentEnvironment) {
    config.currentEnvironment = options.currentEnvironment
  }

  if (options.currentSuite) {
    config.currentSuite = options.currentSuite
  }

  try {
    delete require.cache[require.resolve(config.configPath)]
    const nightwatchConfig = require(config.configPath)

    if (nightwatchConfig.test_settings) {
      config.environments = Object.keys(nightwatchConfig.test_settings)
        .reduce((acc, next) => {
          acc[next] = true
          return acc
        }, {} as { [key: string]: true })
    }

    if (isEmpty(config.environments)) {
      throw new Error('Provided Nightwatch Config has no environments (config.test_settings).')
    }

    if (!config.environments[config.currentEnvironment]) {
      config.currentEnvironment = Object.keys(config.environments)[0]
    }

    config.suiteDirectories = ensureArray(nightwatchConfig.src_folders)
      .map(dir => Path.resolve(dir))

    config.suites = getSuites(config.suiteDirectories)
  } catch (e) {
    config.error = `${e.stack || e}`
  }
  return config
}

export {
  createConfig
}
