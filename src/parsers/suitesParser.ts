import _ from 'lodash'
import path from 'path'
import { Suites } from '../types'

export type NightWatchTestSuite = {
  before?: () => void,
  beforeEach?: () => void,
  after?: () => void,
  afterEach?: () => void,
  '@tags'?: string[],
  '@disabled'?: boolean
} & { [testName: string]: (() => void) }

export type DirNode = {
  [key: string]: NightWatchTestSuite | DirNode
}

/**
 * Assume any key with a whitespace is a test case
 * (i.e. two or more words making up a test case sentence)
 */
export const isTestCaseName = (str: string) => /\s/g.test(str)

export const isTestSuite = (obj: object): obj is NightWatchTestSuite => (
  _.some(obj, (_v: any, key: string) => isTestCaseName(key))
)

export const getTestNames = (testSuite: NightWatchTestSuite) => Object.keys(testSuite)
  .filter(testCaseName => !['before', 'beforeEach', 'after', 'afterEach'].includes(testCaseName))
  .filter(testCaseName => testCaseName[0] !== '@')

const isTestNames = (value: any): value is string[] => Array.isArray(value)

export const parseChildNode = (node: DirNode | NightWatchTestSuite) => (
  isTestSuite(node)
    ? getTestNames(node)
    : parseDirectoryNode(node)
)

export const parseDirectoryNode = (dirNode: DirNode): Suites => {
  return Object.keys(dirNode).reduce((result, childDir) => {
    const childNode = dirNode[childDir]
    const childResult = parseChildNode(childNode)
    if (isTestNames(childResult)) {
      result[childDir] = childResult
    } else {
      Object.keys(childResult).forEach(childKey => {
        result[`${childDir}${path.sep}${childKey}`] = childResult[childKey]
      })
    }
    return result
  }, {} as Suites)
}

export const parse = parseDirectoryNode
