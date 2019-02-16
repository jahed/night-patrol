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
    vorpal
      .command('list', 'List all test suites')
      .alias('ls')
      .types({ string: ['testname'] })
      .action(() => {
        vorpal.log(getTestSuites(store.getState()).join('\n'))
        return Promise.resolve()
      }),

    vorpal
      .command('run [suite]', 'Run all suites or just one')
      .alias('r')
      .autocomplete({
        data: () => getTestSuites(store.getState())
      })
      .action(({ suite: suiteName }) => store.dispatch(runTests({ suite: suiteName }))),

    vorpal
      .command('suite <suite>', 'Switch to a suite')
      .autocomplete({
        data: () => getTestSuites(store.getState())
      })
      .alias('s', 'cd')
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
