import React from 'react';
import {Route} from 'react-router';

import Container from '../Components/Container';
import Home from '../Components/Home';
import App from '../Components/App';
import NotFound from '../Components/NotFount';
import GriddleGrid from '../Components/GriddleGrid';
import BGrid from '../Components/BGrid';

let routes = (
    <Route component={Container}>
        <Route path="/" component={Home}></Route>
        <Route path="/home" component={Home}></Route>
        <Route path="/todo" component={App}></Route>
        <Route path="/griddle" component={GriddleGrid}></Route>
        <Route path="/bgrid" component={BGrid}></Route>
        <Route path="*" component={NotFound}></Route>
    </Route >
)

export default routes