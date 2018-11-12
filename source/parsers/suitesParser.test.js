import path from 'path'
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

test('should flatten test tree', () => {
    const result = parse(tree)

    expect(result).toEqual({
        [`leftDrawer${path.sep}openClose`]: [
            'should open left drawer',
            'should close left drawer'
        ],
        [`load${path.sep}loadHomePage`]: [
            'should load home page'
        ]
    })
})
