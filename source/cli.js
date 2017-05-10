import Vorpal from 'vorpal'
import requireDir from 'require-dir'
import _ from 'lodash'
import minimist from 'minimist'
import path from 'path'
import packageJson from '../package.json'
import * as failureParser from './parsers/failureParser'
import * as suitesParser from './parsers/suitesParser'
import * as templates from './templates'
import * as nightwatchHelper from './helpers/nightwatchHelper'
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

let LAST_FAILED_TESTS = {}

function useExtensions(vorpal, extensions) {
    extensions.forEach(extension => vorpal.use(extension))
}

function clearCommands(vorpal) {
    const GLOBAL_COMMANDS = ['help', 'exit']
    vorpal.commands
        .filter(command => !GLOBAL_COMMANDS.includes(command._name)) // eslint-disable-line no-underscore-dangle
        .forEach(command => command.remove())
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

function getSuites(suitesRoot) {
    return suitesParser.parse(requireDir(suitesRoot, { recurse: true }))
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

        const commands = [
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

function rootCLI() {
    return vorpal => {
        const chalk = vorpal.chalk
        const suites = getSuites(getState().nightwatch.suitesRoot)

        dispatch(clearCurrentSuite())

        const commands = [
            vorpal.command('run [suite]', 'Run all suites or just one')
                .autocomplete({
                    data: () => Object.keys(suites)
                })
                .action(({ suite: suiteName }) => runNightWatch({ suite: suiteName })),

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
}


function globalCLI() {
    return vorpal => [
        vorpal.command('failures list', 'List all tests that failed in the previous run')
                .action(() => {
                    const testChoices = getLastFailedTestNames()
                    if (testChoices.length === 0) {
                        vorpal.log('No tests failed on the last run.')
                        return Promise.resolve()
                    }

                    vorpal.log(testChoices.join('\n'))
                    return Promise.resolve()
                }),


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
                }),


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
                }),

        vorpal.command('internals', 'View the internal Night Patrol state')
                .action(() => {
                    console.log(JSON.stringify(getState(), null, 2))
                    return Promise.resolve()
                })
    ]
}


const argv = minimist(process.argv.slice(2))

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

const rootVorpal = new Vorpal()
rootVorpal.history(`${packageJson.name}-${packageJson.version}`)
useExtensions(rootVorpal, [globalCLI(), rootCLI()])

function reloadDelimiter(vorpal) {
    const chalk = vorpal.chalk
    const { nightwatch: { currentSuite, currentEnvironment } } = getState()
    const delimiter = `${chalk.red(`nightwatch(${currentEnvironment}):`)}${chalk.yellow(`/${currentSuite || ''}`)} $`
    vorpal.delimiter(delimiter)
    vorpal.ui.delimiter(vorpal.delimiter())
}

reloadDelimiter(rootVorpal)
subscribe(() => {
    reloadDelimiter(rootVorpal)
})

rootVorpal.show()
