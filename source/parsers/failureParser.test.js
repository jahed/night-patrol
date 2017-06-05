import test from 'ava'
import fs from 'fs'
import path from 'path'
import { splitLines, parseSuiteName, parse } from './failureParser'

const failure = fs.readFileSync(path.resolve('test/data/failure-output.txt')).toString()

test('should split lines', t => {
    const result = splitLines(failure)
    t.is(result.length, 32)
})

test('should parse suite names', t => {
    const result = parseSuiteName(splitLines(failure)).value()
    t.is(result.length, 6)

    result.forEach(r => {
        t.is(r.suiteName, 'leftDrawer')
    })
})

test('should parse failures', t => {
    const result = parse(failure)
    const expectedName = `${path.sep}leftDrawer: "should open and close left drawer"`

    t.deepEqual(result, {
        [expectedName]: {
            line: '   - should open and close left drawer (7.337s)',
            name: expectedName,
            suiteName: 'leftDrawer',
            testName: 'should open and close left drawer'
        }
    })
})
