import chalk from 'chalk'
import fs from 'fs'
import { Questions } from 'inquirer'
import _ from 'lodash'
import minimist from 'minimist'
import path from 'path'
import Vorpal from 'vorpal'
import {
  clearCurrentSuite,
  setConfig,
  setCurrentEnvironment,
  setCurrentSuite
} from './actions/config'
import { runFailedTestByName, runTests } from './actions/nightwatch'
import { getDelimiter } from './selectors/getDelimiter'
import { getEnvironments } from './selectors/getEnvironments'
import { getTestCases } from './selectors/getTestCases'
import { getTestFailures } from './selectors/getTestFailures'
import { getTestSuites } from './selectors/getTestSuites'
import { hasEnvironment } from './selectors/hasEnvironment'
import store from './store'
import * as templates from './templates'
import { PackageJSON } from './types'

const packageJson: PackageJSON = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../package.json')).toString()
)

const useExtensions = (vorpal: Vorpal, extensions: Vorpal.Extension[]) => {
  extensions.forEach(extension => vorpal.use(extension))
}

const clearCommands = (vorpal: Vorpal) => {
  const GLOBAL_COMMANDS = ['help', 'exit']
  vorpal.commands
    .filter(command => !GLOBAL_COMMANDS.includes(command._name)) // eslint-disable-line no-underscore-dangle
    .forEach(command => command.remove())
}

const suiteCLI = (suiteName: string, testNames: string[]) => {
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
            globalCLI(), // eslint-disable-line no-use-before-define
            rootCLI() // eslint-disable-line no-use-before-define
          ])
          return Promise.resolve()
        })
    ]

    vorpal.log(chalk.cyan(templates.header({
      heading: _.words(suiteName).map(word => _.upperFirst(word)).join(' '),
      body: 'Remember, you will need to restart the session to refresh the autocomplete.'
    })))
    vorpal.execSync('help')

    return commands
  }
}

const rootCLI = (): Vorpal.Extension => vorpal => {
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
          globalCLI(), // eslint-disable-line no-use-before-define
          suiteCLI(suiteName, testNames)
        ])

        return Promise.resolve()
      })
  ]

  vorpal.log(chalk.cyan(templates.header({
    heading: `NIGHT PATROL v${packageJson.version}`,
    body: 'Remember, you will need to restart the session to refresh the autocomplete.'
  })))
  vorpal.execSync('help')

  return commands
}

const globalCLI = (): Vorpal.Extension => vorpal => [
  vorpal.command('failures list', 'List all tests that failed in the previous run')
    .action(() => {
      const testChoices = getTestFailures(store.getState())
      if (testChoices.length === 0) {
        vorpal.log('No tests failed on the last run.')
        return Promise.resolve()
      }

      vorpal.log(testChoices.join('\n'))
      return Promise.resolve()
    }),

  vorpal.command('failures run', 'Run all tests that failed in the previous run')
    .action(function failuresRun () {
      const testChoices = getTestFailures(store.getState())
      if (testChoices.length === 0) {
        vorpal.log('No tests failed on the last run.')
        return Promise.resolve()
      }

      const question: Questions<{ testToRun: string }> = {
        name: 'testToRun',
        message: 'Which failed test would you like to run',
        type: 'list',
        choices: testChoices
      }

      return this.prompt(question)
        .then(({ testToRun }) => store.dispatch(runFailedTestByName(testToRun)))
    }),

  vorpal.command('env <env>', 'Change current environment')
    .autocomplete({
      data: () => getEnvironments(store.getState())
    })
    .action(({ env: chosenEnv }) => {
      if (!hasEnvironment(store.getState(), chosenEnv)) {
        vorpal.log(`Unknown env: "${chosenEnv}"`)
        return Promise.resolve()
      }

      store.dispatch(setCurrentEnvironment({ environment: chosenEnv }))
      return Promise.resolve()
    }),

  vorpal.command('internals [path]', 'View the internal Night Patrol state')
    .action(({ path: statePath }) => {
      const state = store.getState()
      const internals = statePath ? _.get(state, statePath) : state
      vorpal.log(JSON.stringify(internals, null, 2))
      return Promise.resolve()
    })
]

const argv = minimist(process.argv.slice(2))

store.dispatch(setConfig({
  configPath: argv.config,
  executablePath: argv.nightwatch
}))

const rootVorpal = new Vorpal()
rootVorpal.history(`${packageJson.name}-${packageJson.version}`)
useExtensions(rootVorpal, [globalCLI(), rootCLI()])

const reloadDelimiter = (vorpal: Vorpal) => {
  const delimiter = getDelimiter(store.getState())
  vorpal.delimiter(delimiter) // Future delimiters
  vorpal.ui.delimiter(delimiter) // Current delimiter
}

reloadDelimiter(rootVorpal)
store.subscribe(() => {
  reloadDelimiter(rootVorpal)
})

rootVorpal.show()
