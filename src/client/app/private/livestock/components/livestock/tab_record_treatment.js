'use strict';

/**************************
 * treatment tab component of record treatment
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { map as _map } from 'lodash';

import RadioButton from '../../../../../lib/core-components/RadioButton';
import AutoComplete from '../../../../../lib/core-components/AutoComplete';
import Input from '../../../../../lib/core-components/Input';
import NumberInput from '../../../../../lib/core-components/NumberInput';
import Dropdown from '../../../../../lib/core-components/Dropdown';
import DateTimePicker from '../../../../../lib/core-components/DatetimePicker';
import CheckBox from '../../../../../lib/core-components/CheckBox';
import Grid from '../../../../../lib/core-components/Grid';
import Button from '../../../../../lib/core-components/Button';
import CompanyAutoComplete from '../../../../../lib/wrapper-components/CompanyAutoComplete';
import ContactAutoComplete from '../../../../../lib/wrapper-components/ContactAutoComplete';

import { getTreatmentSessionProductData } from '../../../../../services/private/livestock';

import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../../common/actiontypes';
import { newUUID, uuidToBuffer, bufferToUUID } from '../../../../../../shared/uuid';
import { chemicalProductService } from '../../../../../../shared/constants';
import { livestockEventDateFilter } from '../../../../../../shared/index';

class TabTreatment extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.propertyAddress = null;
        this.authorisedContactId = null;
        this.dateFilter = null;

        this.treatmentSchema = ['dateoftreatment', 'contractorstock', 'administerperson'];
        this.sessionSchema = ['sessionname', 'disease'];
        this.chemSchema = ['service', 'chemicalproduct', 'batchnumber', 'stockonhand', 'stockuom',
            'stockcost', 'dose', 'doseuom'];

        this.nonChemSchema = ['service', 'treatname'];

        this.state = {
            key: Math.random(),
            batchNumberKey: Math.random(),
            isClicked: false,
            service: '1',

            uomData: [],
            contractorCompanyId: null,
            contractorCompanyName: null,
            chemicalProductId: null,
            chemicalProductStockId: null,

            addMode: true,
            chemicalProductData: [],
            columns: [
                { field: 'Id', isKey: true, isSort: false, displayName: 'Id' },
                { field: 'SessionId', displayName: 'Session Id' },
                { field: 'SessionAuditLogId', displayName: 'Session AuditLogId' },
                { field: 'SessionName', displayName: 'Session Name', visible: false },
                { field: 'ChemicalProduct', displayName: 'Chemical Product', visible: true },
                { field: 'TreatName', displayName: 'Name of Treat', visible: true },
                { field: 'Service', displayName: 'Service', visible: true },
                { field: 'BatchNumber', displayName: 'Batch Number', visible: true },
                { field: 'WHP', displayName: 'WHP', visible: true },
                { field: 'ESI', displayName: 'ESI', visible: true },
                { field: 'Dosage', displayName: 'Dose', visible: true, formatter: this.dosageColumn.bind(this) },
                { field: 'Id', displayName: 'Actions', visible: true, isSort: false, width: '100px', format: 'actionFormat' }
            ]
        }

        this.onSelectChemicalProduct = this.onSelectChemicalProduct.bind(this);
        this.onSelectBatchNumber = this.onSelectBatchNumber.bind(this);
        this.onContactChange = this.onContactChange.bind(this);
        this.serviceChange = this.serviceChange.bind(this);
        this.addChemical = this.addChemical.bind(this);
        this.editChemProduct = this.editChemProduct.bind(this);
        this.deleteChemProductClick = this.deleteChemProductClick.bind(this);
        this.resetForm = this.resetForm.bind(this);
        this.resetProductObj = this.resetProductObj.bind(this);
        this.getValues = this.getValues.bind(this);

        this.resetProductObj();
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        let sessionIds = _map(this.props.sessionIds, 'Id');
        getTreatmentSessionProductData(this.props.topPIC.PropertyId, this.props.selectedIds, sessionIds).then(function (res) {
            if (res.success) {
                _this.propertyAddress = res.data.address;
                _this.productObj.stockUoMId = res.data.uomData.length > 0 ? res.data.uomData[0]['Id'] : null;
                _this.productObj.doseUoMId = _this.productObj.stockUoMId;
                _this.dateFilter = livestockEventDateFilter(res.data.dates.InductionDate, res.data.dates.ScanDate);
                let columns = [..._this.state.columns];
                if (res.data.sessionProducts.length > 0) {
                    let columnObj = columns.find(x => x.field == 'SessionName');
                    columnObj.visible = true;
                }
                _this.stateSet({ uomData: res.data.uomData, chemicalProductData: res.data.sessionProducts, columns: columns });
            }
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // bind dosage column with uom
    dosageColumn(cell, row) {
        let obj = this.state.uomData.find(x => x.Id == row['DosageUoMId']);
        return obj ? row['Dosage'] + ' ' + (obj.Name || '') : '';
    }

    // handle change event of service radio button
    serviceChange(value) {
        this.setState({ service: value });
    }

    // reset add chemical product form
    resetForm(data = [...this.state.chemicalProductData]) {
        this.resetProductObj();
        this.setState({
            key: Math.random(), chemicalProductData: data,
            chemicalProductId: null, chemicalProductStockId: null,
            addMode: true, service: '1', isClicked: false
        });
    }

    // reset this.productObj
    resetProductObj() {
        this.productObj = {
            id: null,
            sessionId: null,
            sessionAuditLogId: null,
            sessionName: '',
            newEntry: true,
            chemicalProductObj: null,
            chemicalProductStockObj: null,
            treatName: '',
            chemicalProductId: null,
            batchNumber: '',
            stockOnHand: '',
            stockUoMId: this.state.uomData.length > 0 ? this.state.uomData[0]['Id'] : null,
            whp: '',
            esi: '',
            stockCost: '',
            dose: '',
            doseUoMId: this.state.uomData.length > 0 ? this.state.uomData[0]['Id'] : null
        };
    }

    // handle button click of Add/Edit Chemical
    addChemical() {
        let schema = [];
        if (this.state.service == '1') {
            schema = this.chemSchema
            if (this.state.chemicalProductStockId) {
                schema = [...this.chemSchema, 'whp', 'esi'];
            }
        }
        else
            schema = this.nonChemSchema;

        let isFormValid = isValidForm(schema, this.refs);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.stateSet({ isClicked: true });
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let obj = getForm(schema, this.refs);

        let serviceObj = chemicalProductService.find(x => x.Value == obj.service);
        let isVaccineChemical = serviceObj.Value == '1';
        let data = [...this.state.chemicalProductData];

        let isDuplicate = false;
        let msgKey = '';
        if (isVaccineChemical) {
            let duplicateIndex = data.findIndex(x => x.SessionId == this.productObj.sessionId && x.Id != this.productObj.id && x.ChemicalProductId == obj.chemicalproduct.Id && x.BatchNumber == (obj.batchnumber.BatchNumber || obj.batchnumber));
            isDuplicate = duplicateIndex != -1;
            msgKey = this.strings.DUPLICATE_CHEMICAL_FOUND;
        }
        else {
            let duplicateIndex = data.findIndex(x => x.SessionId == this.productObj.sessionId && x.Id != this.productObj.id && x.TreatName.toLowerCase() == obj.treatname.toLowerCase());
            isDuplicate = duplicateIndex != -1;
            msgKey = this.strings.DUPLICATE_TREAT_NAME_FOUND;
        }
        if (isDuplicate) {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });
            this.notifyToaster(NOTIFY_ERROR, { message: msgKey });
            return false;
        }

        let chemProductObj = {
            IsVaccineChemical: isVaccineChemical,
            ChemicalProductObj: isVaccineChemical ? obj.chemicalproduct : null,
            ChemicalProductStockObj: isVaccineChemical ? obj.batchnumber : null,
            ChemicalProduct: isVaccineChemical ? obj.chemicalproduct.Name : null,
            ChemicalProductId: isVaccineChemical ? obj.chemicalproduct.Id : null,
            ChemicalProductStockId: isVaccineChemical ? this.state.chemicalProductStockId : null,
            TreatName: isVaccineChemical ? '' : obj.treatname,
            Service: serviceObj.Text,
            BatchNumber: isVaccineChemical ? obj.batchnumber.BatchNumber || obj.batchnumber : '',
            StockOnHand: isVaccineChemical ? obj.stockonhand : '',
            StockCost: isVaccineChemical ? obj.stockcost : '',
            StockUoMId: isVaccineChemical ? obj.stockuom : null,
            WHP: isVaccineChemical ? obj.whp : '',
            ESI: isVaccineChemical ? obj.esi : '',
            Dosage: isVaccineChemical ? obj.dose : '',
            DosageUoMId: isVaccineChemical ? obj.doseuom : null,
            IsDeleted: 0
        }

        if (this.state.addMode) {
            chemProductObj.Id = newUUID();
            chemProductObj.NewEntry = true;
            data.unshift(chemProductObj);
        }
        else {
            
            let index = data.findIndex(x => x.Id == this.productObj.id)
            if (index != -1) {
                data.splice(index, 1);
            }
            let updatedObj = {
                Id: this.productObj.id,
                NewEntry: this.productObj.newEntry,
                SessionId: this.productObj.sessionId,
                SessionAuditLogId: this.productObj.sessionAuditLogId,
                SessionName: this.productObj.sessionName,
                ...chemProductObj
            }
            if (!updatedObj.NewEntry)
                updatedObj.UpdateEntry = true;

            data.unshift(updatedObj);
        }
        this.resetForm(data);
        this.notifyToaster(NOTIFY_SUCCESS, { message: this.state.addMode ? this.strings.ADD_CHEMICAL_SUCCESS : this.strings.UPDATE_CHEMICAL_SUCCESS });
    }

    // edit chemical product 
    editChemProduct(id) {
        let obj = this.state.chemicalProductData.find((f) => {
            return id == f.Id;
        });
        
        this.productObj = {
            id: obj.Id,
            sessionId: obj.SessionId,
            sessionAuditLogId: obj.SessionAuditLogId,
            sessionName: obj.SessionName,
            newEntry: obj.NewEntry,
            chemicalProductObj: obj.ChemicalProductObj,
            chemicalProductStockObj: obj.ChemicalProductStockObj,
            treatName: obj.TreatName,
            chemicalProductId: obj.ChemicalProductId,
            batchNumber: obj.BatchNumber,
            stockOnHand: obj.StockOnHand,
            stockUoMId: obj.StockUoMId,
            whp: obj.WHP,
            esi: obj.ESI,
            stockCost: obj.StockCost,
            dose: obj.Dosage,
            doseUoMId: obj.DosageUoMId
        };
        this.stateSet({
            chemicalProductId: obj.ChemicalProductId, chemicalProductStockId: obj.ChemicalProductStockId,
            key: Math.random(), addMode: false, service: obj.IsVaccineChemical ? '1' : '2'
        });
    }

    // Delete stock from grid on confirmation
    deleteChemProduct(id) {
        this.updateStockDB = true;
        let gridData = [];
        this.state.chemicalProductData.map((d) => {
            if (d.Id == id) {
                d.IsDeleted = 1;
                d.UpdateEntry = true;
                if (d.NewEntry != true)
                    gridData.push(d);
            }
            else
                gridData.push(d);
        });
        
        this.props.hideConfirmPopup();
        this.stateSet({ chemicalProductData: gridData });
    }

    // Handle delete chemical product click from grid
    deleteChemProductClick(id) {
        let payload = {
            confirmText: this.strings.DELETE_STOCK_CONFIRMATION_MESSAGE,
            strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
            onConfirm: () => this.deleteChemProduct(id)
        };
        this.props.openConfirmPopup(payload);
    }

    // set contact value on change of contact selection
    onContactChange(value) {
        if (!value)
            this.authorisedContactId = null;
        else if (typeof (value) == 'string' || !value.Id)
            this.authorisedContactId = null;
        else
            this.authorisedContactId = value.Id;
    }

    // set values on change of chemical product
    onSelectChemicalProduct(value) {
        this.productObj.chemicalProductStockObj = null;
        this.productObj.batchNumber = '';
        this.productObj.stockOnHand = '';
        this.productObj.stockUoMId = this.state.uomData.length > 0 ? this.state.uomData[0]['Id'] : null;
        this.productObj.whp = '';
        this.productObj.esi = '';
        this.productObj.stockCost = '';

        this.productObj.chemicalProductId = value.Id || null;
        this.setState({ batchNumberKey: Math.random(), chemicalProductId: value.Id || null, chemicalProductStockId: null });
    }

    // set values on change of batch number
    onSelectBatchNumber(value) {
        this.productObj.batchNumber = value.BatchNumber || value || '';
        this.productObj.stockOnHand = value.StockOnHand || this.productObj.stockOnHand;
        this.productObj.stockCost = value.Cost || this.productObj.stockCost;
        this.productObj.whp = value.whp || '';
        this.productObj.esi = value.esi || '';
        this.productObj.stockUoMId = bufferToUUID(value.UoMId) || this.productObj.stockUoMId;
        this.productObj.doseUoMId = this.productObj.stockUoMId;
        this.setState({ chemicalProductStockId: value.Id || null });
    }

    // Get details to save session
    getValues() {
        let isValidTreatment = isValidForm(this.treatmentSchema, this.refs);
        isValidTreatment = isValidTreatment && this.state.contractorCompanyId != null && this.authorisedContactId != null;

        let treatmentObj = getForm(this.treatmentSchema, this.refs);
        treatmentObj.contractorstock = treatmentObj.contractorstock == null ? false : treatmentObj.contractorstock;
        treatmentObj.contractorCompanyId = this.state.contractorCompanyId;
        treatmentObj.authorisedContactId = this.authorisedContactId;

        let isValidSession = isValidForm(this.sessionSchema, this.refs);
        let sessionObj = getForm(this.sessionSchema, this.refs);

        let insertedObj = this.state.chemicalProductData.find(x => x.NewEntry != undefined);
        let productInserted = insertedObj ? true : false;

        let updatedObj = this.state.chemicalProductData.find(x => x.UpdateEntry != undefined);
        let productUpdated = updatedObj ? true : false;

        let deteledSessionIds = [];
        _map(this.props.sessionIds, s => {
            let obj = this.state.chemicalProductData.find(x => x.SessionId == s.Id && x.IsDeleted == 0);
            if (!obj) {
                deteledSessionIds.push(s.Id);
            }
        });

        return {
            validTreatment: isValidTreatment || false,
            treatment: treatmentObj,
            validSession: isValidSession || false,
            session: sessionObj,
            sessionProducts: this.state.chemicalProductData,
            productInserted: productInserted,
            productUpdated: productUpdated,
            deteledSessionIds: deteledSessionIds
        }
    }

    render() {
        let gridProps = {
            columns: this.state.columns,
            isRemoteData: false,
            selectRowMode: "none",
            gridData: this.state.chemicalProductData.filter(d => { return d.IsDeleted == 0 }),
            editClick: this.editChemProduct,
            deleteClick: this.deleteChemProductClick
        }

        let disableAddChemical = false;
        if (this.props.disableAddChemical) {
            disableAddChemical = this.state.addMode;
        }

        return (<div>

            <div key={this.state.key} className="col-md-6" >
                <div className="mb5">{this.strings.SERVICE_LABEL}</div>
                <RadioButton inputGroupProps={{ name: 'service', defaultSelected: this.state.service }}
                    disabled={disableAddChemical}
                    dataSource={chemicalProductService}
                    textField="Text" valueField="Value" horizontalAlign={true}
                    onChange={this.serviceChange}
                    isClicked={this.state.isClicked} ref="service" />

                {this.state.service == '2' ?
                    <Input inputProps={{
                        name: 'treatname',
                        hintText: this.strings.TREAT_NAME_PLACEHOLDER,
                        floatingLabelText: this.strings.TREAT_NAME_LABEL,
                        disabled: disableAddChemical
                    }}
                        updateOnChange={true}
                        initialValue={this.productObj.treatName}
                        eReq={this.strings.TREAT_NAME_REQ_MESSAGE}
                        isClicked={this.state.isClicked} ref="treatname" />
                    : null}

                {this.state.service == '1' ?
                    <div>
                        <Button
                            inputProps={{
                                name: 'btnNewChemical',
                                label: this.strings.NEW_CHEMICAL_LABEL,
                                className: 'button1Style button30Style pull-right',
                                disabled: disableAddChemical
                            }}
                            onClick={() => browserHistory.push('/setup/chemicalproduct')}
                        ></Button>

                        <div className="clearfix"></div>

                        <AutoComplete inputProps={{
                            name: 'chemicalproduct',
                            hintText: this.strings.CHEMICAL_PRODUCT_PLACEHOLDER,
                            floatingLabelText: this.strings.CHEMICAL_PRODUCT_LABEL,
                            disabled: disableAddChemical
                        }}
                            selectedObj={this.productObj.chemicalProductObj}
                            eReq={this.strings.CHEMICAL_PRODUCT_REQ_MESSAGE}
                            textField="Name" valueField="Id"
                            apiUrl={"/api/private/chemicalproduct/getlist?search=$$$&topPIC=" + this.props.topPIC + "&speciesId=" + this.props.speciesId}
                            onSelectionChange={this.onSelectChemicalProduct}
                            isClicked={this.state.isClicked} ref="chemicalproduct" />

                        <div key={this.state.batchNumberKey}>
                            <AutoComplete inputProps={{
                                name: 'batchnumber',
                                hintText: this.strings.BATCH_NUMBER_PLACEHOLDER,
                                floatingLabelText: this.strings.BATCH_NUMBER_LABEL,
                                disabled: this.state.chemicalProductId ? disableAddChemical : true
                            }} eInvalid={null}
                                eReq={this.strings.BATCH_NUMBER_REQ_MESSAGE}
                                selectedObj={this.productObj.chemicalProductStockObj}
                                textField="BatchNumber" valueField="Id"
                                apiUrl={"/api/private/chemicalproductstock/getlist?search=$$$&chemicalProductId=" + this.state.chemicalProductId + "&speciesId=" + this.props.speciesId}
                                onSelectionChange={this.onSelectBatchNumber}
                                isClicked={this.state.isClicked} ref="batchnumber" />
                        </div>

                        <div className="row">
                            <div className="col-sm-8">
                                <NumberInput inputProps={{
                                    name: 'stockonhand',
                                    hintText: this.strings.STOCK_ON_HAND_PLACEHOLDER,
                                    floatingLabelText: this.strings.STOCK_ON_HAND_LABEL,
                                    disabled: this.state.chemicalProductStockId || !this.state.chemicalProductId ? true : disableAddChemical
                                }}
                                    eReq={this.strings.STOCK_ON_HAND_REQ_MESSAGE}
                                    updateOnChange={true}
                                    initialValue={this.productObj.stockOnHand}
                                    isClicked={this.state.isClicked}
                                    numberType="decimal" ref="stockonhand" />
                            </div>
                            <div className="col-sm-4" key={this.state.chemicalProductStockId || !this.state.chemicalProductId ? true : false}>
                                <Dropdown inputProps={{
                                    name: 'stockuom',
                                    value: this.productObj.stockUoMId,
                                    disabled: this.state.chemicalProductStockId || !this.state.chemicalProductId ? true : disableAddChemical
                                }}
                                    textField="Name" valueField="Id" dataSource={this.state.uomData}
                                    isClicked={this.state.isClicked} ref="stockuom" />
                            </div>
                        </div>
                        {this.state.chemicalProductStockId ?
                            <div>
                                <Input inputProps={{
                                    name: 'whp',
                                    hintText: this.strings.WHP_PLACEHOLDER,
                                    floatingLabelText: this.strings.WHP_LABEL,
                                    disabled: this.state.chemicalProductStockId || !this.state.chemicalProductId ? true : false
                                }}
                                    updateOnChange={true}
                                    initialValue={this.productObj.whp}
                                    isClicked={this.state.isClicked} ref="whp" />

                                <Input inputProps={{
                                    name: 'esi',
                                    hintText: this.strings.ESI_PLACEHOLDER,
                                    floatingLabelText: this.strings.ESI_LABEL,
                                    disabled: this.state.chemicalProductStockId || !this.state.chemicalProductId ? true : false
                                }}
                                    updateOnChange={true}
                                    initialValue={this.productObj.esi}
                                    isClicked={this.state.isClicked} ref="esi" />
                            </div>
                            : null}

                        <NumberInput inputProps={{
                            name: 'stockcost',
                            hintText: this.strings.STOCK_COST_PLACEHOLDER,
                            floatingLabelText: this.strings.STOCK_COST_LABEL,
                            disabled: this.state.chemicalProductStockId ? true : disableAddChemical
                        }}
                            eReq={this.strings.STOCK_COST_REQ_MESSAGE}
                            initialValue={this.productObj.stockCost}
                            updateOnChange={true}
                            isClicked={this.state.isClicked}
                            numberType="decimal" ref="stockcost" />

                        <div className="row">
                            <div className="col-sm-8">
                                <NumberInput inputProps={{
                                    name: 'dose',
                                    hintText: this.strings.DOSE_PLACEHOLDER,
                                    floatingLabelText: this.strings.DOSE_LABEL,
                                    disabled: disableAddChemical
                                }}
                                    eReq={this.strings.DOSE_REQ_MESSAGE}
                                    updateOnChange={true}
                                    initialValue={this.productObj.dose}
                                    isClicked={this.state.isClicked}
                                    numberType="decimal" ref="dose" />
                            </div>
                            <div className="col-sm-4">
                                <Dropdown inputProps={{
                                    name: 'doseuom',
                                    value: this.productObj.doseUoMId,
                                    disabled: disableAddChemical
                                }}
                                    textField="Name" valueField="Id" dataSource={this.state.uomData}
                                    isClicked={this.state.isClicked} ref="doseuom" />
                            </div>
                        </div>
                    </div>
                    : null}
            </div>

            <div className="col-md-6">

                <DateTimePicker inputProps={{
                    name: 'dateoftreatment',
                    placeholder: this.strings.TREATMENT_DATE_LABEL,
                    label: this.strings.TREATMENT_DATE_LABEL
                }}
                    dateFilter={this.dateFilter}
                    defaultValue={new Date()}
                    isClicked={this.props.isClicked} ref="dateoftreatment" />

                <CompanyAutoComplete
                    inputProps={{
                        hintText: this.strings.TREAT_BY_COMPANY_PLACEHOLDER,
                        floatingLabelText: this.strings.TREAT_BY_COMPANY_LABEL
                    }}
                    eReq={this.strings.TREAT_BY_COMPANY_REQ_MESSAGE}
                    targetKey="treatbycompany"
                    findCompany={this.props.findCompany}
                    openFindCompany={this.props.openFindCompany}
                    selectCompany={(obj) => { this.setState({ contractorCompanyId: obj.Id, contractorCompanyName: obj.Name }) }}
                    notifyToaster={this.props.notifyToaster} />


                <CheckBox inputProps={{
                    name: 'contractorstock',
                    label: this.strings.CONTRACTOR_CHEMICAL_STOCK_LABEL,
                    defaultChecked: false
                }} ref="contractorstock" />

                <div key={this.state.contractorCompanyId}>
                    <ContactAutoComplete inputProps={{
                        name: 'authorisedperson',
                        hintText: this.strings.AUTHORISED_PERSON_PLACEHOLDER,
                        floatingLabelText: this.strings.AUTHORISED_PERSON_LABEL,
                        disabled: this.state.contractorCompanyId ? false : true
                    }}
                        eReq={this.strings.AUTHORISED_PERSON_REQ_MESSAGE}
                        targetKey='authorisedperson'
                        appendUrl={this.state.contractorCompanyId ? ("&companyid=" + this.state.contractorCompanyId) : ''}
                        companyName={this.state.contractorCompanyId ? this.state.contractorCompanyName : null}
                        onSelectionChange={this.onContactChange}
                        isClicked={this.props.isClicked}
                        findContact={this.props.findContact}
                        openFindContact={this.props.openFindContact} />
                </div>

                <Input inputProps={{
                    name: 'administerperson',
                    hintText: this.strings.ADMINISTER_PERSON_PLACEHOLDER,
                    floatingLabelText: this.strings.ADMINISTER_PERSON_LABEL
                }}
                    isClicked={this.props.isClicked} ref="administerperson" />

                <Input inputProps={{
                    name: 'pic',
                    hintText: this.strings.PIC_LABEL,
                    floatingLabelText: this.strings.PIC_LABEL,
                    disabled: true
                }}
                    initialValue={this.props.topPIC.PIC} />

                <Input inputProps={{
                    name: 'property',
                    hintText: this.strings.PROPERTY_NAME_LABEL,
                    floatingLabelText: this.strings.PROPERTY_NAME_LABEL,
                    disabled: true
                }}
                    initialValue={this.props.topPIC.Name} />

                <Input inputProps={{
                    name: 'address',
                    hintText: this.strings.ADDRESS_LABEL,
                    floatingLabelText: this.strings.ADDRESS_LABEL,
                    disabled: true
                }} multiLine={true} updateOnChange={true}
                    initialValue={this.propertyAddress} />

            </div>

            <div className="clearfix top10"></div>

            <div className="col-md-6">
                <Button
                    inputProps={{
                        name: 'btnAddChemical',
                        label: this.state.addMode || disableAddChemical ? this.strings.ADD_CHEMICAL_LABEL : this.strings.UPDATE_CHEMICAL_LABEL,
                        className: 'button1Style button30Style',
                        disabled: disableAddChemical
                    }}
                    onClick={this.addChemical}
                ></Button>
            </div>

            <div className="clearfix top20"></div>

            <div className="col-md-6">
                <Input inputProps={{
                    name: 'sessionname',
                    hintText: this.strings.SESSION_NAME_PLACEHOLDER,
                    floatingLabelText: this.strings.SESSION_NAME_LABEL,
                    disabled: disableAddChemical
                }}
                    eReq={disableAddChemical ? null : this.strings.SESSION_NAME_REQ_MESSAGE}
                    isClicked={this.props.isClicked} ref="sessionname" />
            </div>

            <div className="col-md-6">
                <Input inputProps={{
                    name: 'disease',
                    hintText: this.strings.DISEASE_PLACEHOLDER,
                    floatingLabelText: this.strings.DISEASE_LABEL,
                    disabled: disableAddChemical
                }}
                    isClicked={this.props.isClicked} ref="disease" />
            </div>

            <div className="clearfix"></div>

            <div className="col-md-12">
                <div className="mb15 mt20">{this.strings.CHEMICAL_PRODUCT_IN_SESSION_LABEL}</div>
                <Grid {...gridProps} />
            </div>
        </div>);
    }
}

export default TabTreatment;