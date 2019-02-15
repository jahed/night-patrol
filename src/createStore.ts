import { applyMiddleware, createStore as createReduxStore } from 'redux'
import thunk, { ThunkMiddleware } from 'redux-thunk'
import reducer from './reducers'
import { Store } from './types'

const createStore = (): Store => createReduxStore(
  reducer,
  applyMiddleware(
    thunk as ThunkMiddleware
  )
)

export {
  createStore
}
