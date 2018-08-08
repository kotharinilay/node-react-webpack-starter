'use strict';

/**************************
 * tab component livestock other attributes
 * **************************** */

import React, { Component } from 'react';
import Dropdown from '../../../../../lib/core-components/Dropdown';
import Input from '../../../../../lib/core-components/Input';
import NumberInput from '../../../../../lib/core-components/NumberInput';
import DateTimePicker from '../../../../../lib/core-components/DatetimePicker';
import ToggleSwitch from '../../../../../lib/core-components/ToggleSwitch';
import LoadingIndicator from '../../../../../lib/core-components/LoadingIndicator';

import { lastMonthOfShearing } from '../../../../../../shared/constants';
import { getLivestockSecondaryDDLData } from '../../../../../services/private/livestock';

import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { NOTIFY_ERROR } from '../../../../common/actiontypes';

class LivestockOtherTab extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.state = {
            dentition: [],
            dentitionReady: false,
            contemporaryGroup: [],
            contemporaryGroupReady: false,
            geneticStatus: [],
            geneticStatusReady: false,
            livestockGroup: [],
            livestockGroupReady: false,
            conditionScore: [],
            conditionScoreReady: false,
            classification: [],
            classificationReady: false,
            tagPlace: [],
            tagPlaceReady: false,
        }
        this.livestock = this.props.data || {};
        this.otherSchema = ['mgmtnumber', 'mgmtgroup', 'numberinbirth', 'dentition', 'birthproductivity',
            'numberreared', 'progeny', 'hgp', 'batchnumber', 'lastmonthofshearing', 'hgpdetail',
            'lastcomment', 'additionaltag', 'feedlottag', 'breedertag', 'studname', 'registrationdetail',
            'weighbridgeticket', 'referenceid', 'name', 'breederpic', 'breedercontact', 'breedercontactmobile',
            'contemporarygroup', 'geneticstatus', 'apprialsal', 'conditionscore', 'group', 'classification',
            'supplychain', 'freemartin', 'draftgroup', 'remindernote', 'reminderdate', 'breedercontactemail',
            'tagPlace'];

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;
        this.getFormValues = this.getFormValues.bind(this);
        this.conflictValidate = this.conflictValidate.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        getLivestockSecondaryDDLData(this.props.topPIC).then(function (res) {
            if (res.success) {
                _this.stateSet({
                    dentition: res.data.dentition,
                    dentitionReady: true,
                    contemporaryGroup: res.data.contemporaryGroup,
                    contemporaryGroupReady: true,
                    geneticStatus: res.data.geneticStatus,
                    geneticStatusReady: true,
                    livestockGroup: res.data.livestockGroup,
                    livestockGroupReady: true,
                    conditionScore: res.data.conditionScore,
                    conditionScoreReady: true,
                    classification: res.data.classification,
                    classificationReady: true,
                    tagPlace: res.data.tagPlace,
                    tagPlaceReady: true,
                })
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    getFormValues() {
        let isValid = isValidForm(this.otherSchema, this.refs);
        if (!isValid) {
            this.props.stateSet({ isClicked: true });
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }
        let otherTabValues = getForm(this.otherSchema, this.refs);
        return otherTabValues;
    }

    conflictValidate(value, label) {
        if (value == 'Mixed Value' || value == '-1') {
            return label + this.strings.CONFLICT_MESSAGE;
        }
    }

    render() {
        let strings = this.strings;
        return (
            <div>
                <div className="col-md-12">
                    <div className="row">
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'mgmtnumber',
                                hintText: this.strings.CONTROLS.MANAGEMENT_NUMBER_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.MANAGEMENT_NUMBER_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.ManagementNo'] ?
                                    this.livestock['livestockattribute.ManagementNo'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.ManagementNo'] : ''}
                                hideStar={true} ref="mgmtnumber" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'mgmtgroup',
                                hintText: this.strings.CONTROLS.MANAGEMENT_GROUP_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.MANAGEMENT_GROUP_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.ManagementGroup'] ?
                                    this.livestock['livestockattribute.ManagementGroup'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.ManagementGroup'] : ''}
                                hideStar={true} ref="mgmtgroup" />
                        </div>
                        <div className="col-md-4">
                            <NumberInput inputProps={{
                                name: 'numberinbirth',
                                hintText: strings.CONTROLS.NUMBER_IN_BIRTH_PLACEHOLDER,
                                floatingLabelText: strings.CONTROLS.NUMBER_IN_BIRTH_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={5} initialValue={this.livestock['livestockattribute.NumberInBirth'] ?
                                    this.livestock['livestockattribute.NumberInBirth'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.NumberInBirth'] : ''}
                                hideStar={true} ref="numberinbirth" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <Dropdown inputProps={{
                                name: 'dentition',
                                hintText: this.state.dentitionReady ? this.strings.CONTROLS.DENTITION_PLACEHOLDER : 'Loading...',
                                floatingLabelText: this.strings.CONTROLS.DENTITION_LABEL,
                                value: this.livestock['livestockattribute.DentitionId'] ?
                                    this.livestock['livestockattribute.DentitionId'] == '-1' ? '-1' : bufferToUUID(this.livestock['livestockattribute.DentitionId']) : null
                            }}
                                eClientValidation={this.conflictValidate}
                                textField="NameCode" valueField="Id" dataSource={this.state.dentition}
                                ref="dentition" />
                        </div>
                        <div className="col-md-4">
                            <NumberInput inputProps={{
                                name: 'birthproductivity',
                                hintText: strings.CONTROLS.BIRTH_PRODUCTIVITY_PLACEHOLDER,
                                floatingLabelText: strings.CONTROLS.BIRTH_PRODUCTIVITY_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={5} initialValue={this.livestock['livestockattribute.BirthProductivity'] ?
                                    this.livestock['livestockattribute.BirthProductivity'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.BirthProductivity'] : ''}
                                hideStar={true} ref="birthproductivity" />
                        </div>
                        <div className="col-md-4">
                            <NumberInput inputProps={{
                                name: 'numberreared',
                                hintText: strings.CONTROLS.NUMBER_REARED_PLACEHOLDER,
                                floatingLabelText: strings.CONTROLS.NUMBER_REARED_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={5} initialValue={this.livestock['livestockattribute.NumberInReared'] ?
                                    this.livestock['livestockattribute.NumberInReared'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.NumberInReared'] : ''}
                                hideStar={true} ref="numberreared" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <NumberInput inputProps={{
                                name: 'progeny',
                                hintText: strings.CONTROLS.PROGENY_PLACEHOLDER,
                                floatingLabelText: strings.CONTROLS.PROGENY_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={5} initialValue={this.livestock['livestockattribute.Progeny'] ?
                                    this.livestock['livestockattribute.Progeny'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.Progeny'] : ''}
                                hideStar={true} ref="progeny" />
                        </div>
                        <div className="col-md-4">
                            <ToggleSwitch inputProps={{
                                label: this.strings.CONTROLS.HGP_LABEL,
                                labelPosition: "right",
                                name: 'hgp',
                                disabled: this.isProfile
                            }}
                                initialValue={this.livestock['livestockattribute.IsHGP'] == 1 ? true : false}
                                ref="hgp" />
                        </div>
                        <div className="col-md-4">
                            <NumberInput inputProps={{
                                name: 'batchnumber',
                                hintText: strings.CONTROLS.BATCH_NUMBER_PLACEHOLDER,
                                floatingLabelText: strings.CONTROLS.BATCH_NUMBER_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={5} initialValue={this.livestock['livestockattribute.EIDBatchNo'] ?
                                    this.livestock['livestockattribute.EIDBatchNo'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.EIDBatchNo'] : ''}
                                hideStar={true} ref="batchnumber" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <Dropdown inputProps={{
                                name: 'lastmonthofshearing',
                                hintText: this.strings.CONTROLS.LASTMONTH_OF_SHEARING_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.LASTMONTH_OF_SHEARING_LABEL,
                                value: this.livestock['livestockattribute.LastMonthOfShearing'] ?
                                    this.livestock['livestockattribute.LastMonthOfShearing'] == '-1' ? '-1' : bufferToUUID(this.livestock['livestockattribute.LastMonthOfShearing']) : null
                            }}
                                eClientValidation={this.conflictValidate}
                                textField="Text" valueField="Value" dataSource={lastMonthOfShearing}
                                ref="lastmonthofshearing" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'hgpdetail',
                                hintText: this.strings.CONTROLS.HGP_DETAIL_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.HGP_DETAIL_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.HGPText'] ?
                                    this.livestock['livestockattribute.HGPText'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.HGPText'] : ''}
                                hideStar={true} ref="hgpdetail" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'lastcomment',
                                hintText: this.strings.CONTROLS.LAST_COMMENT_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.LAST_COMMENT_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.LastComment'] ?
                                    this.livestock['livestockattribute.LastComment'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.LastComment'] : ''}
                                hideStar={true} ref="lastcomment" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'additionaltag',
                                hintText: this.strings.CONTROLS.ADDITIONAL_TAG_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.ADDITIONAL_TAG_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.AdditionalTag'] ?
                                    this.livestock['livestockattribute.AdditionalTag'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.AdditionalTag'] : ''}
                                hideStar={true} ref="additionaltag" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'feedlottag',
                                hintText: this.strings.CONTROLS.FEEDLOT_TAG_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.FEEDLOT_TAG_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.FeedlotTag'] ?
                                    this.livestock['livestockattribute.FeedlotTag'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.FeedlotTag'] : ''}
                                hideStar={true} ref="feedlottag" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'breedertag',
                                hintText: this.strings.CONTROLS.BREEDER_TAG_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.BREEDER_TAG_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.BreederTag'] ?
                                    this.livestock['livestockattribute.BreederTag'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.BreederTag'] : ''}
                                hideStar={true} ref="breedertag" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'studname',
                                hintText: this.strings.CONTROLS.STUD_NAME_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.STUD_NAME_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.StudName'] ?
                                    this.livestock['livestockattribute.StudName'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.StudName'] : ''}
                                hideStar={true} ref="studname" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'registrationdetail',
                                hintText: this.strings.CONTROLS.REGISTRATION_DETAIL_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.REGISTRATION_DETAIL_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.RegistrationDetail'] ?
                                    this.livestock['livestockattribute.RegistrationDetail'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.RegistrationDetail'] : ''}
                                hideStar={true} ref="registrationdetail" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'weighbridgeticket',
                                hintText: this.strings.CONTROLS.WEIGHBRIDGE_TICKET_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.WEIGHBRIDGE_TICKET_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.WeighBridgeTicket'] ?
                                    this.livestock['livestockattribute.WeighBridgeTicket'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.WeighBridgeTicket'] : ''}
                                hideStar={true} ref="weighbridgeticket" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'referenceid',
                                hintText: this.strings.CONTROLS.REFERENCE_ID_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.REFERENCE_ID_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.ReferenceId'] ?
                                    this.livestock['livestockattribute.ReferenceId'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.ReferenceId'] : ''}
                                hideStar={true} ref="referenceid" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'name',
                                hintText: this.strings.CONTROLS.NAME_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.NAME_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.Name'] ?
                                    this.livestock['livestockattribute.Name'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.Name'] : ''}
                                hideStar={true} ref="name" />
                        </div>
                        <div className="col-md-4">
                            <Dropdown inputProps={{
                                name: 'contemporarygroup',
                                hintText: this.state.contemporaryGroupReady ? this.strings.CONTROLS.CONTEMPORARY_GROUP_PLACEHOLDER : 'Loading...',
                                floatingLabelText: this.strings.CONTROLS.CONTEMPORARY_GROUP_LABEL,
                                value: this.livestock['livestockattribute.ContemporaryId'] ?
                                    this.livestock['livestockattribute.ContemporaryId'] == '-1' ? '-1' : bufferToUUID(this.livestock['livestockattribute.ContemporaryId']) : null
                            }}
                                eClientValidation={this.conflictValidate}
                                textField="NameCode" valueField="Id" dataSource={this.state.contemporaryGroup}
                                isClicked={this.state.isClicked} ref="contemporarygroup" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <Dropdown inputProps={{
                                name: 'geneticstatus',
                                hintText: this.state.geneticStatusReady ? this.strings.CONTROLS.GENETIC_STATUS_PLACEHOLDER : 'Loading...',
                                floatingLabelText: this.strings.CONTROLS.GENETIC_STATUS_LABEL,
                                value: this.livestock['livestockattribute.GeneticStatusId'] ?
                                    this.livestock['livestockattribute.GeneticStatusId'] == '-1' ? '-1' : bufferToUUID(this.livestock['livestockattribute.GeneticStatusId']) : null
                            }}
                                eClientValidation={this.conflictValidate}
                                textField="NameCode" valueField="Id" dataSource={this.state.geneticStatus}
                                isClicked={this.state.isClicked} ref="geneticstatus" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'apprialsal',
                                hintText: this.strings.CONTROLS.APPRIALSAL_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.APPRIALSAL_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.Appraisal'] ?
                                    this.livestock['livestockattribute.Appraisal'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.Appraisal'] : ''}
                                hideStar={true} ref="apprialsal" />
                        </div>
                        <div className="col-md-4">
                            <Dropdown inputProps={{
                                name: 'conditionscore',
                                hintText: this.state.conditionScoreReady ? this.strings.CONTROLS.CONDITION_SCORE_PLACEHOLDER : 'Loading...',
                                floatingLabelText: this.strings.CONTROLS.CONDITION_SCORE_LABEL,
                                value: this.livestock['livestockattribute.ConditionScoreId'] ?
                                    this.livestock['livestockattribute.ConditionScoreId'] == '-1' ? '-1' : bufferToUUID(this.livestock['livestockattribute.ConditionScoreId']) : null
                            }}
                                eClientValidation={this.conflictValidate}
                                textField="NameCode" valueField="Id" dataSource={this.state.conditionScore}
                                isClicked={this.state.isClicked} ref="conditionscore" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <Dropdown inputProps={{
                                name: 'group',
                                hintText: this.state.livestockGroupReady ? this.strings.CONTROLS.GROUP_PLACEHOLDER : 'Loading...',
                                floatingLabelText: this.strings.CONTROLS.GROUP_LABEL,
                                value: this.livestock['livestockattribute.LivestockGroupId'] ?
                                    this.livestock['livestockattribute.LivestockGroupId'] == '-1' ? '-1' : bufferToUUID(this.livestock['livestockattribute.LivestockGroupId']) : null
                            }}
                                eClientValidation={this.conflictValidate}
                                textField="NameCode" valueField="Id" dataSource={this.state.livestockGroup}
                                isClicked={this.state.isClicked} ref="group" />
                        </div>
                        <div className="col-md-4">
                            <Dropdown inputProps={{
                                name: 'classification',
                                hintText: this.state.classificationReady ? this.strings.CONTROLS.CLASSIFICATION_PLACEHOLDER : 'Loading...',
                                floatingLabelText: this.strings.CONTROLS.CLASSIFICATION_LABEL,
                                value: this.livestock['livestockattribute.ClassificationId'] ?
                                    this.livestock['livestockattribute.ClassificationId'] == '-1' ? '-1' : bufferToUUID(this.livestock['livestockattribute.ClassificationId']) : null
                            }}
                                eClientValidation={this.conflictValidate}
                                textField="NameCode" valueField="Id" dataSource={this.state.classification}
                                isClicked={this.state.isClicked} ref="classification" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'supplychain',
                                hintText: this.strings.CONTROLS.SUPPLY_CHAIN_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.SUPPLY_CHAIN_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.SupplyChain'] ?
                                    this.livestock['livestockattribute.SupplyChain'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.SupplyChain'] : ''}
                                hideStar={true} ref="supplychain" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <ToggleSwitch inputProps={{
                                label: this.strings.CONTROLS.FREEMARTIN_LABEL,
                                labelPosition: "right",
                                name: 'freemartin',
                                disabled: this.isProfile
                            }}
                                initialValue={this.livestock['livestockattribute.IsFreeMartin' == 1 ? true : false]}
                                isClicked={this.state.isClicked} ref="freemartin" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'draftgroup',
                                hintText: this.strings.CONTROLS.DRAFT_GROUP_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.DRAFT_GROUP_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.DraftGroup'] ?
                                    this.livestock['livestockattribute.DraftGroup'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.DraftGroup'] : ''}
                                hideStar={true} ref="draftgroup" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'breederpic',
                                hintText: this.strings.CONTROLS.BRREEDER_PIC_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.BRREEDER_PIC_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.BreederPIC'] ?
                                    this.livestock['livestockattribute.BreederPIC'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.BreederPIC'] : this.props.topPIC.PIC || ''}
                                hideStar={true} ref="breederpic" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'breedercontact',
                                hintText: this.strings.CONTROLS.BREEDER_CONTACT_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.BREEDER_CONTACT_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.BreederContact'] ?
                                    this.livestock['livestockattribute.BreederContact'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.BreederContact'] : ''}
                                hideStar={true} ref="breedercontact" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'breedercontactmobile',
                                hintText: this.strings.CONTROLS.BREEDER_CONTACT_MOBILE_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.BREEDER_CONTACT_MOBILE_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.BreederContactMobile'] ?
                                    this.livestock['livestockattribute.BreederContactMobile'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.BreederContactMobile'] : ''}
                                hideStar={true} ref="breedercontactmobile" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'breedercontactemail',
                                hintText: this.strings.CONTROLS.BREEDER_CONTACT_EMAIL_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.BREEDER_CONTACT_EMAIL_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.BreederContactEmail'] ?
                                    this.livestock['livestockattribute.BreederContactEmail'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.BreederContactEmail'] : ''}
                                hideStar={true} ref="breedercontactemail" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'remindernote',
                                hintText: this.strings.CONTROLS.REMINDER_NOTE_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.REMINDER_NOTE_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                maxLength={50} initialValue={this.livestock['livestockattribute.ReminderNote'] ?
                                    this.livestock['livestockattribute.ReminderNote'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.ReminderNote'] : ''}
                                hideStar={true} ref="remindernote" />
                        </div>
                        <div className="col-md-4">
                            <DateTimePicker inputProps={{
                                name: 'reminderdate',
                                placeholder: this.strings.CONTROLS.REMINDER_DATE_PLACEHOLDER,
                                label: this.strings.CONTROLS.REMINDER_DATE_LABEL
                            }}
                                eClientValidation={this.conflictValidate}
                                defaultValue={this.livestock['livestockattribute.ReminderDate'] ?
                                    this.livestock['livestockattribute.ReminderDate'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.ReminderDate'] : new Date()} timeFormat={false}
                                isClicked={this.state.isClicked} ref="reminderdate" />
                        </div>
                        <div className="col-md-4">
                            <Dropdown inputProps={{
                                name: 'tagPlace',
                                hintText: this.state.tagPlaceReady ? this.strings.CONTROLS.TAG_PLACE_PLACEHOLDER : 'Loading...',
                                floatingLabelText: this.strings.CONTROLS.TAG_PLACE_LABEL,
                                value: this.livestock['livestockattribute.TagPlaceId'] ?
                                    this.livestock['livestockattribute.TagPlaceId'] == '-1' ? '-1' : bufferToUUID(this.livestock['livestockattribute.TagPlaceId']) : null
                            }}
                                eClientValidation={this.conflictValidate}
                                textField="NameCode" valueField="Id" dataSource={this.state.geneticStatus}
                                isClicked={this.state.isClicked} ref="tagPlace" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default LivestockOtherTab;