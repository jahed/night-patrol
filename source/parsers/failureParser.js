import stripcolorcodes from 'stripcolorcodes'
import _ from 'lodash'

export function splitLines(stdout) {
    return stripcolorcodes(stdout).split('\n')
}

function getErrorSeparatorLineNumber(lines) {
    return _.findIndex(lines, l => l.includes('TEST FAILURE'))
}

export function parseSuiteName({ suites, lines }) {
    const suiteNames = Object.keys(suites)
    let currentSuite
    return _(lines)
        .slice(getErrorSeparatorLineNumber(lines))
        .map(line => {
            const match = /^\s+✖\s+(.+)$/.exec(line)
            const suiteName = match && suiteNames.find(suite => suite.endsWith(match[1]))
            currentSuite = suiteName || currentSuite
            return {
                suiteName: currentSuite,
                line
            }
        })
        .filter(r => !!r.suiteName)
}

export function parse({ suites, stdout }) {
    const lines = parseSuiteName({ suites, lines: splitLines(stdout) })
    return _(lines)
        .map(r => {
            const match = /\s+–\s+(.+)\s+\(.+\)$/.exec(r.line)
            const testName = match && match[1]
            return Object.assign({}, r, {
                name: `${r.suiteName}: "${testName}"`,
                testName
            })
        })
        .filter(r => !!r.testName)
        .keyBy('name')
        .value()
}
