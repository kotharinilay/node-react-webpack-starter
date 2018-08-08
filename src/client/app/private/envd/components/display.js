'use strict';

/************************************************
 * Show e-NVD listing
 ***********************************************/

import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import { uniqBy } from 'lodash';

import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';
import Grid from '../../../../lib/core-components/Grid';
import Button from '../../../../lib/core-components/Button';

import RadioButton from '../../../../lib/core-components/RadioButton';
import CheckBox from '../../../../lib/core-components/CheckBox';
import DatetimePicker from '../../../../lib/core-components/DatetimePicker';
import Dropdown from '../../../../lib/core-components/Dropdown';
import Input from '../../../../lib/core-components/Input';

import { Scrollbars } from '../../../../../../assets/js/react-custom-scrollbars';
import { getForm } from '../../../../lib/wrapper-components/FormActions';
import { gridActionNotify } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR, NOTIFY_WARNING, NOTIFY_INFO } from '../../../common/actiontypes';
import { nvdTypesData, nvdStatusCodes, reportList, LocalStorageKeys, nvdTypes } from '../../../../../shared/constants';
import { hexToRgba } from '../../../../../shared/index';
import { formatDateTime } from '../../../../../shared/format/date';
import { geteNVDFilterData, deleteeNVDRecords } from '../../../../services/private/envd';
import { submitConsignmentToNlis } from '../../../../services/public/nlis';

class Display extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.filterSchema = ['assigneNVD', 'fromDate', 'toDate', 'retrivedeNVD', 'species', 'eNVDType', 'eNVDStatus', 'hasEU'];
        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.assigneNVD = [{ Value: 2, Text: this.strings.CONTROLS.ASSIGN_TO_ME },
        { Value: 3, Text: this.strings.CONTROLS.ASSIGN_TO_OTHER }];

        this.assigneNVDSiteAdmin = [{ Value: 1, Text: this.strings.CONTROLS.NONE },
        { Value: 2, Text: this.strings.CONTROLS.ASSIGN_TO_ME },
        { Value: 3, Text: this.strings.CONTROLS.ASSIGN_TO_OTHER }];


        this.state = {
            selectAll: false,
            selectedData: [],

            isClicked: false,
            displayFilter: false,
            dataFetch: true,

            renderFilter: Math.random(),
            renderSpeciesFilter: Math.random(),
            renderGrid: Math.random(),

            speciesData: [],
            eNVDStatusData: [],

            columns: [
                { field: 'Id', isKey: true, displayName: 'eNVD Id' },
                { field: 'Id', width: '35px', isSort: false, displayName: '', isExpand: true, formatter: this.expander.bind(this), visible: true },
                { field: 'IndFileIcon', width: '40px', visible: true, isSort: false, displayName: '', formatter: this.setIcon.bind(this) },
                { field: 'MLAReferenceNumber', width: '200px', displayName: 'Serial Number', visible: true, formatter: this.serialNumberBinding.bind(this) },
                { field: 'ReferenceNumber', width: '200px', displayName: 'Reference Number', visible: true, formatter: this.retrivedeNVDBinding.bind(this) },
                { field: 'MovementCommenceDate', width: '230px', displayName: 'Movement Commence Date', visible: true, formatter: this.dateFormatBinding.bind(this) },
                { field: 'TotalLivestockQty', width: '100px', displayName: 'Livestock', visible: true, formatter: this.retrivedeNVDBinding.bind(this) },
                { field: 'Consigner', width: '200px', displayName: 'Consigner', visible: true, formatter: this.consignerBinding.bind(this) },
                { field: 'Consignee', width: '200px', displayName: 'Consignee', visible: true, formatter: this.consigneeBinding.bind(this) },
                { field: 'DateOfDelivery', width: '200px', displayName: 'Delivered Date', visible: true, formatter: this.dateFormatBinding.bind(this) },
                { field: 'StatusName', width: '100px', displayName: 'Status', visible: true, formatter: this.retrivedeNVDBinding.bind(this) },
                { field: 'StatusName', width: '230px', displayName: '', visible: true, isSort: false, formatter: this.accreditationsBinding.bind(this) }
            ],
            subColumns: [
                { field: 'Id', isKey: true, displayName: 'Id' },
                { field: 'Mob', displayName: 'Mob', visible: true },
                { field: 'EID', displayName: 'EID', visible: true },
                { field: 'NLISID', displayName: 'NLIS ID', visible: true },
                { field: 'VisualTag', displayName: 'Visual Tag', visible: true },
                { field: 'NumberOfHead', displayName: 'Livestock Number', visible: true },
                { field: 'GenderName', displayName: 'Gender', visible: true },
                { field: 'MaturityName', displayName: 'Maturity', visible: true },
                { field: 'BreedName', displayName: 'Breed', visible: true }
            ],
            filterObj: { topPIC: this.props.topPIC, assignenvd: 2 },
            sortOrder: 'desc',
            sortColumn: 'MovementCommenceDate'
        };

        this.toggleFilter = this.toggleFilter.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
        this.clearFilter = this.clearFilter.bind(this);

        this.printWaybill = this.printWaybill.bind(this);
        this.printeNVD = this.printeNVD.bind(this);
        this.submitToNLIS = this.submitToNLIS.bind(this);

        this.validateOnlyOne = this.validateOnlyOne.bind(this);

        this.rowClickId = [];
        this.rowSelect = this.rowSelect.bind(this);
        this.expandableRow = this.expandableRow.bind(this);
        this.expandComponent = this.expandComponent.bind(this);
        this.expandClick = this.expandClick.bind(this);

        this.modifyNVD = this.modifyNVD.bind(this);
        this.delivereNVD = this.delivereNVD.bind(this);
        this.deleteeNVD = this.deleteeNVD.bind(this);
        this.deleteeNVDComment = this.deleteeNVDComment.bind(this);
        this.deleteeNVDClick = this.deleteeNVDClick.bind(this);
        this.pickupeNVD = this.pickupeNVD.bind(this);

        this.notImplementedYet = this.notImplementedYet.bind(this);
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
        geteNVDFilterData(this.props.topPIC).then(function (res) {
            if (res.success) {
                _this.stateSet({ speciesData: res.data.species, eNVDStatusData: res.data.eNVDStatus });
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Perform header search
    componentWillReceiveProps(nextProps) {
        if (nextProps.topSearch == undefined)
            return;
        this.refs.eNVDGrid.onSearchChange(nextProps.topSearch.searchText);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.topPIC.PropertyId != this.props.topPIC.PropertyId)
            this.clearFilter();
    }

    // Handle grid selection
    rowSelect(selectedRow, row, isSelected) {
        let selectedData = [...this.state.selectedData];
        if (row.Id) {
            if (isSelected) {
                let obj = selectedData.find(r => r.Id == row.Id);
                if (!obj)
                    selectedData.push(row);
            }
            else {
                selectedData = selectedData.filter(r => r.Id != row.Id);
            }
        }

        selectedData = uniqBy(selectedData, 'Id');
        if (selectedData.length == 0) {
            this.stateSet({ selectedData: [], selectAll: false });
        }
        else
            this.stateSet({ selectedData: selectedData });
    }

    // Redirect to edit mode for selected NVD
    modifyNVD() {
        if (gridActionNotify(this.strings, this.notifyToaster, this.refs.eNVDGrid.selectedRows.length, true, true)) {
            browserHistory.push('/envd/envd-detail/' + this.refs.eNVDGrid.selectedRows[0].Id);
        }
    }

    // Open delete eNVD confirmation popup
    deleteeNVDClick() {
        if (this.refs.eNVDGrid.selectedRows[0].StatusCode == nvdStatusCodes.Delivered) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.DELIVERED_ENVD_CANNOT_DELETE });
            return false;
        }
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.refs.eNVDGrid.selectedRows.length, true)) {
            let payload = {
                confirmText: this.strings.DELETE_CONFIRMATION_MESSAGE,
                strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
                onConfirm: this.deleteeNVDComment
            };
            this.props.openConfirmPopup(payload);
        }
    }

    // Open delete eNVD comment popup
    deleteeNVDComment() {
        this.props.hideConfirmPopup();
        let payload = {
            confirmText: <Input inputProps={{
                name: 'deleteComment',
                hintText: this.strings.DELETE_ENVD_COMMENT_PLACEHOLDER,
                floatingLabelText: this.strings.DELETE_ENVD_COMMENT_LABEL
            }}
                callOnChange={true} isLoading={false}
                onChangeInput={(value) => { this.deleteComment = value }}
                maxLength={300} multiLine={true} rows={3} />,
            title: this.strings.ENVD_DELETE_COMMENT_POPUP_LABEL,
            strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
            onConfirm: this.deleteeNVD
        };
        this.props.openConfirmPopup(payload);
    }

    // Delete selected eNVD
    deleteeNVD() {
        this.props.hideConfirmPopup();
        let selectedRows = this.refs.eNVDGrid.selectedRows;
        let uuids = [];
        let auditLogIds = [];
        selectedRows.map(function (r) {
            uuids.push(r.Id);
            auditLogIds.push(r.AuditLogId);
        });

        let _this = this;
        deleteeNVDRecords(uuids, auditLogIds, this.deleteComment).then(function (res) {
            if (res.success) {
                _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.DELETE_SUCCESS });
                _this.refs.eNVDGrid.refreshDatasource();
            }
            else if (res.badRequest) {
                _this.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
            }
            else
                _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Update delivery for selected NVD
    delivereNVD() {
        if (this.validateOnlyOne(false)) {
            if (this.refs.eNVDGrid.selectedRows[0].StatusCode == nvdStatusCodes.InTransit) {
                this.setLocalStorage();
                browserHistory.push('/envd/delivery/' + this.refs.eNVDGrid.selectedRows[0].Id);
            }
            else
                this.notifyToaster(NOTIFY_WARNING, { message: this.strings.DELIVERY_VALIDATION_MESSAGE });
        }
    }

    pickupeNVD() {
        if (this.validateOnlyOne(false)) {
            let selectedData = this.refs.eNVDGrid.selectedRows[0];

            if (selectedData.TransporterCompanyId != null && selectedData.TransporterContactId == null &&
                (selectedData.StatusCode == nvdStatusCodes.Draft || selectedData.StatusCode == nvdStatusCodes.Pending)) {
                browserHistory.push('/envd/pickup/' + selectedData.Id);
            }
            else if (selectedData.TransporterContactId) {
                this.notifyToaster(NOTIFY_WARNING, { message: this.strings.TRANSPORTER_CONTACT_ALREADY_ASSIGN });
                return false;
            }
            else if (selectedData.TransporterCompanyId == null) {
                this.notifyToaster(NOTIFY_WARNING, { message: this.strings.TRANSPORTER_COMPANY_NOT_ASSIGNED });
                return false;
            }
        }
    }


    retrivedeNVDBinding(cell, row) {
        return row["IsForeignNVD"] == 1 ? <span className="retrived-envd">{cell}</span> : cell;
    }

    dateFormatBinding(cell, row) {
        let value = cell ? formatDateTime(cell).ShortDate : '';
        return row["IsForeignNVD"] == 1 ? <span className="retrived-envd">{value}</span> : value;
    }

    // display mob/livestock icon
    setIcon(cell, row) {
        let fileIcon = row["IsMobNVD"] == 1 ? row['MobIcon'] : row['IndFileIcon'];
        return fileIcon ? <img src={fileIcon} width="23px" style={{ cursor: 'pointer' }} /> : null;
    }

    // Set row background color
    setBGColor(row) {
        return hexToRgba(row['ColorCode'], 100);
    }

    consignerBinding(cell, row) {
        return <div className={row["IsForeignNVD"] == 1 ? "retrived-envd" : ""}>
            <div>{cell}</div>
            {row['ConsignerAddress'] ? <div>{row['ConsignerAddress']}</div> : null}
        </div>;
    }

    consigneeBinding(cell, row) {
        return <div className={row["IsForeignNVD"] == 1 ? "retrived-envd" : ""}>
            <div>{cell}</div>
            {row['ConsigneeAddress'] ? <div>{row['ConsigneeAddress']}</div> : null}
        </div>;
    }

    accreditationsBinding(cell, row) {
        let data = row['SupportedAccreditations'] ? row['SupportedAccreditations'].split(',') : [];
        return <div>
            {data.map((d, i) => {
                return <div key={i} className="accred-style">{d}</div>;
            })}
            <div className="clearfix" />
        </div>;
    }

    serialNumberBinding(cell, row) {
        let date = row['MLASubmittedDate'] ? formatDateTime(row['MLASubmittedDate']).DateTime : '';
        return row['IsPostedOnMLA'] == 1 ? <div className={row["IsForeignNVD"] == 1 ? "retrived-envd" : ""}>
            <div>{cell}</div>
            ({date})
        </div> : null;
    }

    applyFilter() {
        let obj = getForm(this.filterSchema, this.refs);
        obj.hasEU = obj.hasEU == null ? false : true;
        obj.retrivedeNVD = obj.retrivedeNVD == null ? false : true;
        this.stateSet({ filterObj: { ...obj, topPIC: this.props.topPIC }, renderGrid: Math.random() });
    }

    clearFilter() {
        this.stateSet({
            renderFilter: Math.random(), renderGrid: Math.random(),
            filterObj: { topPIC: this.props.topPIC, assignenvd: 2 }
        });
    }

    // show/hide filter screen
    toggleFilter() {
        let filterState = this.state.displayFilter;
        this.stateSet({ displayFilter: !filterState });
    }


    // selectedSpecies if operation to be on same specise livestock
    setLocalStorage() {
        localStorage.setItem(LocalStorageKeys.eNVDData, JSON.stringify({
            data: this.state.selectedData,
            propertyId: this.props.topPIC.PropertyId
        }));
    }

    validateOnlyOne(setItem = true) {
        let selectedData = this.refs.eNVDGrid.selectedRows;
        if (selectedData.length == 0) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_AT_LEAST_ONE });
            return false;
        }
        if (selectedData.length > 1) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_ONLY_ONE });
            return false;
        }

        if (setItem)
            this.setLocalStorage();
        return true;
    }

    printWaybill() {
        if (this.validateOnlyOne(false)) {
            let selectedData = this.refs.eNVDGrid.selectedRows;
            let name = reportList.printWaybill;
            let param = 'name=' + name + '&id=' + selectedData[0].Id;
            window.open(this.siteURL + '/report-viewer?' + param, '_blank');
        }
    }

    printeNVD() {
        if (this.validateOnlyOne(false)) {
            let selectedData = this.refs.eNVDGrid.selectedRows;
            let nvdType = selectedData[0].NVDType;
            let name = reportList.printeNVDCattle;
            if (nvdType == 2)
                name = reportList.printeNVDSheep;
            else if (nvdType == 3)
                name = reportList.printeNVDBobbyCalves;
            else if (nvdType == 4)
                name = reportList.printeNVDGoat;
            else if (nvdType == 5)
                name = reportList.printeNVDEUCattle;
            let param = 'name=' + name + '&id=' + selectedData[0].Id;
            window.open(this.siteURL + '/report-viewer?' + param, '_blank');
        }
    }

    submitToNLIS() {
        if (this.validateOnlyOne(false)) {
            let selectedData = this.refs.eNVDGrid.selectedRows;
            let _this = this;
            this.props.showLoading();
            submitConsignmentToNlis(selectedData[0].Id, this.props.topPIC.PropertyId, this.props.authUser.ContactId, this.props.language).then(function (res) {
                _this.props.hideLoading();
                if (res.success) {
                    _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.CONSIGNMENT_SUBMIT_TO_NLIS });
                    _this.stateSet({ renderGrid: Math.random() });
                }
                else if (res.badRequest) {
                    _this.notifyToaster(NOTIFY_ERROR, { message: res.error });
                }
            }).catch(function (err) {
                _this.props.hideLoading();
                _this.notifyToaster(NOTIFY_ERROR);
            });
        }
    }

    /*--------- Bind nested grid start --------------*/

    // Return for bind nested grid
    expandableRow(row) {
        return this.rowClickId.includes(row.Id);
    }

    // Bind nested grid
    expandComponent(row) {
        let gridProps = {
            selectRowMode: 'none',
            maxHeight: "170px",
            functionName: 'envdlivestock/getdataset',
            sortColumn: 'Mob',
            columns: this.state.subColumns,
            filterObj: row.Id
        }
        return (<Grid {...gridProps} />);
    }

    // Display expand/collapse icons
    expander(cell, row) {
        let imgPath = this.siteURL + "/static/images/";
        let expandClick = () => this.expandClick(cell);
        return <div onClick={expandClick}>
            <img src={this.rowClickId.includes(row.Id) ? imgPath + "collapse.png" : imgPath + "expand.png"} />
        </div>;
    }

    // Handle icons click by id
    expandClick(cell) {
        let index = this.rowClickId.indexOf(cell);
        if (index != -1)
            this.rowClickId.splice(index, 1);
        else
            this.rowClickId.push(cell);
    }

    /*--------- Bind nested grid end --------------*/

    // render header part
    renderHeader() {
        let strings = this.strings;
        return (
            <div className="dash-right-top">
                <div className="live-detail-main">
                    <div className="configure-head">
                        <span>{strings.TITLE}</span>
                    </div>
                    {this.state.dataFetch ? <div className="l-stock-top-btn">
                        <ul>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnFilter',
                                        label: strings.CONTROLS.FILTER_LABEL,
                                        className: 'button1Style button30Style',
                                    }}
                                    onClick={this.toggleFilter}
                                ></Button>
                            </li>
                            <li>
                                <a href="javascript:void(0)" className="ripple-effect search-btn" data-toggle="dropdown">{strings.CONTROLS.ACTION_LABEL}</a>
                                <a href="javascript:void(0)" className="ripple-effect dropdown-toggle caret2" data-toggle="dropdown"> <span><img src={this.siteURL + "/static/images/caret-white.png"} /></span></a>
                                <ul className="dropdown-menu mega-dropdown-menu action-menu">
                                    <li className="col-md-3">
                                        <ul>
                                            <li><a href="javascript:void(0)" onClick={this.modifyNVD}>{strings.CONTROLS.MODIFY_ENVD_LABEL}</a></li>
                                            <li><a href="javascript:void(0)" onClick={this.deleteeNVDClick}>{strings.CONTROLS.DELETE_ENVD_LABEL}</a></li>
                                            <li><a href="javascript:void(0)" onClick={this.pickupeNVD}>{strings.CONTROLS.PICKUP_ENVD_LABEL}</a></li>
                                            <li><a href="javascript:void(0)" onClick={this.delivereNVD}>{strings.CONTROLS.DELIVER_ENVD_LABEL}</a></li>
                                            <li><a href="javascript:void(0)" onClick={this.notImplementedYet}>{strings.CONTROLS.UPDATE_BUYER_LABEL}</a></li>
                                        </ul>
                                    </li>
                                    <li className="col-md-3">
                                        <ul>
                                            <li className="dropdown-header">View</li>
                                            <li><a href="javascript:void(0)"
                                                onClick={this.printeNVD}>{strings.CONTROLS.VIEW_ENVD_LABEL}</a></li>
                                            <li><a href="javascript:void(0)"
                                                onClick={this.printWaybill}>{strings.CONTROLS.VIEW_WAYBILL_LABEL}</a></li>
                                            <li><a href="javascript:void(0)"
                                                onClick={this.notImplementedYet}>{strings.CONTROLS.VIEW__NT_ENVD_LABEL}</a></li>
                                            <li><a href="javascript:void(0)"
                                                onClick={this.notImplementedYet}>{strings.CONTROLS.VIEW_SA_ENVD_LABEL}</a></li>
                                            <li><a href="javascript:void(0)"
                                                onClick={this.notImplementedYet}>{strings.CONTROLS.VIEW_NFAS_STATEMENT_LABEL}</a></li>
                                            <li><a href="javascript:void(0)"
                                                onClick={this.notImplementedYet}>{strings.CONTROLS.VIEW_MSA_STATEMENT_LABEL}</a></li>
                                            <li><a href="javascript:void(0)"
                                                onClick={this.notImplementedYet}>{strings.CONTROLS.VIEW_AUS_MEAT_STATEMENT_LABEL}</a></li>
                                            <li><a href="javascript:void(0)"
                                                onClick={this.notImplementedYet}>{strings.CONTROLS.VIEW_HEALTH_STATEMENT_LABEL}</a></li>
                                            <li><a href="javascript:void(0)"
                                                onClick={this.notImplementedYet}>{strings.CONTROLS.VIEW_ATTCHED_DOCUMENTS_LABEL}</a></li>
                                        </ul>

                                    </li>
                                    <li className="col-md-3">
                                        <ul>
                                            <li className="dropdown-header">{strings.CONTROLS.NLIS_GROUP_LABEL}</li>
                                            <li><a href="javascript:void(0)"
                                                onClick={this.submitToNLIS}>{strings.CONTROLS.SUBMIT_NLIS_LABEL}</a></li>
                                            <li><a href="javascript:void(0)"
                                                onClick={this.notImplementedYet}>{strings.CONTROLS.SUBMIT_MOVEMENT_LABEL}</a></li>
                                            <li><a href="javascript:void(0)"
                                                onClick={this.notImplementedYet}>{strings.CONTROLS.RETRIEVE_ENVD_LABEL}</a></li>
                                        </ul>
                                    </li>
                                    <li className="col-md-3">
                                        <ul>
                                            <li className="dropdown-header">{strings.CONTROLS.NOTIFICATION_GROUP_LABEL}</li>
                                            <li><a href="javascript:void(0)"
                                                onClick={this.notImplementedYet}>{strings.CONTROLS.SEND_EMAIL_LABEL}</a></li>
                                            <li><a href="javascript:void(0)"
                                                onClick={this.notImplementedYet}>{strings.CONTROLS.SEND_SMS_LABEL}</a></li>
                                            <li><a href="javascript:void(0)"
                                                onClick={this.notImplementedYet}>{strings.CONTROLS.SEND_FAX_LABEL}</a></li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div> : null}
                </div>
            </div >);
    }

    notImplementedYet() {
        this.props.notifyToaster(NOTIFY_INFO, { message: 'Not implemented yet.' });
    }

    // render filter screen
    renderFilter() {
        let { CONTROLS } = this.props.strings;

        let filter = this.filter;
        return (<div className={"filter-open-box " + (this.state.displayFilter ? 'show' : 'hidden')}
            key={this.state.renderFilter}>
            <h2><img src={this.siteURL + "/static/images/filter-head-icon.png"} alt="icon" />
                {this.strings.COMMON.FILTERS_LABEL}
                <div className="f-close" onClick={this.toggleFilter}>
                    <img src={this.siteURL + "/static/images/close-icon2.png"} alt="close-icon" />
                </div>
            </h2>
            <div className="clearfix"></div>

            <Scrollbars autoHide autoHeight
                autoHeightMax={(typeof document === 'undefined') ? 500 : (document.body.clientHeight - 220)}>

                <RadioButton inputGroupProps={{ name: 'assigneNVD', defaultSelected: this.props.authUser.IsSiteAdministrator == 1 ? 1 : 2 }}
                    dataSource={this.props.authUser.IsSiteAdministrator == 1 ? this.assigneNVDSiteAdmin : this.assigneNVD}
                    textField="Text" valueField="Value"
                    isClicked={this.state.isClicked} ref="assigneNVD" />

                <div className="clearfix mt30" />

                <DatetimePicker inputProps={{
                    name: 'fromDate',
                    placeholder: this.strings.CONTROLS.FROMDATE_PLACEHOLDER,
                    label: this.strings.CONTROLS.FROMDATE_PLACEHOLDER
                }}
                    timeFormat={false}
                    isClicked={this.state.isClicked} ref="fromDate" />

                <div className="clearfix mt30" />

                <DatetimePicker inputProps={{
                    name: 'toDate',
                    placeholder: this.strings.CONTROLS.TODATE_PLACEHOLDER,
                    label: this.strings.CONTROLS.TODATE_PLACEHOLDER
                }}
                    timeFormat={false}
                    isClicked={this.state.isClicked} ref="toDate" />

                <div className="clearfix mt30" />

                <CheckBox inputProps={{
                    name: 'retrivedeNVD',
                    label: this.strings.CONTROLS.RETRIEVED_ENVD_LABEL,
                    defaultChecked: false
                }}
                    isClicked={this.state.isClicked} ref="retrivedeNVD" />

                <div className="clearfix mt15" />

                <Dropdown inputProps={{
                    name: 'species',
                    hintText: this.strings.CONTROLS.SPECIES_PLACEHOLDER,
                    floatingLabelText: this.strings.CONTROLS.SPECIES_LABEL
                }}
                    textField="NameCode" valueField="Id" dataSource={this.state.speciesData}
                    isClicked={this.state.isClicked} ref="species" />

                <div className="clearfix mt30" />

                <Dropdown inputProps={{
                    name: 'eNVDType',
                    hintText: this.strings.CONTROLS.ENVD_TYPE_PLACEHOLDER,
                    floatingLabelText: this.strings.CONTROLS.ENVD_TYPE_LABEL
                }}
                    textField="Text" valueField="Value" dataSource={nvdTypesData}
                    isClicked={this.state.isClicked} ref="eNVDType" />

                <div className="clearfix mt30" />

                <Dropdown inputProps={{
                    name: 'eNVDStatus',
                    hintText: this.strings.CONTROLS.ENVD_STATUS_PLACEHOLDER,
                    floatingLabelText: this.strings.CONTROLS.ENVD_STATUS_LABEL
                }}
                    textField="StatusName" valueField="Id" dataSource={this.state.eNVDStatusData}
                    isClicked={this.state.isClicked} ref="eNVDStatus" />

                <div className="clearfix mt30" />

                <CheckBox inputProps={{
                    name: 'hasEU',
                    label: this.strings.CONTROLS.EU_LABEL,
                    defaultChecked: false
                }}
                    isClicked={this.state.isClicked} ref="hasEU" />

                <div className="clearfix mt30" />

            </Scrollbars>
            <div className="f-btn">
                <Button
                    inputProps={{
                        name: 'btnApplyFilter',
                        label: this.strings.CONTROLS.APPLY_FILTER_LABEL,
                        className: 'button1Style button30Style',
                    }}
                    fullWidth={true}
                    onClick={this.applyFilter}
                ></Button>
            </div>
            <div className="f-btn mt5">
                <Button
                    inputProps={{
                        name: 'btnClearFilter',
                        label: this.strings.CONTROLS.CLEAR_FILTER_LABEL,
                        className: 'button3Style button30Style',
                    }}
                    fullWidth={true}
                    onClick={this.clearFilter}
                ></Button>
            </div>
        </div >);
    }

    renderContent() {
        // if (this.state.dataFetch) {
        let gridProps = {
            ...this.state,
            columns: this.state.columns,
            sortOrder: this.state.sortOrder,
            sortColumn: this.state.sortColumn,
            filterObj: this.state.filterObj,
            functionName: 'envd/getdataset',
            expandBy: 'column',
            clickToExpand: true,
            formatter: this.expander,
            expandClick: this.expandClick,
            expandableRow: this.expandableRow,
            expandComponent: this.expandComponent,
            setBGColor: this.setBGColor,
            onRowSelect: this.rowSelect
        }
        return (
            <div className="stock-list">
                <div className={"stock-list-cover " + (this.state.displayFilter ? 'filter-open' : '')}>
                    <div className="livestock-content">
                        <div className="cattle-text">
                            <span>{this.strings.DESCRIPTION}</span>
                            <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                        </div>
                        <div className="clear" ></div>
                        <div key={this.state.renderGrid}>
                            <Grid ref="eNVDGrid" {...gridProps} />
                        </div>
                    </div>
                    {this.renderFilter()}
                </div>
            </div>);
        // }
        // else return <LoadingIndicator />;
    }

    render() {
        return (
            <div className="row">
                {this.renderHeader()}
                <div className="clear"></div>
                {this.renderContent()}
                <div className="clear"></div>
            </div>
        );
    }
}

export default Display;