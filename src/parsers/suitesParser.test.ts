/* tslint:disable:no-empty */
import path from 'path'
import { parse, DirNode } from './suitesParser'

test('should flatten test tree', () => {
  const tree: DirNode = {
    rootSuite: {
      'beforeEach' () {},
      'after' () {},
      'should open left drawer' () {},
      'should close left drawer' () {}
    },
    leftDrawer: {
      openClose: {
        'beforeEach' () {},
        'after' () {},
        'should open left drawer' () {},
        'should close left drawer' () {}
      }
    },
    general: {
      load: {
        loadHomePage: {
          'after' () {},
          'should load home page' () {}
        }
      }
    }
  }

  const result = parse(tree)

  expect(result).toEqual({
    [`rootSuite`]: [
      'should open left drawer',
      'should close left drawer'
    ],
    [`leftDrawer${path.sep}openClose`]: [
      'should open left drawer',
      'should close left drawer'
    ],
    [`general${path.sep}load${path.sep}loadHomePage`]: [
      'should load home page'
    ]
  })
})
