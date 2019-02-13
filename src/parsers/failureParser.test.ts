import fs from 'fs'
import path from 'path'
import { splitLines, parseSuiteName, parse } from './failureParser'

const stdout = fs.readFileSync(path.resolve('test/data/failure-output.txt')).toString()

test('should split lines', () => {
  const result = splitLines(stdout)
  expect(result.length).toEqual(37)
})

test('should parse suite names', () => {
  const expectedSuiteName = `tests${path.sep}scenarios${path.sep}leftDrawer`
  const suites = {
    'something/not/expected': [],
    [expectedSuiteName]: [],
    'something/else': []
  }

  const result = parseSuiteName({ suites, lines: splitLines(stdout) })
  expect(result.length).toEqual(7)

  result.forEach(r => {
    expect(r.suiteName).toEqual(expectedSuiteName)
  })
})

test('should parse failures', () => {
  const expectedSuiteName = `tests${path.sep}scenarios${path.sep}leftDrawer`
  const expectedTestName = 'starts open on desktop'
  const expectedName = `${expectedSuiteName}: "${expectedTestName}"`
  const suites = {
    'something/not/expected': [],
    [expectedSuiteName]: [],
    'something/else': []
  }

  const result = parse({ suites, stdout })

  expect(result).toEqual({
    [expectedName]: {
      line: ` – ${expectedTestName} (5.222s)`,
      name: expectedName,
      suiteName: expectedSuiteName,
      testName: expectedTestName
    }
  })
})
