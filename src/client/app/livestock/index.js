'use strict';

/**************************
 * expose Livestock page
 * Displays livestock from selected PIC from PIC Menu.
 * Shows all actions that can be performed irrespective of livestock selection
 * **************************** */

import React, { Component } from 'react';

class Livestock extends Component {
    render() {
        return (
            <div className="dash-right">
                <div className="dash-right-top">
                    <div className="live-detail-main">
                        <div className="configure-head"> <span>Livestock</span> </div>
                        <div className="l-stock-top-btn">
                            <ul>
                                <li><a href="javascript:void(0)" className="ripple-effect filter-btn" id="filter-btn1">Filters</a></li>
                                <li><a href="javascript:void(0)" className="ripple-effect filter-btn clear-btn">Clear selection </a></li>
                                <li><a href="#" className="ripple-effect filter-btn to-l-stock">2 Livestocks</a>
                                    <a href="#" className="ripple-effect dropdown-toggle caret2 caret-cover" data-toggle="dropdown"> <span><img src="./static/images/caret-white.png" /></span></a>
                                    <ul className="dropdown-menu mega-dropdown-menu row action-menu livestock-btn">
                                        <li className="col-md-4">
                                            <ul>
                                                <li><a href="modify-livestock.html">Modify</a></li>
                                                <li><a href="#">Delete</a></li>
                                                <li><a href="#">Add Comment</a></li>
                                                <li><a href="#">Export as CSV</a></li>
                                            </ul>
                                            <ul>
                                                <li className="dropdown-header">Carcass</li>
                                                <li><a href="#">Record Carcass</a></li>
                                                <li><a href="#">Show Carcass</a></li>
                                            </ul>
                                        </li>
                                        <li className="col-md-4">
                                            <ul>
                                                <li className="dropdown-header">Weight</li>
                                                <li><a href="#">Show Weight History</a></li>
                                            </ul>
                                            <ul>
                                                <li className="dropdown-header">Treatment</li>
                                                <li><a href="#">Record Treatmen</a></li>
                                                <li><a href="#">Show Treatment History</a></li>

                                            </ul>
                                        </li>
                                        <li className="col-md-4">
                                            <ul>
                                                <li className="dropdown-header">Trait</li>
                                                <li><a href="#">Record Trait</a></li>
                                                <li><a href="#">Show Trait Details</a></li>
                                            </ul>
                                            <ul>
                                                <li className="dropdown-header">Movement</li>
                                                <li><a href="#">Start eNVD</a></li>
                                                <li><a href="#">Move to Paddock or Pen</a></li>
                                                <li><a href="#">Sale Contract</a></li>
                                            </ul>
                                        </li>

                                    </ul>
                                </li>
                                <li><a href="javascript:void(0)" className="ripple-effect filter-btn">Select all</a></li>
                                <li><a href="#" className="ripple-effect search-btn">Actions</a>
                                    <a href="#" className="ripple-effect dropdown-toggle caret2" data-toggle="dropdown"> <span><img src="./static/images/caret-white.png" /></span></a>
                                    <ul className="dropdown-menu mega-dropdown-menu row action-menu">
                                        <li className="col-md-3">
                                            <ul>
                                                <li><a href="#"> Delete All</a></li>
                                                <li><a href="#"> Export as CSV</a></li>
                                            </ul>
                                            <ul>
                                                <li className="dropdown-header">Import from CSV</li>
                                                <li><a href="#"> RFIDs Import</a></li>
                                                <li><a href="#"> Mob Import</a></li>
                                            </ul>
                                        </li>
                                        <li className="col-md-3">
                                            <ul>
                                                <li className="dropdown-header">Carcass</li>
                                                <li><a href="#"> Record Carcass</a></li>
                                                <li><a href="#"> Show Carcass</a></li>
                                            </ul>
                                            <ul>
                                                <li className="dropdown-header">Weight</li>
                                                <li><a href="#"> Show Weight History</a></li>

                                            </ul>
                                        </li>
                                        <li className="col-md-3">
                                            <ul>
                                                <li className="dropdown-header">Treatment</li>
                                                <li><a href="#"> Record Treatment</a></li>
                                                <li><a href="#"> Show Treatment History</a></li>
                                            </ul>
                                            <ul>
                                                <li className="dropdown-header">Trait</li>
                                                <li><a href="#"> Record Trait</a></li>
                                                <li><a href="#"> Show Trait Details</a></li>
                                            </ul>
                                        </li>
                                        <li className="col-md-3">
                                            <ul>
                                                <li className="dropdown-header">Movement</li>
                                                <li><a href="#"> Start eNVD</a></li>
                                                <li><a href="#"> Move to Paddock or Pen</a></li>
                                                <li><a href="#"> Sale Contract</a></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="stock-list">
                    <div className="stock-list-cover">
                        <div className="livestock-content">
                            <div className="cattle-text">
                                <span>4 Cattle(s), 6 Sheep(s) Total 10 Livestock</span>
                                <a href="#"><img src="./static/images/quest-mark-icon.png" alt="icon" />Help</a>
                            </div>
                            <div className="grid-main">
                                <table className="livestock">
                                    <thead>
                                        <tr>
                                            <th className="check-btn">
                                                <div className="form-group">
                                                    <div className=" check-btn">
                                                        <div className="">
                                                            <div className="checkbox">
                                                                <label>
                                                                    <input type="checkbox" />
                                                                    <span className="checkbox-material">

                                                                    </span>
                                                                </label>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </th>
                                            <th><div className="caret-cover"><span className="caret2"><img src="./static/images/caret-white.png" /></span><span className="s-carret"><img src="./static/images/caret-white.png" /></span></div>RFID</th>
                                            <th><div className="caret-cover"><span className="caret2"><img src="./static/images/caret-white.png" /></span><span className="s-carret"><img src="./static/images/caret-white.png" /></span></div>NLIS</th>
                                            <th><div className="caret-cover"><span className="caret2"><img src="./static/images/caret-white.png" /></span><span className="s-carret"><img src="./static/images/caret-white.png" /></span></div>Visual TAG</th>
                                            <th><div className="caret-cover"><span className="caret2"><img src="./static/images/caret-white.png" /></span><span className="s-carret"><img src="./static/images/caret-white.png" /></span></div>Weight</th>
                                            <th><div className="caret-cover"><span className="caret2"><img src="./static/images/caret-white.png" /></span><span className="s-carret"><img src="./static/images/caret-white.png" /></span></div>Age</th>
                                            <th><div className="caret-cover"><span className="caret2"><img src="./static/images/caret-white.png" /></span><span className="s-carret"><img src="./static/images/caret-white.png" /></span></div>Paddock</th>
                                            <th><div className="caret-cover"><span className="caret2"><img src="./static/images/caret-white.png" /></span><span className="s-carret"><img src="./static/images/caret-white.png" /></span></div>MOB</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="tr-bg">
                                            <td>
                                                <a href="#">
                                                    <div className="form-group">
                                                        <div className=" check-btn">
                                                            <div className="">
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <input type="checkbox" />
                                                                        <span className="checkbox-material"> </span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span><img src="./static/images/table-icon-yellow.png" alt="icon" /></span>
                                                </a>
                                            </td>
                                            <td><a href="modify-livestock.html">951000303627114</a></td>
                                            <td>NA123456 627114</td>
                                            <td>V100</td>
                                            <td>100 KG</td>
                                            <td>1.2 year</td>
                                            <td>South</td>
                                            <td>Mt Compass</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <a href="#">
                                                    <div className="form-group">
                                                        <div className=" check-btn">
                                                            <div className="">
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <input type="checkbox" />
                                                                        <span className="checkbox-material">

                                                                        </span>
                                                                    </label>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span><img src="./static/images/table-icon-yellow.png" alt="icon" /></span>
                                                </a>
                                            </td>
                                            <td><a href="#">951000303627114</a></td>
                                            <td>NA123456 627114</td>
                                            <td>V100</td>
                                            <td>100 KG</td>
                                            <td>1.2 year</td>
                                            <td>South</td>
                                            <td>Mt Compass</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <a href="#">
                                                    <div className="form-group">
                                                        <div className=" check-btn">
                                                            <div className="">
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <input type="checkbox" />
                                                                        <span className="checkbox-material">

                                                                        </span>
                                                                    </label>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span><img src="./static/images/table-icon-blue.png" alt="icon" /></span>
                                                </a>
                                            </td>
                                            <td><a href="#">951000303627114</a></td>
                                            <td>NA123456 627114</td>
                                            <td>V100</td>
                                            <td>100 KG</td>
                                            <td>1.2 year</td>
                                            <td>South</td>
                                            <td>Mt Compass</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <a href="#">
                                                    <div className="form-group">
                                                        <div className=" check-btn">
                                                            <div className="">
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <input type="checkbox" />
                                                                        <span className="checkbox-material">

                                                                        </span>
                                                                    </label>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span><img src="./static/images/table-icon-yellow.png" alt="icon" /></span>
                                                </a>
                                            </td>
                                            <td><a href="#">951000303627114</a></td>
                                            <td>NA123456 627114</td>
                                            <td>V100</td>
                                            <td>100 KG</td>
                                            <td>1.2 year</td>
                                            <td>South</td>
                                            <td>Mt Compass</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <a href="#">
                                                    <div className="form-group">
                                                        <div className=" check-btn">
                                                            <div className="">
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <input type="checkbox" />
                                                                        <span className="checkbox-material">

                                                                        </span>
                                                                    </label>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span><img src="./static/images/table-icon-blue.png" alt="icon" /></span>
                                                </a>
                                            </td>
                                            <td><a href="#">951000303627114</a></td>
                                            <td>NA123456 627114</td>
                                            <td>V100</td>
                                            <td>100 KG</td>
                                            <td>1.2 year</td>
                                            <td>South</td>
                                            <td>Mt Compass</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <a href="#">
                                                    <div className="form-group">
                                                        <div className=" check-btn">
                                                            <div className="">
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <input type="checkbox" />
                                                                        <span className="checkbox-material">

                                                                        </span>
                                                                    </label>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span><img src="./static/images/table-icon-yellow.png" alt="icon" /></span>
                                                </a>
                                            </td>
                                            <td><a href="#">951000303627114</a></td>
                                            <td>NA123456 627114</td>
                                            <td>V100</td>
                                            <td>100 KG</td>
                                            <td>1.2 year</td>
                                            <td>South</td>
                                            <td>Mt Compass</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <a href="#">
                                                    <div className="form-group">
                                                        <div className=" check-btn">
                                                            <div className="">
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <input type="checkbox" />
                                                                        <span className="checkbox-material">

                                                                        </span>
                                                                    </label>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span><img src="./static/images/table-icon-blue.png" alt="icon" /></span>
                                                </a>
                                            </td>
                                            <td><a href="#">951000303627114</a></td>
                                            <td>NA123456 627114</td>
                                            <td>V100</td>
                                            <td>100 KG</td>
                                            <td>1.2 year</td>
                                            <td>South</td>
                                            <td>Mt Compass</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <a href="#">
                                                    <div className="form-group">
                                                        <div className=" check-btn">
                                                            <div className="">
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <input type="checkbox" />
                                                                        <span className="checkbox-material">

                                                                        </span>
                                                                    </label>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span><img src="./static/images/table-icon-blue.png" alt="icon" /></span>
                                                </a>
                                            </td>
                                            <td><a href="#">951000303627114</a></td>
                                            <td>NA123456 627114</td>
                                            <td>V100</td>
                                            <td>100 KG</td>
                                            <td>1.2 year</td>
                                            <td>South</td>
                                            <td>Mt Compass</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <a href="#">
                                                    <div className="form-group">
                                                        <div className=" check-btn">
                                                            <div className="">
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <input type="checkbox" />
                                                                        <span className="checkbox-material">

                                                                        </span>
                                                                    </label>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span><img src="./static/images/table-icon-blue.png" alt="icon" /></span>
                                                </a>
                                            </td>
                                            <td><a href="#">951000303627114</a></td>
                                            <td>NA123456 627114</td>
                                            <td>V100</td>
                                            <td>100 KG</td>
                                            <td>1.2 year</td>
                                            <td>South</td>
                                            <td>Mt Compass</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <a href="#">
                                                    <div className="form-group">
                                                        <div className=" check-btn">
                                                            <div className="">
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <input type="checkbox" />
                                                                        <span className="checkbox-material">

                                                                        </span>
                                                                    </label>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span><img src="./static/images/table-icon-blue.png" alt="icon" /></span>
                                                </a>
                                            </td>

                                            <td><a href="#">951000303627114</a></td>
                                            <td>NA123456 627114</td>
                                            <td>V100</td>
                                            <td>100 KG</td>
                                            <td>1.2 year</td>
                                            <td>South</td>
                                            <td>Mt Compass</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="table-bottom">
                                    <div className="item-page">
                                        <div className="form-group">
                                            <select id="select111" className="form-control">
                                                <option>10</option>
                                                <option>2</option>
                                                <option>3</option>
                                                <option>4</option>
                                                <option>5</option>
                                            </select>
                                            <span className="caret2"><img src="./static/images/caret-gray.png" /></span>
                                        </div>
                                    </div>
                                    <span>Items per page</span>
                                    <b> 4 Items</b>
                                    <div className="prev-next-text">
                                        <a href="#">Previous</a>
                                        <a href="#">next</a>
                                    </div>
                                </div>
                            </div>
                            <div className="filter-open-box">

                                <h2><img src="./static/images/filter-head-icon.png" alt="icon" />Filters <div className="f-close"><img src="./static/images/close-icon2.png" alt="close-icon" /></div></h2>
                                <div className="livestock-status">
                                    <h5>Livestock Status </h5>
                                    <div className="form-group">
                                        <select className="form-control" id="select1112">
                                            <option>Live</option>
                                            <option>2</option>
                                            <option>3</option>
                                            <option>4</option>
                                            <option>5</option>
                                        </select>
                                        <span><img src="./static/images/caret-gray.png" alt="caret" /></span>
                                    </div>
                                </div>
                                <div className="livestock-status">
                                    <h5>Activity Status</h5>
                                    <div className="form-group">
                                        <select className="form-control" id="select1113">
                                            <option>Available</option>
                                            <option>2</option>
                                            <option>3</option>
                                            <option>4</option>
                                            <option>5</option>
                                        </select>
                                        <span><img src="./static/images/caret-gray.png" alt="caret" /></span>
                                    </div>
                                </div>
                                <div className="livestock-status">
                                    <h5>Other</h5>
                                    <div className="form-group">
                                        <select className="form-control" id="select1114">
                                            <option>All Livestock</option>
                                            <option>2</option>
                                            <option>3</option>
                                            <option>4</option>
                                            <option>5</option>
                                        </select>
                                        <span><img src="./static/images/caret-gray.png" alt="caret" /></span>
                                    </div>
                                </div>
                                <div className="f-btn"><a href="#" className="ripple-effect filter-btn">Clear Filter</a></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="clear"></div>
            </div>
        );
    }
}

export default Livestock;