'use strict';

/**************************
 * add/update tab for Map
 * **************************** */

import React, { Component } from 'react';
import { sortBy, uniqWith, isEqual } from 'lodash';

import Button from '../../../../lib/core-components/Button';
import Dropdown from '../../../../lib/core-components/Dropdown';
import ColorPicker from '../../../../lib/core-components/ColorPicker';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';

import { polygonIntersect, polygonInside } from '../../../../lib/map-validation';
import { convertArea, convertAreaToM2 } from '../../../../../shared/index';

import Map from '../../../common/map/index';
import MarkerList from '../../../common/map/marker_list';
import { GOOGLE_MAP_URL, MAP_API_KEY } from '../../../../../../ecosystem/client';
import { NOTIFY_ERROR, NOTIFY_WARNING } from '../../../common/actiontypes';

import { mapAreaUnitSystemCodes } from '../../../../../shared/constants';

class MapTab extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this._map = null;
        this.mapArea = 0; // Always in Square Meters
        this.area = 0; // Converted area based on uom selection

        this.draggedElement = null;

        this.Property = {
            data: null,
            area: 0,
            uomId: null,
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

        this.lastEnclColourObj = {
            color: '#00ff00',
            alpha: 35
        };

        this.state = {
            isFullScreen: false,

            readOnly: true,
            isProperty: false,
            isEnclosure: false,
            isRiskProfile: false,
            isEnclosureAdd: false,

            isCenterPointChanged: false,
            displayColorPicker: false,
            displayAssets: false,
            zoomLevel: 16,
            strokeColor: '#000000',
            fenceColour: '#0000ff',
            fenceOpacity: 35,
            mapAreaUnit: mapAreaUnitSystemCodes.Hectare,
            mapAreaUnitText: 'Hectare',
            markers: [],

            showPolyInfo: null,
            infoLat: 0,
            infoLng: 0
        }

        this.enclosureData = [...this.props.EnclosureData];
        this.deletedEnclosureMap = [];

        this.addMarker = this.addMarker.bind(this);
        this.markerClick = this.markerClick.bind(this);
        this.markerCloseClick = this.markerCloseClick.bind(this);
        this.markerRemoveClick = this.markerRemoveClick.bind(this);
        this.markerDrag = this.markerDrag.bind(this);
        this.markerDragEnd = this.markerDragEnd.bind(this);
        this.onMapLoad = this.onMapLoad.bind(this);

        this.preventDefault = this.preventDefault.bind(this);
        this.getLatLng = this.getLatLng.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.drop = this.drop.bind(this);

        this.computeArea = this.computeArea.bind(this);
        this.generateMarker = this.generateMarker.bind(this);
        this.getCordsFromMarkers = this.getCordsFromMarkers.bind(this);

        this.validateCoordinates = this.validateCoordinates.bind(this);
        this.validateWithAssets = this.validateWithAssets.bind(this);
        this.validateWithEnclosure = this.validateWithEnclosure.bind(this);
        this.enclosureSelfValidate = this.enclosureSelfValidate.bind(this);

        this.loadPropertyMarkers = this.loadPropertyMarkers.bind(this);
        this.loadEnclosureMarkers = this.loadEnclosureMarkers.bind(this);

        this.renderColorPicker = this.renderColorPicker.bind(this);
        this.renderMapActions = this.renderMapActions.bind(this);
        this.renderMap = this.renderMap.bind(this);

        this.modifyProperty = this.modifyProperty.bind(this);
        this.modifyEnclosures = this.modifyEnclosures.bind(this);
        this.editEnclosure = this.editEnclosure.bind(this);
        this.clearEnclosure = this.clearEnclosure.bind(this);
        this.clearEnclosureClick = this.clearEnclosureClick.bind(this);
        this.modifyRisk = this.modifyRisk.bind(this);

        this.addEnclosure = this.addEnclosure.bind(this);
        this.saveMap = this.saveMap.bind(this);
        this.cancelMap = this.cancelMap.bind(this);

        this.saveProperty = this.saveProperty.bind(this);
        this.saveEnclosure = this.saveEnclosure.bind(this);
        this.saveRiskProfile = this.saveRiskProfile.bind(this);

        this.onPolygonClick = this.onPolygonClick.bind(this);
        this.onPolyInfoClose = this.onPolyInfoClose.bind(this);

        this.resetEnclosureObj = this.resetEnclosureObj.bind(this);
        this.getCenterCords = this.getCenterCords.bind(this);
        this.onChangeCenterPoint = this.onChangeCenterPoint.bind(this);

        this.getValues = this.getValues.bind(this);
        this.onCenterChanged = this.onCenterChanged.bind(this);
        this.mapElement = this.mapElement.bind(this);
    }

    onCenterChanged() {
        if ($(this._map.getDiv()).children().eq(0).height() == window.innerHeight &&
            $(this._map.getDiv()).children().eq(0).width() == window.innerWidth) {
            if (!this.state.isFullScreen)
                this.setState({ isFullScreen: true });
        }
        else {
            if (this.state.isFullScreen)
                this.setState({ isFullScreen: false });
        }
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }
    componentWillUnmount() {
        this.mounted = false;
    }

    // reset enclosure object
    resetEnclosureObj() {
        this.enclosureObj = {
            id: null,
            auditLogId: null,
            name: null,
            polygon: null,
            cords: []
        };
    }

    // Load map based on given props in edit mode
    componentWillMount() {
        this.mounted = true;
        let mapAreaUnit = this.state.mapAreaUnit;
        let mapAreaUnitText = this.state.mapAreaUnitText;
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

            if (obj.UoMId) {
                let uom = this.props.uomData.find(x => x.Id == obj.UoMId);
                mapAreaUnit = uom.SystemCode;
                mapAreaUnitText = uom.Name;
            }

            this.Property = {
                data: fence,
                area: obj.Area,
                uomId: obj.UoMId,
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
                            }
                        }
                    }

                    this.Enclosure.push({
                        area: obj.Area,
                        auditLogId: obj.AuditLogId,
                        cords: polycords,
                        data: fence,
                        defaultGPS: obj.DefaultGPS,
                        id: obj.Id,
                        options: enclosureOptions,
                        polygon: null,
                        uomId: obj.UoMId
                    });

                    let index = this.enclosureData.findIndex(x => x.Id == obj.Id)
                    if (index != -1)
                        this.enclosureData.splice(index, 1);

                    this.lastEnclColourObj = {
                        color: enclosureOptions.options.fillColor,
                        alpha: enclosureOptions.options.fillOpacity
                    };
                }

            });
        }

        this.stateSet({ zoomLevel: zoomLevel, mapAreaUnit: mapAreaUnit, mapAreaUnitText: mapAreaUnitText });
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
            this.mapArea = google.maps.geometry.spherical.computeArea(this.propertyObj.polygon.getPath());
            this.Enclosure = this.Enclosure.map(e => {
                e.polygon = new google.maps.Polygon({ path: e.cords });
                return e;
            });
            this.stateSet({ markers: this.Property.assetsMarkers });
        }
    }

    // Update center point on drag
    onChangeCenterPoint(event) {
        this.Property.defaultGPS = event.latLng.lat() + ',' + event.latLng.lng();
        if (!this.state.isCenterPointChanged)
            this.setState({ isCenterPointChanged: true });
    }

    // Handle polygon click event to edit/clear
    onPolygonClick(event, id) {
        let obj = this.Enclosure.find(x => x.id == id);
        if (obj) {
            this.setState({
                showPolyInfo: id,
                infoLat: event.latLng.lat(),
                infoLng: event.latLng.lng()
            });
        }
    }

    // Close polygon information popup
    onPolyInfoClose() {
        if (this.state.showPolyInfo)
            this.setState({ showPolyInfo: null, infoLat: 0, infoLng: 0 });
    }

    // Get offset sum for drop assets
    getOffsetSum(elem) {
        let top = 0, left = 0;
        while (elem) {
            top = top + parseInt(elem.offsetTop)
            left = left + parseInt(elem.offsetLeft)
            elem = elem.offsetParent
        }
        return { top: top, left: left }
    }

    // Generate new marker and add into list
    generateMarker(latVal, lngVal, icon, assets = false, sortOrder = null, returnMarker = false, isDraggable = true) {

        let newMarker = {
            showInfo: false,
            draggable: isDraggable,
            cord: { lat: latVal, lng: lngVal },
            icon: icon ? this.siteURL + "/static/images/Markers/" + icon : null,
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

    // Compute area of Polygon
    computeArea(polycords) {
        let polygon = null;
        if (this.state.isProperty) {
            this.propertyObj.polygon = new google.maps.Polygon({ path: polycords });
            this.propertyObj.cords = polycords;
            polygon = this.propertyObj.polygon;
        }
        else if (this.state.isEnclosure) {
            this.enclosureObj.polygon = new google.maps.Polygon({ path: polycords });
            this.enclosureObj.cords = polycords;
            polygon = this.enclosureObj.polygon;
        }
        this.mapArea = google.maps.geometry.spherical.computeArea(polygon.getPath());
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


    /* Marker validation */

    // Validate marker coordinates
    validateCoordinates(latLng, isLatLng = false, isAddMarker = false, isAssets = false, deleteMarker = false, newCords = []) {
        if (deleteMarker) {
            //Validate on click on delete marker from InfoWindow

            if (this.state.isProperty) {
                let newPolygon = new google.maps.Polygon({ path: newCords });
                return this.validateWithAssets(newPolygon);
            }
            else if (this.state.isEnclosure) {
                return this.enclosureSelfValidate(newCords);
            }
            else
                return false;
        }
        else {
            //Validate on marker drag

            if (!isLatLng) {
                latLng = new google.maps.LatLng(latLng.lat(), latLng.lng());
            }

            if (this.state.isProperty) {

                // validate assets
                if (isAssets)
                    return google.maps.geometry.poly.containsLocation(latLng, this.propertyObj.polygon);

                // Generate new polygon to validate based on cords
                let newPolycords = [...this.propertyObj.cords];
                if (isAddMarker)
                    newPolycords.push({ lat: latLng.lat(), lng: latLng.lng() });
                let newPolygon = new google.maps.Polygon({ path: newPolycords });

                return this.validateWithAssets(newPolygon);

            }
            if (this.state.isEnclosure && (this.state.isEnclosureAdd || this.enclosureObj.id)) {

                // Generate new polygon to validate based on cords
                let newPolycords = [...this.enclosureObj.cords];
                if (isAddMarker)
                    newPolycords.push({ lat: latLng.lat(), lng: latLng.lng() });

                return this.enclosureSelfValidate(newPolycords);
            }
            else
                return false;
        }
    }

    // Validate with assets markers
    validateWithAssets(newPolygon) {
        let result = true;
        this.state.markers.map(marker => {
            if (marker.isAssets) {
                let cords = new google.maps.LatLng(marker.cord.lat, marker.cord.lng);
                let isValidCord = google.maps.geometry.poly.containsLocation(cords, newPolygon);
                if (!isValidCord)
                    result = false;
            }
        });
        return result;
    }

    // Validate with enclosures
    validateWithEnclosure(newPolygon) {
        let enclosurePolygons = [];
        this.Enclosure.map(e => {
            enclosurePolygons.push(e.polygon);
        });
        return polygonInside(newPolygon, enclosurePolygons);
    }

    // Validate enclosures with each other on delete marker
    enclosureSelfValidate(newCords) {
        let selfPolygon = [];
        newCords.map(p => {
            selfPolygon.push({ x: p.lat, y: p.lng });
        });
        selfPolygon = uniqWith(selfPolygon, isEqual);

        let result = true;
        this.Enclosure.map(e => {
            if (e.id != this.enclosureObj.id) {
                let comparedPolygon = [];
                e.cords.map(p => {
                    comparedPolygon.push({ x: p.lat, y: p.lng });
                });
                let res = polygonIntersect(selfPolygon, comparedPolygon);
                if (res.length > 0)
                    result = false;
            }
        });
        return result;
    }

    /* Marker validation */




    /* Drag and drop assets to Map */

    // Handle for drag assets to map
    preventDefault(event) {
        event.preventDefault();
    }

    // Get lat lng for dragged assets
    getLatLng(event) {
        let offset = this.getOffsetSum(this._map.getDiv());
        let topRight = this._map.getProjection().fromLatLngToPoint(this._map.getBounds().getNorthEast());
        let bottomLeft = this._map.getProjection().fromLatLngToPoint(this._map.getBounds().getSouthWest());
        let scale = Math.pow(2, this._map.getZoom());
        let worldPoint = new google.maps.Point((event.pageX - offset.left) / scale + bottomLeft.x, (event.pageY - offset.top) / scale + topRight.y);
        let latLng = this._map.getProjection().fromPointToLatLng(worldPoint);
        return latLng;
    }

    // Handle it for drag assets
    onDragStart(event) {
        let data = { icon: event.target["id"] };
        event.dataTransfer.setData('assetsDetails', JSON.stringify(data));
    }

    // Drop assets to map area
    drop(event) {
        event.preventDefault();
        let data = JSON.parse(event.dataTransfer.getData('assetsDetails'));

        let latLng = this.getLatLng(event);
        let isValidCord = this.propertyObj.polygon ? google.maps.geometry.poly.containsLocation(latLng, this.propertyObj.polygon) : false;

        if (isValidCord) {
            let markerList = this.generateMarker(latLng.lat(), latLng.lng(), data.icon, true);
            this.setState({ displayAssets: false, markers: markerList });
        }
        else
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.INVALID_MARKER });
    }

    /* Drag and drop assets to Map */




    /* Marker events for Map */

    // Handle marker click to display information popup
    markerClick(targetMarker) {
        this.setState({
            markers: this.state.markers.map(marker => {
                if (marker === targetMarker && (this.state.isProperty || !marker.isAssets)) {
                    return Object.assign({}, marker, {
                        showInfo: true
                    });
                }
                return marker;
            }),
        });
    }

    // Handle marker close button to hide information popup
    markerCloseClick(targetMarker) {
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

    // Delete marker from map
    markerRemoveClick(targetMarker) {
        let oldMarkers = [...this.state.markers];
        let newMarkers = oldMarkers.filter((marker) => {
            return marker !== targetMarker;
        });

        let oldCords = [];
        if (this.state.isProperty)
            oldCords = [...this.propertyObj.cords];
        else if (this.state.isEnclosure)
            oldCords = [...this.enclosureObj.cords];

        let newCords = oldCords.filter((polycord) => {
            return JSON.stringify(polycord) != JSON.stringify(targetMarker.cord);
        });

        let isValidCord = this.validateCoordinates(null, false, false, false, true, newCords);
        if (isValidCord) {
            // update sortOrder of markers
            newMarkers = newMarkers.map((marker, i) => {
                if (marker.sortOrder != i + 1)
                    marker.sortOrder = marker.sortOrder - 1;
                return marker;
            });

            this.computeArea(newCords);
            this.setState({ markers: newMarkers });
        }
        else
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.INVALID_POLYGON_TO_DELETE });

    }

    // Move marker inside the map
    markerDrag(event, element) {
        if (!this.draggedElement) {
            this.draggedElement = {
                marker: element,
                area: this.mapArea,
                cords: this.state.isProperty ? this.propertyObj.cords : this.enclosureObj.cords,
                polygon: this.state.isProperty ? this.propertyObj.polygon : this.enclosureObj.polygon
            };
        }

        let isValidCord = true;
        let iconImg = null;

        if (element.isAssets) {
            isValidCord = this.validateCoordinates(event.latLng, false, false, true);
            if (!isValidCord)
                iconImg = this.siteURL + "/static/images/Markers/decline.png";
            else
                iconImg = this.siteURL + "/static/images/Markers/" + element.key;
        }
        else {
            isValidCord = this.validateCoordinates(event.latLng);
        }

        let markerList = this.state.markers.map(marker => {
            if (marker.sortOrder === element.sortOrder) {
                return Object.assign({}, marker, {
                    cord: { lat: event.latLng.lat(), lng: event.latLng.lng() },
                    icon: iconImg
                });
            }
            return marker;
        });

        if (!element.isAssets) {
            let newPolycords = this.getCordsFromMarkers(markerList);
            this.computeArea(newPolycords);
        }

        this.setState({ markers: markerList, strokeColor: isValidCord ? '#000000' : '#ff0000' });
    }

    // Handle marker drag end event
    markerDragEnd(event, element) {
        if (element.isAssets && this.draggedElement) {

            let isValidCord = this.validateCoordinates(event.latLng, false, false, true);

            if (!isValidCord) {
                this.notifyToaster(NOTIFY_ERROR, { message: this.strings.INVALID_MARKER });
                let markerList = this.state.markers.map(marker => {
                    if (marker.sortOrder === element.sortOrder) {
                        return Object.assign({}, marker, {
                            cord: this.draggedElement.marker.cord,
                            icon: this.draggedElement.marker.icon
                        });
                    }
                    return marker;
                });
                this.setState({ markers: markerList, strokeColor: '#000000' });
            }
        }
        else if (this.draggedElement) {
            let isValidCord = this.validateCoordinates(event.latLng);

            if (!isValidCord) {
                this.notifyToaster(NOTIFY_ERROR, { message: this.strings.INVALID_MARKER });
                let markerList = this.state.markers.map(marker => {
                    if (marker.sortOrder === element.sortOrder) {
                        return Object.assign({}, marker, {
                            cord: this.draggedElement.marker.cord
                        });
                    }
                    return marker;
                });

                this.mapArea = this.draggedElement.area;
                if (this.state.isProperty) {
                    this.propertyObj.cords = this.draggedElement.cords;
                    this.propertyObj.polygon = this.draggedElement.polygon;
                }
                else if (this.state.isEnclosure) {
                    this.enclosureObj.cords = this.draggedElement.cords;
                    this.enclosureObj.polygon = this.draggedElement.polygon;
                }
                this.setState({ markers: markerList, strokeColor: '#000000' });
            }
        }

        this.draggedElement = null;
    }

    // Add marker to draw polygon
    addMarker(event) {
        if (!this.state.isProperty && !this.state.isEnclosureAdd && !this.enclosureObj.id)
            return;

        let isValidCord = this.validateCoordinates(event.latLng, false, true);
        if (isValidCord) {
            let markerList = this.generateMarker(event.latLng.lat(), event.latLng.lng(), null, false);
            let polycords = this.getCordsFromMarkers(markerList);
            this.computeArea(polycords);
            this.setState({ markers: markerList });
        }
        else {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.INVALID_MARKER });
        }
    }

    /* Marker events for Map */



    /* Handle click events */

    // Return tab values to add/edit
    getValues() {
        let enclosureArr = [];
        this.Enclosure.map(e => {
            enclosureArr.push({
                Id: e.id,
                AuditLogId: e.auditLogId,
                DefaultGPS: e.defaultGPS,
                EnclosureFence: e.data,
                Area: e.area,
                UoMId: e.uomId
            });
        });

        return {
            property: {
                DefaultGPS: this.Property.defaultGPS,
                MapZoomLevel: this._map.getZoom(),
                Area: this.Property.area == 0 ? null : this.Property.area,
                UoMId: this.Property.area == 0 ? null : this.Property.uomId,
                PropertyFence: this.Property.data
            },
            enclosure: enclosureArr,
            deletedEnclosureMap: this.deletedEnclosureMap,
            updateMapDB: true
        };
    }


    // Handle save button click for map
    saveMap() {
        let isValidMap = false;

        // Save all map details
        if (this.state.isProperty) {
            isValidMap = this.saveProperty();
        }
        if (this.state.isEnclosure)
            isValidMap = this.saveEnclosure();

        if (isValidMap) {
            let assetsMarkers = this.Property.assetsMarkers;

            let mapAreaUnit = this.state.mapAreaUnit;
            let mapAreaUnitText = this.state.mapAreaUnitText;
            if (this.Property.uomId) {
                let uom = this.props.uomData.find(x => x.Id == this.Property.uomId);
                mapAreaUnit = uom.SystemCode;
                mapAreaUnitText = uom.Name;
                this.area = this.Property.area;
                this.mapArea = convertAreaToM2(this.area, uom.SystemCode == mapAreaUnitSystemCodes.Hectare, uom.SystemCode == mapAreaUnitSystemCodes.Acre);
            }

            if (this.state.isEnclosure && this.state.isEnclosureAdd)
                this.setState({ isEnclosureAdd: false, markers: assetsMarkers, mapAreaUnit: mapAreaUnit, mapAreaUnitText: mapAreaUnitText });
            else if (this.state.isEnclosure && !this.state.isEnclosureAdd)
                this.setState({ isEnclosure: true, markers: assetsMarkers, mapAreaUnit: mapAreaUnit, mapAreaUnitText: mapAreaUnitText });
            else
                this.setState({ readOnly: true, isProperty: false, isEnclosure: false, isRiskProfile: false, markers: assetsMarkers, mapAreaUnit: mapAreaUnit, mapAreaUnitText: mapAreaUnitText });
        }
        else
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.INVALID_POLYGON });
    }

    // Handle cancel button click for map
    cancelMap() {
        let mapAreaUnit = this.state.mapAreaUnit;
        let mapAreaUnitText = this.state.mapAreaUnitText;
        if (this.Property.uomId) {
            let uom = this.props.uomData.find(x => x.Id == this.Property.uomId);
            mapAreaUnit = uom.SystemCode;
            mapAreaUnitText = uom.Name;
            this.area = this.Property.area;
            this.mapArea = convertAreaToM2(this.area, uom.SystemCode == mapAreaUnitSystemCodes.Hectare, uom.SystemCode == mapAreaUnitSystemCodes.Acre);
        }
        else {
            this.area = 0;
            this.mapArea = 0;
        }

        if (this.state.isEnclosure && this.state.isEnclosureAdd) {
            // Change state to modify enclosure mode
            this.setState({ isEnclosureAdd: false, markers: this.Property.assetsMarkers, mapAreaUnit: mapAreaUnit, mapAreaUnitText: mapAreaUnitText });
        }
        else if (this.state.isEnclosure && !this.state.isEnclosureAdd && this.enclosureObj.id) {
            this.resetEnclosureObj();
            this.setState({ markers: this.Property.assetsMarkers, mapAreaUnit: mapAreaUnit, mapAreaUnitText: mapAreaUnitText });
        }
        else {
            this.propertyObj.cords = this.Property.cords;
            this.propertyObj.polygon = this.Property.polygon;

            this.resetEnclosureObj();
            this.setState({ readOnly: true, isProperty: false, isEnclosure: false, isRiskProfile: false, markers: this.Property.assetsMarkers, mapAreaUnit: mapAreaUnit, mapAreaUnitText: mapAreaUnitText });
        }
    }


    // Save property
    saveProperty() {
        if (this.propertyObj.cords.length < 3 && this.propertyObj.cords.length != 0)
            return false;
        else if (this.propertyObj.cords.length == 0) {

            this.Property = {
                data: null,
                area: 0,
                uomId: null,
                polygon: null,
                cords: [],
                options: null,
                assetsMarkers: [],
                defaultGPS: this.Property.defaultGPS || this.props.defaultGPS
            };

            this.propertyObj = {
                polygon: null,
                cords: []
            };

            return true;
        }

        let uom = this.props.uomData.find(x => x.SystemCode == this.state.mapAreaUnit);

        let fenceCoordinateArr = [];
        let assetsArr = [];

        this.Property.cords = this.propertyObj.cords;
        this.Property.polygon = this.propertyObj.polygon;
        if (!this.state.isCenterPointChanged)
            this.Property.defaultGPS = this.getCenterCords(this.Property.cords);
        this.Property.area = this.area;
        this.Property.uomId = uom ? uom.Id : null;

        this.Property.assetsMarkers = [];

        this.state.markers.map((m, i) => {
            if (m.isAssets) {
                assetsArr.push({ key: m.key, lat: m.cord.lat, lng: m.cord.lng, sortorder: m.sortOrder });
                m.draggable = false;
                m.showInfo = false;
                this.Property.assetsMarkers.push(m);
            }
            else {
                fenceCoordinateArr.push({ lat: m.cord.lat, lng: m.cord.lng, sortorder: m.sortOrder });
            }
        });

        this.Property.data = {
            FenceCoordinate: fenceCoordinateArr,
            FenceColour: {
                color: this.state.fenceColour,
                alpha: this.state.fenceOpacity
            },
            Assets: assetsArr
        };

        this.Property.options = {
            polycords: this.Property.cords,
            options: {
                strokeColor: '#000000',
                fillColor: this.Property.data.FenceColour.color,
                fillOpacity: this.Property.data.FenceColour.alpha,
                zIndex: 0
            }
        }

        return true;
    }

    // Save enclosure
    saveEnclosure() {
        if (this.enclosureObj.cords.length < 3)
            return false;

        let uom = this.props.uomData.find(x => x.SystemCode == this.state.mapAreaUnit);

        let obj = {};
        let fenceCoordinateArr = [];
        let assetsArr = [];

        let name = 'Enclosure';
        if (this.state.isEnclosureAdd) {
            obj.id = this.refs.enclosure.fieldStatus.value;
            let enclObj = this.enclosureData.find(x => x.Id == obj.id);
            name = enclObj.Name;
            obj.auditLogId = enclObj.AuditLogId;
        }
        else {
            obj.id = this.enclosureObj.id;
            obj.auditLogId = this.enclosureObj.auditLogId;
            name = this.enclosureObj.name;
        }

        obj.cords = this.enclosureObj.cords;
        obj.defaultGPS = this.getCenterCords(obj.cords);
        obj.polygon = this.enclosureObj.polygon;
        obj.area = this.area;
        obj.uomId = uom ? uom.Id : null;

        this.state.markers.map((m, i) => {
            if (!m.isAssets)
                fenceCoordinateArr.push({ lat: m.cord.lat, lng: m.cord.lng, sortorder: m.sortOrder });
        });

        obj.data = {
            FenceCoordinate: fenceCoordinateArr,
            FenceColour: {
                color: this.state.fenceColour,
                alpha: this.state.fenceOpacity
            }
        };

        obj.options = {
            name: name,
            polycords: obj.cords,
            options: {
                strokeColor: '#000000',
                fillColor: obj.data.FenceColour.color,
                fillOpacity: obj.data.FenceColour.alpha,
                zIndex: 1
            }
        }

        if (this.state.isEnclosureAdd) {
            this.Enclosure.push(obj);

            let index = this.enclosureData.findIndex(x => x.Id == obj.id)
            if (index != -1)
                this.enclosureData.splice(index, 1);

        }
        else if (this.enclosureObj.id) {
            this.Enclosure = this.Enclosure.map(e => {
                if (e.id == this.enclosureObj.id)
                    e = obj;
                return e;
            });
            this.resetEnclosureObj();
        }

        let index = this.deletedEnclosureMap.findIndex(x => x.Id == obj.id)
        if (index != -1)
            this.deletedEnclosureMap.splice(index, 1);

        this.lastEnclColourObj = obj.data.FenceColour;
        this.props.updateEnclMapDetails(obj.id, true);
        return true;
    }

    // Save risk profile
    saveRiskProfile() {
        // Save risk profile logic comes here...
    }



    // Handle modify property action click
    modifyProperty() {
        let markerObj = this.loadPropertyMarkers();
        this.setState({
            readOnly: false, isProperty: true, isEnclosure: false, isRiskProfile: false,
            fenceColour: markerObj.fenceColour, fenceOpacity: markerObj.fenceOpacity,
            markers: markerObj.markers, mapAreaUnit: markerObj.mapAreaUnit, mapAreaUnitText: markerObj.mapAreaUnitText
        });
    }

    // Handle modify enclosure action click
    modifyEnclosures() {
        if (this.Property.uomId) {
            this.setState({
                readOnly: false, isProperty: false, isEnclosure: true, isRiskProfile: false
            });
        }
        else
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.PROPERTY_NOT_AVAILABLE });
    }

    // Handle modify risk action click
    modifyRisk() {
        this.setState({ readOnly: false, isProperty: false, isEnclosure: false, isRiskProfile: true });
    }



    // Load property markers with assets
    loadPropertyMarkers() {
        let markersArr = [];
        let fenceColour = '#0000ff';
        let fenceOpacity = 35;
        let mapAreaUnit = this.state.mapAreaUnit;
        let mapAreaUnitText = this.state.mapAreaUnitText

        if (this.Property.data) {

            if (this.Property.data.FenceColour) {
                let colorObj = this.Property.data.FenceColour;
                fenceColour = colorObj && colorObj.color ? colorObj.color : '#00ff00';
                fenceOpacity = colorObj && colorObj.alpha ? colorObj.alpha : 35;
            }

            if (this.Property.uomId) {
                let uom = this.props.uomData.find(x => x.Id == this.Property.uomId);
                mapAreaUnit = uom.SystemCode;
                mapAreaUnitText = uom.Name;
                this.area = this.Property.area;
                this.mapArea = convertAreaToM2(this.area, uom.SystemCode == mapAreaUnitSystemCodes.Hectare, uom.SystemCode == mapAreaUnitSystemCodes.Acre);
            }

            this.Property.data.FenceCoordinate.map(m => {
                markersArr.push(this.generateMarker(m.lat, m.lng, null, false, m.sortorder, true));
            });

            this.Property.data.Assets.map(m => {
                markersArr.push(this.generateMarker(m.lat, m.lng, m.key, true, m.sortorder, true));
            });

            markersArr = sortBy(markersArr, 'sortOrder');
        }

        return {
            markers: markersArr,
            fenceColour: fenceColour,
            fenceOpacity: fenceOpacity,
            mapAreaUnit: mapAreaUnit,
            mapAreaUnitText: mapAreaUnitText
        }
    }

    // Load enclosure markers with assets
    loadEnclosureMarkers(id) {

        let obj = this.Enclosure.find(x => x.id == id);

        this.enclosureObj = {
            id: id,
            auditLogId: obj.auditLogId,
            name: obj.options.name,
            cords: obj.cords,
            polygon: obj.polygon
        };

        let markersArr = [];
        let fenceColour = '#00ff00';
        let fenceOpacity = 35;
        let mapAreaUnit = this.state.mapAreaUnit;
        let mapAreaUnitText = this.state.mapAreaUnitText;

        if (obj.data) {

            if (obj.data.FenceColour) {
                let colorObj = obj.data.FenceColour;
                fenceColour = colorObj && colorObj.color ? colorObj.color : '#00ff00';
                fenceOpacity = colorObj && colorObj.alpha ? colorObj.alpha : 35;
            }

            if (obj.uomId) {
                let uom = this.props.uomData.find(x => x.Id == obj.uomId);
                mapAreaUnit = uom.SystemCode;
                mapAreaUnitText = uom.Name;
                this.area = obj.area;
                this.mapArea = convertAreaToM2(this.area, uom.SystemCode == mapAreaUnitSystemCodes.Hectare, uom.SystemCode == mapAreaUnitSystemCodes.Acre);
            }

            obj.data.FenceCoordinate.map(m => {
                markersArr.push(this.generateMarker(m.lat, m.lng, null, false, m.sortorder, true));
            });

            markersArr = sortBy(markersArr, 'sortOrder');
        }

        return {
            markers: markersArr,
            fenceColour: fenceColour,
            fenceOpacity: fenceOpacity,
            mapAreaUnit: mapAreaUnit,
            mapAreaUnitText: mapAreaUnitText
        }
    }



    // Handle add enclosure click
    addEnclosure() {
        if (this.enclosureData.length == 0)
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.ENCLOSURE_NOT_AVAILABLE });
        else {
            this.area = 0;
            this.mapArea = 0;
            this.resetEnclosureObj();
            this.setState({ isEnclosureAdd: true, markers: [], fenceColour: this.lastEnclColourObj.color, fenceOpacity: this.lastEnclColourObj.alpha });
        }
    }

    // Edit enclosure
    editEnclosure(id) {
        let markerObj = this.loadEnclosureMarkers(id);
        this.setState({
            showPolyInfo: null, infoLat: 0, infoLng: 0,
            fenceColour: markerObj.fenceColour, fenceOpacity: markerObj.fenceOpacity,
            markers: markerObj.markers, mapAreaUnit: markerObj.mapAreaUnit, mapAreaUnitText: markerObj.mapAreaUnitText
        });
    }

    // Clear/Delete enclosure
    clearEnclosure(id) {
        let obj = this.Enclosure.find(x => x.id == id);
        let index = this.Enclosure.findIndex(x => x.id == id);
        if (index != -1)
            this.Enclosure.splice(index, 1);

        this.enclosureData = [...this.props.EnclosureData];
        this.Enclosure.map(e => {
            let index = this.enclosureData.findIndex(x => x.Id == e.id)
            if (index != -1)
                this.enclosureData.splice(index, 1);
        });

        this.deletedEnclosureMap.push({ Id: obj.id, AuditLogId: obj.auditLogId });

        this.props.hideConfirmPopup();
        this.props.updateEnclMapDetails(obj.id, false);
        this.resetEnclosureObj();
        this.setState({ marker: this.Property.assetsMarkers, showPolyInfo: null, infoLat: 0, infoLng: 0 });
    }

    // Handle Clear/Delete enclosure click
    clearEnclosureClick(id) {
        let payload = {
            confirmText: this.strings.DELETE_ENCLOSURE_MAP_CONFIRMATION,
            strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
            onConfirm: () => this.clearEnclosure(id)
        };
        this.props.openConfirmPopup(payload);
    }

    /* Handle click events */


    // Render ColorPicker
    renderColorPicker() {
        let state = this.state;

        return (<div>
            <div className="colorpicker-style">
                <div onClick={() => { this.setState({ displayColorPicker: !state.displayColorPicker }) }}
                    style={{ width: '40px', height: '30px', cursor: 'pointer', opacity: state.fenceOpacity / 100, background: state.fenceColour }}></div>
            </div>

            {state.displayColorPicker ?
                <ColorPicker
                    selectionVisible={true}
                    style={{ position: 'absolute', zIndex: 9999 }}
                    color={state.fenceColour} alpha={state.fenceOpacity}
                    clickOnOuter={() => this.setState({ displayColorPicker: false })}
                    changeHandler={(color) => { this.setState({ fenceColour: color.color, fenceOpacity: color.alpha }) }} />
                : null}
        </div>);
    }

    // Render map actions area
    renderMapActions() {
        let state = this.state;
        this.area = convertArea(this.mapArea, state.mapAreaUnit == mapAreaUnitSystemCodes.Hectare, state.mapAreaUnit == mapAreaUnitSystemCodes.Acre);
        let isUoMTextDisplay = state.readOnly || state.isEnclosure && !state.isEnclosureAdd && !this.enclosureObj.id;

        return (<div className="row" style={{ lineHeight: '30px' }}>
            <div className="col-md-4  pull-left">
                <h3 className="highlight-area">
                    <span style={isUoMTextDisplay ? {} : { float: 'left', margin: '13px 5px 0 0' }}>{this.area}</span>
                    {isUoMTextDisplay ?
                        <b className="mr10"> {state.mapAreaUnitText}</b> : <Dropdown inputProps={{
                            name: 'units',
                            value: state.mapAreaUnit,
                            style: { width: '110px' },
                            disabled: isUoMTextDisplay
                        }}
                            onSelectionChange={(val, text) => {
                                this.setState({ mapAreaUnit: val, mapAreaUnitText: text });
                            }}
                            textField="Name" valueField="SystemCode" dataSource={this.props.uomData}
                            fullWidth={false} ref="units" />}
                </h3>
            </div>

            <div className="col-md-8">
                <div className="l-stock-top-btn mb10">
                    {state.readOnly ?
                        <ul>
                            <li><a href="javascript:void(0)" className="ripple-effect search-btn" data-toggle="dropdown">{this.strings.ACTION_LABEL}</a>
                                <a href="javascript:void(0)" className="ripple-effect dropdown-toggle caret2" data-toggle="dropdown"> <span><img src={this.siteURL + "/static/images/caret-white.png"} /></span></a>
                                <ul className="dropdown-menu mega-dropdown-menu action-menu action-menu-height">
                                    <li>
                                        <ul>
                                            <li><a href="javascript:void(0)" onClick={this.modifyProperty}>
                                                {this.strings.CHANGE_PROPERTY}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.modifyEnclosures}>
                                                {this.strings.CHANGE_ENCLOSURE}</a>
                                            </li>
                                            {/*<li><a href="javascript:void(0)" onClick={this.modifyRisk}>
                                            {this.strings.MODIFY_RISK}</a>
                                        </li>*/}
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul> :
                        <ul>
                            {state.isEnclosureAdd ?
                                <li>
                                    <Dropdown inputProps={{
                                        name: 'enclosure',
                                        floatingLabelText: this.strings.ENCLOSURE_LABEL,
                                        className: 'mr10',
                                        value: this.enclosureData[0].Id
                                    }}
                                        textField="Name" valueField="Id" dataSource={this.enclosureData}
                                        fullWidth={false} ref="enclosure" />
                                </li> : null}
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnBack',
                                        label: this.strings.CANCEL_LABEL,
                                        className: 'button1Style button30Style'
                                    }}
                                    onClick={this.cancelMap} ></Button>
                            </li>
                            {state.isEnclosure && !state.isEnclosureAdd && !this.enclosureObj.id ? null :
                                <li>
                                    <Button
                                        inputProps={{
                                            name: 'btnSave',
                                            label: this.strings.SAVE_LABEL,
                                            className: 'button2Style button30Style'
                                        }}
                                        onClick={this.saveMap} ></Button>
                                </li>}
                            {state.isEnclosure && !state.isEnclosureAdd && !this.enclosureObj.id ?
                                <li>
                                    <Button
                                        inputProps={{
                                            name: 'btnAddEnclosure',
                                            label: this.strings.ADD_ENCLOSURE_LABEL,
                                            className: 'button2Style button30Style'
                                        }}
                                        onClick={this.addEnclosure} ></Button>
                                </li> : null}
                        </ul>
                    }
                </div></div>


        </div>);
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

        if (state.isProperty) {
            polygons.push({
                defaultGPS: this.Property.defaultGPS,
                changeCenterPoint: this.onChangeCenterPoint,
                polycords: this.propertyObj.cords,
                options: {
                    strokeColor: state.strokeColor,
                    fillColor: state.fenceColour,
                    fillOpacity: state.fenceOpacity,
                    zIndex: 0
                }
            });

            this.Enclosure.map(obj => {
                polygons.push(obj.options);
            });
        }
        else if (state.isEnclosure) {

            // Add property polygon into array
            let propertyObj = {
                defaultGPS: this.Property.defaultGPS,
                changeCenterPoint: this.onChangeCenterPoint,
                ...this.Property.options
            }
            if (state.isEnclosureAdd || this.enclosureObj.id)
                propertyObj.onClick = this.addMarker;
            polygons.push(propertyObj);


            // Add enclosure into array if it's add mode
            if (state.isEnclosureAdd) {

                // Add enclosure polygon into array
                this.Enclosure.map(obj => {
                    polygons.push(obj.options);
                });

                polygons.push({
                    polycords: this.enclosureObj.cords,
                    options: {
                        strokeColor: state.strokeColor,
                        fillColor: state.fenceColour,
                        fillOpacity: state.fenceOpacity
                    }
                });
            }
            else {
                // Add enclosure polygon into array
                this.Enclosure.map(obj => {
                    if (obj.id == this.enclosureObj.id) {
                        polygons.push({
                            polycords: this.enclosureObj.cords,
                            options: {
                                strokeColor: state.strokeColor,
                                fillColor: state.fenceColour,
                                fillOpacity: state.fenceOpacity
                            }
                        });
                    }
                    else
                        polygons.push({
                            ...obj.options,
                            id: obj.id,
                            showPolyInfo: state.showPolyInfo == obj.id,
                            infoLat: state.infoLat,
                            infoLng: state.infoLng,
                            onPolyInfoClose: this.onPolyInfoClose,
                            onPolygonClick: this.onPolygonClick,
                            onEdit: this.editEnclosure,
                            onClear: this.clearEnclosureClick
                        });
                });
            }

        }
        else {
            if (this.Property.options)
                polygons.push({
                    defaultGPS: this.Property.defaultGPS,
                    changeCenterPoint: this.onChangeCenterPoint,
                    ...this.Property.options
                });

            this.Enclosure.map(obj => {
                polygons.push(obj.options);
            });
        }

        let mapProps = {
            lat: defaultGPS[0],
            lng: defaultGPS[1],
            zoomLevel: state.zoomLevel,
            markers: state.markers,
            polygons: polygons
        }

        let outerMapEvents = {};
        let mapEvents = {};

        mapEvents.onCenterChanged = this.onCenterChanged;

        if (!state.readOnly) {
            outerMapEvents.onDragOver = this.preventDefault;
            outerMapEvents.onDrop = this.drop;

            mapEvents.onAddMarker = this.addMarker;
            mapEvents.onMarkerDrag = this.markerDrag;
            mapEvents.onMarkerDragEnd = this.markerDragEnd;
            mapEvents.onMarkerClick = this.markerClick;
            mapEvents.onMarkerCloseClick = this.markerCloseClick;
            mapEvents.onMarkerRemoveClick = this.markerRemoveClick;
        }

        return (<div {...outerMapEvents} style={{ zIndex: '999999999999', width: '100%' }}>
            <Map {...mapProps} {...mapElementProps} {...mapEvents} element={this.mapElement()}
                googleMapURL={GOOGLE_MAP_URL + "&key=" + MAP_API_KEY}
                onMapLoad={this.onMapLoad} />
        </div>);
    }
    mapElement() {
        let state = this.state;
        return (
            <div>
                {state.isProperty || (state.isEnclosure && state.isEnclosureAdd) || (state.isEnclosure && !state.isEnclosureAdd && this.enclosureObj.id) ?
                    <div>
                        {this.renderColorPicker()}
                        <div className="assets-style" onClick={() => {
                            this.setState({
                                displayAssets: !state.displayAssets
                            })
                        }}><img src={this.siteURL + "/static/images/Markers/icon_assets.png"} /></div>
                        {
                            this.state.displayAssets ?
                                <MarkerList onDragStart={this.onDragStart}
                                    clickOnOuter={() => this.setState({ displayAssets: false })} /> : null
                        }</div> : null}
            </div >
        );


    }
    // Render component
    render() {
        return (<div className="col-md-12">
            {this.renderMapActions()}
            <div className={this.state.isFullScreen ? "map-box-main map-box-fullscreen" : "map-box-main"}>
                {this.renderMap()}
            </div>
        </div>);
    }

}

export default MapTab;