import Path from 'path'
import requireDir from 'require-dir'
import * as suitesParser from '../parsers/suitesParser'
import { Suites } from '../types'

const getSuites = (suiteDirectories: string[]): Suites => (
  suiteDirectories.reduce((suites, srcDir) => {
    const dirTree = requireDir(srcDir, { recurse: true, noCache: true })
    const srcSuites = suitesParser.parse(dirTree)
    Object.keys(srcSuites).forEach(srcSuiteName => {
      const suiteName = Path.relative(
        process.cwd(),
        Path.resolve(srcDir, srcSuiteName)
      )
      suites[suiteName] = srcSuites[srcSuiteName]
    })
    return suites
  }, {} as Suites)
)

export {
  getSuites
}
