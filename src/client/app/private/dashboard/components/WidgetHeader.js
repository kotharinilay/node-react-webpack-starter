'use strict';

/*****************************************
 * General header component for every widget
 * ***************************************/

import React, { Component } from 'react';

class WidgetHeader extends Component {

    // constructor
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
    }

    render() {

        const ready = this.props.ready;
        // determines title of widget based on props
        const title = ready ?
            (this.props.titleCount ? <h4>{this.props.titleCount}<span>{this.props.titleText}</span></h4> : <h4><span>{this.props.titleText}</span></h4>)
            : <h5><span>Loading...</span></h5>;

        return (<div className={this.props.className}>
            {title}
            <div className="close-icon">
                {ready ?
                    <span>
                        <img src={this.siteURL + "/static/images/refresh-icon.png"} alt="refresh" className="refre-img" onClick={this.props.reload} />
                        <img src={this.siteURL + "/static/images/refresh-icon-hover.png"} alt="refresh" className="refre-hover" onClick={this.props.reload} />
                    </span>
                    : <span>
                        <img src={this.siteURL + "/static/images/refresh-icon.png"} alt="refresh" className="refre-img spin-img" onClick={this.props.reload} />
                    </span>
                }
                <span>
                    <img src={this.siteURL + "/static/images/close-icon.png"} alt="refresh" className="close-img" onClick={(e) => this.props.remove(e)} />
                    <img src={this.siteURL + "/static/images/close-icon-hover.png"} alt="refresh" className="close-hover" onClick={(e) => this.props.remove(e)} />
                </span>
            </div>
        </div>);
    }
}

export default WidgetHeader;

