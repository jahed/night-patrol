import _ from 'lodash'
import stripcolorcodes from 'stripcolorcodes'
import { Suites, TestFailuresBySuite } from '../types'

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

export const parse = ({ suites, stdout }: { suites: Suites, stdout: string }): TestFailuresBySuite => (
  parseSuiteName({ suites, lines: splitLines(stdout) })
    .map(r => {
      const match = /\s+–\s+(.+)\s+\(.+\)$/.exec(r.line)
      return {
        suiteName: r.suiteName,
        testName: (match && match[1]) || undefined
      }
    })
    .filter(r => r.suiteName && r.testName)
    .reduce(
      (acc: TestFailuresBySuite, next) => {
        acc[next.suiteName] = acc[next.suiteName] || next
        return acc
      },
      {}
    )
)
