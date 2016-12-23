import React, { Component } from 'react';
import AsyncGettingStartedExampleGoogleMap from '../index';
import ColorPicker from '../../../../lib/core-components/ColorPicker';
import Marker from './markers';

class Map extends Component {
    constructor(props) {
        super(props);

        this.state = {
            markers: [],
            polyOptions: {
                polycords: [],
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35
            }
        }
        this.addMarker = this.addMarker.bind(this);
        this.markerClick = this.markerClick.bind(this);
        this.markerCloseClick = this.markerCloseClick.bind(this);
        this.markerRemoveClick = this.markerRemoveClick.bind(this);
        this.polyColorChange = this.polyColorChange.bind(this);
        this.markerDrag = this.markerDrag.bind(this);
        this.onMapLoad = this.onMapLoad.bind(this);
        this.getPolypath = this.getPolypath.bind(this);
        this.DragStart = this.DragStart.bind(this);
        this.preventDefault = this.preventDefault.bind(this);
        this.drop = this.drop.bind(this);
    }

    drop(event) {
        event.preventDefault();
        debugger;
        var data = JSON.parse(event.dataTransfer.getData('test'));
        console.log(data);

        function getOffsetSum(elem) {
            var top = 0, left = 0

            while (elem) {
                top = top + parseInt(elem.offsetTop)
                left = left + parseInt(elem.offsetLeft)
                elem = elem.offsetParent
            }

            return { top: top, left: left }
        }

        var offset = getOffsetSum(this._map.getDiv());
        var topRight = this._map.getProjection().fromLatLngToPoint(this._map.getBounds().getNorthEast());
        var bottomLeft = this._map.getProjection().fromLatLngToPoint(this._map.getBounds().getSouthWest());
        var scale = Math.pow(2, this._map.getZoom());
        var worldPoint = new google.maps.Point((event.pageX - offset.left) / scale + bottomLeft.x, (event.pageY - offset.top) / scale + topRight.y);
        var latLng = this._map.getProjection().fromPointToLatLng(worldPoint);

        var newMarker = {
            position: latLng,
            defaultAnimation: 2,
            showInfo: false,
            content: "Delete",
            draggable: true,
            key: Date.now(), // Add a key property for: http://fb.me/react-warning-keys
            cord: { lat: latLng.lat(), lng: latLng.lng() },
            icon: data.icon
        };
        var oldMarkerList = this.state.markers;
        oldMarkerList.push(newMarker);

        this.setState({
            markers: oldMarkerList
        });
    }

    preventDefault(event) {
        event.preventDefault();
    }

    DragStart(event) {
        //debugger;
        var data = {
            icon: event.target["src"]
        };
        console.log(JSON.stringify(data));
        event.dataTransfer.setData('test', JSON.stringify(data));
    }

    sortPoints2Polygon(gmarkers) {
        function bearingsort(a, b) {
            return (a.SortOrder - b.SortOrder);
        }
        var points = [];
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < gmarkers.length; i++) {
            points.push(gmarkers[i]);
            bounds.extend(gmarkers[i].position);
        }
        var center = bounds.getCenter();
        var SortOrder = [];
        for (var i = 0; i < points.length; i++) {
            points[i].SortOrder = google.maps.geometry.spherical.computeHeading(center, points[i].position);
        }
        points.sort(bearingsort);

        return points;
    }

    componentDidUpdate() {
        //debugger;
        var area = google.maps.geometry.spherical.computeArea(this._polygon.getPath());
    }

    getPolypath(polygon) {
        this._polygon = polygon;
    }

    onMapLoad(map) {
        this._map = map;
    }

    polyColorChange(color) {
        debugger;
        this.setState({
            polyOptions: {
                fillColor: color.color
            }
        });
    }

    markerClick(targetMarker) {
        debugger;
        this.setState({
            markers: this.state.markers.map(marker => {
                if (marker === targetMarker) {
                    return Object.assign({}, marker, {
                        showInfo: true
                    });
                }
                return marker;
            }),
        });
    }

    markerCloseClick(targetMarker) {
        debugger;
        this.setState({
            markers: this.state.markers.map(marker => {
                if (marker === targetMarker) {
                    return Object.assign({}, marker, {
                        showInfo: false
                    })
                }
                return marker;
            }),
        });
    }

    markerRemoveClick(targetMarker) {
        this.setState({
            markers: this.state.markers.filter((marker) => {
                return marker !== targetMarker;
            }),
            polyOptions: {
                polycords: this.state.polyOptions.polycords.filter((polycord) => {
                    return JSON.stringify(polycord) !== JSON.stringify(targetMarker.cord);
                })
            }
        });
    }

    markerDrag(e, prevMarker) {
        debugger;
        let markers = this.state.markers.map(marker => {
            if (marker.key === prevMarker) {
                return Object.assign({}, marker, {
                    cord: { lat: e.latLng.lat(), lng: e.latLng.lng() },
                    position: e.latLng
                });
            }
            return marker;
        });



        let finalMarkerList = this.sortPoints2Polygon(markers.filter((marker) => {
            return marker.icon == null;
        }));
        let newcords = finalMarkerList.map(marker => {
            return { lat: marker.position.lat(), lng: marker.position.lng() }
        });

        this.setState({
            markers: markers,
            polyOptions: { polycords: newcords }
        });
    }

    addMarker(event) {
        console.log('addMarker');
        debugger;
        var newMarker = {
            position: event.latLng,
            showInfo: false,
            content: "Delete",
            draggable: true,
            key: Date.now(), // Add a key property for: http://fb.me/react-warning-keys
            cord: { lat: event.latLng.lat(), lng: event.latLng.lng() },
            SortOrder: 0,
            icon: null
        };
        var oldMarkerList = this.state.markers;
        oldMarkerList.push(newMarker);

        var markerList = this.sortPoints2Polygon(oldMarkerList.filter((marker) => {
            return marker.icon == null;
        }));

        let newcords = markerList.map(marker => {
            return { lat: marker.position.lat(), lng: marker.position.lng() }
        });

        this.setState({
            markers: oldMarkerList,
            polyOptions: { polycords: newcords }
        });
    }

    render() {
        return (
            <div className="dash-right" >
                <ColorPicker color="#FF0000" changeHandler={this.polyColorChange} />
                <div onDragOver={this.preventDefault} onDrop={this.drop}>
                    <AsyncGettingStartedExampleGoogleMap
                        googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
                        loadingElement={
                            <div style={{
                                height: "400px",
                                width: "400px"
                            }}>
                                Loading...
                        </div>
                        }
                        mapElement={
                            <div style={{
                                height: "400px",
                                width: "400px"
                            }} />
                        }
                        containerElement={
                            <div style={{
                                height: "400px",
                                width: "400px"
                            }} />
                        }
                        onAddMarker={this.addMarker}
                        onMarkerClick={this.markerClick}
                        onMarkerCloseClick={this.markerCloseClick}
                        onMarkerRemoveClick={this.markerRemoveClick}
                        markers={this.state.markers}
                        onMapLoad={this.onMapLoad}
                        onMarkerDrag={this.markerDrag}
                        polyOptions={this.state.polyOptions}
                        getPolypath={this.getPolypath}
                        />
                </div>
                <div className="markers">
                    <Marker DragStart={this.DragStart} icon="M1.png" />
                    <Marker DragStart={this.DragStart} icon="M2.png" />
                    <Marker DragStart={this.DragStart} icon="M3.png" />
                    <Marker DragStart={this.DragStart} icon="M4.png" />
                    <Marker DragStart={this.DragStart} icon="M5.png" />
                </div>
            </div >
        )
    }
}

export default Map;