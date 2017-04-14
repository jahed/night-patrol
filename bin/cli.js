#!/usr/bin/env node

const Vorpal = require('vorpal')
const requireDir = require('require-dir')
const _ = require('lodash')
const argv = require('minimist')(process.argv.slice(2))
const path = require('path')
const packageJson = require('../package.json')
const failureParser = require('../source/failureParser')
const suitesParser = require('../source/suitesParser')
const templates = require('../source/templates')
const nightwatchHelper = require('../source/nightwatchHelper')
const shell = require('../source/shell')

function getSuites(suitesRoot) {
    return suitesParser.parse(requireDir(suitesRoot, { recurse: true }))
}

if (!argv.config) {
    console.error('config is required\n')
    console.error('Usage:\n\t$ night-patrol --config <path-to-nightwatch-config>')
    process.exit(1)
}

const NIGHTWATCH_EXEC = argv.nightwatch || nightwatchHelper.getDefaultNightwatchExec()
const NIGHTWATCH_CONFIG_PATH = path.resolve(argv.config)
const NIGHTWATCH_CONFIG = require(NIGHTWATCH_CONFIG_PATH) // eslint-disable-line import/no-dynamic-require
const NIGHTWATCH_SUITES_ROOT = path.resolve(NIGHTWATCH_CONFIG.src_folders)
const NIGHTWATCH_ENVIRONMENTS = NIGHTWATCH_CONFIG.test_settings

if (_.isEmpty(NIGHTWATCH_ENVIRONMENTS)) {
    console.error('Provided Nightwatch Config has no environments (config.test_settings).')
    process.exit(1)
}

let CURRENT_NIGHTWATCH_SUITE = null
let CURRENT_NIGHTWATCH_ENV = NIGHTWATCH_ENVIRONMENTS.default ? 'default' : Object.keys(NIGHTWATCH_ENVIRONMENTS)[0]
let LAST_FAILED_TESTS = {}

const GLOBAL_COMMANDS = ['help', 'exit', 'failures run', 'failures list', 'env']

function clearCommands(vorpal) {
    /* eslint-disable no-underscore-dangle */
    vorpal.commands
        .filter(command => !GLOBAL_COMMANDS.includes(command._name))
        .forEach(command => command.remove())
    /* esline-enable */
}

function reloadDelimiter(vorpal) {
    const chalk = vorpal.chalk
    vorpal.delimiter(
        `${chalk.red(`nightwatch(${CURRENT_NIGHTWATCH_ENV}):`)}${chalk.yellow(`/${CURRENT_NIGHTWATCH_SUITE || ''}`)} $`
    )
}

function clearSuite(vorpal) {
    CURRENT_NIGHTWATCH_SUITE = null
    reloadDelimiter(vorpal)
}

function setSuite(vorpal, suite) {
    CURRENT_NIGHTWATCH_SUITE = suite
    reloadDelimiter(vorpal)
}

function setEnv(vorpal, env) {
    CURRENT_NIGHTWATCH_ENV = env
    reloadDelimiter(vorpal)
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
    const nightWatchArgs = {
        config: NIGHTWATCH_CONFIG_PATH,
        env: CURRENT_NIGHTWATCH_ENV
    }

    if (suite) {
        nightWatchArgs.test = path.resolve(NIGHTWATCH_SUITES_ROOT, `${suite}.js`)
    }

    if (testname) {
        nightWatchArgs.testcase = testname
    }

    return shell.exec(shell.createCommandString(NIGHTWATCH_EXEC, nightWatchArgs))
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
        setSuite(vorpal, suiteName)

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
    const suites = getSuites(NIGHTWATCH_SUITES_ROOT)

    clearSuite(vorpal)

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
            data: () => Object.keys(NIGHTWATCH_ENVIRONMENTS)
        })
        .action(({ env: chosenEnv }) => {
            if (!NIGHTWATCH_CONFIG.test_settings[chosenEnv]) {
                vorpal.log(`Unknown env: "${chosenEnv}"`)
                return Promise.resolve()
            }

            setEnv(vorpal, chosenEnv)
            return Promise.resolve()
        })
}

const rootVorpal = new Vorpal()

rootVorpal.use(globalCLI)
rootVorpal.use(rootCLI)
rootVorpal.show()
