import test from 'ava'
import fs from 'fs'
import path from 'path'
import failureParser from './failureParser'

const failure = fs.readFileSync(path.resolve('test/data/failure-output.txt')).toString()

test('should split lines', t => {
    const result = failureParser.splitLines(failure)
    t.is(result.length, 32)
})

test('should parse suite names', t => {
    const result = failureParser.parseSuiteName(failureParser.splitLines(failure)).value()
    t.is(result.length, 6)

    result.forEach(r => {
        t.is(r.suiteName, 'leftDrawer')
    })
})

test('should parse failures', t => {
    const result = failureParser.parse(failure)

    t.deepEqual(result, {
        '/leftDrawer: "should open and close left drawer"': {
            line: '   - should open and close left drawer (7.337s)',
            name: '/leftDrawer: "should open and close left drawer"',
            suiteName: 'leftDrawer',
            testName: 'should open and close left drawer'
        }
    })
})
