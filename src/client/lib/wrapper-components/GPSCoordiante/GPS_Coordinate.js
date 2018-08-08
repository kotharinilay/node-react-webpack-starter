'use strict';

/**************************
 * Component to display selected center coordinate
 * from proerty fence
 * **************************** */

import React, { Component } from 'react';
import Map_Popup from './Map_Popup';
import Input from '../../core-components/Input';
import { getPropertyMapDetail } from '../../../services/private/property';

class GPSCoordinate extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.strings = this.props.strings;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.state = {
            openMap: false,
            mapCenterCords: "-25.363882,131.044922",
            enclosureData: [],
        }
        this.toggleMapPopup = this.toggleMapPopup.bind(this);
        this.openMapPopup = this.openMapPopup.bind(this);
        this.setGPSValue = this.setGPSValue.bind(this);
        this.GPSValue = this.props.initialCords || null;
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        getPropertyMapDetail(this.props.propertyId).then(function (res) {
            _this.Map = { property: res.data.property, enclosure: res.data.enclosure.data }
            let defaultGPS = res.data.property.DefaultGPS ? res.data.property.DefaultGPS : "-25.363882,131.044922";
            _this.stateSet({
                mapCenterCords: defaultGPS,
                enclosureCount: res.data.enclosure.total,
                enclosureData: res.data.enclosure.data
            });
        })
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.initialCords != nextProps.initialCords) {
            this.setGPSValue(nextProps.initialCords);
        }
    }

    toggleMapPopup(isOpen) {
        this.stateSet({ openMap: !isOpen });
    }

    openMapPopup() {
        this.toggleMapPopup(false);
    }

    setGPSValue(value) {
        this.GPSValue = value;
        this.refs.GPSCoordinate.setState({ value: value });
        this.refs.GPSCoordinate.updateInputStatus();
    }

    render() {

        return (
            <div>
                <div style={{ position: 'relative' }}>
                    <Input inputProps={{
                        name: 'GPSCoordinate',
                        hintText: this.strings.hintText,
                        floatingLabelText: this.strings.floatingLabelText,
                        disabled: true
                    }}
                        eReq={this.props.eReq || null}
                        isClicked={this.props.isClicked}
                        maxLength={100} disabled={true}
                        initialValue={this.props.initialCords || ''}
                        ref="GPSCoordinate" />

                    <span className="location-icon"   onClick={this.openMapPopup} >
                        <img src={this.siteURL + "/static/images/maps-and-flags.png"} alt="gps-icon" title="Event At Gps" />
                    </span>
                </div>
                {this.state.openMap ?
                    <Map_Popup MapData={this.Map ? this.Map : null}
                        strings={{ COMMON: this.strings.COMMON }}
                        toggleMapPopup={this.toggleMapPopup}
                        defaultGPS={this.state.mapCenterCords}
                        EnclosureData={this.state.enclosureData}
                        setGPSValue={this.setGPSValue} />
                    : null}
            </div>
        );
    }
}

export default GPSCoordinate;