import chalk from 'chalk'
import Vorpal from 'vorpal'
import { setCurrentSuite } from '../actions/config'
import { runTests } from '../actions/nightwatch'
import { getTestCases } from '../selectors/getTestCases'
import { Store } from '../types'
import { header } from '../utils/header'
import { clearCommands } from './clearCommands'
import { createCommonExtension } from './createCommonExtension'
import { createRootExtension } from './createRootExtension'
import { useExtensions } from './useExtensions'

const createSuiteExtension = (store: Store, suiteName: string) => {
  return (vorpal: Vorpal) => {
    const goBack = () => {
      clearCommands(vorpal)
      useExtensions(vorpal, [
        createCommonExtension(store),
        createRootExtension(store)
      ])
      return Promise.resolve()
    }

    store.dispatch(setCurrentSuite({ suite: suiteName }))
    const unsubscribeFromStore = store.subscribe(() => {
      const state = store.getState()
      if (!state.config.suites[suiteName]) {
        vorpal.log('Suite has been removed. Going back.')
        unsubscribeFromStore()
        goBack().catch(e => {
          console.error(`Failed to go back.`, e)
          process.exit(1)
        })
      }
    })

    const realSpace = ' '
    const alternativeSpace = ' '

    const commands = [
      vorpal
        .command('list', 'List all test cases')
        .alias('ls')
        .types({ string: ['testname'] })
        .action(() => {
          vorpal.log(getTestCases(store.getState(), suiteName).join('\n'))
          return Promise.resolve()
        }),

      vorpal
        .command('run [testname]', 'Run all tests or just one')
        .alias('r')
        .autocomplete({
          data () {
            return getTestCases(store.getState(), suiteName)
              .map(name => `"${name.replace(new RegExp(realSpace, 'g'), alternativeSpace)}"`)
          }
        })
        .types({ string: ['testname'] })
        .action(({ testname: formattedTestName }) => {
          const testName = formattedTestName
            ? formattedTestName.replace(new RegExp(alternativeSpace, 'g'), realSpace)
            : undefined

          return store.dispatch(runTests({
            suite: suiteName,
            testname: testName
          }))
        }),

      vorpal
        .command('back', 'Exit suite')
        .alias('b', 'cd ..', 'cd ~', 'cd ~/')
        .action(() => {
          unsubscribeFromStore()
          return goBack()
        })
    ]

    vorpal.log(chalk.cyan(header({
      title: `SUITE`,
      subtitle: suiteName
    })))
    vorpal.execSync('help')

    return commands
  }
}

export {
  createSuiteExtension
}
