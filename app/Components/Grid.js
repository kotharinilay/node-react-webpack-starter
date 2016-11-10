import React, { Component } from 'react';
import Render from 'react-dom';

import BGrid from './BGrid';
//import BGrid from './GriddleGrid';

class Grid extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        return (<BGrid columns={this.props.columns} functionName={this.props.functionName} />)
    }
}

export default Grid