'use strict';

/**************************
 * expose app dashboard
 * This is a landing page. User can see their preferred widgets.
 * **************************** */

import React, { Component } from 'react';

class Dashboard extends Component {
    render() {
        return (
            <div className="dash-right">
                <div className="dash-right-top">
                    <div className="notify">
                        <span><em className="notify-count">13</em><b>New </b>messages</span>
                    </div>
                    <div className="configure-right">
                        <div className="configure-cover">
                            <a href="#">
                                <div className="configure">
                                    <img src="./static/images/configure-icon.png" className="configure-img" />
                                    <img src="./static/images/configure-icon-ho.png" className="configure-ho-img" />
                                    <span>Configure</span>
                                </div>
                            </a>
                        </div>
                        <span className="left-trial-text"><b>29 Days</b> left in trial</span>
                        <a className="btn ripple-effect btn-danger" href="javascript:void(0)">BUY NOW</a>
                    </div>
                </div>
                <div className="stock-list">
                    <div className="stock-list-cover">
                        <div className="stock-box">
                            <div className="box-head green-bg">
                                <h4>10<span>Livestock</span></h4>
                                <div className="close-icon">
                                    <span>
                                        <img src="./static/images/refresh-icon.png" alt="refresh" className="refre-img" />
                                        <img src="./static/images/refresh-icon-hover.png" alt="refresh" className="refre-hover" />
                                    </span>
                                    <span>
                                        <img src="./static/images/close-icon.png" alt="refresh" className="close-img" />
                                        <img src="./static/images/close-icon-hover.png" alt="refresh" className="close-hover" />
                                    </span>

                                </div>
                            </div>
                            <div className="box-middle">
                                <ul>
                                    <li><a href="#"><b>4</b>  Cattle(s)</a></li>
                                    <li><a><b>6</b>Sheep(s)</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="stock-box">
                            <div className="box-head light-blk-bg">
                                <h4>3<span>eNVD(s)</span></h4>
                                <div className="close-icon">
                                    <span>
                                        <img src="./static/images/refresh-icon.png" alt="refresh" className="refre-img" />
                                        <img src="./static/images/refresh-icon-hover.png" alt="refresh" className="refre-hover" />
                                    </span>
                                    <span>
                                        <img src="./static/images/close-icon.png" alt="refresh" className="close-img" />
                                        <img src="./static/images/close-icon-hover.png" alt="refresh" className="close-hover" />
                                    </span>

                                </div>
                            </div>
                            <div className="box-middle">
                                <ul>
                                    <li><a href="#"> <b>1</b> Draft</a></li>
                                    <li><a href="#"><b>2</b>  In transit</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="stock-box">
                            <div className="box-head sky-blue-bg">
                                <h4><span>NA123456</span></h4>
                                <div className="close-icon">
                                    <span>
                                        <img src="./static/images/refresh-icon.png" alt="refresh" className="refre-img" />
                                        <img src="./static/images/refresh-icon-hover.png" alt="refresh" className="refre-hover" />
                                    </span>
                                    <span>
                                        <img src="./static/images/close-icon.png" alt="refresh" className="close-img" />
                                        <img src="./static/images/close-icon-hover.png" alt="refresh" className="close-hover" />
                                    </span>

                                </div>
                            </div>
                            <div className="box-middle">
                                <ul>
                                    <li><a href="#"><b>4</b>  Paddock(s)</a></li>
                                    <li><a href="#"><b>2</b> Mob(s)</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="stock-box">
                            <div className="box-head dark-org-bg">
                                <h4><span>Aglive Pty Ltd</span></h4>
                                <div className="close-icon">
                                    <span>
                                        <img src="./static/images/refresh-icon.png" alt="refresh" className="refre-img" />
                                        <img src="./static/images/refresh-icon-hover.png" alt="refresh" className="refre-hover" />
                                    </span>
                                    <span>
                                        <img src="./static/images/close-icon.png" alt="refresh" className="close-img" />
                                        <img src="./static/images/close-icon-hover.png" alt="refresh" className="close-hover" />
                                    </span>

                                </div>
                            </div>
                            <div className="box-middle">
                                <ul>
                                    <li><a href="#"><b>4</b>  Contact(s)</a></li>
                                    <li><a href="#"><b>2</b>  Aglive User(s)</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="stock-box">
                            <div className="box-head light-org-bg">
                                <h4>4<span>PIC</span></h4>
                                <div className="close-icon">
                                    <span>
                                        <img src="./static/images/refresh-icon.png" alt="refresh" className="refre-img" />
                                        <img src="./static/images/refresh-icon-hover.png" alt="refresh" className="refre-hover" />
                                    </span>
                                    <span>
                                        <img src="./static/images/close-icon.png" alt="refresh" className="close-img" />
                                        <img src="./static/images/close-icon-hover.png" alt="refresh" className="close-hover" />
                                    </span>

                                </div>
                            </div>
                            <div className="box-middle">
                                <ul>
                                    <li><a href="#"><b>4</b>  Cattle(s)</a></li>
                                    <li><a href="#"> <b>6</b>  Sheep(s)</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="stock-box">
                            <div className="box-head yellow-bg">
                                <h4><span>Report</span></h4>
                                <div className="close-icon">
                                    <span>
                                        <img src="./static/images/refresh-icon.png" alt="refresh" className="refre-img" />
                                        <img src="./static/images/refresh-icon-hover.png" alt="refresh" className="refre-hover" />
                                    </span>
                                    <span>
                                        <img src="./static/images/close-icon.png" alt="refresh" className="close-img" />
                                        <img src="./static/images/close-icon-hover.png" alt="refresh" className="close-hover" />
                                    </span>

                                </div>
                            </div>
                            <div className="box-middle">
                                <ul>
                                    <li><a href="#"><b></b>Stock Holding</a></li>
                                    <li><a href="#"><b></b> eNVD Summary</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="clear"></div>
            </div>
        );
    }
}

export default Dashboard;