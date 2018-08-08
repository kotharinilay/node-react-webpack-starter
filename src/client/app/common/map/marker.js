'use strict';

/**************************
 * expose marker component that can be draggable
 * **************************** */

import React, { Component } from 'react';

class Marker extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
    }

    render() {
        return (
            <div draggable='true' className='drag' onDragStart={this.props.onDragStart}
                style={{ float: 'left', height: '15px', width: '15px', margin: '15px' }}>
                <img src={this.siteURL + "/static/images/Markers/" + this.props.icon} id={this.props.icon} alt={this.props.title} title={this.props.title} />
            </div>
        );
    }
}

export default Marker;