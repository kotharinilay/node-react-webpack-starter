'use strict';

/**************************
 * expose marker list component that can be draggable
 * **************************** */

import React, { Component } from 'react';
import Marker from './marker';
import { map } from 'lodash';
import { assetsMarkers } from '../../../../shared/constants';

class MarkerList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="markers mt10" style={{ background: '#697378', lineHeight: '30px' }}>
                {this.props.clickOnOuter ? <div className="colorpicker-outer" style={{ zIndex: 9 }} onClick={this.props.clickOnOuter}></div> : null}
                <div style={{ zIndex: 99, position: 'relative' }}>
                    {assetsMarkers.map((icon, index) => {
                        return <Marker key={index} onDragStart={this.props.onDragStart} icon={icon.Name} title={icon.Title} />
                    })}
                </div>
                <div className="clear"></div>
            </div>
        );
    }
}

export default MarkerList;