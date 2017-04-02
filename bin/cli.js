#!/usr/bin/env node

const Vorpal = require('vorpal')
const requireDir = require('require-dir')
const _ = require('lodash')
const shell = require('shelljs')
const argv = require('minimist')(process.argv.slice(2))
const path = require('path')
const os = require('os')
const stripcolorcodes = require('stripcolorcodes')

function isTestCaseName(string) {
    return /\s/g.test(string)
}

function isTestSuite(object) {
    return _.some(object, (fn, key) => isTestCaseName(key))
}

function getTestNames(testSuite) {
    return Object.keys(testSuite)
        .filter(testCaseName => !['after', 'before'].includes(testCaseName))
}

function flattenSuites(object) {
    if (isTestSuite(object)) {
        return getTestNames(object)
    }

    const result = {}

    /* eslint-disable no-restricted-syntax, no-prototype-builtins, no-continue */
    for (const key in object) {
        if (!object.hasOwnProperty(key)) {
            continue
        }

        if (typeof object[key] === 'object') {
            const childObject = flattenSuites(object[key])
            if (Array.isArray(childObject)) {
                result[key] = childObject
            } else {
                for (const childKey in childObject) {
                    if (!childObject.hasOwnProperty(childKey)) {
                        continue
                    }

                    result[`${key}/${childKey}`] = childObject[childKey]
                }
            }
        } else {
            result[key] = object[key]
        }
    }
    /* eslint-enable */

    return result
}

function getSuites(suitesRoot) {
    return flattenSuites(requireDir(suitesRoot, {
        recurse: true
    }))
}

function header({ heading, body }) {
    return `
${heading}
=====================

${body}`
}

function getDefaultNightwatchExec() {
    switch (os.platform()) {
        case 'win32': {
            return 'node_modules\\.bin\\nightwatch'
        }
        default: {
            return './node_modules/.bin/nightwatch'
        }
    }
}

if (!argv.config) {
    console.error('config is required\n')
    console.error('Usage:\n\t$ nightwatch-cli --config <path-to-nightwatch-config>')
    process.exit(1)
}

const nightWatchExec = argv.nightwatch || getDefaultNightwatchExec()
const nightWatchConfigPath = path.resolve(argv.config)
const nightWatchConfig = require(nightWatchConfigPath) // eslint-disable-line import/no-dynamic-require
const suitesRoot = path.resolve(nightWatchConfig.src_folders)
let lastFailedTests = {}

function runNightWatch({ suite, testname }) {
    const nightwatchArgs = [nightWatchExec, `--config ${nightWatchConfigPath}`]
    if (suite) {
        nightwatchArgs.push(`--test ${path.resolve(suitesRoot, `${suite}.js`)}`)
    }
    if (testname) {
        nightwatchArgs.push(`--testcase "${testname}"`)
    }

    const cmd = nightwatchArgs.join(' ')

    return new Promise((resolve) => {
        shell.exec(cmd, (code, stdout, stderr) => {
            resolve({ code, stdout, stderr })
        })
    }).then(({ code, stdout }) => {
        if (code === 0) {
            lastFailedTests = {}
            return Promise.resolve()
        }

        const lines = stripcolorcodes(stdout).split('\n')
        let currentSuite

        lastFailedTests = _(lines)
            .map((line, lineNumber) => {
                const match = /^\s+✖\s+(.+)$/.exec(line)
                const suiteName = match && match[1]
                if (suiteName) {
                    currentSuite = suiteName
                }

                return {
                    suiteName: currentSuite,
                    line,
                    lineNumber
                }
            })
            .filter(r => !!r.suiteName)
            .map((r) => {
                const match = /\s+-\s+(.+)\s+\(.+\)$/.exec(r.line)
                const testName = match && match[1]
                return Object.assign({}, r, {
                    name: `/${r.suiteName}: "${testName}"`,
                    testName
                })
            })
            .filter(r => !!r.testName)
            .keyBy('name')
            .value()

        return Promise.resolve()
    })
}

function clearCommands(vorpal) {
    /* eslint-disable no-underscore-dangle */
    vorpal.commands
        .filter(command => !['help', 'exit', 'failures run', 'failures list'].includes(command._name))
        .forEach(command => command.remove())
    /* esline-enable */
}

function suiteCLI(suiteName, testNames) {
    return (vorpal) => {
        const chalk = vorpal.chalk
        const realSpace = ' '
        const alternativeSpace = ' '

        vorpal
            .delimiter(`${chalk.red('nightwatch:')}${chalk.yellow(`/${suiteName}`)}$`)

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

        vorpal.log(chalk.cyan(header({
            heading: _.words(suiteName).map(word => _.upperFirst(word)).join(' '),
            body: 'Remember, you will need to restart the session to refresh the autocomplete.'
        })))
        vorpal.execSync('help')
    }
}

function rootCLI(vorpal) {
    const chalk = vorpal.chalk
    const suites = getSuites(suitesRoot)

    vorpal
        .delimiter(`${chalk.red('nightwatch:')}${chalk.yellow('/')} $`)

    vorpal.command('run [suite]', 'Run all suites or just one')
        .autocomplete({
            data: () => Object.keys(suites)
        })
        .action(({ suite: suiteName }) => runNightWatch({ suite: suiteName }))

    vorpal.command('failures list', 'List all tests that failed in the previous run')
        .action(() => {
            const testChoices = Object.keys(lastFailedTests)
            if (testChoices.length === 0) {
                vorpal.log('No tests failed on the last run.')
                return Promise.resolve()
            }

            vorpal.log(testChoices.join('\n'))
            return Promise.resolve()
        })


    vorpal.command('failures run', 'Run all tests that failed in the previous run')
        .action(function failuresRun() {
            const testChoices = Object.keys(lastFailedTests)
            if (testChoices.length === 0) {
                vorpal.log('No tests failed on the last run.')
                return Promise.resolve()
            }

            return this.prompt({
                name: 'testToRun',
                message: 'Which failed test would you like to run',
                type: 'list',
                choices: testChoices
            }).then(({ testToRun }) => {
                const lastFailedTest = lastFailedTests[testToRun]
                return runNightWatch({
                    suite: lastFailedTest.suiteName,
                    testname: lastFailedTest.testName
                })
            })
        })

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

    vorpal.log(chalk.cyan(header({
        heading: 'NIGHTWATCH CLI',
        body: 'Remember, you will need to restart the session to refresh the autocomplete.'
    })))
    vorpal.execSync('help')
}

const rootVorpal = new Vorpal()

rootVorpal.use(rootCLI)
rootVorpal.show()
