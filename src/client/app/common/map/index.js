'use strict';

/**************************
 * expose map component
 * provide the functionality to draw area inside the map
 * **************************** */

import React, { Component } from 'react';
import { withGoogleMap, GoogleMap, Marker, InfoWindow, Polygon } from "react-google-maps";
import withScriptjs from "react-google-maps/lib/async/withScriptjs";

const AsyncGettingStartedExampleGoogleMap = withScriptjs(
    withGoogleMap(

        props => (
            <GoogleMap
                ref={props.onMapLoad}
                defaultZoom={5}
                defaultCenter={new google.maps.LatLng(-50.363882, 131.044922)}
                defaultMapTypeId="satellite"
                onClick={props.onAddMarker}>
                {props.markers.map((marker, index) => {
                    //console.log(props.markers);
                    let markerClick = () => props.onMarkerClick(marker);
                    let onCloseClick = () => props.onMarkerCloseClick(marker);
                    let markerRemoveClick = () => props.onMarkerRemoveClick(marker);
                    let markerDrag = (e) => props.onMarkerDrag(e, marker.key);
                    return (
                        <Marker
                            key={index}
                            position={marker.position}
                            title={(index + 1).toString()}
                            onClick={markerClick}
                            draggable={marker.draggable}
                            onDrag={markerDrag}
                            icon={marker.icon}
                            >
                            {marker.showInfo && (
                                <InfoWindow onCloseClick={onCloseClick}>
                                    <div>
                                        <h3>This is marker {index}.</h3>
                                        <br />
                                        <em>
                                            If you want to remove click <b onClick={markerRemoveClick}>{marker.content}</b>.
                                        </em>
                                    </div>
                                </InfoWindow>
                            )}
                        </Marker>
                    );
                })}
                <Polygon path={props.polyOptions.polycords} options={props.polyOptions} ref={props.getPolypath} />
            </GoogleMap>
        )
    ));

export default AsyncGettingStartedExampleGoogleMap
