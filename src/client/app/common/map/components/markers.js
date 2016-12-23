'use strict';

/**************************
 * expose marker component that can be draggable
 * **************************** */

import React, { Component } from 'react';

class Marker extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div draggable='true' className='drag' onDragStart={this.props.DragStart}
                style={{ height: "40px", width: "40px" }}>
                <img src={"./static/images/Markers/" + this.props.icon} alt="dash-logo" />
            </div>

        );
    }
}

export default Marker;