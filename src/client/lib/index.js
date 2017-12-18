import React from 'react';
import { browserHistory } from 'react-router';
import MenuItem from 'material-ui/MenuItem';

let mandatory = (text) => {
    var style = {
        color: "#f05c5c",
        'fontSize': '11px'
    }
    return <span > {text} <label style={style}>*</label> </span>
}

// get current url
let getCurrentURL = () => {
    let urlPath = null;
    browserHistory.listen(function (ev) {
        urlPath = ev.pathname;
    });
    return urlPath;
}

// Display expand/collapse icons
let handleExpander = (cell, row, expandClick, rowClickId) => {
    let imgPath = window.__SITE_URL__ + "/static/images/";
    return <div onClick={expandClick}>
        <img src={rowClickId.includes(row.Id) ? imgPath + "collapse.png" : imgPath + "expand.png"} />
    </div>;
}

// Get list of livestock identifier
let getLivestockIdentifier = () => {
    return [ 
        { Text: 'EID', Value: 'EID' },
        { Text: 'NLIS ID', Value: 'NLIS ID' },
        { Text: 'VisualTag', Value: 'VisualTag' },
        { Text: 'Society ID', Value: 'Society ID' }
    ];
}

// Render manager items from dataSource
let renderManagerItems = (data, valueField, textField) => {
    return ( 
        data.map((d, index) =>
            <MenuItem
                key={index} className="manager-menu"
                value={d[valueField]} label={d[textField]}
                primaryText={<div>{d.Name}<br /><span className="manager-role">{d.Role}</span></div>} />
        )
    );
}

// List of Accreditation Status
let getAccreditationStatus = () => {
    return [
        { Text: 'Nothing', Value: 1 },
        { Text: 'Active', Value: 2 },
        { Text: 'Inactive', Value: 3 }
    ];
}

module.exports = {
    mandatory: mandatory,
    getCurrentURL: getCurrentURL,
    handleExpander: handleExpander,
    getLivestockIdentifier: getLivestockIdentifier,
    renderManagerItems: renderManagerItems,
    getAccreditationStatus: getAccreditationStatus
}