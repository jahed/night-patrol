import Vorpal from 'vorpal'
import { clearCurrentSuite } from '../actions/config'
import { runTests } from '../actions/nightwatch'
import { getHeader } from '../selectors/getHeader'
import { getTestCases } from '../selectors/getTestCases'
import { getTestSuites } from '../selectors/getTestSuites'
import { Store } from '../types'
import { clearCommands } from './clearCommands'
import { createCommonExtension } from './createCommonExtension'
import { createSuiteExtension } from './createSuiteExtension'
import { useExtensions } from './useExtensions'

const createRootExtension = (store: Store): Vorpal.Extension => vorpal => {
  store.dispatch(clearCurrentSuite())

  const commands = [
    vorpal.command('run [suite]', 'Run all suites or just one')
      .autocomplete({
        data: () => getTestSuites(store.getState())
      })
      .action(({ suite: suiteName }) => store.dispatch(runTests({ suite: suiteName }))),

    vorpal.command('suite <suite>', 'Switch to a suite')
      .autocomplete({
        data: () => getTestSuites(store.getState())
      })
      .action(({ suite: suiteName }) => {
        const testNames = getTestCases(store.getState(), suiteName)
        if (!testNames) {
          vorpal.log(`Unknown suite "${suiteName}"`)
          return Promise.resolve()
        }

        clearCommands(vorpal)
        useExtensions(vorpal, [
          createCommonExtension(store),
          createSuiteExtension(store, suiteName)
        ])

        return Promise.resolve()
      })
  ]

  vorpal.log(getHeader(store.getState()))
  vorpal.execSync('help')

  return commands
}

export {
  createRootExtension
}
