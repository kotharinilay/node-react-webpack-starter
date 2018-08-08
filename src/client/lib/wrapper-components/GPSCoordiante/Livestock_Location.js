'use strict';

/**************************
 * Component to display selected center coordinate
 * from proerty fence
 * **************************** */

import React, { Component } from 'react';
import Map_Popup from './Map_Popup';
import { getPropertyMapDetail } from '../../../services/private/property';
import { NOTIFY_WARNING } from '../../../app/common/actiontypes';

class GPSCoordinate extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.strings = this.props.strings;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.state = {
            openMap: false,
            enclosureData: [],
        }
        this.toggleMapPopup = this.toggleMapPopup.bind(this);
        this.openMapPopup = this.openMapPopup.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    toggleMapPopup(isOpen) {
        this.stateSet({ openMap: !isOpen });
    }

    openMapPopup() {
        if (this.props.centerCords) {
            let _this = this;
            getPropertyMapDetail(this.props.propertyId).then(function (res) {
                _this.Map = { property: res.data.property[0], enclosure: res.data.enclosure.data }
                _this.stateSet({
                    openMap: true,
                    enclosureCount: res.data.enclosure.total,
                    enclosureData: res.data.enclosure.data
                });
            });
        }
        else {
            this.props.notifyToaster(NOTIFY_WARNING, { message: this.props.mapNotExist });
        }
    }

    render() {
        return (
            <div>
                <div>{this.props.icon ?
                    <span onClick={this.openMapPopup} >
                        <img src={this.props.icon} width="23px" style={{ cursor: 'pointer' }} />
                    </span> : null}
                </div>
                {this.state.openMap ?
                    <Map_Popup MapData={this.Map ? this.Map : null}
                        toggleMapPopup={this.toggleMapPopup}
                        defaultGPS={this.props.centerCords}
                        EnclosureData={this.state.enclosureData}
                        livestockIcon={this.props.icon} />
                    : null}
            </div>
        );
    }
}

export default GPSCoordinate;