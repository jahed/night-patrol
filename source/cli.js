import Vorpal from 'vorpal'
import requireDir from 'require-dir'
import _ from 'lodash'
import minimist from 'minimist'
import path from 'path'
import packageJson from '../package.json'
import * as failureParser from './failureParser'
import * as suitesParser from './suitesParser'
import * as templates from './templates'
import * as nightwatchHelper from './nightwatchHelper'
import * as shell from './shell'
import store from './store'
import {
    setNightwatchConfig,
    setNightwatchExecutable,
    setCurrentSuite,
    clearCurrentSuite,
    setCurrentEnvironment
} from './actions/nightwatch'

const { dispatch, getState, subscribe } = store
const argv = minimist(process.argv.slice(2))

function getSuites(suitesRoot) {
    return suitesParser.parse(requireDir(suitesRoot, { recurse: true }))
}

if (!argv.config) {
    console.error('config is required\n')
    console.error('Usage:\n\t$ night-patrol --config <path-to-nightwatch-config>')
    process.exit(1)
}

dispatch(setNightwatchExecutable({
    path: argv.nightwatch || nightwatchHelper.getDefaultNightwatchExec()
}))

dispatch(setNightwatchConfig({
    path: path.resolve(argv.config)
}))

let LAST_FAILED_TESTS = {}

const GLOBAL_COMMANDS = ['help', 'exit', 'failures run', 'failures list', 'env', 'internals']

function clearCommands(vorpal) {
    /* eslint-disable no-underscore-dangle */
    vorpal.commands
        .filter(command => !GLOBAL_COMMANDS.includes(command._name))
        .forEach(command => command.remove())
    /* eslint-enable */
}

function clearLastFailedTests() {
    LAST_FAILED_TESTS = {}
}

function setLastFailedTests(v) {
    LAST_FAILED_TESTS = v
}

function getLastFailedTestNames() {
    return Object.keys(LAST_FAILED_TESTS)
}

function runNightWatch({ suite, testname }) {
    const {
        nightwatch: { configPath, suitesRoot, executablePath, currentEnvironment }
    } = getState()

    const nightWatchArgs = {
        config: configPath,
        env: currentEnvironment
    }

    if (suite) {
        nightWatchArgs.test = path.resolve(suitesRoot, `${suite}.js`)
    }

    if (testname) {
        nightWatchArgs.testcase = testname
    }

    return shell.exec(shell.createCommandString(executablePath, nightWatchArgs))
        .then(() => clearLastFailedTests())
        .catch(({ stdout }) => setLastFailedTests(failureParser.parse(stdout)))
}

function runFailedTestByName(name) {
    const lastFailedTest = LAST_FAILED_TESTS[name]
    return runNightWatch({
        suite: lastFailedTest.suiteName,
        testname: lastFailedTest.testName
    })
}

function suiteCLI(suiteName, testNames) {
    return vorpal => {
        dispatch(setCurrentSuite({ suite: suiteName }))

        const chalk = vorpal.chalk
        const realSpace = ' '
        const alternativeSpace = ' '

        vorpal.command('run [testname]', 'Run all tests or just one')
            .autocomplete({
                data() {
                    return testNames.map(name => `"${name.replace(new RegExp(realSpace, 'g'), alternativeSpace)}"`)
                }
            })
            .types({ string: ['testname'] })
            .action(({ testname: formattedTestName }) => {
                const testName = formattedTestName
                    ? formattedTestName.replace(new RegExp(alternativeSpace, 'g'), realSpace)
                    : undefined

                return runNightWatch({
                    suite: suiteName,
                    testname: testName
                })
            })

        vorpal.command('back', 'Exit suite')
            .action(() => {
                clearCommands(vorpal)
                vorpal.use(rootCLI) // eslint-disable-line no-use-before-define
                return Promise.resolve()
            })

        vorpal.log(chalk.cyan(templates.header({
            heading: _.words(suiteName).map(word => _.upperFirst(word)).join(' '),
            body: 'Remember, you will need to restart the session to refresh the autocomplete.'
        })))
        vorpal.execSync('help')
    }
}

function rootCLI(vorpal) {
    const chalk = vorpal.chalk
    const suites = getSuites(getState().nightwatch.suitesRoot)

    dispatch(clearCurrentSuite())

    vorpal.command('run [suite]', 'Run all suites or just one')
        .autocomplete({
            data: () => Object.keys(suites)
        })
        .action(({ suite: suiteName }) => runNightWatch({ suite: suiteName }))

    vorpal.command('suite <suite>', 'Switch to a suite')
        .autocomplete({
            data: () => Object.keys(suites)
        })
        .action(({ suite: suiteName }) => {
            const testNames = suites[suiteName]
            if (!testNames) {
                vorpal.log(`Unknown suite "${suiteName}"`)
                return Promise.resolve()
            }

            clearCommands(vorpal)
            vorpal.use(suiteCLI(suiteName, testNames))
            return Promise.resolve()
        })

    vorpal.log(chalk.cyan(templates.header({
        heading: `NIGHT PATROL v${packageJson.version}`,
        body: 'Remember, you will need to restart the session to refresh the autocomplete.'
    })))
    vorpal.execSync('help')
}


function globalCLI(vorpal) {
    vorpal.command('failures list', 'List all tests that failed in the previous run')
        .action(() => {
            const testChoices = getLastFailedTestNames()
            if (testChoices.length === 0) {
                vorpal.log('No tests failed on the last run.')
                return Promise.resolve()
            }

            vorpal.log(testChoices.join('\n'))
            return Promise.resolve()
        })


    vorpal.command('failures run', 'Run all tests that failed in the previous run')
        .action(function failuresRun() {
            const testChoices = getLastFailedTestNames()
            if (testChoices.length === 0) {
                vorpal.log('No tests failed on the last run.')
                return Promise.resolve()
            }

            return this.prompt({
                name: 'testToRun',
                message: 'Which failed test would you like to run',
                type: 'list',
                choices: testChoices
            }).then(({ testToRun }) => runFailedTestByName(testToRun))
        })


    vorpal.command('env <env>', 'Change current environment')
        .autocomplete({
            data: () => Object.keys(getState().nightwatch.environments)
        })
        .action(({ env: chosenEnv }) => {
            if (!getState().nightwatch.environments[chosenEnv]) {
                vorpal.log(`Unknown env: "${chosenEnv}"`)
                return Promise.resolve()
            }

            dispatch(setCurrentEnvironment({ environment: chosenEnv }))
            return Promise.resolve()
        })

    vorpal.command('internals', 'View the internal Night Patrol state')
        .action(() => {
            console.log(JSON.stringify(getState(), null, 2))
            return Promise.resolve()
        })
}

const rootVorpal = new Vorpal()

rootVorpal.use(globalCLI)
rootVorpal.use(rootCLI)

function reloadDelimiter(vorpal) {
    const chalk = vorpal.chalk
    const { nightwatch: { currentSuite, currentEnvironment } } = getState()
    vorpal.delimiter(
        `${chalk.red(`nightwatch(${currentEnvironment}):`)}${chalk.yellow(`/${currentSuite || ''}`)} $`
    )
}

reloadDelimiter(rootVorpal)
subscribe(() => {
    reloadDelimiter(rootVorpal)
})

rootVorpal.show()
