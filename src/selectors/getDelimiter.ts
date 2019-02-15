import chalk from 'chalk'
import path from 'path'
import { createSelector, Selector } from 'reselect'
import { State } from '../types'

const getDelimiter: Selector<State, string> = createSelector(
  state => state.config.currentSuite,
  state => state.config.currentEnvironment,
  state => state.testFailures,
  (currentSuite, currentEnvironment, testFailures) => {
    const environmentParts = [chalk.cyan(currentEnvironment)]
    const failureCount = Object.keys(testFailures).length
    if (failureCount > 0) {
      environmentParts.push(chalk.red(chalk.bold(`×${failureCount}`)))
    }

    const environment = chalk.magenta(`nightwatch(${environmentParts.join('|')}):`)
    const location = chalk.yellow(`${path.sep}${currentSuite || ''}`)

    return `${environment}${location} $ `
  }
)

export {
  getDelimiter
}
