import fs from 'fs'
import path from 'path'
import { splitLines, parseSuiteName, parse } from './failureParser'

const failure = fs.readFileSync(path.resolve('test/data/failure-output.txt')).toString()

test('should split lines', () => {
    const result = splitLines(failure)
    expect(result.length).toEqual(32)
})

test('should parse suite names', () => {
    const result = parseSuiteName(splitLines(failure)).value()
    expect(result.length).toEqual(6)

    result.forEach(r => {
        expect(r.suiteName).toEqual('leftDrawer')
    })
})

test('should parse failures', () => {
    const result = parse(failure)
    const expectedName = `${path.sep}leftDrawer: "should open and close left drawer"`

    expect(result).toEqual({
        [expectedName]: {
            line: '   - should open and close left drawer (7.337s)',
            name: expectedName,
            suiteName: 'leftDrawer',
            testName: 'should open and close left drawer'
        }
    })
})
