'use strict';

import React, { Component } from 'react';

import Input from '../../../../../lib/core-components/Input';
import AutoComplete from '../../../../../lib/core-components/AutoComplete';
import NumberInput from '../../../../../lib/core-components/NumberInput';
import Button from '../../../../../lib/core-components/Button';
import Dropdown from '../../../../../lib/core-components/Dropdown';
import DatetimePicker from '../../../../../lib/core-components/DatetimePicker';
import BusyButton from '../../../../../lib/wrapper-components/BusyButton';
import GpsCoordinate from '../../../../../lib/wrapper-components/GPSCoordiante/GPS_Coordinate';
import PICAutoComplete from '../../../../../lib/wrapper-components/PICAutoComplete';
import CompanyAutoComplete from '../../../../../lib/wrapper-components/CompanyAutoComplete';
import { lactationCode } from '../../../../../../shared/constants';
import { getRecordScanData } from '../../../../../services/private/livestock';
import { getAllContact } from '../../../../../services/private/contact';

class TabRecordScanResult extends Component {

    constructor(props) {
        super(props);

        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.selectPIC = this.selectPIC.bind(this);
        this.selectCompany = this.selectCompany.bind(this);
        this.state = {
            isClicked: false,
            lactations: lactationCode,
            conceptionMethodReady: false, conceptionMethods: [],
            conditionScoreReady: false, conditionScores: [],
            dentitionReady: false, dentitions: [],
            maturities: [], maturityReady: false,
            scanPurposes: [], scanPurposeReady: false,
            contacts: [], contactReady: true
        }
        this.strings = this.props.strings;
        this.scanOnPIC = null;
        this.scanOnPropertyId = null;
        this.serviceProvider = null;
        this.recordScanSchema = ['ScanPurposeId', 'ScanDate', 'Lactation', 'PregnancyResult', 'ExpPregnancyDate', 'PregnancyDue',
            'ConceptionMethodId', 'Decision', 'ProcessingSession', 'Disease', 'WeighingCategory', 'Weight', 'Appraisal', 'AdministerByPerson',
            , 'ScanCost', 'StomuchContent', 'ConditionScoreId', 'DentitionId', 'MaturityId', 'ScanPersonId'];

        this.ScanPersonChange = this.ScanPersonChange.bind(this);
    }

    componentWillMount() {
        this.mounted = true;
    }

    stateSet(setObj) {
        if (this.mounted) {
            this.setState(setObj);
        }
    }

    componentDidMount() {
        if (this.mounted) {
            let _this = this;
            return getRecordScanData(_this.props.SpeciesId, _this.props.topPIC).then(function (res) {
                if (res.success) {
                    _this.stateSet({
                        maturities: res.data.maturities, maturityReady: true,
                        conceptionMethods: res.data.conceptionMethods, conceptionMethodReady: true,
                        conditionScores: res.data.conditionScores, conditionScoreReady: true,
                        dentitions: res.data.dentitions, dentitionReady: true,
                        scanPurposes: res.data.scanPurposes, scanPurposeReady: true
                    });
                }
                else {
                    _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error });
                }
            }).catch(function (err) {
                _this.props.notifyToaster(NOTIFY_ERROR);
            })
        }
    }

    ScanPersonChange(value, text) {
        if (value)
            this.serviceProvider = text;
        else
            this.serviceProvider = null;
    }

    // make scan on pic selected from PICAutoComplete component
    selectPIC(payload) {
        if (payload != null) {
            this.scanOnPIC = payload.PIC;
            this.scanOnPropertyId = payload.Id;
        }
        else {
            this.scanOnPIC = null;
            this.scanOnPropertyId = null;
        }
    }

    // make scan by comapny selected from CompanyAutoComplete component
    selectCompany(payload) {

        if (payload != null && payload.Id != null && payload.Id.length > 0) {

            this.stateSet({ contacts: [], contactReady: false });
            let _this = this;
            return getAllContact(payload.Id).then(function (res) {
                if (res.success) {
                    _this.stateSet({ contacts: res.data, contactReady: true });
                }
                else {
                    _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error });
                }
            }).catch(function (err) {
                _this.props.notifyToaster(NOTIFY_ERROR);
            })
        }
        else {
            this.stateSet({ contacts: [], contactReady: true });
        }
    }

    render() {
        return (
            <div className="col-md-12">
                <div className="row">
                    <div className="col-md-6">
                        <Dropdown inputProps={{
                            name: 'ScanPurposeId',
                            hintText: this.state.scanPurposeReady ? this.strings.CONTROLS.SCANPURPOSE_PLACEHOLDER : 'Loading...',
                            floatingLabelText: this.strings.CONTROLS.SCANPURPOSE_LABEL,
                            value: null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.scanPurposes}
                            isClicked={this.state.isClicked} ref="ScanPurposeId" />

                    </div>
                    <div className="col-md-6">
                        <DatetimePicker inputProps={{
                            name: 'ScanDate',
                            placeholder: this.strings.CONTROLS.SCAN_DATE
                        }}
                            eReq={this.strings.CONTROLS.SCAN_DATE_REQ_MESSAGE}
                            defaultValue={new Date()}
                            isClicked={this.state.isClicked} ref="ScanDate" />
                        <GpsCoordinate strings={{
                            hintText: this.strings.CONTROLS.EVENTGPS_PLACEHOLDER,
                            floatingLabelText: this.strings.CONTROLS.EVENTGPS_LABEL, COMMON: this.strings.COMMON
                        }}
                            propertyId={this.props.topPIC.PropertyId} ref='GpsCoordinate'
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <Dropdown inputProps={{
                            name: 'Lactation',
                            hintText: this.strings.CONTROLS.LACTATION_PLACEHOLDER,
                            floatingLabelText: this.strings.CONTROLS.LACTATION_LABEL,
                            value: null
                        }}
                            textField="Text" valueField="Value" dataSource={this.state.lactations}
                            isClicked={this.state.isClicked} ref="Lactation" />

                    </div>
                    <div className="col-md-6">
                        <Dropdown inputProps={{
                            name: 'MaturityId',
                            hintText: this.state.maturityReady ? this.strings.CONTROLS.MATURITY_PLACEHOLDER : 'Loading...',
                            floatingLabelText: this.strings.CONTROLS.MATURITY_LABEL,
                            value: null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.maturities}
                            isClicked={this.state.isClicked} ref="MaturityId" />

                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'PregnancyResult',
                            hintText: this.strings.CONTROLS.PREGNANCY_RESULT_HINT,
                            floatingLabelText: this.strings.CONTROLS.PREGNANCY_RESULT_FLOATING
                        }}
                            initialValue={null}
                            ref="PregnancyResult" />
                    </div>
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'PregnancyDue',
                            hintText: this.strings.CONTROLS.PREGNANCY_DAYS_HINT,
                            floatingLabelText: this.strings.CONTROLS.PREGNANCY_DAYS_FLOATING
                        }}
                            initialValue={null}
                            ref="PregnancyDue" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <DatetimePicker inputProps={{
                            name: 'ExpPregnancyDate',
                            placeholder: this.strings.CONTROLS.EXP_PREG_DATE
                        }}
                            time={false}
                            isClicked={this.state.isClicked} ref="ExpPregnancyDate" />
                    </div>
                    <div className="col-md-6">
                        <Dropdown inputProps={{
                            name: 'ConceptionMethodId',
                            hintText: this.state.conceptionMethodReady ? this.strings.CONTROLS.CONCEPTION_METHOD_PLACEHOLDER : 'Loading...',
                            floatingLabelText: this.strings.CONTROLS.CONCEPTION_METHOD_LABEL,
                            value: null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.conceptionMethods}
                            isClicked={this.state.isClicked} ref="ConceptionMethodId" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <Dropdown inputProps={{
                            name: 'ConditionScoreId',
                            hintText: this.state.conditionScoreReady ? this.strings.CONTROLS.CONDITION_SCORE_PLACEHOLDER : 'Loading...',
                            floatingLabelText: this.strings.CONTROLS.CONDITION_SCORE_LABEL,
                            value: null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.conditionScores}
                            isClicked={this.state.isClicked} ref="ConditionScoreId" />
                    </div>
                    <div className="col-md-6">
                        <Dropdown inputProps={{
                            name: 'DentitionId',
                            hintText: this.state.dentitionReady ? this.strings.CONTROLS.DENTITION_PLACEHOLDER : 'Loading...',
                            floatingLabelText: this.strings.CONTROLS.DENTITION_LABEL,
                            value: null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.dentitions}
                            isClicked={this.state.isClicked} ref="DentitionId" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'Decision',
                            hintText: this.strings.CONTROLS.DECISION_HINT,
                            floatingLabelText: this.strings.CONTROLS.DECISION_FLOATING
                        }}
                            initialValue={null}
                            ref="Decision" />
                    </div>
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'ProcessingSession',
                            hintText: this.strings.CONTROLS.PROCESSING_SESSION_HINT,
                            floatingLabelText: this.strings.CONTROLS.PROCESSING_SESSION_FLOATING
                        }}
                            initialValue={null}
                            ref="ProcessingSession" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'WeighingCategory',
                            hintText: this.strings.CONTROLS.WEIGHING_CATEGORY_HINT,
                            floatingLabelText: this.strings.CONTROLS.WEIGHING_CATEGORY_FLOATING
                        }}
                            initialValue={null}
                            ref="WeighingCategory" />
                    </div>
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'Disease',
                            hintText: this.strings.CONTROLS.DISEASE_HINT,
                            floatingLabelText: this.strings.CONTROLS.DISEASE_FLOATING
                        }}
                            initialValue={null}
                            ref="Disease" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <NumberInput inputProps={{
                            name: 'Weight',
                            hintText: this.strings.CONTROLS.WEIGHT_HINT,
                            floatingLabelText: this.strings.CONTROLS.WEIGHT_FLOATING
                        }}
                            initialValue={null}
                            ref="Weight" />
                    </div>
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'Appraisal',
                            hintText: this.strings.CONTROLS.APPRAISAL_HINT,
                            floatingLabelText: this.strings.CONTROLS.APPRAISAL_FLOATING
                        }}
                            initialValue={null}
                            ref="Appraisal" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'StomuchContent',
                            hintText: this.strings.CONTROLS.STOMUCH_CONTENT_HINT,
                            floatingLabelText: this.strings.CONTROLS.STOMUCH_CONTENT_FLOATING
                        }}
                            initialValue={null}
                            ref="StomuchContent" />
                    </div>
                    <div className="col-md-6">
                        <NumberInput inputProps={{
                            name: 'ScanCost',
                            hintText: this.strings.CONTROLS.SCAN_COST_HINT,
                            floatingLabelText: this.strings.CONTROLS.SCAN_COST_FLOATING
                        }}
                            initialValue={null}
                            ref="ScanCost" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'AdministerByPerson',
                            hintText: this.strings.CONTROLS.ADMINISTER_PERSON_HINT,
                            floatingLabelText: this.strings.CONTROLS.ADMINISTER_PERSON_FLOATING
                        }}
                            initialValue={null}
                            ref="AdministerByPerson" />
                    </div>
                    <div className="col-md-6">
                        <PICAutoComplete
                            inputProps={{
                                hintText: this.strings.CONTROLS.PIC_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.PIC_FLOATING
                            }}
                            targetKey="scanOnPIC"
                            findPIC={this.props.findPIC}
                            openFindPIC={this.props.openFindPIC}
                            selectPIC={this.selectPIC}
                            notifyToaster={this.props.notifyToaster} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <CompanyAutoComplete
                            inputProps={{
                                hintText: this.strings.CONTROLS.COMPANYNAME_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANYNAME_FLOATING
                            }}
                            targetKey="scanCompanyId"
                            findCompany={this.props.findCompany}
                            openFindCompany={this.props.openFindCompany}
                            selectCompany={this.selectCompany}
                            notifyToaster={this.props.notifyToaster} />
                    </div>
                    <div className="col-md-6">
                        <Dropdown inputProps={{
                            name: 'ScanPersonId',
                            hintText: this.state.contactReady ? this.strings.CONTROLS.SCANPERSON_PLACEHOLDER : 'Loading...',
                            floatingLabelText: this.strings.CONTROLS.SCANPERSON_LABEL,
                            value: null
                        }}
                            eReq={this.strings.CONTROLS.SCANPERSON_REQ_MESSAGE}
                            onSelectionChange={this.ScanPersonChange}
                            textField="Name" valueField="Id" dataSource={this.state.contacts}
                            isClicked={this.state.isClicked} ref="ScanPersonId" />
                    </div>
                </div>
            </div>
        );
    }
}
export default TabRecordScanResult;