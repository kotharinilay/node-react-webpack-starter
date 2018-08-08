'use strict';

/**************************
 * Navigation actions will be listed at here
 * **************************** */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import Input from '../../../lib/core-components/Input';
import Decorator from '../../../lib/wrapper-components/AbstractDecorator';
import { getSetupMenu } from '../../../services/private/setup';
import { map, groupBy, values } from 'lodash';
import { contains } from '../../../../shared/format/string';
import { getCurrentURL } from '../../../lib/index';
import { Scrollbars } from '../../../../../assets/js/react-custom-scrollbars';
// import {
//     openConfirmPopup, hideConfirmPopup, notifyToaster,
//     openFindCompany, openFindPIC, openFindContact
// } from '../../common/actions';

class UserSetup extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;

        this.state = {
            dataFetch: true,
            menuList: [],
            inputKey: Math.random(),
            displayClear: false
        }

        this.strings = this.props.strings;
        this.urlPath = getCurrentURL();
        this.menuList = [];

        this.filterMenu = this.filterMenu.bind(this);
        this.clearMenu = this.clearMenu.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    // Get setup menu list
    componentWillMount() {
        // this.mounted = true;
        // this.bindSetupMenu();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // Check setupMenuKey props to bind setup menu when click on navigation link
    componentWillReceiveProps(nextProps) {
        // if (nextProps.setupMenuKey != this.props.setupMenuKey) {
        //     this.bindSetupMenu();
        // }
    }

    // Bind setup menus
    bindSetupMenu() {
        // let _this = this;

        // return getSetupMenu(this.props.controlMenuId).then(function (res) {
        //     if (res.success) {
        //         _this.menuList = res.setupMenu;
        //         let selected = _this.menuList.filter(m => {
        //             return m.RedirectURL == _this.urlPath || contains(_this.urlPath, m.RedirectURL + '/');
        //         });

        //         if (selected.length == 0)
        //             browserHistory.push(_this.menuList[0].RedirectURL);
        //     }
        //     else if (res.badRequest) {
        //         _this.menuList = null;
        //         _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
        //     }
        //     _this.stateSet({ dataFetch: true, menuList: _this.menuList });
        //     return true;
        // }).catch(function (err) {
        //     _this.stateSet({ dataFetch: true });
        //     _this.props.notify.error();
        //     return false;
        // });
    }

    // Filter setup menu
    filterMenu(value = '') {
        // let filterMenu = this.menuList.filter(m => {
        //     return contains(m.Name.toLowerCase(), value.toLowerCase());
        // })
        // let SetupSearch = this.refs.SetupSearch;
        // SetupSearch.updateInputStatus();
        // this.stateSet({ menuList: filterMenu, displayClear: value.length == 0 ? false : true });
    }

    // Clear setup menu
    clearMenu() {
        // this.filterMenu();
        // this.stateSet({ inputKey: Math.random() });
    }

    // Return selected menu class name
    getMenuSelection(redirectURL) {
        // let selectedClass = "filter-btn";
        // if (this.urlPath == redirectURL)
        //     return selectedClass;
        // else if (contains(this.urlPath, redirectURL + '/'))
        //     return selectedClass;
        // else
        //     return "";
    }

    // Render setup menu list
    renderSetupMenu() {
        return (<div className="set-left-confi"><span><a className="filter-btn" href="/usersetup/species">Species</a></span></div>);
        /*let { strings } = this.props;
        if (this.state.dataFetch) {
            if (this.state.menuList.length > 0) {
                let menuList = values(groupBy(this.state.menuList, 'GroupSortOrder'));
                this.urlPath = getCurrentURL();
                return (<Scrollbars autoHide autoHeight
                    autoHeightMax={(typeof document === 'undefined') ? 500 : (document.body.clientHeight - 200)}>
                    {map(menuList, (group, index) => {
                        if (group.length > 0) {
                            return (<div key={index} className="set-left-confi">
                                <h2><img src={this.siteURL + "/static/images/modules/" + group[0].GroupIcon} alt="icon" />
                                    {group[0].GroupName}
                                </h2>
                                {map(group, (menu, indexMenu) => {
                                    return (<span key={indexMenu}><Link to={menu.RedirectURL} className={this.getMenuSelection(menu.RedirectURL)}>
                                        {menu.Name}
                                    </Link></span>);
                                })}
                            </div>);
                        }
                    })}
                </Scrollbars>);
            }
            else {
                return (<div className="set-left-confi">{strings.NO_MENU_FOUND}</div>);
            }
        }
        else {
            return (<div className="set-left-confi">Loading...</div>);
        }*/
    }

    // Render component
    render() {
        const childrenWithProps = React.Children.map(this.props.children,
            (child) => React.cloneElement(child, {
                ...this.props
            })
        );

        return (
            <div className="dash-right">
                {childrenWithProps}
                <div className="setup-main-inner">
                    <div className="filter-open-box">
                        <h2><img src={this.siteURL + "/static/images/setting-icon.png"} alt="icon" />{this.props.strings.SETUP_TITLE}</h2>
                        <div className="set-left-search" key={this.state.inputKey}>
                            <Input inputProps={{
                                name: 'SetupSearch',
                                id: 'SetupSearch',
                                hintText: this.props.strings.SEARCH_LABEL
                            }}
                                onChangeInput={this.filterMenu}
                                ref="SetupSearch" />
                            {this.state.displayClear ?
                                <a href="javascript:void(0)" className="btnClear" onClick={() => this.clearMenu()}>×</a> : null}
                        </div>
                        {this.renderSetupMenu()}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        //searchText: state.header.searchText,
        controlMenuId: state.header.controlMenuId,
        //findCompany: state.common.findCompany,
        setupMenuKey: state.header.setupMenuKey
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // openConfirmPopup: (info) => {
        //     dispatch(openConfirmPopup(info))
        // },
        // hideConfirmPopup: (info) => {
        //     dispatch(hideConfirmPopup(info))
        // },
        // notifyToaster: (type, options) => {
        //     dispatch(notifyToaster(type, options))
        // },
        // openFindCompany: (payload) => {
        //     dispatch(openFindCompany(payload))
        // },
        // openFindPIC: (payload) => {
        //     dispatch(openFindPIC(payload))
        // },
        // openFindContact: (payload) => {
        //     dispatch(openFindContact(payload))
        // }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Decorator('UserSetup', UserSetup));