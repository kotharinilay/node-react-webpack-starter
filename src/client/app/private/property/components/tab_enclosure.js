'use strict';

/**************************
 * add/update tab for Enclosure
 * **************************** */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { map, filter } from 'lodash';

import Input from '../../../../lib/core-components/Input';
import Dropdown from '../../../../lib/core-components/Dropdown';
import NumberInput from '../../../../lib/core-components/NumberInput';
import Button from '../../../../lib/core-components/Button';
import Grid from '../../../../lib/core-components/Grid';

import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_ERROR } from '../../../common/actiontypes';
import { newUUID } from '../../../../../shared/uuid';
import { digitDecimal } from '../../../../../shared/format/number';

import { getAllEnclosureType } from '../../../../services/private/setup';

class EnclosureTab extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;
        this.enclosureSchema = ['enclosureType', 'enclosureName', 'DSE'];

        this.enclosureTypeName = "";
        this.enclosureTypeChange = this.enclosureTypeChange.bind(this);

        this.objEnclosure = {};
        this.updateEnclosureDB = false;  // Use this flag for edit mode at server side
        this.state = {
            enclosureData: this.props.EnclosureData ? this.props.EnclosureData.data : [], // Store enclosure data
            enclosureTypeData: this.props.EnclosureData ? this.props.EnclosureData.enclosureTypeData : [],
            addMode: false, // Check mode for enclosure
            isClicked: false,
            columns: [
                { field: 'Id', isKey: true, isSort: false, displayName: 'Id' },
                { field: 'AuditLogId', displayName: 'AuditLogId' },
                { field: 'IsDeleted', displayName: 'IsDeleted' },
                { field: 'EnclosureType', displayName: 'Enclosure Type', visible: true },
                { field: 'Name', displayName: 'Enclosure Name', visible: true, formatter: this.fenceFormat.bind(this) },
                { field: 'DSE', displayName: 'DSE', visible: true, format: 'decimalformat' },
                { field: 'Id', displayName: 'Actions', visible: true, isSort: false, width: '100px', format: 'actionFormat' }
            ]
        }
        this.addEnclosure = this.addEnclosure.bind(this);
        this.editEnclosure = this.editEnclosure.bind(this);
        this.deleteEnclosure = this.deleteEnclosure.bind(this);
        this.deleteEnclosureClick = this.deleteEnclosureClick.bind(this);
        //this.blurEnclosureName = this.blurEnclosureName.bind(this);
        this.getValues = this.getValues.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }
    componentWillUnmount() {
        this.mounted = false;
    }

    // Set data of enclosure
    componentWillMount() {
        this.mounted = true;
        if (this.props.detail == 'new') {
            let _this = this;
            getAllEnclosureType().then(function (res) {
                if (res.success) {
                    _this.stateSet({ enclosureTypeData: res.data });
                }
                else if (res.badRequest) {
                    _this.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                }
            }).catch(function (err) {
                _this.notifyToaster(NOTIFY_ERROR);
            });
        }
    }

    // display marker in Enclosure Name column
    fenceFormat(cell, row) {
        let fenceImg = "<img src='" + this.siteURL + "/static/images/map-marker.png' alt='Fence' style='margin-right:2px;'/>";
        if (this.props.enclosureMap.deleted.includes(row['Id']))
            return "<span style='margin-right:18px;'></span> " + cell;
        else if (row['EnclosureFence'] != null) {
            let fence = JSON.parse(row['EnclosureFence']);
            if (fence.FenceCoordinate.length > 0) {
                return fenceImg + cell;
            }
            else {
                return "<span style='margin-right:18px;'></span> " + cell;
            }
        }
        else if (this.props.enclosureMap.inserted.includes(row['Id']))
            return fenceImg + cell;
        else
            return "<span style='margin-right:18px;'></span> " + cell;
    }

    // Add enclosure to grid
    addEnclosure(e) {
        e.preventDefault();
        this.updateEnclosureDB = true;

        let isFormValid = isValidForm(this.enclosureSchema, this.refs);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let gridData = this.state.enclosureData;

        let newEntry = true;
        let newId = newUUID();
        let newAuditLogId = newUUID();

        // Edit mode of grid data
        if (this.objEnclosure.Id) {
            newEntry = false;
            newId = this.objEnclosure.Id;
            newAuditLogId = this.objEnclosure.AuditLogId;
            let index = gridData.findIndex(x => x.Id == this.objEnclosure.Id)
            if (index != -1) {
                gridData.splice(index, 1);
            }
        }

        let schemaData = getForm(this.enclosureSchema, this.refs);

        if (newEntry)
            this.objEnclosure.NewEntry = true;

        this.objEnclosure.EnclosureTypeId = schemaData.enclosureType;
        this.objEnclosure.EnclosureType = this.enclosureTypeName;
        this.objEnclosure.Name = schemaData.enclosureName;
        this.objEnclosure.DSE = digitDecimal(this.refs.DSE.fieldStatus.value);

        this.objEnclosure.Id = newId;
        this.objEnclosure.AuditLogId = newAuditLogId;
        this.objEnclosure.IsDeleted = 0;

        gridData.unshift(this.objEnclosure);
        this.setState({ addMode: false, isClicked: false, enclosureData: gridData });
        this.props.updateEnclosureDetails(gridData.filter(s => { return s.IsDeleted == 0 }));
        this.objEnclosure = {};
    }

    // Edit enclosure from grid
    editEnclosure(id) {
        this.objEnclosure = this.state.enclosureData.find((f) => {
            return id == f.Id;
        });
        this.setState({ addMode: true });
    }

    // Delete enclosure from grid on confirmation
    deleteEnclosure(id) {
        this.updateEnclosureDB = true;
        let gridData = [];
        this.state.enclosureData.map((f) => {
            if (f.Id == id) {
                f.IsDeleted = 1;
                if (f.NewEntry != true)
                    gridData.push(f);
            }
            else
                gridData.push(f);
        });
        this.props.hideConfirmPopup();
        this.setState({ enclosureData: gridData });
        this.props.updateEnclosureDetails(gridData.filter(s => { return s.IsDeleted == 0 }));
    }

    // Handle delete enclosure click from grid
    deleteEnclosureClick(id) {
        let payload = {
            confirmText: this.strings.DELETE_ENCLOSURE_CONFIRMATION_MESSAGE,
            strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
            onConfirm: () => this.deleteEnclosure(id)
        };
        this.props.openConfirmPopup(payload);
    }

    // Handle change event of enclosure type to store name in local var
    enclosureTypeChange(value, text) {
        this.enclosureTypeName = text;
    }

    // Handle blur event of enclosureName to check duplicate name
    blurEnclosureName(value) {
        let enclosureType = this.refs.enclosureType.fieldStatus.value;
        let enclosureObj = this.state.enclosureData.find(e => {
            return e.EnclosureTypeId == enclosureType && e.Name == value;
        });
        if (enclosureObj) {
            this.refs.enclosureName.updateInputStatus(this.strings.DUPLICATE_ENCLOSURE_NAME);
        }
        else {
            this.refs.enclosureName.updateInputStatus();
        }
    }

    // Return tab values to add/edit
    getValues() {
        return {
            data: this.state.enclosureData,
            updateEnclosureDB: this.updateEnclosureDB
        };
    }

    // Render enclosure form
    renderForm() {
        let { strings } = this.props;
        return (
            <div className="form-group">
                <form autoComplete="off" className="form-cover" onSubmit={this.addEnclosure}>

                    <Dropdown inputProps={{
                        name: 'enclosureType',
                        hintText: this.strings.ENCLOSURE_TYPE_PLACEHOLDER,
                        floatingLabelText: this.strings.ENCLOSURE_TYPE_LABEL,
                        value: this.objEnclosure.Id ? this.objEnclosure.EnclosureTypeId : null
                    }}
                        onSelectionChange={this.enclosureTypeChange}
                        eReq={this.strings.ENCLOSURE_TYPE_REQ_MESSAGE}
                        textField="NameCode" valueField="Id" dataSource={this.state.enclosureTypeData}
                        isClicked={this.state.isClicked} ref="enclosureType" />

                    <Input inputProps={{
                        name: 'enclosureName',
                        hintText: this.strings.ENCLOSURE_NAME_PLACEHOLDER,
                        floatingLabelText: this.strings.ENCLOSURE_NAME_LABEL
                    }}
                        maxLength={100}
                        initialValue={this.objEnclosure.Id ? this.objEnclosure.Name : ''}
                        eReq={this.strings.ENCLOSURE_NAME_REQ_MESSAGE}
                        isClicked={this.state.isClicked} ref="enclosureName" />

                    <NumberInput inputProps={{
                        name: 'DSE',
                        hintText: this.strings.DSE_PLACEHOLDER,
                        floatingLabelText: this.strings.DSE_LABEL,
                    }}
                        initialValue={this.objEnclosure.Id ? this.objEnclosure.DSE.toString() : null}
                        maxLength={21} numberType="decimal"
                        isClicked={this.state.isClicked} ref="DSE" />

                    <div className="mt15" style={{ textAlign: 'right' }}>
                        <Button
                            inputProps={{
                                name: 'btnAdd',
                                label: this.objEnclosure.Id ? strings.UPDATE_LABEL : strings.ADD_LABEL,
                                type: 'submit',
                                className: 'button2Style button30Style mr10'
                            }}
                            onClick={this.addEnclosure} ></Button>
                        <Button
                            inputProps={{
                                name: 'btnCancel',
                                label: strings.BACK_LABEL,
                                className: 'button1Style button30Style'
                            }} onClick={() => { this.setState({ addMode: false, isClicked: false }); this.objEnclosure = {}; }}></Button>
                    </div>
                </form>
            </div>
        );
    }

    // Render enclosure grid
    renderGrid() {
        let gridProps = {
            columns: this.state.columns,
            isRemoteData: false,
            gridData: this.state.enclosureData.filter(s => { return s.IsDeleted == 0 }),
            selectRowMode: "none",
            editClick: this.editEnclosure,
            deleteClick: this.deleteEnclosureClick
        }
        return (<div>
            <div className="l-stock-top-btn setup-top">
                <ul>
                    <li>
                        <Button
                            inputProps={{
                                name: 'btnAddNew',
                                label: this.strings.ADDNEW_LABEL,
                                className: 'button1Style button30Style',
                            }}
                            onClick={() => this.setState({ addMode: true })}
                        ></Button>
                    </li>
                </ul>
            </div>
            <div className="livestock-content mt5">
                <Grid {...gridProps} />
            </div>
        </div>);
    }

    // Render component
    render() {
        return (
            <div className="col-md-12">
                {this.state.addMode ? this.renderForm() : this.renderGrid()}
            </div>
        );
    }
}

export default EnclosureTab;