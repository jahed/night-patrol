import Path from 'path'
import requireDir from 'require-dir'
import * as suitesParser from '../parsers/suitesParser'
import { Suites } from '../types'

const getSuites = (suiteDirectories: string[]): Suites => (
  suiteDirectories.reduce((suites: Suites, srcDir) => {
    const srcSuites = suitesParser.parse(requireDir(srcDir, { recurse: true }))
    Object.keys(srcSuites).forEach(srcSuiteName => {
      const suiteName = Path.relative(
        process.cwd(),
        Path.resolve(srcDir, srcSuiteName)
      )
      suites[suiteName] = srcSuites[srcSuiteName]
    })
    return suites
  }, {})
)

export {
  getSuites
}
