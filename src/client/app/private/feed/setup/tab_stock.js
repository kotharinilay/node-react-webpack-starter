'use strict';

/**************************
 * add/update tab for stock
 * **************************** */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';

import Input from '../../../../lib/core-components/Input';
import NumberInput from '../../../../lib/core-components/NumberInput';
import Button from '../../../../lib/core-components/Button';
import Grid from '../../../../lib/core-components/Grid';
import DatetimePicker from '../../../../lib/core-components/DatetimePicker';
import CompanyHierarchy from '../../../common/companyhierarchy/index';

import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';
import { newUUID } from '../../../../../shared/uuid';
import { digitDecimal } from '../../../../../shared/format/number';

class StockTab extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.strings = this.props.strings;
        this.stockSchema = ['StockOnDate', 'StockOnHand', 'StockCost'];
        this.objStock = {};
        this.updateStockDB = false;  // Use this flag for edit mode at server side
        this.state = {
            stockData: [], // Store feed stock data
            addMode: false, // Check mode for feed stock
            isClicked: false,
            columns: [
                { field: 'Id', isKey: true, isSort: false, displayName: 'Id' },
                { field: 'AuditLogId', displayName: 'AuditLogId' },
                { field: 'IsDeleted', displayName: 'IsDeleted' },
                { field: 'StockOnDate', displayName: 'Stock Date', visible: true, format: 'dateformat' },
                { field: 'StockOnHand', displayName: 'Stock On Hand (Tonne)', visible: true, format: 'decimalformat' },
                { field: 'StockCost', displayName: 'Stock Cost ($)', format: 'currencyformat', visible: true },
                { field: 'Company', displayName: 'Company', visible: true },
                { field: 'Type', displayName: 'Type' },
                { field: 'Property', displayName: 'Property', visible: true, format: 'emptyFormat' },
                { field: 'Id', displayName: 'Actions', visible: true, isSort: false, width: '100px', format: 'actionFormat' }
            ]
        }
        this.addStock = this.addStock.bind(this);
        this.editStock = this.editStock.bind(this);
        this.deleteStock = this.deleteStock.bind(this);
        this.deleteStockClick = this.deleteStockClick.bind(this);
        this.getValues = this.getValues.bind(this);
        this.cancelClick = this.cancelClick.bind(this);
        this.addNewClick = this.addNewClick.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    // Set data of feed stock
    componentWillMount() {
        this.mounted = true;
        if (this.props.stockData.length > 0) {
            this.setState({ stockData: this.props.stockData });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // Add stock to grid
    addStock(e) {
        e.preventDefault();
        this.updateStockDB = true;

        let isFormValid = isValidForm(this.stockSchema, this.refs);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.stateSet({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let objHierarchy = this.refs.hierarchy.getValues();
        if (objHierarchy == false) {
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }


        let gridData = this.state.stockData;

        let newEntry = true;
        let newId = newUUID();
        let newAuditLogId = newUUID();

        // Edit mode of grid data
        if (this.objStock.Id) {
            newEntry = false;
            newId = this.objStock.Id;
            newAuditLogId = this.objStock.AuditLogId;
            let index = gridData.findIndex(x => x.Id == this.objStock.Id)
            if (index != -1) {
                gridData.splice(index, 1);
            }
        }

        if (newEntry)
            this.objStock.NewEntry = true;

        this.objStock.StockOnDate = this.refs.StockOnDate.fieldStatus.value;
        this.objStock.StockOnHand = digitDecimal(this.refs.StockOnHand.fieldStatus.value);
        this.objStock.StockCost = digitDecimal(this.refs.StockCost.fieldStatus.value);

        this.objStock.Id = newId;
        this.objStock.AuditLogId = newAuditLogId;
        this.objStock.IsDeleted = 0;

        this.objStock.CompanyId = objHierarchy.id;
        this.objStock.PropertyId = objHierarchy.propertyId;
        this.objStock.Company = objHierarchy.name;
        this.objStock.Property = objHierarchy.property;
        this.objStock.Type = objHierarchy.type;

        gridData.unshift(this.objStock);
        this.stateSet({ addMode: false, isClicked: false, stockData: gridData });
        this.objStock = {};
    }

    // Edit stock from grid
    editStock(id) {
        this.objStock = this.state.stockData.find((f) => {
            return id == f.Id;
        });
        this.stateSet({ addMode: true });
    }

    // Delete stock from grid on confirmation
    deleteStock(id) {
        this.updateStockDB = true;
        let gridData = [];
        this.state.stockData.map((f) => {
            if (f.Id == id) {
                f.IsDeleted = 1;
                if (f.NewEntry != true)
                    gridData.push(f);
            }
            else
                gridData.push(f);
        });
        this.props.hideConfirmPopup();
        this.stateSet({ stockData: gridData });
    }

    // Handle delete stock click from grid
    deleteStockClick(id) {
        let payload = {
            confirmText: this.strings.DELETE_STOCK_CONFIRMATION_MESSAGE,
            strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
            onConfirm: () => this.deleteStock(id)
        };
        this.props.openConfirmPopup(payload);
    }

    // return tab values to add/edit
    getValues() {
        return {
            feedStock: this.state.stockData,
            updateStockDB: this.updateStockDB
        };
    }

    cancelClick() {
        this.setState({ addMode: false, isClicked: false });
        this.objStock = {};
    }

    addNewClick() {
        this.setState({ addMode: true });
    }

    // Render stock form
    renderForm() {
        let { strings } = this.props;
        return (
            <div className="form-group">
                <form autoComplete="off" className="form-cover" onSubmit={this.addStock}>
                    <div className="col-md-6">
                        <CompanyHierarchy
                            inputProps={{
                                id: this.objStock.Id ? this.objStock.CompanyId : null,
                                name: this.objStock.Id ? this.objStock.Company : null,
                                type: this.objStock.Id ? this.objStock.Type : null,
                                propertyId: this.objStock.Id ? this.objStock.PropertyId : null,
                                property: this.objStock.Id ? this.objStock.Property : null
                            }}
                            {...this.props.hierarchyProps}
                            isClicked={this.state.isClicked} strings={{ ...this.strings.COMMON }} ref="hierarchy" />
                    </div>
                    <div className="col-md-6">
                        <DatetimePicker inputProps={{
                            name: 'stockOnDate',
                            placeholder: strings.CONTROLS.DATE_PLACEHOLDER,
                            label: strings.CONTROLS.DATE_LABEL
                        }}
                            eReq={strings.CONTROLS.DATE_REQ_MESSAGE}
                            defaultValue={this.objStock.Id ? new Date(this.objStock.StockOnDate) : new Date()}
                            timeFormat={false}
                            isClicked={this.state.isClicked} ref="StockOnDate" />

                        <NumberInput inputProps={{
                            name: 'stockOnHand',
                            hintText: strings.CONTROLS.ONHAND_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.ONHAND_LABEL
                        }}
                            initialValue={this.objStock.Id ? this.objStock.StockOnHand.toString() : null}
                            maxLength={10} numberType="decimal"
                            eReq={strings.CONTROLS.ONHAND_REQ_MESSAGE}
                            isClicked={this.state.isClicked} ref="StockOnHand" />

                        <NumberInput inputProps={{
                            name: 'stockCost',
                            hintText: strings.CONTROLS.COST_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.COST_LABEL
                        }}
                            initialValue={this.objStock.Id ? this.objStock.StockCost.toString() : null}
                            maxLength={10} numberType="decimal"
                            isClicked={this.state.isClicked} ref="StockCost" />

                    </div>
                    <div className="col-md-12 mt15" style={{ textAlign: 'right' }}>
                        <Button
                            inputProps={{
                                name: 'btnAdd',
                                label: this.objStock.Id ? strings.CONTROLS.UPDATE_LABEL : strings.CONTROLS.ADD_LABEL,
                                type: 'submit',
                                className: 'button2Style button30Style mr10'
                            }}
                            onClick={this.addStock} ></Button>
                        <Button
                            inputProps={{
                                name: 'btnCancel',
                                label: strings.CONTROLS.BACK_LABEL,
                                className: 'button1Style button30Style'
                            }} onClick={this.cancelClick}></Button>
                    </div>
                </form>
            </div>
        );
    }

    // Render stock grid
    renderGrid() {
        let gridProps = {
            columns: this.state.columns,
            isRemoteData: false,
            gridData: this.state.stockData.filter(s => { return s.IsDeleted == 0 }),
            selectRowMode: "none",
            editClick: this.editStock,
            deleteClick: this.deleteStockClick
        }
        return (<div>
            <div className="l-stock-top-btn setup-top">
                <ul>
                    <li>
                        <Button
                            inputProps={{
                                name: 'btnAddNew',
                                label: this.strings.CONTROLS.ADDNEW_LABEL,
                                className: 'button1Style button30Style',
                            }}
                            onClick={this.addNewClick}
                        ></Button>
                    </li>
                </ul>
            </div>
            <div className="livestock-content">
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

export default StockTab;