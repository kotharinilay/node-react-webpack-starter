import React from 'react';
import { browserHistory } from 'react-router';
import MenuItem from 'material-ui/MenuItem';
import { browserList } from '../../shared/constants';

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

// Render contact items from dataSource (Only for autocomplete)
let renderContactItems = (data, valueField, textField) => {
    data.map(d => {
        d[valueField] = <MenuItem className="manager-menu"
            value={d[valueField]} label={d[textField]}
            primaryText={<div>{d.Name}<br /><span className="manager-role">{d.CompanyName}</span></div>} />
    });
    return data;
}

// Get name of browser
let getBrowserName = () => {
    if (navigator.userAgent.indexOf("Edge") != -1) {
        return browserList.edge;
    }
    else if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) {
        return browserList.opera;
    }
    else if (navigator.userAgent.indexOf("Chrome") != -1) {
        return browserList.chrome;
    }
    else if (navigator.userAgent.indexOf("Safari") != -1) {
        return browserList.safari;
    }
    else if (navigator.userAgent.indexOf("Firefox") != -1) {
        return browserList.firefox;
    }
    else if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!document.documentMode == true)) //IF IE > 10
    {
        return browserList.ie;
    }
    else {
        return browserList.unknown;
    }
}

module.exports = {
    mandatory: mandatory,
    getCurrentURL: getCurrentURL,
    handleExpander: handleExpander,
    renderManagerItems: renderManagerItems,
    renderContactItems: renderContactItems,
    getBrowserName: getBrowserName
}