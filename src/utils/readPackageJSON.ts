import fs from 'fs'
import _ from 'lodash'
import path from 'path'
import { PackageJSON } from '../types'

const readPackageJSON = _.memoize((): PackageJSON => JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../package.json')).toString()
))

export {
  readPackageJSON
}
