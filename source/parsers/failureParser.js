import path from 'path'
import stripcolorcodes from 'stripcolorcodes'
import _ from 'lodash'

export function splitLines(stdout) {
    return stripcolorcodes(stdout).split('\n')
}

function getErrorSeparatorLineNumber(lines) {
    return _.findIndex(lines, l => l.includes('TEST FAILURE'))
}

export function parseSuiteName(lines) {
    let currentSuite
    return _(lines)
        .slice(getErrorSeparatorLineNumber(lines))
        .map(line => {
            // eslint-disable-next-line no-control-regex
            const match = /^\s+[^\x00-\x7F]\s+(.+)$/.exec(line)
            const suiteName = match && match[1]
            if (suiteName) {
                currentSuite = suiteName
            }

            return {
                suiteName: currentSuite,
                line
            }
        })
        .filter(r => !!r.suiteName)
}

export function parse(stdout) {
    const lines = parseSuiteName(splitLines(stdout))
    return _(lines)
        .map(r => {
            const match = /\s+-\s+(.+)\s+\(.+\)$/.exec(r.line)
            const testName = match && match[1]
            return Object.assign({}, r, {
                name: `${path.sep}${r.suiteName}: "${testName}"`,
                testName
            })
        })
        .filter(r => !!r.testName)
        .keyBy('name')
        .value()
}
