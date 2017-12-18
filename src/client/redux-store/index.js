'use strict';

/************************************* 
 * create store with applying middlewars 
 * redux-thunk to have async action creators
 * store can be subscribed to listen the changes which are updated everytime
 * *************************************/

import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk'; // allows asynchronous actions      
import combineReducer from './combine-reducer';

// create store with middlewares
const finalCreateStore = compose(
    applyMiddleware(reduxThunk)
)(createStore);

export default function configureStore(initialState) {

    const store = finalCreateStore(combineReducer(), initialState);

    store.asyncReducers = {};
    store.subscribe(function () {
        //console.log(store.getState());
    });
    return store;
};

export function injectAsyncReducer(store, name, asyncReducer) {
    store.asyncReducers[name] = asyncReducer;
    let cr = combineReducer([store.asyncReducers], );
    store.replaceReducer(cr);
}