import { applyMiddleware, createStore } from 'redux'
import thunk, { ThunkMiddleware } from 'redux-thunk'
import reducer from './reducers'

const store = createStore(
  reducer,
  applyMiddleware(
    thunk as ThunkMiddleware
  )
)

export default store
