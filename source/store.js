import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import reducer from './reducers'

const middlewares = [
    thunk
]

const enhancers = [
    applyMiddleware(...middlewares)
]

export default createStore(reducer, compose(...enhancers))
