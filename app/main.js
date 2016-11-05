require("./Assets/style.scss")

import React from 'react';
import {Router, browserHistory} from 'react-router';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import store from './store';
import routes from './Routes/routes';
// import App from './Components/App'; import DemoList from
// './Components/DemoList'

render(
    <Provider store={store}>
    <Router history={browserHistory} routes={routes}/>
</Provider>, document.getElementById('body'));
