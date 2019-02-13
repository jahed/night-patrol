import chalk from 'chalk'
import _ from 'lodash'
import Vorpal from 'vorpal'
import { setCurrentSuite } from '../actions/config'
import { runTests } from '../actions/nightwatch'
import { header } from '../header'
import store from '../store'
import { clearCommands } from './clearCommands'
import { createCommonExtension } from './createCommonExtension'
import { createRootExtension } from './createRootExtension'
import { useExtensions } from './useExtensions'

const createSuiteExtension = (suiteName: string, testNames: string[]) => {
  return (vorpal: Vorpal) => {
    store.dispatch(setCurrentSuite({ suite: suiteName }))

    const realSpace = ' '
    const alternativeSpace = ' '

    const commands = [
      vorpal.command('run [testname]', 'Run all tests or just one')
        .autocomplete({
          data () {
            return testNames.map(name => `"${name.replace(new RegExp(realSpace, 'g'), alternativeSpace)}"`)
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

      vorpal.command('back', 'Exit suite')
        .action(() => {
          clearCommands(vorpal)
          useExtensions(vorpal, [
            createCommonExtension(),
            createRootExtension()
          ])
          return Promise.resolve()
        })
    ]

    vorpal.log(chalk.cyan(header({
      heading: _.words(suiteName).map(word => _.upperFirst(word)).join(' '),
      body: 'Remember, you will need to restart the session to refresh the autocomplete.'
    })))
    vorpal.execSync('help')

    return commands
  }
}

export {
  createSuiteExtension
}
