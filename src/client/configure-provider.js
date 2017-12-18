'use strict';

/************************************
 * configure provider and store with react routes
 * so that store can be available anytime
 * **********************************/

// load react-redux dependacies
import React, { Component } from 'react';
import { Router, browserHistory } from 'react-router';
import { Provider } from 'react-redux'; // store provider
import configureStore, { injectAsyncReducer } from './redux-store';
import createRoutes from './routes';

// load material-ui dependacies
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { muiTheme } from './../../assets/js/mui-theme';

// handle onTouchTap for material-ui
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

// localization
import { IntlProvider } from 'react-redux-multilingual';
import translations from './localization/translations';
import localization from './localization/index';

// init reducers
import login from '../client/app/public/login/reducer';
import headerReducer from '../client/app/private/header/reducer';
import commonReducer from '../client/app/common/reducer';

import { setUserInfo } from '../client/app/public/login/actions';
import { getMenuIds } from '../shared/index';

// client store state in case of store exist
let reduxState = {}
if (window.__REDUX_STATE__) {
  try {
    reduxState = window.__REDUX_STATE__;
  } catch (e) { }
}

const store = configureStore(reduxState);


//reducers required for app init
if (reduxState.authUser) {
  injectAsyncReducer(store, 'authUser', login);
  store.dispatch(setUserInfo(reduxState.authUser));
}

injectAsyncReducer(store, 'common', commonReducer);
injectAsyncReducer(store, 'header', headerReducer);

// // store menu selection from based on loaded URL
// if (window.__MENUS__.moduleMenu && window.__MENUS__.controlMenu) {
//   try {
//     let menuIds = getMenuIds(null, null, window.__MENUS__.moduleMenu, window.__MENUS__.controlMenu);
//     store.dispatch(setModule(menuIds.moduleId, menuIds.controlMenuId, null));
//   } catch (e) { }
// }


localization.checkLanguage(store);  // set default language
let routes = createRoutes(store);

// Expose AppRoutes
export default class AppRoutes extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
          <IntlProvider translations={translations}>
            <Router history={browserHistory} routes={routes} />
          </IntlProvider>
        </Provider>
      </MuiThemeProvider>
    );
  }
}