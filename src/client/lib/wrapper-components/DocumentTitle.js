'use strict';

/*************************************
 * display title of document
 * ******************************* */

import React, { Component } from 'react';

class DocumentTitle extends Component {

    componentDidMount() {
        if (this.props.title)
            document.title = this.props.title;
    }

    render() {
        return (<div className={this.props.className}>
            {this.props.children}
        </div>);
    }
}

export default DocumentTitle;