import _ from 'lodash'
import stripcolorcodes from 'stripcolorcodes'
import { Suites, TestFailure, TestFailuresByName } from '../types'

export const splitLines = (stdout: string) => (
  stripcolorcodes(stdout).split('\n')
)

const getErrorSeparatorLineNumber = (lines: string[]) => (
  _.findIndex(lines, l => l.includes('TEST FAILURE'))
)

export const parseSuiteName = ({ suites, lines }: { suites: Suites, lines: string[] }) => {
  const suiteNames = Object.keys(suites)
  let currentSuite: string
  return lines
    .slice(getErrorSeparatorLineNumber(lines))
    .map(line => {
      const match = /^\s+✖\s+(.+)$/.exec(line)
      const suiteName = match && suiteNames.find(suite => suite.endsWith(match[1])) || undefined
      currentSuite = suiteName || currentSuite
      return {
        suiteName: currentSuite,
        line
      }
    })
    .filter(r => !!r.suiteName)
}

const hasCompleteInfo = (r?: any): r is TestFailure => (
  !!r.suiteName &&
  !!r.testName &&
  !!r.name
)

export const parse = ({ suites, stdout }: { suites: Suites, stdout: string }): TestFailuresByName => (
  parseSuiteName({ suites, lines: splitLines(stdout) })
    .map(r => {
      const match = /\s+–\s+(.+)\s+\(.+\)$/.exec(r.line)
      const testName = match && match[1] || undefined
      return Object.assign({}, r, {
        name: `${r.suiteName}: "${testName}"`,
        testName
      })
    })
    .filter(hasCompleteInfo)
    .reduce(
      (acc: TestFailuresByName, next) => {
        acc[next.name] = next
        return acc
      },
      {}
    )
)
