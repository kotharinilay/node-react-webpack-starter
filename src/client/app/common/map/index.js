'use strict';

/**************************
 * expose map component
 * provide the functionality to draw area inside the map
 * **************************** */

import React, { Component } from 'react';
import { withGoogleMap, GoogleMap, Marker, InfoWindow, Polygon, Polyline } from "react-google-maps";
import withScriptjs from "react-google-maps/lib/async/withScriptjs";
//import { triggerEvent } from "react-google-maps/lib/utils";

const Map = withScriptjs(
    withGoogleMap(

        props => {
            let count = 0;
            let googleMapEvents = {};

            if (props.onAddMarker)
                googleMapEvents.onClick = props.onAddMarker;
            if (props.onCenterChanged)
                googleMapEvents.onCenterChanged = props.onCenterChanged;

            return (<GoogleMap
                ref={props.onMapLoad}
                options={{
                    streetViewControl: false,
                    fullscreenControl: true,
                    mapTypeControlOptions: {
                        position: google.maps.ControlPosition.RIGHT_BOTTOM
                    },
                    zoomControlOptions: {
                        position: google.maps.ControlPosition.TOP_LEFT
                    },
                    fullscreenControlOptions: {
                        position: google.maps.ControlPosition.LEFT_TOP
                    },
                    scrollwheel: !props.drawLine,
                    draggable: !props.drawLine
                }}
                defaultZoom={props.zoomLevel}
                defaultCenter={new google.maps.LatLng(props.lat, props.lng)}
                defaultMapTypeId="hybrid"
                {...googleMapEvents}>

                {props.element}

                {props.markers.map((marker, index) => {

                    let markerEvents = {};
                    if (props.onMarkerClick)
                        markerEvents.onClick = () => props.onMarkerClick(marker);
                    if (props.onMarkerDrag)
                        markerEvents.onDrag = (e) => props.onMarkerDrag(e, marker);
                    if (props.onMarkerDragEnd)
                        markerEvents.onDragEnd = (e) => props.onMarkerDragEnd(e, marker);

                    return (
                        <Marker
                            key={index}
                            position={new google.maps.LatLng(marker.cord.lat, marker.cord.lng)}
                            title={marker.sortOrder.toString()}
                            {...markerEvents}
                            draggable={marker.draggable}
                            icon={marker.icon} >
                            {marker.showInfo && (
                                <InfoWindow onCloseClick={() => props.onMarkerCloseClick(marker)}>
                                    <a href="javascript:void(0)" style={{ color: 'red', fontWeight: 'bold' }} onClick={() => props.onMarkerRemoveClick(marker)}>Delete</a>
                                </InfoWindow>
                            )}
                        </Marker>
                    );
                })}


                {props.polygons.map((poly, index) => {

                    let options = { ...poly.options }
                    options.fillOpacity = options.fillOpacity / 100;

                    let polyOptions = {
                        //content: 'label',
                        //boxStyle: {
                        //border: "1px solid black",
                        //textAlign: "center",
                        //backgroundColor: "white",
                        //fontSize: "8pt",
                        //width: "50px"
                        //}, 
                        //disableAutoPan: true,
                        //pixelOffset: new google.maps.Size(-25, 0),
                        //closeBoxURL: "",
                        //isHidden: false,
                        //enableEventPropagation: true,

                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        //fillOpacity: 0.35,
                        ...options
                    }

                    let polygonEvents = {};
                    if (poly.onClick)
                        polygonEvents.onClick = poly.onClick;
                    if (poly.onPolygonClick)
                        polygonEvents.onClick = (e) => poly.onPolygonClick(e, poly.id);

                    if (!poly.defaultGPS) {
                        var bounds = new google.maps.LatLngBounds();
                        poly.polycords.forEach(function (element, i) { bounds.extend(element) })
                        var centerCords = bounds.getCenter();
                    }

                    count++;
                    let markerObj = {};
                    if (poly.name) {
                        markerObj.title = poly.name;
                        markerObj.label = { text: poly.name, color: 'white' };
                    }

                    return (<div key={index}>

                        {count == 1 ?
                            //Add marker for center point of property
                            poly.defaultGPS && poly.polycords.length > 2 ? <Marker
                                position={new google.maps.LatLng(poly.defaultGPS.split(',')[0], poly.defaultGPS.split(',')[1])}
                                draggable={true}
                                onDragEnd={poly.changeCenterPoint}
                                icon={window.__SITE_URL__ + "/static/images/Markers/center.png"}>
                            </Marker> : null
                            :
                            // Add marker for name of enclosure
                            <Marker
                                position={new google.maps.LatLng(centerCords.lat(), centerCords.lng())}
                                {...markerObj}
                                icon={window.__SITE_URL__ + "/static/images/Markers/label.png"}>
                            </Marker>
                        }

                        {poly.showPolyInfo ?
                            <InfoWindow style={{ color: 'red', fontWeight: 'bold', width: '200px' }}
                                onCloseClick={poly.onPolyInfoClose}
                                position={new google.maps.LatLng(poly.infoLat, poly.infoLng)}>
                                <div>
                                    <b className="mr5">{poly.name}</b>
                                    <br />
                                    <a href="javascript:void(0)" className="mr5" style={{ color: 'red', fontWeight: 'bold', width: '200px' }}
                                        onClick={() => poly.onEdit(poly.id)}>Edit</a>
                                    <b className="mr5">|</b>
                                    <a href="javascript:void(0)" style={{ color: 'red', fontWeight: 'bold', width: '200px' }}
                                        onClick={() => poly.onClear(poly.id)}>Clear</a>
                                </div>
                            </InfoWindow>
                            : null
                        }
                        <Polygon path={poly.polycords} options={polyOptions} {...polygonEvents } />
                    </div>)
                })}
            </GoogleMap>)
        }
    ));

export default Map
