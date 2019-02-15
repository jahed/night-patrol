import { Questions } from 'inquirer'
import Vorpal from 'vorpal'
import { setCurrentEnvironment } from '../actions/config'
import { runFailedTestByName } from '../actions/nightwatch'
import { getEnvironments } from '../selectors/getEnvironments'
import { getTestFailures } from '../selectors/getTestFailures'
import { hasEnvironment } from '../selectors/hasEnvironment'
import _ from 'lodash'
import { Store } from '../types'

const createCommonExtension = (store: Store): Vorpal.Extension => vorpal => [
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

export {
  createCommonExtension
}
