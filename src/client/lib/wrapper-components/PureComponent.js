'use strict';

/*************************************
 * If react component's render function renders the same result given the same props and state, 
 * we can use this component for a performance boost in some cases to restrict the component rendering.
 * ShallowCompare is also use for check the state and props.
 * *************************************/

import React, { Component } from 'react'
import lodash from 'lodash';
//import shallowCompare from 'react-addons-shallow-compare'

export default class PureComponent extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        //return shallowCompare(this, nextProps, nextState);
        return !lodash.isEqual(this.props, nextProps) || !lodash.isEqual(this.state, nextState);
    }
}