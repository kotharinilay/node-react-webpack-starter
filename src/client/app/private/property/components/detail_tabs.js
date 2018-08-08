'use strict';

/**************************
 * Detail page for property (Add/Edit)
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { map, forEach as _forEach, isEmpty as _isEmpty } from 'lodash';

import Input from '../../../../lib/core-components/Input';
import Dropdown from '../../../../lib/core-components/Dropdown';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';
import CompanyHierarchy from '../../../common/companyhierarchy/index';

import TabPIC from './tab_pic';
import TabAccreditation from './tab_accreditation';
import TabEnclosure from './tab_enclosure';
import TabMap from './tab_map';
import TabAccess from './tab_access';

import { isUUID } from '../../../../../shared/format/string';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { checkDuplicatePIC } from '../../../../services/private/common';
import { saveProperty, getPropertyDetail } from '../../../../services/private/property';
import { validateNlisCredential, picErpStatus } from '../../../../services/public/nlis';
import { NOTIFY_SUCCESS, NOTIFY_WARNING, NOTIFY_ERROR } from '../../../common/actiontypes';
import { picValidation } from '../../../../../shared/index';

import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
require('rc-tabs/assets/index.css');

import { Scrollbars } from '../../../../../../assets/js/react-custom-scrollbars';
import ToolTip from 'react-portal-tooltip'

class DetailTabs extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.propertySchema = ['PropertyTypeId', 'PIC', 'Name'];

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;
        this.addMode = (this.props.detail == 'new');
        this.state = {
            isClicked: false,
            error: null,
            dataFetch: false,
            enclosureData: [],
            enclosureCount: 0,
            enclosureMap: { inserted: [], deleted: [] }, // Ids of enclosures to manage fence icon in Enclosure Tab
            tabKey: 'tabPIC',
            isTooltipActive: false,
            mapCenterCords: "-25.363882,131.044922",
            hierarchyIds: null,
            NLISStatus: null
        }

        this.data = null;

        this.propertyTypeData = [];
        this.uomData = [];
        this.companyHierarchy = null;
        this.property = null;
        this.PIC = null;

        this.validatePropertyDetails = this.validatePropertyDetails.bind(this);
        this.savePropertyClick = this.savePropertyClick.bind(this);
        this.saveProperty = this.saveProperty.bind(this);
        this.tabChanged = this.tabChanged.bind(this);
        this.hierarchyChange = this.hierarchyChange.bind(this);
        this.getHierarchyDetails = this.getHierarchyDetails.bind(this);
        this.validatePIC = this.validatePIC.bind(this);
        this.propertyTypeChange = this.propertyTypeChange.bind(this);
        this.updateCenterCords = this.updateCenterCords.bind(this);
        this.updateEnclMapDetails = this.updateEnclMapDetails.bind(this);
        this.validateNLISCredentials = this.validateNLISCredentials.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }
    componentWillUnmount() {
        this.mounted = false;
    }

    // Get details for edit mode
    componentWillMount() {
        this.mounted = true;
        if (!this.addMode && !isUUID(this.props.detail)) {
            this.props.onBack();
        }
        let _this = this;
        if (this.addMode) {
            getPropertyDetail(null).then(function (res) {
                if (res.success) {
                    _this.propertyTypeData = res.data.propertyTypeData;
                    _this.uomData = res.data.uomData;
                    _this.stateSet({ dataFetch: true });
                }
                else if (res.badRequest) {
                    _this.stateSet({ dataFetch: true });
                    _this.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                }
            }).catch(function (err) {
                _this.stateSet({ dataFetch: true });
                _this.props.notifyToaster(NOTIFY_ERROR);
            });
        }
        else {
            getPropertyDetail(this.props.detail).then(function (res) {
                if (res.success) {
                    _this.propertyTypeData = res.data.propertyTypeData;
                    _this.companyHierarchy = res.data.companyHierarchy;
                    _this.property = res.data.property;
                    _this.PIC = res.data.PIC;
                    _this.Accreditation = res.data.accreditation;
                    _this.Enclosure = res.data.enclosure;
                    _this.Access = res.data.access;
                    _this.InActiveAccreditation = res.data.inActiveAccreditation;
                    _this.uomData = res.data.uomData;
                    _this.Map = { property: res.data.property, enclosure: res.data.enclosure.data }
                    let defaultGPS = res.data.property.DefaultGPS ? res.data.property.DefaultGPS : "-25.363882,131.044922";
                    _this.stateSet({ mapCenterCords: defaultGPS, enclosureCount: res.data.enclosure.total, enclosureData: res.data.enclosure.data, dataFetch: true });
                }
                else if (res.badRequest) {
                    _this.stateSet({ dataFetch: true });
                    _this.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                }
            }).catch(function (err) {
                _this.stateSet({ dataFetch: true });
                _this.props.notifyToaster(NOTIFY_ERROR);
            });
        }
    }

    // Validate all property tabs
    validatePropertyDetails(retrieveStatus) {
        let { tabPIC, tabAccreditation, tabEnclosure, tabMap, tabAccess } = this.refs;

        let propertyObj = isValidForm(this.propertySchema, this.refs);
        let picObj = tabPIC.getValues();

        if (retrieveStatus && picObj && (_isEmpty(picObj.NLISUsername) || _isEmpty(picObj.NLISPassword))) {
            this.notifyToaster(NOTIFY_ERROR, { message: "NLIS Username & Password are required." });
            return false;
        }

        if (picObj == false || !propertyObj) {
            let updateState = false;
            let key = 'tabPIC';

            if (!this.state.isClicked)
                updateState = true;
            if (picObj == false)
                updateState = true;
            else
                key = this.state.tabKey;

            if (updateState)
                this.setState({ tabKey: key, isClicked: true });

            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let hierarchyObj = this.refs.CompanyHierarchy.getValues();
        if (hierarchyObj == false) {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        propertyObj = getForm(this.propertySchema, this.refs);
        propertyObj.PIC = propertyObj.PIC.toUpperCase();

        let accreditationObj = tabAccreditation ? tabAccreditation.getValues() : { data: [], deletedData: this.InActiveAccreditation, updateAccreditationDB: false };
        let enclosureObj = tabEnclosure ? tabEnclosure.getValues() : { data: [], updateEnclosureDB: false };
        let mapObj = tabMap ? tabMap.getValues() : { property: null, enclosure: [], deletedEnclosureMap: [], updateMapDB: false };
        let accessObj = tabAccess ? tabAccess.getValues(this.companyHierarchy && this.companyHierarchy.id != hierarchyObj.id ? true : false) : { data: [], deletedData: [], defaultAccessData: true }

        let finalObj = {
            property: {
                ...propertyObj,
                ...picObj,
                ...mapObj.property,
                CompanyId: hierarchyObj.id
            },
            accreditation: accreditationObj.data,
            accredDeletedData: accreditationObj.deletedData,
            enclosure: enclosureObj.data,
            updateAccreditationDB: accreditationObj.updateAccreditationDB,
            updateEnclosureDB: enclosureObj.updateEnclosureDB,
            access: accessObj.data,
            accessDeletedData: accessObj.deletedData,
            defaultAccessData: accessObj.defaultAccessData,
            enclosureMap: mapObj.enclosure,
            updateMapDB: mapObj.updateMapDB,
            deletedEnclosureMap: mapObj.deletedEnclosureMap,
            retrieveStatus: retrieveStatus
        }

        if (accessObj.defaultAccessData) {
            finalObj.companyHierarchy = {
                companyId: hierarchyObj.companyId,
                regionId: hierarchyObj.regionId,
                businessId: hierarchyObj.businessId
            }
        }

        if (!this.addMode && isUUID(this.props.detail)) {
            finalObj.property.PropertyId = this.props.detail;
            finalObj.property.AuditLogId = this.property.AuditLogId;

            if (accessObj.defaultAccessData && this.companyHierarchy.id == hierarchyObj.id) {
                finalObj.defaultAccessData = false;
            }
            else if (accessObj.defaultAccessData) {
                this.Access.map(d => {
                    if (this.companyHierarchy.id != hierarchyObj.id && d.PropertyAccessId && d.IsExternal != 1) {
                        // if company hierarchy changed then delete all records and do not delete external user
                        finalObj.accessDeletedData.push(d.PropertyAccessId);
                    }
                    else if (this.companyHierarchy.id != hierarchyObj.id && d.PropertyAccessId && d.IsExternal == 1 && hierarchyObj.id == d.CompanyId) {
                        // if selected company and external user's company are same then delete external user
                        finalObj.accessDeletedData.push(d.PropertyAccessId);
                    }
                });
            }
        }
        return finalObj;
    }

    // Save property to db
    saveProperty(finalObj) {
        let _this = this;
        return saveProperty(finalObj).then(function (res) {
            if (res.success) {
                let msgElement = null;
                let msg = '';
                if (_this.addMode)
                    msg = _this.strings.ADD_SUCCESS;
                else
                    msg = _this.strings.MODIFY_SUCCESS;

                msgElement = msg;
                if (res.validNLIS == false) {
                    msgElement = <ul>
                        <li>{msg}</li>
                        <li>{_this.strings.INVALID_NLIS}</li>
                    </ul>
                }

                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: msgElement });
                _this.props.hideConfirmPopup({ redirectUrlOnSuccess: _this.props.redirectUrl });
                if (_this.props.changeMode)
                    _this.props.changeMode();
                return true;
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                _this.props.hideConfirmPopup();
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Handle save button click
    savePropertyClick(retrieveStatus = false) {
        let finalObj = this.validatePropertyDetails(retrieveStatus);
        if (finalObj != false) {
            if (!finalObj.updateAccreditationDB && this.InActiveAccreditation && this.InActiveAccreditation.length > 0) {
                let payload = {
                    strings: this.strings.COMMON,
                    confirmText: this.strings.ACCRED_PROGRAM_SAVE_CONFIRM,
                    buttonText: this.strings.POPUP_CONTINUE,
                    cancelText: this.strings.POPUP_CANCEL,
                    redirectUrlOnSuccess: this.props.redirectUrl,
                    onConfirm: () => {
                        return this.saveProperty(finalObj).then(function (res) {
                            if (retrieveStatus)
                                browserHistory.replace('/property');
                            return res;
                        });
                    },
                    onCancel: () => { this.setState({ tabKey: 'tabAccreditation' }); this.props.hideConfirmPopup(); }
                };
                this.props.openConfirmPopup(payload);
            }
            else {
                let _this = this;
                return this.saveProperty(finalObj).then(function (res) {
                    if (retrieveStatus)
                        browserHistory.replace('/property');
                    return res;
                });
            }
        }
    }

    validateNLISCredentials() {
        let { tabPIC } = this.refs;
        let picObj = tabPIC.getValues();

        let _this = this;
        if (_isEmpty(picObj.NLISUsername) || _isEmpty(picObj.NLISPassword)) {
            _this.notifyToaster(NOTIFY_WARNING, { message: _this.strings.COMMON.NLIS_REQ });
            return;
        }

        return validateNlisCredential(picObj.NLISUsername, picObj.NLISPassword).then(function (res) {
            if (res.success) {
                _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.COMMON.NLIS_VERIFIED });
            }
            else {
                _this.notifyToaster(NOTIFY_ERROR, { message: res.error });
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    retrieveErpStatus() {
        let { tabPIC } = this.refs;
        let propertyObj = getForm(this.propertySchema, this.refs);
        let picObj = tabPIC.getValues();

        let _this = this;
        if (_isEmpty(picObj.NLISUsername) || _isEmpty(picObj.NLISPassword)) {
            _this.notifyToaster(NOTIFY_WARNING, { message: _this.strings.COMMON.NLIS_REQ });
            return;
        }
        if (_isEmpty(propertyObj.PIC)) {
            _this.notifyToaster(NOTIFY_WARNING, { message: _this.strings.COMMON.PIC_REQ });
            return;
        }

        return picErpStatus(picObj.NLISUsername, picObj.NLISPassword, propertyObj.PIC).then(function (res) {
            if (res.success) {
                if (_this.refs.tabAccreditation)
                    _this.refs.tabAccreditation.setNLIS = true;
                _this.stateSet({ NLISStatus: res.response });
                if (res.response.ProgramCode == 'LPA')
                    _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.COMMON.PIC_LPA_ACCREDITED });
                else
                    _this.notifyToaster(NOTIFY_WARNING, { message: _this.strings.COMMON.PIC_NOT_LPA_ACCREDITED });
            }
            else {
                _this.notifyToaster(NOTIFY_ERROR, { message: res.error });
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Change tab selection
    tabChanged(key) {
        this.setState({ tabKey: key });
    }

    // Handle change event of company hierarchy
    hierarchyChange(companyId, regionId, businessId, id) {
        if (this.refs.tabPIC) {
            this.refs.tabPIC.hierarchyChange(companyId, regionId, businessId);
            if (this.state.hierarchyIds)
                this.setState({ hierarchyIds: null });
        }
        else {
            this.setState({
                hierarchyIds: {
                    companyId: companyId,
                    regionId: regionId,
                    businessId: businessId
                }
            });
        }
        if (this.refs.tabAccess)
            this.refs.tabAccess.hierarchyChange(companyId, regionId, businessId, id);

    }

    // Get companyId, regionId, businessId from company hierarchy
    getHierarchyDetails() {
        let hierarchyObj = this.refs.CompanyHierarchy.getValues();
        return {
            companyId: hierarchyObj.companyId,
            regionId: hierarchyObj.regionId,
            businessId: hierarchyObj.businessId,
            id: hierarchyObj.id
        }
    }

    // validate PIC based on property type and state
    validatePIC(value = null, stateSystemCode = null) {
        let picTextBox = this.refs.PIC;

        let pic = value ? value.toUpperCase() : this.refs.PIC.fieldStatus.value.toUpperCase();
        let propertyType = this.propertyTypeData.find(p => {
            return p.Id == this.refs.PropertyTypeId.fieldStatus.value;
        });
        let state = stateSystemCode ? stateSystemCode : this.refs.tabPIC.refs.Suburb.state.stateSystemCode;

        if (picValidation(pic, propertyType ? propertyType.SystemCode : null, state)) {
            let _this = this;
            return checkDuplicatePIC(pic, this.addMode ? null : this.props.detail).then(function (res) {
                if (res.success) {
                    if (res.isDuplicatePIC)
                        picTextBox.updateInputStatus(_this.strings.COMMON.DUPLICATE_PIC, false);
                    else
                        picTextBox.updateInputStatus(null, false);
                }
                else if (res.badRequest) {
                    picTextBox.updateInputStatus(null, false);
                    _this.notifyToaster(NOTIFY_ERROR, { message: res.error });
                }
            }).catch(function (err) {
                _this.props.notifyToaster(NOTIFY_ERROR);
            });
        }
        else {
            picTextBox.updateInputStatus(this.strings.COMMON.PIC_INVALID, false);
        }
    }

    // Handle change event of property type
    propertyTypeChange() {
        this.validatePIC();
    }

    // Update center cords for map
    updateCenterCords(cords) {
        if (!this.refs.tabMap && this.addMode) {
            this.stateSet({ mapCenterCords: cords });
        }
    }

    // Update enclosure map details to display fence icon
    updateEnclMapDetails(id, isAdd = true) {
        if (isAdd) {
            let mapDetails = { ...this.state.enclosureMap };
            mapDetails.inserted.push(id);

            let index = mapDetails.deleted.findIndex(x => x == id);
            if (index != -1)
                mapDetails.deleted.splice(index, 1);

            this.setState({ enclosureMap: mapDetails });
        } else {
            let mapDetails = { ...this.state.enclosureMap };

            let index = mapDetails.inserted.findIndex(x => x == id);
            if (index != -1)
                mapDetails.inserted.splice(index, 1);
            else
                mapDetails.deleted.push(id);

            this.setState({ enclosureMap: mapDetails });
        }
    }

    showTooltip() {
        this.setState({ isTooltipActive: true });
    }
    hideTooltip() {
        this.setState({ isTooltipActive: false });
    }

    // Render tab of content area
    renderTab() {
        let tabProps = {
            detail: this.props.detail,
            isClicked: this.state.isClicked,
            notifyToaster: this.props.notifyToaster
        }
        let popupProps = {
            openConfirmPopup: this.props.openConfirmPopup,
            hideConfirmPopup: this.props.hideConfirmPopup
        }
        return (
            <Tabs
                activeKey={this.state.tabKey}
                onChange={this.tabChanged}
                renderTabBar={() => <ScrollableInkTabBar />}
                renderTabContent={() => <TabContent animated={false} />} >
                <TabPane tab={this.strings.PIC_TAB_LABEL} key="tabPIC">
                    <TabPIC PICData={!this.addMode && this.PIC ? this.PIC : null}
                        strings={{ ...this.strings.TAB_PIC, COMMON: this.strings.COMMON }}
                        validatePIC={this.validatePIC} updateCenterCords={this.updateCenterCords}
                        {...this.state.hierarchyIds}
                        {...tabProps} ref="tabPIC" />
                    <div className="clearfix">
                    </div>
                </TabPane>
                <TabPane tab={this.strings.ACCREDITATION_TAB_LABEL} key="tabAccreditation">
                    <TabAccreditation AccreditationData={!this.addMode && this.Accreditation ? this.Accreditation : null}
                        NLISStatus={this.state.NLISStatus}
                        strings={{ ...this.strings.TAB_ACCREDITATION, COMMON: this.strings.COMMON }}
                        {...tabProps} ref="tabAccreditation" />
                    <div className="clearfix">
                    </div>
                </TabPane>
                <TabPane tab={this.strings.ENCLOSURE_TAB_LABEL + " (" + this.state.enclosureCount + ")"} key="tabEnclosure">
                    <TabEnclosure EnclosureData={!this.addMode && this.Enclosure ? this.Enclosure : null}
                        strings={{ ...this.strings.TAB_ENCLOSURE, COMMON: this.strings.COMMON }}
                        {...tabProps} {...popupProps} enclosureMap={this.state.enclosureMap}
                        updateEnclosureDetails={(enclsoure) => this.stateSet({ enclosureCount: enclsoure.length, enclosureData: enclsoure })}
                        ref="tabEnclosure" />
                    <div className="clearfix">
                    </div>
                </TabPane>
                <TabPane tab={<div><img src={this.siteURL + "/static/images/map-marker.png"} alt={this.strings.MAP_TAB_LABEL} style={{ marginRight: '2px' }} />{this.strings.MAP_TAB_LABEL}</div>} key="tabMap">
                    <TabMap MapData={!this.addMode && this.Map ? this.Map : null}
                        strings={{ ...this.strings.TAB_MAP, COMMON: this.strings.COMMON }}
                        defaultGPS={this.state.mapCenterCords}
                        EnclosureData={this.state.enclosureData}
                        uomData={this.uomData} updateEnclMapDetails={this.updateEnclMapDetails}
                        {...tabProps} {...popupProps} ref="tabMap" />
                    <div className="clearfix">
                    </div>
                </TabPane>
                <TabPane tab={this.strings.ACCESS_TAB_LABEL} key="tabAccess">
                    <TabAccess AccessData={!this.addMode && this.Access ? this.Access : null}
                        strings={{ ...this.strings.TAB_ACCESS, COMMON: this.strings.COMMON }}
                        {...tabProps} getHierarchyDetails={this.getHierarchyDetails} ref="tabAccess" />
                    <div className="clearfix">
                    </div>
                </TabPane>
            </Tabs >
        );
    }

    // Render component
    render() {
        if (this.state.dataFetch) {
            return (<div className="stock-list">
                <div className="stock-list-cover">
                    <div className="livestock-content">
                        <div className="cattle-text">
                            <span>{this.strings.DESCRIPTION}</span>
                            <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <Dropdown inputProps={{
                                    name: 'propertyType',
                                    hintText: this.strings.CONTROLS.PROPERTY_TYPE_PLACEHOLDER,
                                    floatingLabelText: this.strings.CONTROLS.PROPERTY_TYPE_LABEL,
                                    value: this.property ? this.property.PropertyTypeId : null
                                }}
                                    onSelectionChange={this.propertyTypeChange}
                                    eReq={this.strings.CONTROLS.PROPERTY_TYPE_REQ_MESSAGE}
                                    textField="NameCode" valueField="Id" dataSource={this.propertyTypeData}
                                    isClicked={this.state.isClicked} ref="PropertyTypeId" />
                                <div style={{ position: 'relative' }} className="dropdown-input">
                                    <Input inputProps={{
                                        name: 'PIC',
                                        hintText: this.strings.CONTROLS.PIC_PLACEHOLDER,
                                        floatingLabelText: this.strings.CONTROLS.PIC_LABEL
                                    }}
                                        isUppercase={true}
                                        onChangeInput={this.validatePIC}
                                        onBlurInput={this.validatePIC}
                                        maxLength={8}
                                        initialValue={this.property ? this.property.PIC : ''}
                                        eReq={this.strings.CONTROLS.PIC_REQ_MESSAGE}
                                        isClicked={this.state.isClicked} ref="PIC" />
                                    <span className="location-icon" >
                                        <img id="picValidationTip" src={this.siteURL + "/static/images/infotip.png"} onMouseEnter={this.showTooltip.bind(this)} onMouseLeave={this.hideTooltip.bind(this)} />
                                    </span>
                                    <ToolTip active={this.state.isTooltipActive} position="bottom" arrow="right" parent="#picValidationTip">
                                        <Scrollbars autoHeight autoHeightMax={250}>
                                            <div className="tooltip-box">

                                                <h3>Type of Property & PIC Validation</h3>
                                                Supported property types.<br />
                                                <ul>
                                                    <li>Producer </li>
                                                    <li>Saleyard </li>
                                                    <li>Showground </li>
                                                    <li>Transit Depot </li>
                                                    <li>Abattoir </li>
                                                    <li>Butcher </li>
                                                    <li>Feedlot </li>
                                                    <li>Knackery </li>
                                                    <li>Live Export Depot </li>
                                                    <li>Milk Factory</li>
                                                </ul>
                                                <span>Special</span> PICs will be available globally for all company/business within Aglive and these are below. <br /><br />
                                                <table>
                                                    <tbody>
                                                        <tr>
                                                            <th style={{ width: '35%' }}>PIC</th>
                                                            <th>Purpose</th>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ width: '35%' }}>EUAB (any 4 digits of number followed)</td>
                                                            <td>EUAB for Abattoirs. No algorithm check required. For example, EUAB9999, EUAB1234</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ width: '35%' }}>EUSY (any 4 digits of number followed)</td>
                                                            <td>EUSY for Saleyard. No algorithm check required. For example, EUSY9999, EUSY1234</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ width: '35%' }}>AAAAAAAA</td>
                                                            <td>8A’s - Unknown PIC. No algorithm check required.</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <span>Emergency</span> PICs will also be available globally for all company/business within Aglive and below are rules to identify. <br />
                                                <ul>
                                                    <li>First character is one of the accepted first characters listed in the below table (to designate which State Department issued the emergency PIC)</li>
                                                    <li>Second character is Z</li>
                                                </ul>
                                                Any PIC that meets these two rules is deemed a valid, emergency PIC.<br /><br />
                                                <h3>PIC Validation </h3>

                                                The following general rules apply to all PICs in Australia<br />
                                                <ul>
                                                    <li>All PICs are eight characters long, containing only letters or numbers. </li>
                                                    <li>No spaces, dividers etc. within the PIC. For example, ‘3FDS 0003’ will be immediately rejected (includes a space); as will ‘3FDS-0003’ (includes a dividing hyphen)</li>
                                                    <li>All letters in the PIC must be uppercase.</li>
                                                </ul>
                                                Further to those rules, the following table outlines additional format rules based on the PIC origin.<br /><br />
                                                <table>
                                                    <tbody>
                                                        <tr>
                                                            <th>First Character </th>
                                                            <th>PIC Origin / State</th>
                                                            <th>PIC Format </th>
                                                            <th>Additional Rules </th>
                                                        </tr>
                                                        <tr>
                                                            <td>3</td>
                                                            <td>VIC (new format) </td>
                                                            <td>3AAAA999 </td>
                                                            <td>-</td>
                                                        </tr>
                                                        <tr>
                                                            <td>V</td>
                                                            <td>VIC (old format) </td>
                                                            <td>VAAA9999 </td>
                                                            <td>-</td>
                                                        </tr>
                                                        <tr>
                                                            <td>N</td>
                                                            <td>NSW </td>
                                                            <td>NA999999 </td>
                                                            <td>2nd char must be A – K </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Q</td>
                                                            <td>QLD </td>
                                                            <td>QAAA9999 </td>
                                                            <td>2nd char must be A – K </td>
                                                        </tr>
                                                        <tr>
                                                            <td>S</td>
                                                            <td>SA</td>
                                                            <td>SA999999 </td>
                                                            <td>2nd char must be A – K </td>
                                                        </tr>
                                                        <tr>
                                                            <td>M</td>
                                                            <td>TAS</td>
                                                            <td>MAAA9999 </td>
                                                            <td>2nd char must be A – K </td>
                                                        </tr>
                                                        <tr>
                                                            <td>W</td>
                                                            <td>WA</td>
                                                            <td>WAAA9999 </td>
                                                            <td>2nd char must be A – K </td>
                                                        </tr>
                                                        <tr>
                                                            <td>T</td>
                                                            <td>NT</td>
                                                            <td>TAAA9999 </td>
                                                            <td>2nd char must be A – K </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                For example, the current format for Victoria is listed as ‘3AAAA999’. This means valid PICs have a first character ‘3’, followed by 4 letters (A-Z), followed by 3 numbers (0-9).<br />
                                            </div>
                                        </Scrollbars>
                                    </ToolTip>

                                </div>
                                <div className="dropdown-input">
                                    <Input inputProps={{
                                        name: 'propertyName',
                                        hintText: this.strings.CONTROLS.PROPERTY_PLACEHOLDER,
                                        floatingLabelText: this.strings.CONTROLS.PROPERTY_LABEL
                                    }}
                                        maxLength={250}
                                        initialValue={this.property ? this.property.Name : ''}
                                        eReq={this.strings.CONTROLS.PROPERTY_REQ_MESSAGE}
                                        isClicked={this.state.isClicked} ref="Name" />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <CompanyHierarchy
                                    propertyVisible={false} hierarchyChange={this.hierarchyChange}
                                    refCompanyId={this.props.refCompanyId}
                                    refBusinessReq={this.props.hierarchyProps.isSiteAdmin == 0 && this.props.hierarchyProps.isSuperUser == 0 ? true : null} companyDisabled={this.props.companyDisabled}
                                    regionDisabled={this.companyHierarchy ? 1 : 0}
                                    inputProps={this.companyHierarchy ? { ...this.companyHierarchy } : {}}
                                    {...this.props.hierarchyProps}
                                    isClicked={this.state.isClicked} strings={{ ...this.strings.COMMON }} ref="CompanyHierarchy" />
                            </div>
                        </div>
                        <div className="clear mt15"></div>
                        {this.renderTab()}
                    </div>
                </div>
            </div >);
        }
        else {
            return <LoadingIndicator />;
        }
    }

}

export default DetailTabs;