'use strict';

/**************************
 * add/update tab for Map
 * **************************** */

import React from 'react';
import PureComponent from '../PureComponent';
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from 'react-modal-bootstrap';
import { sortBy, uniqWith, isEqual } from 'lodash';

import LoadingIndicator from '../../core-components/LoadingIndicator';

import { polygonIntersect, polygonInside } from '../../map-validation';

import Map from '../../../app/common/map';
import MarkerList from '../../../app/common/map/marker_list';
import { GOOGLE_MAP_URL, MAP_API_KEY } from '../../../../../ecosystem/client';
import { NOTIFY_ERROR, NOTIFY_WARNING } from '../../../app/common/actiontypes';

class MapTab extends PureComponent {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this._map = null;

        this.Property = {
            data: null,
            polygon: null,
            cords: [],
            options: null,
            assetsMarkers: [],
            defaultGPS: null
        };
        this.Enclosure = [];

        this.propertyObj = {
            polygon: null,
            cords: []
        };
        this.enclosureObj = {
            id: null,
            auditLogId: null,
            name: null,
            polygon: null,
            cords: []
        };

        this.state = {
            isOpen: true,
            zoomLevel: 16,
            strokeColor: '#000000',
            fenceColour: '#0000ff',
            fenceOpacity: 35,
            markers: []
        }

        this.enclosureData = [...this.props.EnclosureData];
        this.addMarker = this.addMarker.bind(this);
        this.onMapLoad = this.onMapLoad.bind(this);

        this.preventDefault = this.preventDefault.bind(this);

        this.generateMarker = this.generateMarker.bind(this);
        this.getCordsFromMarkers = this.getCordsFromMarkers.bind(this);

        this.renderMap = this.renderMap.bind(this);

        this.getCenterCords = this.getCenterCords.bind(this);

        this.hideModal = this.hideModal.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    // To hide modal popup
    hideModal() {
        this.setState({ isOpen: false });
        let _this = this;
        setTimeout(function () {
            _this.props.toggleMapPopup(true);
        }, 1000);
    }

    // Handle ESC key
    handleKeyDown(e) {
        if (e.keyCode === 27) {
            this.hideModal();
            e.preventDefault();
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }
    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
        this.mounted = false;
    }

    // Load map based on given props in edit mode
    componentWillMount() {
        this.mounted = true;
        let zoomLevel = 16;
        if (this.props.MapData && this.props.MapData.property && this.props.MapData.property.PropertyFence) {

            let obj = this.props.MapData.property;
            let fence = JSON.parse(obj.PropertyFence);

            let polycords = [];
            if (fence && fence.FenceCoordinate) {
                fence.FenceCoordinate.map(fence => {
                    polycords.push({ lat: fence.lat, lng: fence.lng });
                });
            }

            let propertyOptions = null;
            if (fence) {
                propertyOptions = {
                    polycords: polycords,
                    options: {
                        strokeColor: '#000000',
                        fillColor: fence.FenceColour && fence.FenceColour.color ? fence.FenceColour.color : '#0000ff',
                        fillOpacity: fence.FenceColour && fence.FenceColour.alpha ? fence.FenceColour.alpha : 35
                    }
                }
            }

            let assetsMarkersArr = [];
            if (fence && fence.Assets) {
                fence.Assets.map(m => {
                    assetsMarkersArr.push(this.generateMarker(m.lat, m.lng, m.key, true, m.sortorder, true, false));
                });
            }

            this.Property = {
                data: fence,
                polygon: null,
                cords: polycords,
                options: propertyOptions,
                assetsMarkers: assetsMarkersArr,
                defaultGPS: obj.DefaultGPS
            };
            this.propertyObj.cords = polycords;
            zoomLevel = obj.MapZoomLevel;
        }

        if (this.props.MapData && this.props.MapData.enclosure) {

            let enclosureObj = this.props.MapData.enclosure;
            enclosureObj.map(obj => {

                if (obj.EnclosureFence) {
                    let fence = JSON.parse(obj.EnclosureFence);

                    let polycords = [];
                    if (fence && fence.FenceCoordinate) {
                        fence.FenceCoordinate.map(fence => {
                            polycords.push({ lat: fence.lat, lng: fence.lng });
                        });
                    }

                    let enclosureOptions = null;
                    if (fence && fence.FenceColour) {
                        enclosureOptions = {
                            name: obj.Name,
                            polycords: polycords,
                            options: {
                                strokeColor: '#000000',
                                fillColor: fence.FenceColour && fence.FenceColour.color ? fence.FenceColour.color : '#00ff00',
                                fillOpacity: fence.FenceColour && fence.FenceColour.alpha ? fence.FenceColour.alpha : 35
                            },
                            onClick: this.addMarker
                        }
                    }

                    this.Enclosure.push({
                        auditLogId: obj.AuditLogId,
                        cords: polycords,
                        data: fence,
                        defaultGPS: obj.DefaultGPS,
                        id: obj.Id,
                        options: enclosureOptions,
                        polygon: null,
                    });

                    let index = this.enclosureData.findIndex(x => x.Id == obj.Id)
                    if (index != -1)
                        this.enclosureData.splice(index, 1);
                }
            });
        }
        this.stateSet({ zoomLevel: zoomLevel });
    }

    // Perform header search
    componentWillReceiveProps(nextProps) {
        if (this.props.EnclosureData != nextProps.EnclosureData) {
            this.enclosureData = [...nextProps.EnclosureData];
            this.Enclosure = this.Enclosure.map(e => {
                let obj = this.enclosureData.find(x => x.Id == e.id);
                let index = this.enclosureData.findIndex(x => x.Id == e.id);

                if (index != -1)
                    this.enclosureData.splice(index, 1);
                if (obj)
                    e.options.name = obj.Name;

                return e;
            });
        }
    }

    // Handle it after map loaded
    onMapLoad(map) {
        this._map = map;
        if (this.props.MapData) {
            this.Property.polygon = new google.maps.Polygon({ path: this.Property.cords });
            this.propertyObj.polygon = this.Property.polygon;
            this.Enclosure = this.Enclosure.map(e => {
                e.polygon = new google.maps.Polygon({ path: e.cords });
                return e;
            });
            let markerList = [...this.Property.assetsMarkers];
            if (this.props.livestockIcon) {
                let cords = this.props.defaultGPS.split(',');
                markerList.push(this.generateMarker(cords[0], cords[1], null, false, null, true, false, this.props.livestockIcon));
            }
            this.stateSet({ markers: markerList });
        }
    }

    // Generate new marker and add into list
    generateMarker(latVal, lngVal, icon, assets = false, sortOrder = null, returnMarker = false, isDraggable = true, iconPath = null) {

        if (iconPath)
            iconPath = new google.maps.MarkerImage(
                iconPath,
                null, /* size is determined at runtime */
                null, /* origin is 0,0 */
                null, /* anchor is bottom center of the scaled image */
                new google.maps.Size(30, 30)
            );

        let newMarker = {
            showInfo: false,
            draggable: isDraggable,
            cord: { lat: latVal, lng: lngVal },
            icon: iconPath ? iconPath : (icon ? this.siteURL + "/static/images/Markers/" + icon : null),
            sortOrder: sortOrder || this.state.markers.length + 1,
            isAssets: assets,
            key: icon
        };

        if (returnMarker)
            return newMarker;
        else {
            let markerList = [...this.state.markers];
            markerList.push(newMarker);
            return markerList;
        }
    }

    // Draw polygon based on marker list
    getCordsFromMarkers(markerList) {
        let polycords = [];
        markerList.map(marker => {
            if (!marker.isAssets)
                polycords.push({ lat: marker.cord.lat, lng: marker.cord.lng });
        });
        return polycords;
    }

    // Get center cords of polygon
    getCenterCords(polyCords) {
        let bounds = new google.maps.LatLngBounds();
        polyCords.forEach(function (element, i) { bounds.extend(element) })
        let centerCords = bounds.getCenter();
        return centerCords.lat() + ',' + centerCords.lng();
    }

    // Handle for drag assets to map
    preventDefault(event) {
        event.preventDefault();
    }

    // Add marker to draw polygon
    addMarker(event) {
        if (this.props.setGPSValue) {
            this.props.setGPSValue(`${event.latLng.lat()},${event.latLng.lng()}`);
            this.hideModal();
        }
    }

    // Render map area
    renderMap() {
        let state = this.state;
        let defaultGPS = this.props.defaultGPS.split(',');

        let mapElementProps = {
            loadingElement: <div className='loading-element'><LoadingIndicator onlyIndicator={true} /></div>,
            mapElement: <div className='map-element' />,
            containerElement: <div className='container-element' />
        }

        let polygons = [];

        polygons.push({
            defaultGPS: this.Property.defaultGPS,
            polycords: this.propertyObj.cords,
            options: {
                strokeColor: state.strokeColor,
                fillColor: state.fenceColour,
                fillOpacity: state.fenceOpacity
            },
            onClick: this.addMarker
        });

        this.Enclosure.map(obj => {
            polygons.push(obj.options);
        });

        let mapProps = {
            lat: defaultGPS[0],
            lng: defaultGPS[1],
            zoomLevel: state.zoomLevel,
            markers: state.markers,
            polygons: polygons
        }

        let outerMapEvents = {};
        let mapEvents = {};
        mapEvents.onAddMarker = this.addMarker;
        return (<div {...outerMapEvents}>
            <Map {...mapProps} {...mapElementProps} {...mapEvents}
                googleMapURL={GOOGLE_MAP_URL + "&key=" + MAP_API_KEY}
                onMapLoad={this.onMapLoad} />
        </div>);
    }

    // Render component
    render() {
        return (
            <Modal isOpen={this.state.isOpen} keyboard={false}>
                <ModalHeader>
                    <ModalClose onClick={this.hideModal} />
                    <h2>MAP</h2>
                </ModalHeader>
                <div style={{ overflow: 'auto' }}>
                    <ModalBody>
                        <div className="col-md-12 mb25">
                            {this.renderMap()}
                        </div>
                    </ModalBody>
                </div>
            </Modal>);
    }

}

export default MapTab;