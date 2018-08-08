Property/Enclosure map validation logic
----------------------------------------------------
   
    // Validate marker coordinates
    validateCoordinates(latLng, isLatLng = false, isAddMarker = false, isAssets = false, deleteMarker = false, newCords = []) {
        if (deleteMarker) {
            //Validate on click on delete marker from InfoWindow

            if (this.state.isProperty) {
                let newPolygon = new google.maps.Polygon({ path: newCords });

                let result = this.validateWithAssets(newPolygon);
                if (!result)
                    return false;

                return this.validateWithEnclosure(newPolygon);
            }
            else if (this.state.isEnclosure) {

                let newPolygon = new google.maps.Polygon({ path: newCords });

                // Validate new enclosure with property
                let isInsideProperty = polygonInside(this.propertyObj.polygon, [newPolygon]);
                if (!isInsideProperty)
                    return false;

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

                let result = this.validateWithAssets(newPolygon);
                if (!result)
                    return false;

                return this.validateWithEnclosure(newPolygon);

            }
            if (this.state.isEnclosure && (this.state.isEnclosureAdd || this.enclosureObj.id)) {

                // Generate new polygon to validate based on cords
                let newPolycords = [...this.enclosureObj.cords];
                if (isAddMarker)
                    newPolycords.push({ lat: latLng.lat(), lng: latLng.lng() });
                let newPolygon = new google.maps.Polygon({ path: newPolycords });


                if (newPolycords.length < 3) {
                    // Validate if cords is less then 3
                    let isValidCord = true;
                    this.Enclosure.map(e => {
                        if (e.id != this.enclosureObj.id) {
                            let isValid = !google.maps.geometry.poly.containsLocation(latLng, e.polygon);
                            if (!isValid)
                                isValidCord = false;
                        }
                    });
                    return isValidCord;
                }

                // Validate new cords with property
                let isValidCord = google.maps.geometry.poly.containsLocation(latLng, this.propertyObj.polygon);
                if (!isValidCord)
                    return false;

                // Validate new enclosure with property
                let isInsideProperty = polygonInside(this.propertyObj.polygon, [newPolygon]);
                if (!isInsideProperty)
                    return false;

                return this.enclosureSelfValidate(newPolycords);
            }
            else
                return false;
        }
    }
