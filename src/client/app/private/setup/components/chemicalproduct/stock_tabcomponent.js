'use strict';

/**************************
 * add/update tab for chemical product stock
 * **************************** */

import React, { Component } from 'react';
import { getAllUoM } from '../../../../../services/private/setup';
import Dropdown from '../../../../../lib/core-components/Dropdown';
import Input from '../../../../../lib/core-components/Input';
import NumberInput from '../../../../../lib/core-components/NumberInput';
import DatetimePicker from '../../../../../lib/core-components/DatetimePicker';
import Grid from '../../../../../lib/core-components/Grid';
import Button from '../../../../../lib/core-components/Button';
import AutoComplete from '../../../../../lib/core-components/AutoComplete';
import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../../common/actiontypes';
import { newUUID, bufferToUUID } from '../../../../../../shared/uuid';
import { formatDateTime, isAfter } from '../../../../../../shared/format/date';

class StockTab extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.stockObj = {}; // stock object while in edit mode
        this.gridData = []; // all stock data for insert/update
        this.stockSchema = ['batchnumber', 'stockonhand', 'cost', 'manufactureDate', 'usebyDate', 'storagepic',
            'stockDate', 'supplier', 'uom'];
        this.strings = this.props.strings;
        this.state = {
            uomData: [], // drop down data of UoM
            addMode: false, // flag to display grid/form
            isClicked: false, // handle form submit click
            stockData: [], // stock data to display in grid
            filterDD: [], // drop down data of month-year filter
            filterIndex: null, //current index of month-year filter
            columns: [
                { field: 'Id', isKey: true, isSort: false, displayName: 'Stock Id' },
                { field: 'batchnumber', displayName: 'Batch Number', visible: true, format: 'linkFormat' },
                { field: 'stockOnHandUoM', displayName: 'Stock On Hand', visible: true },
                { field: 'cost', displayName: 'Cost' },
                { field: 'stockDate', displayName: 'Stock Date', visible: true, format: 'dateformat' },
                { field: 'manufactureDate', displayName: 'Date of Manufacturing', visible: true, format: 'dateformat' },
                { field: 'usebyDate', displayName: 'Used By Date', visible: true, format: 'dateformat' },
                { field: 'pictext', displayName: 'Storage PIC', visible: true },
                { field: 'Id', displayName: 'Actions', visible: true, isSort: false, width: '100px', format: 'deleteFormat' }
            ]
        }

        this.onUoMChange = this.onUoMChange.bind(this);
        this.addStock = this.addStock.bind(this);
        this.deleteStock = this.deleteStock.bind(this);
        this.editStock = this.editStock.bind(this);
        this.filterDDChange = this.filterDDChange.bind(this);
        this.filterNext = this.filterNext.bind(this);
        this.filterPrev = this.filterPrev.bind(this);
        this.validations = this.validations.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        let objResponse = {};
        getAllUoM('treatment').then(function (res) {
            if (res.success) {
                objResponse.uomData = res.data;
            }
        }).then(function (resPromise) {
            _this.stateSet({ uomData: objResponse.uomData });
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidMount() {
        if (this.props.chemicalProductStock) {
            this.props.chemicalProductStock.map((stockObj) => {
                this.gridData.push({
                    Id: stockObj.Id,
                    batchnumber: stockObj.BatchNumber,
                    stockOnHandUoM: stockObj.StockOnHand + ' ' + stockObj.UomName,
                    cost: stockObj.Cost,
                    manufactureDate: stockObj.DateOfManufacturing,
                    usebyDate: stockObj.ExpiryDate,
                    pictext: stockObj.StoragePIC,
                    storagepic: { PIC: stockObj.StoragePIC, Id: stockObj.PropertyId },
                    stockonhand: stockObj.StockOnHand.toString(),
                    supplier: stockObj.Supplier,
                    stockDate: stockObj.StockDate,
                    uomId: bufferToUUID(stockObj.UoMId.data),
                    uomName: stockObj.UomName,
                    auditId: stockObj.AuditLogId,
                    isDeleted: false
                });
            });
            let filterArr = this.manageFilterDDValues(this.props.chemicalProductStock);
            this.stateSet({
                stockData: this.gridData,
                filterDD: filterArr
            })
        }
    }

    // get/update available values for month-year filter drop down from stock dates
    // at initial point/after add, update, delete
    manageFilterDDValues(stockArr) {
        let monthYearArr = [];
        let filterArr = [];

        stockArr.map((stockObj) => {
            let stockDate = stockObj.stockDate ? stockObj.stockDate : stockObj.StockDate;
            let dateStr = formatDateTime(stockDate).MMMYYYY;
            if (monthYearArr.indexOf(dateStr) === -1) {
                monthYearArr.push(dateStr);
            }
        });
        monthYearArr.sort(function (a, b) {
            return new Date(a).getTime() - new Date(b).getTime()
        });
        monthYearArr.map((obj, index) => {
            filterArr.push({
                id: index.toString(),
                value: obj
            });
        });
        return filterArr;
    }

    // handle change event of filter drop down
    filterDDChange(value, text) {
        let displayData = this.gridData.filter((stock) => {
            return (value != null ? !stock.isDeleted && formatDateTime(stock.stockDate).MMMYYYY == text : !stock.isDeleted);
        });
        this.stateSet({
            stockData: displayData,
            filterIndex: value,
        });
    }

    // navigate to next value of filter drop down
    filterNext() {
        let index = this.state.filterIndex;
        if (index) {
            if (parseInt(index) < this.state.filterDD.length) {
                index = (parseInt(index) + 1);
            }
        }
        else {
            index = '0';
        }
        let filterObj = this.state.filterDD.filter((obj) => {
            return obj.id == index;
        })[0];
        this.filterDDChange(filterObj.id, filterObj.value);
    }

    // navigate to previous value of filter drop down
    filterPrev() {
        let index = this.state.filterIndex;
        if (index) {
            if (parseInt(index) == 0) {
                index = null;
            } else {
                index = parseInt(index) - 1;
            }
        }
        let filterObj = this.state.filterDD.filter((obj) => {
            return obj.id == index;
        })[0];
        this.filterDDChange(filterObj.id, filterObj.value);
    }

    // handle change event of UoM drop down
    onUoMChange(value, text) {
        this.stockObj.uomId = value;
        this.stockObj.uomName = text;
    }

    validations(obj, stockId) {
        // check expiry date validations
        if (obj.manufactureDate && obj.usebyDate) {
            if (isAfter(obj.manufactureDate, obj.usebyDate)) {
                this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.STOCK_EXPIRYDATE_VALIDATION });
                return false;
            }
        }
        // check for duplicate batch number
        let dupBatch = this.gridData.filter((stock) => {
            return !stock.isDeleted && stock.batchnumber == obj.batchnumber && stockId != stock.Id;
        });
        if (dupBatch.length > 0) {
            dupBatch = dupBatch[0];
            if (this.stockObj.Id && this.stockObj.Id != dupBatch.Id) {
                // updating stock
                this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.STOCK_DUPLICATE_BATCHNUMBER });
                return false;
            }
            else {
                // new stock entry
                this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.STOCK_DUPLICATE_BATCHNUMBER });
                return false;
            }
        }
        return true;
    }

    // add/update stock
    addStock(e) {
        e.preventDefault();
        let isFormValid = isValidForm(this.stockSchema, this.refs);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }
        let obj = getForm(this.stockSchema, this.refs);
        let isValid = this.validations(obj, this.stockObj.Id);
        if (!isValid) return false;
        let newId = newUUID();
        // if record is in edit mode remove existing record
        if (this.stockObj.Id) {
            newId = this.stockObj.Id;
            let index = this.gridData.findIndex(x => x.Id == this.stockObj.Id)
            if (index != -1)
                this.gridData.splice(index, 1);
        }
        this.stockObj.Id = newId;
        Object.assign(this.stockObj, obj); // merge "this.stockObj" and obj Objects into "this.stockObj"
        this.stockObj.stockOnHandUoM = this.stockObj.stockonhand + ' ' + this.stockObj.uomName; //stockOnHandUoM for grid display column
        this.stockObj.pictext = this.stockObj.storagepic.PIC;
        this.gridData.push(this.stockObj);
        let displayData = this.gridData.filter((stock) => {
            return !stock.isDeleted;
        });
        let filterArr = this.manageFilterDDValues(displayData);
        this.stateSet({
            addMode: false,
            isClicked: false,
            stockData: displayData,
            filterDD: filterArr
        });
        this.stockObj = {};
    }

    // handle edit click for stock
    editStock(batchName) {
        this.stockObj = this.state.stockData.filter((stock) => {
            return batchName == stock.batchnumber;
        })[0];
        this.setState({ addMode: true });
    }

    // handle delete click for stock
    deleteStock(id) {
        this.gridData = this.gridData.filter((stock) => {
            if (stock.Id == id && stock.isDeleted == false) {
                stock.isDeleted = true;
                return stock;
            }
            else {
                return stock.Id != id;
            }
        });
        let displayData = this.gridData.filter((stock) => {
            return !stock.isDeleted;
        });
        let filterArr = this.manageFilterDDValues(displayData);
        this.setState({ stockData: displayData, filterDD: filterArr });
    }

    renderForm() {
        return (
            <form autoComplete="off" className="form-cover" onSubmit={this.addStock}>
                <div className="row">
                    <div className="col-md-6">
                        <div className="row">
                            <div className="col-md-5 dropdown-input">
                                <NumberInput inputProps={{
                                    name: 'stockonhand',
                                    hintText: this.strings.CONTROLS.STOCK_STOCKONHAND_PLACEHOLDER,
                                    floatingLabelText: this.strings.CONTROLS.STOCK_STOCKONHAND_LABEL
                                }}
                                    initialValue={this.stockObj.Id ? this.stockObj.stockonhand : null}
                                    maxLength={10}
                                    eReq={this.strings.CONTROLS.STOCK_STOCKONHAND_REQ_MESSAGE}
                                    isClicked={this.state.isClicked} ref="stockonhand" />
                            </div>
                            <div className="col-md-7">
                                <Dropdown inputProps={{
                                    name: 'uom',
                                    hintText: this.strings.CONTROLS.STOCK_SOHUOM_PLACEHOLDER,
                                    floatingLabelText: this.strings.CONTROLS.STOCK_SOHUOM_PLACEHOLDER,
                                    value: this.stockObj.Id ? this.stockObj.uomId : null
                                }}
                                    eReq={this.strings.CONTROLS.STOCK_SOHUOM_REQ_MESSAGE} onSelectionChange={this.onUoMChange}
                                    textField="NameCode" valueField="Id" dataSource={this.state.uomData}
                                    isClicked={this.state.isClicked} ref="uom" />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 dropdown-input">
                        <NumberInput inputProps={{
                            name: 'cost',
                            hintText: this.strings.CONTROLS.STOCK_COST_PLACEHOLDER,
                            floatingLabelText: this.strings.CONTROLS.STOCK_COST_LABEL
                        }}
                            initialValue={this.stockObj.Id ? this.stockObj.cost.toString() : null}
                            maxLength={10} numberType="decimal"
                            isClicked={this.state.isClicked} ref="cost" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'batchnumber',
                            hintText: this.strings.CONTROLS.STOCK_BATCHNO_PLACEHOLDER,
                            floatingLabelText: this.strings.CONTROLS.STOCK_BATCHNO_LABEL
                        }}
                            maxLength={20} initialValue={this.stockObj.Id ? this.stockObj.batchnumber : ''}
                            eReq={this.strings.CONTROLS.STOCK_BATCHNO_REQ_MESSAGE}
                            isClicked={this.state.isClicked} ref="batchnumber" />
                    </div>
                    <div className="col-md-6">
                        <DatetimePicker inputProps={{
                            name: 'stockDate',
                            placeholder: this.strings.CONTROLS.STOCK_STOCKDATE_PLACEHOLDER,
                            label: this.strings.CONTROLS.STOCK_STOCKDATE_LABEL
                        }}
                            defaultValue={this.stockObj.Id ? new Date(this.stockObj.stockDate) : new Date()}
                            timeFormat={false}
                            isClicked={this.state.isClicked} ref="stockDate" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <DatetimePicker inputProps={{
                            name: 'manufactureDate',
                            placeholder: this.strings.CONTROLS.STOCK_MANUFACTUREDATE_PLACEHOLDER,
                            label: this.strings.CONTROLS.STOCK_MANUFACTUREDATE_LABEL
                        }}
                            defaultValue={this.stockObj.Id ? new Date(this.stockObj.manufactureDate) : ''}
                            timeFormat={false}
                            isClicked={this.state.isClicked} ref="manufactureDate" />
                    </div>
                    <div className="col-md-6">
                        <DatetimePicker inputProps={{
                            name: 'usebyDate',
                            placeholder: this.strings.CONTROLS.STOCK_USEBYDATE_PLACEHOLDER,
                            label: this.strings.CONTROLS.STOCK_USEBYDATE_LABEL
                        }}
                            defaultValue={this.stockObj.Id ? new Date(this.stockObj.usebyDate) : ''}
                            timeFormat={false}
                            isClicked={this.state.isClicked} ref="usebyDate" />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <AutoComplete inputProps={{
                            name: 'storagepic',
                            hintText: this.strings.CONTROLS.STOCK_STORAGEPIC_PLACEHOLDER,
                            floatingLabelText: this.strings.CONTROLS.STOCK_STORAGEPIC_PLACEHOLDER,
                            className: "inputStyle inputStyle2"
                        }}
                            searchText={this.stockObj.Id ? this.stockObj.pictext : ''}
                            selectedValue={this.stockObj.Id ? this.stockObj.storagepic.Id : null}
                            textField="PIC" valueField="Id"
                            apiUrl="/api/private/property/getall?search=$$$"
                            isClicked={this.state.isClicked} ref="storagepic" />
                    </div>

                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'supplier',
                            hintText: this.strings.CONTROLS.STOCK_SUPPLIER_PLACEHOLDER,
                            floatingLabelText: this.strings.CONTROLS.STOCK_SUPPLIER_LABEL
                        }}
                            maxLength={100} initialValue={this.stockObj.Id ? this.stockObj.supplier : ''}
                            isClicked={this.state.isClicked} ref="supplier" />
                    </div>
                </div>

                <div className="l-stock-top-btn setup-top">
                    <ul>
                        <li>
                            <Button inputProps={{
                                name: 'btnAddStock',
                                label: this.strings.CONTROLS.SAVE_LABEL,
                                className: 'button2Style button30Style',
                            }} onClick={this.addStock}></Button>
                        </li>
                        <li>
                            <Button inputProps={{
                                name: 'btnClear',
                                label: this.strings.CONTROLS.BACK_LABEL,
                                className: 'button1Style button30Style',
                            }} onClick={() => this.setState({ addMode: false })}></Button>
                        </li>
                    </ul>
                </div>
                <div className="clear" />
            </form>
        );
    }

    renderGrid() {
        return (
            <div>
                <div className="col-md-3" key={this.state.filterIndex}>
                    <div className="row">
                        <Dropdown inputProps={{
                            name: 'filterDD',
                            hintText: this.strings.CONTROLS.STOCK_FILTERDROPDOWN_PLACEHOLDER,
                            value: this.state.filterIndex != null ? this.state.filterIndex.toString() : null
                        }}
                            onSelectionChange={this.filterDDChange}
                            textField="value" valueField="id" dataSource={this.state.filterDD}
                            isClicked={this.state.isClicked} ref="filterDD" />
                    </div>
                </div>
                <div className="col-md-9">
                    <div className="row">
                        <Button
                            inputProps={{
                                name: 'btnfilterPrev',
                                label: "-",
                                className: 'btnPrev',
                            }}
                            onClick={this.filterPrev}
                        ></Button>

                        <Button
                            inputProps={{
                                name: 'btnfilterNext',
                                label: "-",
                                className: 'btnNext',
                            }}
                            onClick={this.filterNext}
                        ></Button>
                        <Button
                            inputProps={{
                                name: 'btnAddNew',
                                label: this.strings.CONTROLS.NEW_LABEL,
                                className: 'button1Style button30Style pull-right mt10',
                            }}
                            onClick={() => { this.stockObj = {}; this.setState({ addMode: true }) }}
                        ></Button>
                    </div>
                </div>
                <div className="clear"></div>
                <Grid ref="stockGrid" columns={this.state.columns} isRemoteData={false} gridData={this.state.stockData}
                    height="200px" selectRowMode="none" editClick={this.editStock} deleteClick={this.deleteStock} />
                <div className="clear"></div>
            </div>
        );
    }

    render() {
        return (
            <div className="col-md-12">
                {this.state.addMode ? this.renderForm() : this.renderGrid()}
            </div>
        );
    }
}

export default StockTab;