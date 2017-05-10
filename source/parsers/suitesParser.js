const _ = require('lodash')
const path = require('path')

export function isTestCaseName(string) {
    return /\s/g.test(string)
}

export function isTestSuite(object) {
    return _.some(object, (fn, key) => isTestCaseName(key))
}

export function getTestNames(testSuite) {
    return Object.keys(testSuite)
        .filter(testCaseName => !['before', 'beforeEach', 'after', 'afterEach'].includes(testCaseName))
}

export function parse(suiteTree) {
    if (isTestSuite(suiteTree)) {
        return getTestNames(suiteTree)
    }

    const result = {}

    /* eslint-disable no-restricted-syntax, no-prototype-builtins, no-continue */
    for (const key in suiteTree) {
        if (!suiteTree.hasOwnProperty(key)) {
            continue
        }

        if (typeof suiteTree[key] === 'object') {
            const childObject = parse(suiteTree[key])
            if (Array.isArray(childObject)) {
                result[key] = childObject
            } else {
                for (const childKey in childObject) {
                    if (!childObject.hasOwnProperty(childKey)) {
                        continue
                    }

                    result[`${key}${path.sep}${childKey}`] = childObject[childKey]
                }
            }
        } else {
            result[key] = suiteTree[key]
        }
    }
    /* eslint-enable */

    return result
}
