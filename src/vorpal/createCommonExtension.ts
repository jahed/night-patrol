import { QuestionCollection } from 'inquirer'
import _ from 'lodash'
import Vorpal from 'vorpal'
import { setCurrentEnvironment } from '../actions/config'
import { runTests } from '../actions/nightwatch'
import { getEnvironments } from '../selectors/getEnvironments'
import { getTestFailures } from '../selectors/getTestFailures'
import { hasEnvironment } from '../selectors/hasEnvironment'
import { Store, TestFailure } from '../types'
import { withoutVorpal } from './withoutVorpal'

const testFailureName = (failure: TestFailure) => (
  `${failure.suiteName}: "${failure.testName}"`
)

const createCommonExtension = (store: Store): Vorpal.Extension => vorpal => [
  vorpal
    .command('failures list', 'List all tests that failed in the previous run')
    .alias('failures ls', 'fls')
    .action(() => {
      const failures = getTestFailures(store.getState())
      if (Object.keys(failures).length === 0) {
        vorpal.log('No tests failed on the last run.')
        return Promise.resolve()
      }

      const output = Object.keys(failures)
        .map(k => failures[k])
        .map(f => testFailureName(f))
        .join('\n')

      vorpal.log(output)
      return Promise.resolve()
    }),

  vorpal
    .command('failures run', 'Run all tests that failed in the previous run')
    .alias('fr')
    .action(function failuresRun () {
      const failures = getTestFailures(store.getState())
      if (Object.keys(failures).length === 0) {
        vorpal.log('No tests failed on the last run.')
        return Promise.resolve()
      }

      const question: QuestionCollection<{ suite: string }> = {
        name: 'suite',
        message: 'Which failed test suite would you like to run?',
        type: 'list',
        choices: Object.keys(failures)
          .map(k => failures[k])
          .map(f => ({
            name:  testFailureName(f),
            value: f.suiteName,
            short: f.suiteName
          }))
      }

      return this.prompt(question)
        .then(({ suite }) => withoutVorpal(
          vorpal,
          () => store.dispatch(runTests({ suite }))
        ))
    }),

  vorpal
    .command('env <env>', 'Change current environment')
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

  vorpal
    .command('state [path]', 'View the internal Night Patrol state')
    .alias('internals')
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
