'use strict';

/*********************************************
 * Root container to display all widgets
 * based on array provided from parent
 * ***************************************** */

import React, { Component } from 'react';

import WidgetLivestock from '../widgets/Livestock';
import WidgetNVD from '../widgets/NVD';
import WidgetBusiness from '../widgets/Business';
import WidgetPIC from '../widgets/PIC';
import WidgetReport from '../widgets/Report';

const componentSet = [
    { 'key': 'Livestock', component: WidgetLivestock },
    { 'key': 'NVD', component: WidgetNVD },
    { 'key': 'PIC', component: WidgetPIC },
    { 'key': 'Business', component: WidgetBusiness },
    { 'key': 'Report', component: WidgetReport }
];

class WidgetContainer extends Component {

    // constructor
    constructor(props) {
        super(props);
        this.renderContent = this.renderContent.bind(this);
    }

    // render provided content from child widgets 
    // if state is ready
    renderContent(ready, content) {
        return ready ? content : <div className="box-middle">
            <div className="timeline-item" >
                <div className="animated-background">
                    <div className="background-masker header-top"></div>
                    <div className="background-masker header-left"></div>
                    <div className="background-masker header-right"></div>
                    <div className="background-masker header-bottom"></div>
                    <div className="background-masker subheader-left"></div>
                    <div className="background-masker subheader-right"></div>
                    <div className="background-masker subheader-bottom"></div>
                    <div className="background-masker content-top"></div>
                    <div className="background-masker content-first-end"></div>
                    <div className="background-masker content-second-line"></div>
                    <div className="background-masker content-second-end"></div>
                    <div className="background-masker content-third-line"></div>
                    <div className="background-masker content-third-end"></div>
                </div>
            </div>
        </div>;
    }

    render() {

        // check whether provided child component exist
        // in the actual list 
        let _this = this;
        var renderingComponents = componentSet.filter(function (i) {
            return i.key == _this.props.item.name;
        }).map(function (m, i) {
            return <m.component
                key={i}
                titleColor={_this.props.item.titleColor}
                hideWidget={_this.props.hideWidget}
                renderContent={_this.renderContent}
                name={m.key} />;
        });

        return (
            <div className="stock-list">
                <div className="stock-list-cover">
                    {renderingComponents}
                </div>
            </div>
        );
    }
}

export default WidgetContainer;