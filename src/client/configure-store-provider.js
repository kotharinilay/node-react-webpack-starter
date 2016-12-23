'use strict';

/************************************
 * configure provider and store with react routes
 * so that store can be available anytime
 * **********************************/

// load react dependacies
import React, { Component } from 'react';
import { Router, browserHistory } from 'react-router';
import { Provider } from 'react-redux' // store provider
import Immutable from 'immutable'
import configureStore from './redux-store';
import createRoutes from './routes';

//for multi language
import { IntlProvider } from 'react-redux-multilingual'
import translations from './localization/translations'
import localization from './localization/index'

// client store state in case of store exist
let reduxState = {}
if (window.__REDUX_STATE__) {
  try {
    let plain = JSON.parse(unescape(__REDUX_STATE__))
    _.each(plain, (val, key) => {
      reduxState[key] = Immutable.fromJS(val)
    })
  } catch (e) {
  }
}

// creates redux store based on selected web language
const store = configureStore(reduxState);
localization.checkLanguage(store);
let routes = createRoutes(store);

// expose AppRoutes as react component
export default class AppRoutes extends Component {
  render() {
    return (
      <Provider store={store}>
        <IntlProvider translations={translations}>
          <Router history={browserHistory} routes={routes} />
        </IntlProvider>
      </Provider>
    );
  }
}