'use strict';

/******************************************
 * Map all actions and props to feed component 
 ******************************************/

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';

import Button from '../../../../lib/core-components/Button';
import Dropdown from '../../../../lib/core-components/Dropdown';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import DateTimePicker from '../../../../lib/core-components/DatetimePicker';
import NumberInput from '../../../../lib/core-components/NumberInput';
import Grid from '../../../../lib/core-components/Grid';
import CheckBox from '../../../../lib/core-components/CheckBox';
import ContactAutoComplete from '../../../../lib/wrapper-components/ContactAutoComplete';

import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

import { notifyToaster, openFindContact, hideFindContact } from '../../../common/actions';
import { getMenuIds } from '../../../../../shared/index';
import { setModule } from '../../../private/header/actions';

import { getRecordFeedData, saveRecordFeed } from '../../../../services/private/feed';

class RecordFeed extends Component {
    constructor(props) {
        super(props);

        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.recordFeedSchema = ['feed', 'enclosure', 'dateoffeed', 'quantity', 'cost', 'contractor'];
        this.state = {
            key: Math.random(),
            dataFetch: false,
            isClicked: false,
            isContractor: false,
            contact: null,
            filterDDL: [],
            feed: [],
            enclosure: [],
            columns: [
                { field: 'Id', isKey: true, isSort: false, displayName: 'Feed Id' },
                { field: 'FeedName', width: '200', displayName: 'Feed', visible: true },
                { field: 'DateOfFeed', width: '150', displayName: 'Date of Feed', visible: true, format: 'datetimeformat' },
                { field: 'EnclosureName', width: '200', displayName: 'Enclosure', visible: true },
                { field: 'TotalFeedQty', width: '150', displayName: 'Feed Quantity', visible: true, format: 'qtyformat' },
                { field: 'TotalCost', width: '150', displayName: 'Cost', visible: true, format: 'currencyformat' }
            ],
            filterObj: { propertyId: this.props.topPIC.PropertyId }
        }

        this.renderHeader = this.renderHeader.bind(this);
        this.renderContent = this.renderContent.bind(this);

        this.gotoFeedSetup = this.gotoFeedSetup.bind(this);
        this.recordFeed = this.recordFeed.bind(this);
        this.onBack = this.onBack.bind(this);
        this.filterDDLChange = this.filterDDLChange.bind(this);
        this.filterNext = this.filterNext.bind(this);
        this.filterPrev = this.filterPrev.bind(this);
        this.onContactChange = this.onContactChange.bind(this);
        this.checkQuantity = this.checkQuantity.bind(this);
        this.checkCost = this.checkCost.bind(this);
        this.getGridData = this.getGridData.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }
    componentWillUnmount() {
        this.mounted = false;
    }
    componentWillMount() {
        this.mounted = true;
        let _this = this;
        getRecordFeedData(this.props.topPIC).then(function (res) {
            if (res.success)
                _this.stateSet({ dataFetch: true, enclosure: res.enclosure, feed: res.feed });
            else {
                _this.stateSet({ dataFetch: true });
                _this.notifyToaster(NOTIFY_ERROR);
            }
        }).catch(function (err) {
            _this.stateSet({ dataFetch: true });
            _this.notifyToaster(NOTIFY_ERROR);
        })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.topPIC.PropertyId != this.props.topPIC.PropertyId)
            this.onBack();
        
        if (nextProps.topSearch == undefined) {
            return;
        }
        
        this.refs.feedGrid.onSearchChange(nextProps.topSearch.searchText);
    }

    // handle save button click
    recordFeed() {
        
        let isFormValid = isValidForm(this.recordFeedSchema, this.refs);
        let contactObj = this.refs.contact.getValue();
        if (!isFormValid || !contactObj) {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let obj = getForm(this.recordFeedSchema, this.refs);
        obj.contact = contactObj;
        obj.propertyId = this.props.topPIC.PropertyId;

        let _this = this;
        return saveRecordFeed(obj).then(function (res) {
            if (res.success) {
                _this.props.hideFindContact({ Payload: null, TargetKey: 'contact' });
                _this.stateSet({ key: Math.random(), isContractor: false, contact: null });
                _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SUCCESS });
                return true;
            }
            else {
                _this.notifyToaster(NOTIFY_ERROR);
                return false;
            }
        });
    }

    // handle Feed Setup button click
    gotoFeedSetup() {
        let menuIds = getMenuIds(null, null, [], [], true, '/feed/setup');
        this.props.setModule(menuIds.moduleId, menuIds.controlMenuId);
        browserHistory.replace('/feed/setup');
    }

    // handle back button click
    onBack() {
        browserHistory.replace('/livestock');
    }

    // handle change event of filter drop down
    filterDDLChange(value) {
        this.setState({ filterObj: { propertyId: this.props.topPIC.PropertyId, monthOfFeed: value } });
    }

    // navigate to next value of filter drop down
    filterNext() {
        let month = this.state.filterObj.monthOfFeed;
        let index = -1;
        if (month)
            index = this.state.filterDDL.findIndex(x => x.MonthOfFeed == month);

        let obj = this.state.filterDDL[index + 1];
        if (obj)
            this.filterDDLChange(obj.MonthOfFeed);
        else
            this.filterDDLChange(this.state.filterDDL[0].MonthOfFeed);
    }

    // navigate to previous value of filter drop down
    filterPrev() {
        let month = this.state.filterObj.monthOfFeed;
        let index = this.state.filterDDL.length;
        if (month)
            index = this.state.filterDDL.findIndex(x => x.MonthOfFeed == month);

        let obj = this.state.filterDDL[index - 1];
        if (obj)
            this.filterDDLChange(obj.MonthOfFeed);
        else
            this.filterDDLChange(this.state.filterDDL[this.state.filterDDL.length - 1].MonthOfFeed);
    }

    // set contact value on change of contact selection
    onContactChange(value) {
        if (!value) {
            this.setState({ contact: null });
        }
        else if (typeof (value) == 'string' || !value.Id) {
            this.setState({ contact: null });
        }
        else {
            let data = { Id: value.Id, Email: value.Email, Mobile: value.Mobile };
            this.setState({ contact: data });
        }
    }

    // check feed quantity
    checkQuantity(value) {
        if (value > 10)
            return this.strings.CONTROLS.QUANTITY_EXCEEDED;
        else
            return null;
    }

    // check cost
    checkCost(value) {
        if (value <= 0)
            return this.strings.CONTROLS.COST_LIMIT;
        else
            return null;
    }

    // get livestock data of grid response
    getGridData(data) {
        this.stateSet({ filterDDL: data.month });
    }

    // render display recorded feed area
    renderGrid() {
        let gridProps = {
            columns: this.state.columns,
            filterObj: this.state.filterObj,
            functionName: 'recordfeed/getdataset',
            getExternalData: this.getGridData,
            selectRowMode: "none",
            sortOrder: 'desc',
            sortColumn: 'DateOfFeed',
            height: '300px'
        }
        return (<div>

            <div className="col-md-3" key={this.state.filterIndex}>
                <div className="row">
                    <Dropdown inputProps={{
                        name: 'filterDDL',
                        hintText: this.strings.CONTROLS.FILTER_DDL_PLACEHOLDER,
                        floatingLabelText: this.strings.CONTROLS.FILTER_DDL_LABEL,
                        value: this.state.filterObj.monthOfFeed != null ? this.state.filterObj.monthOfFeed : null
                    }}
                        onSelectionChange={this.filterDDLChange}
                        textField="MonthOfFeed1" valueField="MonthOfFeed" dataSource={this.state.filterDDL}
                        isClicked={this.state.isClicked} ref="filterDDL" />
                </div>
            </div>
            <div className="col-md-9">
                <div className="row">
                    <Button
                        inputProps={{
                            name: 'btnfilterPrev',
                            label: this.strings.CONTROLS.PREVIOUS_LABEL,
                            className: 'button1Style button30Style mr10',
                        }}
                        onClick={this.filterPrev}
                    ></Button>

                    <Button
                        inputProps={{
                            name: 'btnfilterNext',
                            label: this.strings.CONTROLS.NEXT_LABEL,
                            className: 'button1Style button30Style',
                        }}
                        onClick={this.filterNext}
                    ></Button>
                </div>
            </div>
            <div className="clear"></div>
            <Grid ref="feedGrid" {...gridProps} />
        </div>);
    }

    // render entry form area
    renderForm() {
        return (
            <div>
                <Dropdown inputProps={{
                    name: 'feed',
                    hintText: this.state.dataFetch ? this.strings.CONTROLS.FEED_PLACEHOLDER : 'Loading...',
                    floatingLabelText: this.strings.CONTROLS.FEED_LABEL
                }}
                    eReq={this.strings.CONTROLS.FEED_REQ_MESSAGE}
                    textField="Name" valueField="Id" dataSource={this.state.feed}
                    isClicked={this.state.isClicked} ref="feed" />
                <Dropdown inputProps={{
                    name: 'enclosure',
                    hintText: this.state.dataFetch ? this.strings.CONTROLS.ENCLOSURE_PLACEHOLDER : 'Loading...',
                    floatingLabelText: this.strings.CONTROLS.ENCLOSURE_LABEL
                }}
                    eReq={this.strings.CONTROLS.ENCLOSURE_REQ_MESSAGE}
                    textField="NameCode" valueField="Id" dataSource={this.state.enclosure}
                    isClicked={this.state.isClicked} ref="enclosure" />
                <DateTimePicker inputProps={{
                    name: 'dateoffeed',
                    placeholder: this.strings.CONTROLS.FEED_DATE_PLACEHOLDER,
                    label: this.strings.CONTROLS.FEED_DATE_LABEL
                }}
                    eReq={this.strings.CONTROLS.FEED_DATE_REQ_MESSAGE}
                    dateFilter={{ isBefore: true, isIncludeToday: true }}
                    defaultValue={new Date()}
                    isClicked={this.state.isClicked} ref="dateoffeed" />
                <NumberInput inputProps={{
                    name: 'quantity',
                    hintText: this.strings.CONTROLS.QUANTITY_PLACEHOLDER,
                    floatingLabelText: this.strings.CONTROLS.QUANTITY_LABEL
                }}
                    maxLength={10} eClientValidation={this.checkQuantity}
                    eReq={this.strings.CONTROLS.QUANTITY_REQ_MESSAGE}
                    numberType="decimal" isClicked={this.state.isClicked} ref="quantity" />
                <NumberInput inputProps={{
                    name: 'cost',
                    hintText: this.strings.CONTROLS.COST_PLACEHOLDER,
                    floatingLabelText: this.strings.CONTROLS.COST_LABEL
                }}
                    maxLength={10} eClientValidation={this.checkCost}
                    eReq={this.strings.CONTROLS.COST_REQ_MESSAGE}
                    numberType="decimal" isClicked={this.state.isClicked} ref="cost" />
                <CheckBox inputProps={{
                    name: 'contractor',
                    label: this.strings.CONTROLS.CONTRACTOR_LABEL,
                    defaultChecked: false
                }}
                    onCheck={(value) => {
                        this.setState({ isContractor: value, contact: null });
                        this.props.hideFindContact({ Payload: null, TargetKey: 'contact' });
                    }}
                    className='mt20'
                    isClicked={this.state.isClicked} ref="contractor" />
                <div key={this.state.isContractor}>
                    <ContactAutoComplete inputProps={{
                        name: 'contact',
                        hintText: this.strings.CONTROLS.FEED_CONTACT_PLACEHOLDER,
                        floatingLabelText: this.strings.CONTROLS.FEED_CONTACT_LABEL
                    }}
                        targetKey='contact' eInvalid={null}
                        appendUrl={!this.state.isContractor ? ("&companyid=" + this.props.topPIC.CompanyId) : ''}
                        companyName={!this.state.isContractor ? this.props.topPIC.CompanyName : null}
                        onSelectionChange={this.onContactChange}
                        isClicked={this.state.isClicked}
                        findContact={this.props.findContact}
                        openFindContact={this.props.openFindContact} ref="contact" />
                    {this.state.contact ?
                        <div style={{ lineHeight: '20px' }}>
                            <div><b>{this.strings.CONTROLS.EMAIL} :</b> {this.state.contact.Email}</div>
                            <div><b>{this.strings.CONTROLS.MOBILE} :</b> {this.state.contact.Mobile}</div>
                        </div> : null}
                </div>
            </div>);
    }

    // render content area
    renderContent() {
        return (<div key={this.state.key} className="stock-list">
            <div className="stock-list-cover">
                <div className="livestock-content">
                    <div className="cattle-text">
                        <span>{this.strings.DESCRIPTION}</span>
                    </div>
                    <div className="clear" ></div>
                    <div className="row">
                        <div className="col-md-5">
                            {this.renderForm()}
                        </div>
                        <div className="col-md-7">
                            {this.renderGrid()}
                        </div>
                    </div>
                </div>
            </div>
        </div>);

    }

    // render header area
    renderHeader() {
        return (<div className="dash-right-top">
            <div className="live-detail-main">
                <div className="configure-head">
                    <span>{this.strings.TITLE}</span>
                </div>
                <div className="l-stock-top-btn">
                    <ul>
                        <li>
                            <Button
                                inputProps={{
                                    name: 'btnFeedSetup',
                                    label: this.strings.CONTROLS.SETUP_FEED_LABEL,
                                    className: 'button3Style button30Style'
                                }}
                                onClick={this.gotoFeedSetup} ></Button>
                        </li>
                        <li>
                            <Button
                                inputProps={{
                                    name: 'btnBack',
                                    label: this.strings.CONTROLS.CANCEL_LABEL,
                                    className: 'button1Style button30Style'
                                }}
                                onClick={this.onBack} ></Button>
                        </li>
                        <li>
                            <BusyButton
                                inputProps={{
                                    name: 'btnSave',
                                    label: this.strings.CONTROLS.SAVE_LABEL,
                                    className: 'button2Style button30Style'
                                }}
                                loaderHeight={25}
                                //redirectUrl='/livestock'
                                onClick={this.recordFeed} ></BusyButton>
                        </li>
                    </ul>
                </div>
            </div>
        </div>);
    }

    // render component
    render() {
        return (<div className="dash-right">
            {this.renderHeader()}
            <div className="clear"></div>
            {this.renderContent()}
            <div className="clear"></div>
        </div>);
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        topPIC: state.header.topPIC,
        topSearch: state.header.topSearch,
        companyId: state.authUser.CompanyId,
        companyName: state.authUser.CompanyName,
        isSiteAdmin: state.authUser.IsSiteAdministrator,
        isSuperUser: state.authUser.IsSuperUser,
        findContact: state.common.findContact
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        notifyToaster: (type, options) => {
            dispatch(notifyToaster(type, options))
        },
        setModule: (moduleId, controlMenuId) => {
            dispatch(setModule(moduleId, controlMenuId));
        },
        openFindContact: (payload) => {
            dispatch(openFindContact(payload))
        },
        hideFindContact: (payload) => {
            dispatch(hideFindContact(payload))
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Decorator('RecordFeed', RecordFeed));