'use strict';

/**************************
 * Consigned To Property step for e-NVD
 * **************************** */

import React, { Component } from 'react';

import Input from './../../../../lib/core-components/Input';
import NumberInput from '../../../../lib/core-components/NumberInput';
import CheckBox from '../../../../lib/core-components/CheckBox';
import PICAutoComplete from '../../../../lib/wrapper-components/PICAutoComplete';
import SuburbAutoComplete from '../../../../lib/wrapper-components/SuburbAutoComplete';

import { getPropertyByCondition } from '../../../../services/private/property';
import { bufferToUUID } from '../../../../../shared/uuid';

import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_ERROR } from '../../../common/actiontypes';

class ConsignedToProperty extends Component {
    constructor(props) {
        super(props);

        this.siteURL = window.__SITE_URL__;
        this.strings = { ...this.props.strings.CONSIGNED_TO_PROPERTY, COMMON: this.props.strings.COMMON }
        this.notifyToaster = this.props.notifyToaster;

        this.consignedtoPropertySchema = ['consignedtoPropertyName', 'consignedtoOwnerOfPIC', 'consignedtoEmail',
            'consignedtoMobile', 'consignedtoMobile', 'consignedtoFax', 'consignedtoAddress', 'isDestinationSame'];

        this.destinationSchema = ['destinationPropertyName', 'destinationOwnerOfPIC', 'destinationEmail',
            'destinationMobile', 'destinationFax', 'destinationAddress'];
        this.editData = this.props.editData;
        this.state = {
            consignedToPIC: '',
            consignedToPropertyName: '',
            consignedToOwnerPIC: '',
            consignedToEmail: '',
            consignedToMobile: '',
            consignedToFax: '',
            consignedToAddress: '',
            consignedToSuburbId: null,
            consignedToCountryId: null,
            destinationPIC: '',
            destinationPropertyName: '',
            destinationOwnerPIC: '',
            destinationEmail: '',
            destinationMobile: '',
            destinationFax: '',
            destinationAddress: '',
            destinationSuburbId: null,
            destinationCountryId: null,
            isDestinationSame: this.editData.DestinationPropertyId ? false : true,
            samePIC: Math.random(),
            sameDestPIC: Math.random(),
        }

        this.selectConsignedToPIC = this.selectConsignedToPIC.bind(this);
        this.selectDestinationPIC = this.selectDestinationPIC.bind(this);
        this.onCheck = this.onCheck.bind(this);
    }

    componentWillMount() {
        this.selectConsignedToPIC({ PIC: this.editData.ConsigneePIC, Id: bufferToUUID(this.editData.ConsigneePropertyId) });
        if (this.editData.DestinationPropertyId) {
            this.selectDestinationPIC({ PIC: this.editData.DestinationPIC, Id: bufferToUUID(this.editData.DestinationPropertyId) });
        }
    }

    // check change event for if destination PIC is same
    onCheck(value) {
        this.setState({ isDestinationSame: !value });
        if (!value) {
            this.selectDestinationPIC(null);
        }
    }

    // make consigned to pic selected from PICAutoComplete component
    selectConsignedToPIC(payload) {
        if (payload != null) {
            if (this.ConsignedToPIC != payload.PIC) {
                if (payload.Id == this.props.ConsignedFromPICId) {
                    this.selectConsignedToPIC(null);
                    this.setState({ consignedToPIC: '', samePIC: Math.random() });
                    this.notifyToaster(NOTIFY_ERROR, { message: this.strings.SRC_DEST_PROP_VALIDATION });
                    return;
                }
                this.ConsignedToPIC = payload.PIC;
                this.ConsignedToPICId = payload.Id;
                if (this.ConsignedToPICId) {
                    let where = ` p.UUID = '${this.ConsignedToPICId}'`;
                    let select = `p.UUID AS PropertyId, p.PIC, p.Address, p.Name, c.Name AS PICOwner, c.Email,
                              c.Mobile, c.Fax, s.UUID AS SuburbId, s.Name AS SuburbName, 
                              c.BusinessCountryId AS CountryId`;
                    let joins = ` LEFT JOIN suburb s ON p.SuburbId = s.Id LEFT JOIN company c ON p.CompanyId = c.Id`;
                    let _this = this;
                    getPropertyByCondition(select, joins, where).then(function (res) {
                        if (res.success) {
                            let propertyData = res.response[0];
                            _this.setState({
                                consignedToPIC: propertyData.PIC, consignedToPropertyName: propertyData.Name,
                                consignedToOwnerPIC: propertyData.PICOwner || '',
                                consignedToEmail: propertyData.Email || '',
                                consignedToMobile: propertyData.Mobile || '',
                                consignedToFax: propertyData.Fax || '',
                                consignedToAddress: propertyData.Address || '',
                                consignedToSuburbId: propertyData.SuburbId || null,
                                consignedToCountryId: bufferToUUID(propertyData.CountryId) || null
                            });
                        }
                    }).catch(function (err) {
                        _this.notifyToaster(NOTIFY_ERROR);
                    });
                }
                else {
                    this.setState({
                        consignedToPIC: this.ConsignedToPIC, consignedToPropertyName: '', consignedToOwnerPIC: '',
                        consignedToEmail: '', consignedToMobile: '', consignedToFax: '',
                        consignedToAddress: '', consignedToSuburbId: null,
                        consignedToCountryId: bufferToUUID(this.props.authUser.CountryId)
                    });
                }
            }
        }
        else {
            this.ConsignedToPIC = null;
            this.ConsignedToPICId = null;
            this.setState({
                consignedToPIC: '', consignedToPropertyName: '', consignedToOwnerPIC: '',
                consignedToEmail: '', consignedToMobile: '', consignedToFax: '',
                consignedToAddress: '', consignedToSuburbId: null,
                consignedToCountryId: bufferToUUID(this.props.authUser.CountryId)
            });
        }
    }

    // make destination pic selected from PICAutoComplete component
    selectDestinationPIC(payload) {
        if (payload != null) {
            if (this.DestinationPIC != payload.PIC) {
                if (payload.Id == this.props.ConsignedFromPICId) {
                    this.selectDestinationPIC(null);
                    this.setState({ destinationPIC: '', sameDestPIC: Math.random() });
                    this.notifyToaster(NOTIFY_ERROR, { message: this.strings.SRC_DEST_PROP_VALIDATION });
                    return;
                }
                this.DestinationPIC = payload.PIC;
                this.DestinationPICId = payload.Id;
                if (this.DestinationPICId) {
                    let where = ` p.UUID = '${this.DestinationPICId}'`;
                    let select = `p.UUID AS PropertyId, p.PIC, p.Address, p.Name, c.Name AS PICOwner, c.Email,
                              c.Mobile, c.Fax, s.UUID AS SuburbId, s.Name AS SuburbName, 
                              c.BusinessCountryId AS CountryId`;
                    let joins = ` LEFT JOIN suburb s ON p.SuburbId = s.Id LEFT JOIN company c ON p.CompanyId = c.Id`;
                    let _this = this;
                    getPropertyByCondition(select, joins, where).then(function (res) {
                        if (res.success) {
                            let propertyData = res.response[0];
                            _this.setState({
                                destinationPIC: propertyData.PIC, destinationPropertyName: propertyData.Name,
                                destinationOwnerPIC: propertyData.PICOwner || '',
                                destinationEmail: propertyData.Email || '',
                                destinationMobile: propertyData.Mobile || '',
                                destinationFax: propertyData.Fax || '',
                                destinationAddress: propertyData.Address || '',
                                destinationSuburbId: propertyData.SuburbId || null,
                                destinationCountryId: bufferToUUID(propertyData.CountryId) || null
                            });
                        }
                    }).catch(function (err) {
                        _this.notifyToaster(NOTIFY_ERROR);
                    });
                }
                else {
                    this.setState({
                        destinationPIC: this.DestinationPIC, destinationPropertyName: '', destinationOwnerPIC: '',
                        destinationEmail: '', destinationMobile: '', destinationFax: '',
                        destinationAddress: '', destinationSuburbId: null,
                        destinationCountryId: bufferToUUID(this.props.authUser.CountryId)
                    });
                }
            }
        }
        else {
            this.DestinationPIC = null;
            this.DestinationPICId = null;
            this.setState({
                destinationPIC: '', destinationPropertyName: '', destinationOwnerPIC: '',
                destinationEmail: '', destinationMobile: '', destinationFax: '',
                destinationAddress: '', destinationSuburbId: null,
                destinationCountryId: bufferToUUID(this.props.authUser.CountryId)
            });
        }
    }

    getData() {
        let isFormValid = isValidForm(this.consignedtoPropertySchema, this.refs);
        let isDestinationValid = true;
        if (!this.state.isDestinationSame) {
            isDestinationValid = isValidForm(this.destinationSchema, this.refs);
        }
        if (!isFormValid || !isDestinationValid || !this.ConsignedToPIC ||
            (!this.state.isDestinationSame && !this.DestinationPIC)) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }
        let consignedtoPropertyObj = getForm(this.consignedtoPropertySchema, this.refs);
        let destinationPICDataObj = {}, destinationPICObj = {};
        if (!this.state.isDestinationSame) {
            destinationPICDataObj = getForm(this.destinationSchema, this.refs);
            destinationPICObj = {
                DestinationPIC: this.DestinationPIC,
                DestinationPICId: this.DestinationPICId
            }
        }
        let consignedToPICObj = {
            ConsignedToPIC: this.ConsignedToPIC,
            ConsignedToPICId: this.ConsignedToPICId
        }
        let consignedtoSuburbData = { consignedtoSuburbData: this.refs.consignedtoSuburb.state };
        let destinationSuburbData = { destinationSuburbData: this.refs.destinationSuburb.state };
        Object.assign(consignedtoPropertyObj, destinationPICDataObj, destinationPICObj, consignedToPICObj,
            consignedtoSuburbData, destinationSuburbData);

        return consignedtoPropertyObj;
    }

    render() {
        let strings = this.strings.CONTROLS;
        return (
            <div className="row">
                <div className='col-md-12'>
                    <div className="configure-head mb30">
                        <span>{this.strings.TITLE}</span>
                    </div>
                </div>
                <div className='col-md-6'>
                    <div className="row">
                        <div className="col-md-12">
                        </div>
                        <div className="col-md-12" key={this.state.samePIC}>
                            <PICAutoComplete
                                inputProps={{
                                    hintText: strings.CONSIGNED_TO_PIC_PLACEHOLDER,
                                    floatingLabelText: strings.CONSIGNED_TO_PIC_LABEL,
                                    disabled: this.editData.disableAll
                                }}
                                eReq={strings.CONSIGNED_TO_PIC_REQ_MESSAGE}
                                isClicked={this.props.isClicked}
                                initialValue={this.state.consignedToPIC}
                                targetKey="consignedToPIC" showDetail={false}
                                findPIC={this.props.findPIC}
                                openFindPIC={this.props.openFindPIC}
                                hideFindPIC={this.props.hideFindPIC}
                                selectPIC={this.selectConsignedToPIC}
                                notifyToaster={this.notifyToaster} />
                        </div>
                        <div className="col-md-12">
                            <Input inputProps={{
                                name: 'consignedtoPropertyName',
                                hintText: strings.CONSIGNED_TO_PROPERTY_NAME_PLACEHOLDER,
                                floatingLabelText: strings.CONSIGNED_TO_PROPERTY_NAME_LABEL,
                                disabled: this.editData.disableAll
                            }}
                                updateOnChange={true}
                                maxLength={50} initialValue={this.state.consignedToPropertyName}
                                isClicked={this.props.isClicked} ref="consignedtoPropertyName" />
                        </div>
                        <div className="col-md-12">
                            <Input inputProps={{
                                name: 'consignedtoOwnerOfPIC',
                                hintText: strings.CONSIGNED_TO_PIC_OWNER_PLACEHOLDER,
                                floatingLabelText: strings.CONSIGNED_TO_PIC_OWNER_LABEL,
                                disabled: this.editData.disableAll
                            }}
                                updateOnChange={true}
                                maxLength={100} initialValue={this.state.consignedToOwnerPIC}
                                isClicked={this.props.isClicked} ref="consignedtoOwnerOfPIC" />
                        </div>
                        <div className="col-md-12">
                            <Input inputProps={{
                                name: 'consignedtoEmail',
                                hintText: strings.CONSIGNED_TO_EMAIL_PLACEHOLDER,
                                floatingLabelText: strings.CONSIGNED_TO_EMAIL_LABEL,
                                disabled: this.editData.disableAll
                            }}
                                updateOnChange={true}
                                eInvalid={strings.EMAIL_VALIDATE_MESSAGE}
                                maxLength={100} initialValue={this.state.consignedToEmail}
                                isClicked={this.props.isClicked} ref="consignedtoEmail" />
                        </div>
                        <div className="col-md-12">
                            <NumberInput inputProps={{
                                name: 'consignedtoMobile',
                                hintText: strings.CONSIGNED_TO_MOBILE_PLACEHOLDER,
                                floatingLabelText: strings.CONSIGNED_TO_MOBILE_LABEL,
                                disabled: this.editData.disableAll
                            }}
                                updateOnChange={true}
                                maxLength={20} initialValue={this.state.consignedToMobile}
                                isClicked={this.props.isClicked} ref="consignedtoMobile" />
                        </div>
                        <div className="col-md-12">
                            <NumberInput inputProps={{
                                name: 'consignedtoFax',
                                hintText: strings.CONSIGNED_TO_FAX_PLACEHOLDER,
                                floatingLabelText: strings.CONSIGNED_TO_FAX_LABEL,
                                disabled: this.editData.disableAll
                            }}
                                updateOnChange={true}
                                maxLength={20} initialValue={this.state.consignedToFax}
                                isClicked={this.props.isClicked} ref="consignedtoFax" />
                        </div>
                        <div className="col-md-12">
                            <Input inputProps={{
                                name: 'consignedtoAddress',
                                hintText: strings.CONSIGNED_TO_ADDRESS_PLACEHOLDER,
                                floatingLabelText: strings.CONSIGNED_TO_ADDRESS_LABEL,
                                disabled: this.editData.disableAll
                            }}
                                maxLength={200} initialValue={this.state.consignedToAddress}
                                multiLine={true} updateOnChange={true}
                                isClicked={this.props.isClicked} ref="consignedtoAddress" />
                        </div>
                        <div className="col-md-12">
                            <SuburbAutoComplete suburbName='consignedtoSuburb' ref='consignedtoSuburb'
                                countryId={this.state.consignedToCountryId} strings={this.strings.COMMON}
                                suburbSelectedValue={this.state.consignedToSuburbId} fatchData={true}
                                isClicked={this.props.isClicked} isDisabled={this.editData.disableAll} />
                        </div>
                    </div>
                </div>
                <div className='col-md-6'>
                    <div className="row">
                        <div className="col-md-12 if-destination">
                            <CheckBox inputProps={{
                                name: 'isDestinationSame',
                                label: strings.IS_DESTINATION_SAME_LABEL,
                                defaultChecked: this.editData.DestinationPropertyId ? true : false,
                                disabled: this.editData.disableAll
                            }}
                                onCheck={this.onCheck} className=''
                                isClicked={this.props.isClicked} ref="isDestinationSame" />
                        </div>
                        <div className="col-md-12">
                            <PICAutoComplete
                                inputProps={{
                                    hintText: strings.DESTINATION_PIC_PLACEHOLDER,
                                    floatingLabelText: strings.DESTINATION_PIC_LABEL,
                                    disabled: this.state.isDestinationSame || this.editData.disableAll
                                }}
                                eReq={!this.state.isDestinationSame ? strings.DESTINATION_PIC_REQ_MESSAGE : null}
                                isClicked={this.props.isClicked}
                                initialValue={this.state.destinationPIC}
                                targetKey="destinationPIC" showDetail={false}
                                findPIC={this.props.findPIC}
                                openFindPIC={this.props.openFindPIC}
                                hideFindPIC={this.props.hideFindPIC}
                                selectPIC={this.selectDestinationPIC}
                                notifyToaster={this.notifyToaster} />
                        </div>
                        <div className="col-md-12">
                            <Input inputProps={{
                                name: 'destinationPropertyName',
                                hintText: strings.DESTINATION_PROPERTY_NAME_PLACEHOLDER,
                                floatingLabelText: strings.DESTINATION_PROPERTY_NAME_LABEL,
                                disabled: this.state.isDestinationSame || this.editData.disableAll
                            }}
                                updateOnChange={true}
                                maxLength={50} initialValue={this.state.destinationPropertyName}
                                isClicked={this.props.isClicked} ref="destinationPropertyName" />
                        </div>
                        <div className="col-md-12">
                            <Input inputProps={{
                                name: 'destinationOwnerOfPIC',
                                hintText: strings.DESTINATION_PIC_OWNER_PLACEHOLDER,
                                floatingLabelText: strings.DESTINATION_PIC_OWNER_LABEL,
                                disabled: this.state.isDestinationSame || this.editData.disableAll
                            }}
                                updateOnChange={true}
                                maxLength={100} initialValue={this.state.destinationOwnerPIC}
                                isClicked={this.props.isClicked} ref="destinationOwnerOfPIC" />
                        </div>
                        <div className="col-md-12">
                            <Input inputProps={{
                                name: 'destinationEmail',
                                hintText: strings.DESTINATION_EMAIL_PLACEHOLDER,
                                floatingLabelText: strings.DESTINATION_EMAIL_LABEL,
                                disabled: this.state.isDestinationSame || this.editData.disableAll
                            }}
                                updateOnChange={true}
                                eInvalid={strings.EMAIL_VALIDATE_MESSAGE}
                                maxLength={100} initialValue={this.state.destinationEmail}
                                isClicked={this.props.isClicked} ref="destinationEmail" />
                        </div>
                        <div className="col-md-12">
                            <NumberInput inputProps={{
                                name: 'destinationMobile',
                                hintText: strings.DESTINATION_MOBILE_PLACEHOLDER,
                                floatingLabelText: strings.DESTINATION_MOBILE_LABEL,
                                disabled: this.state.isDestinationSame || this.editData.disableAll
                            }}
                                updateOnChange={true}
                                maxLength={20} initialValue={this.state.destinationMobile}
                                isClicked={this.props.isClicked} ref="destinationMobile" />
                        </div>
                        <div className="col-md-12">
                            <NumberInput inputProps={{
                                name: 'destinationFax',
                                hintText: strings.DESTINATION_FAX_PLACEHOLDER,
                                floatingLabelText: strings.DESTINATION_FAX_LABEL,
                                disabled: this.state.isDestinationSame || this.editData.disableAll
                            }}
                                updateOnChange={true}
                                maxLength={20} initialValue={this.state.destinationFax}
                                isClicked={this.props.isClicked} ref="destinationFax" />
                        </div>
                        <div className="col-md-12">
                            <Input inputProps={{
                                name: 'destinationAddress',
                                hintText: strings.DESTINATION_ADDRESS_PLACEHOLDER,
                                floatingLabelText: strings.DESTINATION_ADDRESS_LABEL,
                                disabled: this.state.isDestinationSame || this.editData.disableAll
                            }}
                                maxLength={200} initialValue={this.state.destinationAddress}
                                multiLine={true} updateOnChange={true}
                                isClicked={this.props.isClicked} ref="destinationAddress" />
                        </div>
                        <div className="col-md-12">
                            <SuburbAutoComplete suburbName='destinationSuburb' ref='destinationSuburb'
                                countryId={this.state.destinationCountryId} strings={this.strings.COMMON}
                                suburbSelectedValue={this.state.destinationSuburbId} fatchData={true}
                                isClicked={this.props.isClicked}
                                isDisabled={this.state.isDestinationSame || this.editData.disableAll} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ConsignedToProperty;