import test from 'ava'
import { parse } from './suitesParser'

const tree = {
    leftDrawer: {
        openClose: {
            'beforeEach'() {},
            'after'() {},
            'should open left drawer'() {},
            'should close left drawer'() {}
        }
    },
    load: {
        loadHomePage: {
            'after'() {},
            'should load home page'() {}
        }
    }
}

test('should flatten test tree', t => {
    const result = parse(tree)

    t.deepEqual(result, {
        'leftDrawer/openClose': [
            'should open left drawer',
            'should close left drawer'
        ],
        'load/loadHomePage': [
            'should load home page'
        ]
    })
})
